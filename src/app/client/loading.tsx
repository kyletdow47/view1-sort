import { Skeleton } from '@/components/common'

export default function ClientPortalLoading() {
  return (
    <div className="min-h-screen bg-[#0D0B1A] text-white">
      {/* Nav skeleton */}
      <header className="flex h-14 items-center justify-between px-6 md:px-10 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-[30px] w-[30px] rounded-lg" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      {/* Content skeleton */}
      <main className="mx-auto max-w-6xl px-6 md:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-8">
            {/* Welcome */}
            <div>
              <Skeleton className="h-8 w-72 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>

            {/* Pending actions */}
            <div className="flex gap-3">
              <Skeleton className="h-14 flex-1 rounded-2xl" />
              <Skeleton className="h-14 flex-1 rounded-2xl" />
              <Skeleton className="h-14 flex-1 rounded-2xl" />
            </div>

            {/* Gallery rows */}
            <div className="flex flex-col gap-3">
              <Skeleton className="h-3 w-24 mb-1" />
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="hidden lg:flex flex-col gap-4 w-80">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  )
}
