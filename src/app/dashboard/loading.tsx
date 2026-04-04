export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5">
      {/* Welcome skeleton */}
      <div className="flex w-full flex-col items-center gap-4 py-2">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-white/[0.08]" />
        <div className="h-12 w-[480px] max-w-full animate-pulse rounded-3xl bg-white/[0.06]" />
      </div>

      {/* Quick actions skeleton */}
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-36 animate-pulse rounded-full bg-white/[0.06]" />
        ))}
      </div>

      {/* Widget Row 1 */}
      <div className="grid h-auto gap-4 grid-cols-1 md:grid-cols-2 lg:h-[320px] lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-white/[0.1]" />
              <div className="h-4 w-4 rounded bg-white/[0.06]" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-12 rounded-xl bg-white/[0.05]" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Widget Row 2 */}
      <div className="grid h-auto gap-4 grid-cols-1 md:grid-cols-2 lg:h-[310px] lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-4 w-28 rounded bg-white/[0.1]" />
              <div className="h-4 w-4 rounded bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-10 rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
