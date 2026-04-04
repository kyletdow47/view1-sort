'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ProjectsErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectsError({ error, reset }: ProjectsErrorProps) {
  useEffect(() => {
    // Log error with context for debugging
    console.error('[Projects Error]', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    })
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10">
        <AlertTriangle className="h-8 w-8 text-red-400/60" />
      </div>
      <h2
        className="text-lg font-semibold text-white mb-2"
        style={{ fontFamily: 'var(--font-geist)' }}
      >
        Something went wrong
      </h2>
      <p className="text-sm text-white/50 max-w-sm mb-8">
        We couldn&apos;t load your projects. This might be a temporary issue — try refreshing.
      </p>
      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white/70 hover:bg-white/15 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  )
}
