export default function PublishLoading() {
  return (
    <div className="min-h-full px-10 py-8 max-w-5xl mx-auto animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-48 rounded-full bg-white/[0.06] mb-6" />

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-white/[0.08]" />
          <div className="h-4 w-80 rounded-full bg-white/[0.05]" />
        </div>
        {/* Stepper skeleton */}
        <div className="flex items-center gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full bg-white/[0.06]"
            />
          ))}
        </div>
      </div>

      {/* Stage cards + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/[0.06]" />
                <div className="h-4 w-44 rounded-full bg-white/[0.06]" />
              </div>
              <div className="h-4 w-full rounded-full bg-white/[0.04]" />
              <div className="h-4 w-2/3 rounded-full bg-white/[0.04]" />
              {i === 0 && (
                <div className="h-9 w-40 rounded-xl bg-white/[0.06]" />
              )}
            </div>
          ))}
        </div>

        {/* Stats sidebar skeleton */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 space-y-3">
          <div className="h-3 w-24 rounded-full bg-white/[0.06]" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-white/[0.06]" />
              <div className="flex-1 h-3 rounded-full bg-white/[0.04]" />
              <div className="h-4 w-6 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
