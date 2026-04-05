export default function BookingLoading() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-pulse">
      {/* Header skeleton */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-white/10" />
              <div className="h-7 w-36 rounded-xl bg-white/10" />
            </div>
            <div className="h-4 w-64 rounded-lg bg-white/[0.06]" />
          </div>
          <div className="flex items-center gap-3">
            {[60, 80, 80].map((w, i) => (
              <div key={i} className="h-10 rounded-2xl bg-white/10" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div
        className="flex items-center gap-1 px-6 py-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {[80, 90, 90, 110, 85].map((w, i) => (
          <div key={i} className="h-10 rounded-t-xl bg-white/[0.06] px-4" style={{ width: w }} />
        ))}
      </div>

      {/* Kanban columns skeleton */}
      <div className="flex gap-3 overflow-x-auto px-6 py-4">
        {['Inquiry', 'Quoted', 'Booked', 'Shooting', 'Delivered', 'Paid'].map((col) => (
          <div
            key={col}
            className="flex w-[210px] shrink-0 flex-col gap-3 rounded-2xl p-3"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-2 px-1">
              <div className="h-2 w-2 rounded-full bg-white/20" />
              <div className="h-3.5 w-16 rounded-md bg-white/10" />
            </div>
            {[1, 2, 3].slice(0, Math.max(1, Math.floor(Math.random() * 3) + 1)).map((j) => (
              <div
                key={j}
                className="rounded-2xl p-3 space-y-2"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded-md bg-white/10" />
                    <div className="h-2.5 w-1/2 rounded-md bg-white/[0.06]" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-4 w-14 rounded-full bg-white/10" />
                  <div className="h-4 w-16 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
