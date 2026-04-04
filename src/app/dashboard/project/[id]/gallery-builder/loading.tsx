export default function GalleryBuilderLoading() {
  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden">
      {/* Top Bar Skeleton */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]
        bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="w-28 h-3.5 bg-white/[0.06] rounded animate-pulse" />
            <div className="w-40 h-2.5 bg-white/[0.04] rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-8 bg-white/[0.06] rounded-lg animate-pulse" />
          <div className="w-32 h-8 bg-[#5749F4]/30 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Split Panel Skeleton */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel */}
        <div className="w-[340px] shrink-0 border-r border-white/[0.06] p-4 flex flex-col gap-4">
          {/* Section Tabs */}
          <div className="flex gap-2 pb-3 border-b border-white/[0.06]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 h-6 bg-white/[0.06] rounded animate-pulse" />
            ))}
          </div>

          {/* Photo Grid Skeleton */}
          <div className="grid grid-cols-3 gap-1.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-white/[0.06] animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
              <div className="px-6 pt-8 pb-4">
                <div className="w-48 h-5 bg-white/[0.08] rounded animate-pulse" />
                <div className="w-20 h-3 bg-white/[0.04] rounded mt-2 animate-pulse" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-3 gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-white/[0.06] animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
