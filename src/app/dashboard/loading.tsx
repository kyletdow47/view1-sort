import { Skeleton } from '@/components/common'

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="line" className="w-48 h-7" />
          <Skeleton variant="line" className="w-32 h-4" />
        </div>
        <Skeleton className="w-32 h-9" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      {/* Project cards grid */}
      <div className="space-y-3">
        <Skeleton variant="line" className="w-24 h-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl bg-surface-container-low p-4 space-y-3">
              <Skeleton className="h-36 w-full" />
              <Skeleton variant="line" className="w-3/4 h-5" />
              <Skeleton variant="line" className="w-1/2 h-4" />
              <div className="flex gap-2">
                <Skeleton variant="line" className="w-16 h-6" />
                <Skeleton variant="line" className="w-20 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
