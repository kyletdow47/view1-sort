import { Skeleton } from '@/components/common'

export default function ProjectLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-view1-border">
        <Skeleton variant="line" className="w-40 h-6" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-8 h-8" />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-view1-border overflow-x-auto">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="line" className="w-20 h-7 shrink-0" />
        ))}
      </div>

      {/* Photo grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
