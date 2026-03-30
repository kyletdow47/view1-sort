import { Skeleton } from '@/components/common'

/**
 * Loading state for the AI Sort page.
 * Shown while the page code-splits and hydrates the classifier.
 */
export default function AiSortLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="line" className="w-40 h-8" />
        <Skeleton variant="line" className="w-72 h-4" />
      </div>

      {/* Shoot context card */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-4">
        <Skeleton variant="line" className="w-32 h-5" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-20 rounded-xl" />
      </div>

      {/* Upload drop zone */}
      <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-low p-10 flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <Skeleton variant="line" className="w-40 h-5" />
        <Skeleton variant="line" className="w-28 h-4" />
      </div>
    </div>
  )
}
