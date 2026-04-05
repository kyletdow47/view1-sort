import { Suspense } from 'react'
import { StripeConnectSetup } from '@/components/features/settings/StripeConnectSetup'

/**
 * Payment Setup page — Settings › Connect
 *
 * Pencil frame: WkLgB ("Stripe Connect Onboarding")
 * Route: /dashboard/settings/connect
 *
 * Server Component wrapper. All interactive state lives in
 * StripeConnectSetup (client component).
 */
export default function StripeConnectPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[Geist,sans-serif]">
          Payment Setup
        </h1>
        <p className="mt-1 text-sm text-white/50 font-[Geist,sans-serif]">
          Connect your Stripe account to receive client payments directly
        </p>
      </div>

      {/* Connect widget — useSearchParams requires Suspense */}
      <Suspense
        fallback={
          <div className="flex items-center gap-3 py-6 text-white/40">
            <span className="text-sm font-[Geist,sans-serif]">Loading payment settings…</span>
          </div>
        }
      >
        <StripeConnectSetup />
      </Suspense>
    </div>
  )
}
