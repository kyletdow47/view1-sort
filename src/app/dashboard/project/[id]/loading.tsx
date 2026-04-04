import { Skeleton } from '@/components/common'

export default function ProjectLoading() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden animate-pulse">
      {/* Project Header Skeleton */}
      <div className="flex items-center justify-between px-10 h-14 border-b border-white/[0.06] bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-16 h-4 rounded" />
          <Skeleton className="w-3 h-4 rounded" />
          <Skeleton className="w-40 h-4 rounded" />
        </div>
        <Skeleton className="w-20 h-6 rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-28 h-9 rounded-[10px]" />
          <Skeleton className="w-32 h-9 rounded-[10px]" />
        </div>
      </div>

      {/* Tab Bar Skeleton */}
      <div className="flex items-center justify-between px-10 py-3">
        <div className="flex items-center gap-1 p-1 rounded-[20px] bg-white/[0.05]">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-8 rounded-xl" />
          ))}
        </div>
        <Skeleton className="w-20 h-4 rounded" />
      </div>

      {/* Sub-Tab Row Skeleton */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.05]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-20 h-7 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-7 rounded-lg" />
          <Skeleton className="w-16 h-7 rounded-lg" />
          <Skeleton className="w-14 h-7 rounded-lg" />
        </div>
      </div>

      {/* Content Skeleton: 4 columns + side panel */}
      <div className="flex gap-4 flex-1 min-h-0 px-6 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 p-3 rounded-[20px] flex-1
              bg-white/[0.04] border border-white/10"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="w-20 h-4 rounded" />
              </div>
              <Skeleton className="w-6 h-3 rounded" />
            </div>
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="w-full aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ))}
        {/* AI Panel skeleton */}
        <div className="w-[260px] shrink-0 rounded-3xl bg-white/[0.04] border border-white/10 p-4">
          <Skeleton className="w-24 h-4 rounded mb-4" />
          <Skeleton className="w-full h-1.5 rounded-full mb-3" />
          <Skeleton className="w-full h-20 rounded-lg mb-3" />
          <Skeleton className="w-full h-20 rounded-lg" />
        </div>
      </div>

      {/* Cull Slider Skeleton */}
      <div className="flex items-center justify-between px-10 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-4 rounded" />
          <Skeleton className="w-8 h-5 rounded" />
          <Skeleton className="w-12 h-4 rounded" />
          <Skeleton className="w-[200px] h-1.5 rounded-full" />
        </div>
        <Skeleton className="w-32 h-6 rounded-lg" />
      </div>
    </div>
  )
}
