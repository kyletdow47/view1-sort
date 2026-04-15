// Shared durable rate limiter for AI edge functions.
//
// In-memory Maps don't survive Deno isolate recycles, so we delegate the
// check to a Postgres RPC that atomically upserts the counter. The RPC
// lives in supabase/migrations/20260415000000_ai_rate_limits.sql.
//
// Usage inside a Deno.serve handler:
//
//   import { checkRateLimit, getUserKey } from '../_shared/rate-limit.ts'
//
//   const userId = getUserKey(req)
//   const allowed = await checkRateLimit(userId, 'generate-captions', 60, 10)
//   if (!allowed) return new Response('Rate limit exceeded', { status: 429 })

import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * Returns a stable per-caller identifier for rate limiting. We prefer a
 * prefix of the auth token (last 16 chars) over the full token so the
 * identifier isn't leaked into logs, and we fall back to the originating
 * IP when unauthenticated. IPs aren't a perfect identity (CGNAT, VPNs),
 * but they're enough to protect the API key from abuse.
 */
export function getUserKey(req: Request): string {
  const auth = req.headers.get('authorization') ?? ''
  if (auth) return `auth:${auth.slice(-16)}`

  // Supabase Edge sets x-forwarded-for with the client IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return ip ? `ip:${ip}` : 'anon'
}

/**
 * Returns TRUE when the request is allowed, FALSE when the caller has
 * exceeded `maxRequests` within the last `windowSeconds`. Fails OPEN on
 * database errors — we'd rather serve requests than break the product
 * if the limiter table is briefly unavailable.
 */
export async function checkRateLimit(
  userId: string,
  functionName: string,
  windowSeconds: number,
  maxRequests: number,
): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) {
    console.warn('[rate-limit] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — failing open')
    return true
  }

  try {
    const client = createClient(url, key, { auth: { persistSession: false } })
    const { data, error } = await client.rpc('check_and_increment_rate_limit', {
      p_user_id: userId,
      p_function_name: functionName,
      p_window_seconds: windowSeconds,
      p_max_requests: maxRequests,
    })

    if (error) {
      console.warn('[rate-limit] RPC error, failing open:', error.message)
      return true
    }

    return data === true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[rate-limit] Unexpected error, failing open:', msg)
    return true
  }
}
