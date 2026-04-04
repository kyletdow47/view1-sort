'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface PublishErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublishError({ error, reset }: PublishErrorProps) {
  useEffect(() => {
    console.error('[PublishPage] Error:', error)
  }, [error])

  return (
    <div className="min-h-full flex items-center justify-center px-10 py-16">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-white">
            Failed to load delivery flow
          </h2>
          <p className="text-sm text-white/50">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
              bg-white/[0.06] border border-white/[0.08] text-white/80
              hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <Link
            href="/dashboard/projects"
            className="rounded-xl px-4 py-2 text-sm font-semibold
              text-white/50 hover:text-white/80 transition-colors"
          >
            Back to projects
          </Link>
        </div>
      </div>
    </div>
  )
}
