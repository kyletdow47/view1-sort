/**
 * Skeleton loader for the Billing & Plan settings page.
 * Mirrors the layout sections: plan card, plan comparison, Stripe Connect, billing history.
 */
export default function SettingsBillingLoading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-md bg-white/[0.06]" />
          <div className="h-3.5 w-52 rounded-md bg-white/[0.04]" />
        </div>
        <div className="h-3.5 w-24 rounded-md bg-white/[0.04] mt-1" />
      </div>

      {/* Current Plan card */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-white/[0.06]" />
            <div className="h-7 w-16 rounded-md bg-white/[0.08]" />
            <div className="h-3 w-40 rounded bg-white/[0.04]" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-white/[0.06]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 rounded-lg bg-white/[0.03] border border-white/[0.05]" />
          <div className="h-16 rounded-lg bg-white/[0.03] border border-white/[0.05]" />
        </div>
      </div>

      {/* Plan comparison table */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-white/[0.04]" />
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-4 border-b border-white/[0.05] bg-white/[0.02]">
            <div className="p-4" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-4 border-l border-white/[0.05] space-y-1.5">
                <div className="h-4 w-16 rounded bg-white/[0.06] mx-auto" />
                <div className="h-3 w-10 rounded bg-white/[0.04] mx-auto" />
              </div>
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 border-t border-white/[0.04]">
              <div className="px-4 py-3">
                <div className="h-3 w-24 rounded bg-white/[0.04]" />
              </div>
              {[0, 1, 2].map((j) => (
                <div key={j} className="px-4 py-3 border-l border-white/[0.04] flex items-center justify-center">
                  <div className="h-3.5 w-3.5 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Connect */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white/[0.08] flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-28 rounded bg-white/[0.06]" />
            <div className="h-3 w-48 rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>

      {/* Billing history */}
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-white/[0.04]" />
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] overflow-hidden">
          <div className="border-b border-white/[0.05] bg-white/[0.02] px-4 py-3 grid grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 rounded bg-white/[0.05]" />
            ))}
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-t border-white/[0.04] px-4 py-3 grid grid-cols-5 gap-4 items-center">
              <div className="h-3 w-20 rounded bg-white/[0.04]" />
              <div className="h-3 w-16 rounded bg-white/[0.04]" />
              <div className="h-3 w-12 rounded bg-white/[0.06]" />
              <div className="h-5 w-14 rounded-full bg-white/[0.04]" />
              <div className="h-3 w-14 rounded bg-white/[0.04] ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
