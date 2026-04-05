/**
 * Checkout page skeleton — shown while the Server Component fetches gallery/project data.
 */

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#0D0B1A] text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#030305] via-[#080810] to-[#030305]" />

      {/* Header skeleton */}
      <header className="border-b border-white/[0.07] bg-black/20">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-36 animate-pulse rounded-lg bg-white/10" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded-lg bg-white/10" />
        </div>
      </header>

      {/* Content skeleton */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left panel */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <div className="h-3 w-24 animate-pulse rounded-md bg-white/10" />
              <div className="mt-2 h-7 w-48 animate-pulse rounded-xl bg-white/10" />
            </div>
            {/* Package cards skeleton */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            <div className="flex justify-between">
              <div className="h-10 w-24 animate-pulse rounded-xl bg-white/10" />
              <div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>

          {/* Right panel: order summary skeleton */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 h-3 w-28 animate-pulse rounded-md bg-white/10" />
              <div className="mb-4 h-14 animate-pulse rounded-xl bg-white/10" />
              <div className="my-4 border-t border-white/10" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="mb-2 flex justify-between">
                  <div className="h-3 w-20 animate-pulse rounded-md bg-white/10" />
                  <div className="h-3 w-16 animate-pulse rounded-md bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
