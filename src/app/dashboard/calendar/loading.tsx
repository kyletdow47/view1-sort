export default function CalendarLoading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-pulse">
      {/* Header skeleton */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-white/10" />
              <div className="h-7 w-28 rounded-xl bg-white/10" />
            </div>
            <div className="h-4 w-52 rounded-lg bg-white/[0.06]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 rounded-2xl bg-white/[0.08]" />
            <div className="h-9 w-28 rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div
        className="flex items-center gap-3 px-6 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-1">
          <div className="h-7 w-7 rounded-xl bg-white/[0.06]" />
          <div className="h-7 w-16 rounded-xl bg-white/[0.06]" />
          <div className="h-7 w-7 rounded-xl bg-white/[0.06]" />
          <div className="h-5 w-36 rounded-lg bg-white/10 ml-2" />
        </div>
        <div className="flex-1" />
        <div className="h-8 w-40 rounded-xl bg-white/[0.06]" />
        <div className="h-8 w-48 rounded-xl bg-white/[0.06]" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 gap-4 px-6 py-4">
        {/* Calendar grid */}
        <div className="flex-1 rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-5 rounded-md bg-white/[0.06] mx-auto w-8" />
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-1.5 min-h-[72px]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="h-4 w-4 rounded-full bg-white/[0.06] ml-auto mb-1" />
                {i % 5 === 0 && <div className="h-3 w-full rounded-md bg-white/[0.06]" />}
                {i % 7 === 0 && <div className="h-3 w-3/4 rounded-md bg-white/[0.04] mt-0.5" />}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="hidden xl:flex xl:flex-col xl:w-64 gap-3 shrink-0">
          <div className="rounded-3xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="h-4 w-32 rounded-lg bg-white/10" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-3/4 rounded-md bg-white/10" />
                  <div className="h-2.5 w-1/2 rounded-md bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-3 w-20 rounded-md bg-white/[0.06] mb-3" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className="h-2 w-2 rounded-full bg-white/15" />
                <div className="h-3 rounded-md bg-white/[0.06]" style={{ width: `${40 + (i % 3) * 20}px` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
