import { Skeleton } from '@/components/common/Skeleton'

function StatSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-xl px-3 py-2.5"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <Skeleton variant="line" className="h-8 w-16 mb-1" />
      <Skeleton variant="line" className="h-3 w-24" />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div
      className="h-[260px] rounded-[20px] overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        border: '2px solid rgba(255,255,255,0.12)',
      }}
    >
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  )
}

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton variant="line" className="h-8 w-40 mb-2" />
          <Skeleton variant="line" className="h-4 w-72" />
        </div>
        <Skeleton variant="line" className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-4 gap-3.5">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton variant="line" className="h-10 w-56 rounded-lg" />
        <Skeleton variant="line" className="h-8 w-12 rounded-full" />
        <Skeleton variant="line" className="h-8 w-16 rounded-full" />
        <Skeleton variant="line" className="h-8 w-20 rounded-full" />
        <Skeleton variant="line" className="h-8 w-20 rounded-full" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
