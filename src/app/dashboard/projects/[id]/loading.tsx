/** Loading skeleton for AI Workspace page — matches Pencil frame I8wu6 layout */

export default function ProjectDetailLoading() {
  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden animate-pulse">
      {/* Project Header skeleton */}
      <div className="flex items-center justify-between h-14 px-10 border-b border-white/[0.06] bg-white/[0.025]">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-white/10" />
          <div className="h-3.5 w-16 rounded bg-white/10" />
          <div className="h-3.5 w-2 rounded bg-white/5" />
          <div className="h-3.5 w-44 rounded bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 rounded-[10px] bg-amber-500/20" />
          <div className="h-8 w-32 rounded-[10px] bg-white/5 border border-white/10" />
        </div>
      </div>

      {/* Tab Bar skeleton */}
      <div className="flex items-center justify-between px-10 py-3">
        <div className="flex gap-1 p-1 rounded-[20px] bg-white/[0.06]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-9 rounded-xl ${i === 0 ? 'w-24 bg-white/10' : 'w-20 bg-white/[0.03]'}`}
            />
          ))}
        </div>
        <div className="h-4 w-24 rounded bg-white/10" />
      </div>

      {/* Content Area skeleton */}
      <div className="flex flex-col flex-1 min-h-0 gap-4 px-6">
        {/* Sub-tab row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.05]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded-lg ${i === 1 ? 'w-24 bg-white/10' : 'w-20 bg-white/[0.03]'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-[10px] bg-white/5 border border-white/10" />
            <div className="h-8 w-24 rounded-[10px] bg-white/5 border border-white/10" />
          </div>
        </div>

        {/* Category columns + AI Panel */}
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex gap-3 flex-1 min-h-0">
            {Array.from({ length: 4 }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="flex-1 flex flex-col gap-2.5 p-3 rounded-[20px] bg-white/[0.06] border border-white/[0.08]"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="h-5 w-8 rounded-full bg-white/5" />
                </div>
                {Array.from({ length: 3 - (colIdx === 3 ? 1 : 0) }).map((_, cardIdx) => (
                  <div
                    key={cardIdx}
                    className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden"
                  >
                    <div className="aspect-[4/3] bg-white/[0.03]" />
                    <div className="p-2.5 space-y-1.5">
                      <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
                      <div className="h-2.5 w-1/2 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* AI Analysis Panel skeleton */}
          <div className="w-[260px] shrink-0 p-4 rounded-3xl bg-white/[0.06] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="h-4 w-4 rounded bg-indigo-400/20" />
            </div>
            <div className="h-px bg-white/10" />
            <div className="space-y-3">
              <div className="h-3 w-32 rounded bg-white/[0.06]" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-3 w-16 rounded bg-white/[0.06]" />
                  <div className="flex-1 h-2 rounded-full bg-white/[0.04]" />
                </div>
              ))}
            </div>
            <div className="h-px bg-white/10" />
            <div className="space-y-2.5">
              <div className="h-3 w-28 rounded bg-white/[0.06]" />
              <div className="h-10 rounded-[10px] bg-white/[0.04]" />
              <div className="h-10 rounded-[10px] bg-white/[0.04]" />
            </div>
            <div className="h-10 rounded-xl bg-indigo-400/10" />
          </div>
        </div>
      </div>

      {/* Cull Slider Bar skeleton */}
      <div className="flex items-center justify-between px-10 py-3 border-t border-white/[0.06] bg-white/[0.025]">
        <div className="flex items-center gap-3">
          <div className="h-3.5 w-20 rounded bg-white/10" />
          <div className="h-4 w-8 rounded bg-white/10" />
          <div className="h-3.5 w-14 rounded bg-white/[0.06]" />
          <div className="h-1.5 w-[200px] rounded-full bg-white/10" />
        </div>
        <div className="h-6 w-36 rounded-lg bg-indigo-400/10" />
      </div>
    </div>
  )
}
