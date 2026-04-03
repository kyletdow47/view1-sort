'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectDetailError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('[AI Workspace] Page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 px-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold text-white">
          Something went wrong
        </h2>
        <p className="text-white/50 text-sm leading-relaxed">
          {error.message || 'Failed to load the AI Workspace. This could be a network issue or a problem with the project data.'}
        </p>
        {error.digest && (
          <p className="text-white/30 font-mono text-xs mt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
            text-white bg-indigo-500/80 hover:bg-indigo-500 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
            text-white/70 bg-white/[0.06] border border-white/10
            hover:bg-white/[0.10] hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>
    </div>
  )
}
