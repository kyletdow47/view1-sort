export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-36 animate-pulse rounded-lg bg-white/[0.08]" />
          <div className="h-5 w-6 animate-pulse rounded-full bg-white/[0.08]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 animate-pulse rounded-xl bg-white/[0.08]" />
          <div className="h-8 w-24 animate-pulse rounded-xl bg-white/[0.08]" />
          <div className="h-8 w-28 animate-pulse rounded-xl bg-white/[0.08]" />
        </div>
      </div>

      {/* Notification row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5"
        >
          <div className="mt-1 h-8 w-0.5 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  )
}
