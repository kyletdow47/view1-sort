export default function BrandingLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-52 rounded-xl bg-surface-container-highest" />
        <div className="mt-2 h-4 w-72 rounded bg-surface-container-highest/60" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {[140, 160, 130, 200, 220].map((h, i) => (
            <div
              key={i}
              className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6"
              style={{ minHeight: h }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="h-5 w-5 rounded bg-surface-container-highest" />
                <div className="h-5 w-32 rounded bg-surface-container-highest" />
              </div>
              <div className="h-4 w-full rounded bg-surface-container-highest/60" />
              <div className="mt-3 h-4 w-3/4 rounded bg-surface-container-highest/40" />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-6">
            <div className="h-5 w-28 rounded bg-surface-container-highest mb-5" />
            <div className="h-64 w-full rounded-xl bg-surface-container-highest/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
