'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AnalyticsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AnalyticsError({ error, reset }: AnalyticsErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[Analytics] Page error:', error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div
        className="flex max-w-sm flex-col items-center gap-4 rounded-2xl p-8 text-center"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,80,80,0.25)',
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-white">Analytics unavailable</p>
          <p className="mt-1.5 text-[12px] text-white/45">
            Something went wrong loading your analytics. Your data is safe — this is a temporary
            display error.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-[10px] text-white/25">ref: {error.digest}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    </div>
  )
}
