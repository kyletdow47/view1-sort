/**
 * Loading skeleton for Settings › Connect
 * Matches Pencil frame WkLgB layout.
 */
export default function StripeConnectLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-white/8" />
        <div className="h-4 w-72 rounded-md bg-white/5" />
      </div>

      {/* Status card skeleton */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3 backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/20" />
          <div className="h-4 w-20 rounded bg-white/10" />
        </div>
        <div className="h-4 w-48 rounded bg-white/8" />
        <div className="h-4 w-64 rounded bg-white/5" />
      </div>

      {/* Payment methods card skeleton */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 backdrop-blur-2xl">
        <div className="h-5 w-44 rounded bg-white/10" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-36 rounded bg-white/8" />
            <div className="h-5 w-9 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      {/* Footer note skeleton */}
      <div className="mx-auto h-3 w-72 rounded bg-white/5" />
    </div>
  )
}
