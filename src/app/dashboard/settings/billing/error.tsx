'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary for the Billing & Plan settings page.
 */
export default function SettingsBillingError({ error, reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle size={22} className="text-red-400" />
      </div>
      <div>
        <p className="text-base font-semibold text-white font-[Geist,sans-serif]">
          Failed to load billing
        </p>
        <p className="text-sm text-white/50 mt-1 font-[Inter,sans-serif]">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}
