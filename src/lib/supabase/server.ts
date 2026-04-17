import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — cookies are read-only in this context
          }
        },
      },
    }
  )
}

/**
 * Returns a Supabase client authenticated with the service-role key, bypassing
 * RLS. This is the single authorized read of `SUPABASE_SERVICE_ROLE_KEY` in
 * `src/lib/**`; any other occurrence is a leak risk flagged by the CI guard in
 * `scripts/check-service-role-leak.mjs`.
 *
 * Only import this from server-only code paths: route handlers, server
 * components, server actions, or other server-only `src/lib` modules that are
 * themselves never imported from client code.
 */
export function getServiceRoleClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceRoleClient must not run in the browser')
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials')
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
