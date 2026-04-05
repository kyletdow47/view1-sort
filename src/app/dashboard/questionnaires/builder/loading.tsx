export default function QuestionnaireBuilderLoading() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#030305' }}>
      {/* Nav skeleton */}
      <div
        className="flex items-center justify-between px-10 h-14 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1.5px solid rgba(245,158,11,0.15)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="h-[18px] w-[18px] rounded bg-white/10 animate-pulse" />
          <div className="h-5 w-56 rounded-lg bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-32 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-8 w-20 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-8 w-32 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Subtitle skeleton */}
      <div className="px-10 py-2">
        <div className="h-3 w-64 rounded bg-white/10 animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 gap-6 px-6 pb-6">
        {/* Left panel skeleton */}
        <div className="w-72 flex-shrink-0">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
            <div className="h-3 w-20 rounded bg-white/10 animate-pulse mb-4" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-white/10 animate-pulse" />
                  <div className="h-2.5 w-32 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel skeleton */}
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="h-7 w-72 rounded-lg bg-white/10 animate-pulse mb-2" />
            <div className="h-4 w-96 rounded bg-white/10 animate-pulse" />
            <div className="space-y-3 mt-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
