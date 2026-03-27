import { Skeleton } from '@/components/common'

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Gallery header */}
      <div className="border-b border-view1-border px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton variant="line" className="w-48 h-7" />
            <Skeleton variant="line" className="w-32 h-4" />
          </div>
          <Skeleton className="w-28 h-9" />
        </div>
      </div>

      {/* Category filter */}
      <div className="border-b border-view1-border px-6 py-3">
        <div className="max-w-6xl mx-auto flex gap-3 overflow-x-auto">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="line" className="w-20 h-7 shrink-0" />
          ))}
        </div>
      </div>

      {/* Photo masonry grid */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-full break-inside-avoid mb-3"
              style={{ height: `${[180, 240, 200, 160, 220, 200][i % 6]}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
