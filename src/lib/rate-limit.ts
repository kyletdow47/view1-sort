/**
 * Simple in-process sliding-window rate limiter.
 * Works per-instance (fine for Vercel serverless — each invocation is stateless,
 * so this prevents burst abuse within a single cold-start window).
 * For distributed rate limiting across instances, swap the Map for Upstash Redis
 * by adding UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars.
 */

interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSec: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSec * 1000

  const existing = store.get(key)

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: config.limit - 1, resetAt }
  }

  if (existing.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return { success: true, remaining: config.limit - existing.count, resetAt: existing.resetAt }
}

/** Extracts a reasonable IP identifier from Next.js request headers */
export function getIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
