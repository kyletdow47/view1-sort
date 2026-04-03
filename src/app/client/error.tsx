'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ClientPortalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: Log to error reporting service
    console.error('[ClientPortal] Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0B1A] px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>

        <h2 className="font-headline text-lg font-bold text-white">
          Something went wrong
        </h2>

        <p className="text-[14px] text-white/50">
          We couldn&apos;t load your portal. This is usually temporary — try
          refreshing the page.
        </p>

        <button
          onClick={reset}
          className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.08] border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white/80 transition-all hover:bg-white/[0.12]"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
