export default function AnalyticsLoading() {
  return (
    <div className="flex flex-1 flex-col animate-pulse">
      {/* Header */}
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

      {/* Tab bar */}
      <div
        className="flex shrink-0 items-center gap-2 px-8 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="h-9 w-80 rounded-2xl bg-white/[0.06]" />
      </div>

      {/* KPI row */}
      <div className="flex flex-1 flex-col gap-4 px-6 py-4">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-12 gap-4">
          <div
            className="col-span-4 h-56 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          <div
            className="col-span-8 h-56 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        {/* Bottom row */}
        <div
          className="h-48 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
      </div>
    </div>
  )
}
