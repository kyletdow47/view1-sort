export default function BookingsPhotoPageLoading() {
  return (
    <div className="flex h-full gap-6 px-6 py-5 animate-pulse">
      {/* Left panel skeleton */}
      <div className="flex flex-col gap-4 w-[400px] shrink-0">
        {/* Tab bar */}
        <div className="h-10 rounded-2xl bg-white/5" />
        {/* URL bar */}
        <div className="h-12 rounded-2xl bg-white/5" />
        {/* Section cards */}
        {[160, 200, 100].map((h, i) => (
          <div
            key={i}
            className="rounded-3xl bg-white/5"
            style={{ height: h }}
          />
        ))}
        {/* Save button */}
        <div className="h-12 rounded-2xl bg-white/10" />
      </div>

      {/* Right preview skeleton */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded-full bg-white/5" />
          <div className="h-8 w-36 rounded-xl bg-white/5" />
        </div>
        {/* Preview frame */}
        <div className="flex-1 rounded-3xl bg-white/5" style={{ minHeight: 500 }} />
      </div>
    </div>
  )
}
