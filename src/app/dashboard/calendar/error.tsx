'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CalendarError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[CalendarPage] Error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
        style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}
      >
        <AlertTriangle size={22} className="text-red-400" />
      </div>
      <h2 className="text-[20px] font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-[13px] text-white/45 max-w-md mb-6">
        The calendar page failed to load. This is often a temporary issue.
        {error.digest && (
          <span className="block mt-1 font-mono text-[11px] text-white/25">
            Error ID: {error.digest}
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-2.5 text-[13px] font-medium text-white/60 hover:border-violet-400/30 hover:text-violet-300 transition-colors"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}
