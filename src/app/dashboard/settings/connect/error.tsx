'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Error boundary for Settings › Connect
 */
export default function StripeConnectError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white font-[Geist,sans-serif]">
          Failed to load payment settings
        </h2>
        <p className="mt-1 text-sm text-white/50 font-[Geist,sans-serif]">
          {error.message ?? 'Something went wrong. Please try again.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 font-[Geist,sans-serif]"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}
