import { createBrowserClient } from '@supabase/ssr'

// Fallback placeholder values allow the client to be instantiated in local dev / QA
// environments where Supabase credentials are not configured. All auth API calls will
// return errors gracefully (user = null), so dashboard pages render with mock data.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  )
}
