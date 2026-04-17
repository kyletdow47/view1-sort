import { Suspense } from 'react'
import { AnalyticsLayout } from '@/components/features/analytics/AnalyticsLayout'
import { ComingSoonOverlay } from '@/components/common/ComingSoonOverlay'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0] as string
}

function getDefaultDateRange(): { from: string; to: string } {
  const now = new Date()
  const to = isoDate(now)
  const from30 = new Date(now)
  from30.setDate(now.getDate() - 30)
  return { from: isoDate(from30), to }
}

/* ------------------------------------------------------------------ */
/*  Skeleton (rendered while Suspense is resolving)                   */
/* ------------------------------------------------------------------ */

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-1 flex-col animate-pulse">
      {/* Header skeleton */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col gap-2">
          <div className="h-6 w-32 rounded-xl bg-white/10" />
          <div className="h-3 w-56 rounded-lg bg-white/[0.06]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-40 rounded-xl bg-white/10" />
          <div className="h-8 w-36 rounded-xl bg-white/10" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div
        className="flex shrink-0 items-center gap-2 px-8 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="h-9 w-72 rounded-2xl bg-white/[0.06]" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-4 px-6 py-4">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.06]" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 h-48 rounded-2xl bg-white/[0.06]" />
          <div className="col-span-8 h-48 rounded-2xl bg-white/[0.06]" />
        </div>
        <div className="h-48 rounded-2xl bg-white/[0.06]" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                           */
/* ------------------------------------------------------------------ */

interface AnalyticsPageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams
  const defaults = getDefaultDateRange()
  const from = params.from ?? defaults.from
  const to = params.to ?? defaults.to

  return (
    <ComingSoonOverlay
      feature="Analytics"
      description="Revenue, gallery engagement, and delivery metrics will unlock in a future update."
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/*
         * Suspense is required here because AnalyticsLayout calls useSearchParams().
         * The skeleton is shown instantly while the client bundle hydrates.
         */}
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsLayout initialFrom={from} initialTo={to} />
        </Suspense>
      </div>
    </ComingSoonOverlay>
  )
}
