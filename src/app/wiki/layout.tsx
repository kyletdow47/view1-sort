export const dynamic = 'force-dynamic'

import { requireAuth } from '@/lib/auth'
import { WikiSidebar } from '@/components/features/wiki/WikiSidebar'

export const metadata = {
  title: 'View1 Bible — Studio HQ',
  robots: 'noindex, nofollow',
}

export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  // Only enforce auth if Supabase is configured (graceful local dev fallback)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    await requireAuth()
  }

  return (
    <div className="min-h-screen bg-[#030305]">
      {/* Background gradients matching landing page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-purple-600/6 blur-[80px]" />
      </div>

      <WikiSidebar />

      {/* Main content offset by sidebar width */}
      <main className="pl-64 min-h-screen relative z-10">
        <div className="max-w-5xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
