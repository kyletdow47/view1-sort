/**
 * Loading skeleton for the Clients & CRM page.
 * Renders a shimmer kanban board with 6 placeholder columns.
 */
export default function ClientsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header skeleton */}
      <div
        className="flex shrink-0 flex-col gap-3 px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-6 w-24 animate-pulse rounded-lg bg-white/8" />
            <div className="hidden items-center gap-2 sm:flex">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-white/6" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-28 animate-pulse rounded-xl bg-white/6" />
            <div className="h-8 w-20 animate-pulse rounded-xl bg-white/6" />
            <div className="h-8 w-28 animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
        {/* Search bar skeleton */}
        <div className="h-9 animate-pulse rounded-xl bg-white/5" />
      </div>

      {/* Kanban columns skeleton */}
      <div className="flex flex-1 gap-3 overflow-hidden px-6 py-4">
        {[
          '#94A3B8',
          '#60A5FA',
          '#A78BFA',
          '#FBBF24',
          '#34D399',
          '#10B981',
        ].map((color, colIdx) => (
          <div
            key={colIdx}
            className="flex w-[210px] shrink-0 flex-col gap-2 rounded-2xl p-3"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1 py-0.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <div className="h-3.5 w-14 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-5 w-5 animate-pulse rounded-full bg-white/8" />
            </div>

            {/* Card skeletons */}
            {Array.from({ length: colIdx === 2 ? 3 : colIdx === 0 || colIdx === 1 ? 2 : 1 }).map(
              (_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="flex animate-pulse items-center gap-2.5 rounded-xl p-3"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="h-9 w-9 shrink-0 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-white/10" />
                    <div className="h-2.5 w-16 rounded bg-white/6" />
                  </div>
                  {cardIdx === 0 && (
                    <div className="h-4 w-10 shrink-0 rounded-full bg-emerald-400/10" />
                  )}
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
