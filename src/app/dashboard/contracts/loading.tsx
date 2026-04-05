/**
 * Contracts page loading skeleton — /dashboard/contracts
 */

export default function ContractsLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 animate-pulse">
      {/* Page header skeleton */}
      <div
        className="flex shrink-0 items-start justify-between px-8 pb-4 pt-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="space-y-2">
          <div className="h-6 w-52 rounded-lg bg-white/10" />
          <div className="h-3.5 w-80 rounded-md bg-white/[0.06]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-36 rounded-xl bg-white/[0.06]" />
          <div className="h-8 w-32 rounded-xl bg-white/[0.08]" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div
        className="flex shrink-0 items-center px-8 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-1 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
          {[96, 88, 140].map((w, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-1.5"
              style={{ width: w, height: 32, background: i === 0 ? 'rgba(255,255,255,0.15)' : 'transparent' }}
            />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 gap-4 overflow-hidden px-6 py-4">
        {/* Left list */}
        <div className="flex w-[280px] shrink-0 flex-col gap-3">
          {/* Search */}
          <div className="h-9 rounded-xl bg-white/[0.06]" />
          {/* Filter chips */}
          <div className="flex gap-1.5">
            {[40, 44, 52, 44, 56].map((w, i) => (
              <div key={i} className="h-6 rounded-full bg-white/[0.06]" style={{ width: w }} />
            ))}
          </div>
          {/* New contract btn */}
          <div className="h-11 rounded-xl bg-white/[0.04] border border-dashed border-white/10" />
          {/* Contract cards */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex justify-between gap-2">
                <div className="h-3.5 flex-1 rounded bg-white/10" />
                <div className="h-4 w-14 rounded-full bg-white/[0.06]" />
              </div>
              <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
              <div className="h-2.5 w-1/2 rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div
          className="flex-1 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {/* Detail header */}
          <div className="space-y-2 border-b border-white/[0.08] p-5">
            <div className="h-5 w-64 rounded bg-white/10" />
            <div className="h-3.5 w-40 rounded bg-white/[0.06]" />
            <div className="h-3 w-80 rounded bg-white/[0.04]" />
          </div>
          {/* Stats row */}
          <div className="flex gap-2 px-5 py-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="h-4 w-4 rounded bg-white/[0.06]" />
                <div className="space-y-1.5">
                  <div className="h-2 w-12 rounded bg-white/[0.06]" />
                  <div className="h-3 w-24 rounded bg-white/[0.08]" />
                </div>
              </div>
            ))}
          </div>
          {/* Body */}
          <div className="px-5 pb-3 space-y-2">
            {[100, 90, 95, 85, 100, 70, 88].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded bg-white/[0.05]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
