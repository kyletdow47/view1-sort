'use client'

/**
 * Contracts page error boundary — /dashboard/contracts
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ContractsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // TODO: Log to error tracking service (Sentry, etc.)
    console.error('[ContractsPage] error:', error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16">
      <div
        className="flex items-center justify-center rounded-2xl p-4"
        style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.20)' }}
      >
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-[16px] font-bold text-white">Failed to load contracts</h2>
        <p className="mt-1 text-[13px] text-white/50">
          {error.message ?? 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  )
}
