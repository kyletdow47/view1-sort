'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ClientsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[ClientsPage] Error:', error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>

      <div className="text-center">
        <h2 className="text-[17px] font-bold text-white/90">Failed to load clients</h2>
        <p className="mt-1.5 text-[13px] text-white/40">
          {error.message || 'An unexpected error occurred while fetching client data.'}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-[10px] text-white/20">Digest: {error.digest}</p>
        )}
      </div>

      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white/90"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  )
}
