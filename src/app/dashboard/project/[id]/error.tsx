'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/common'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[ProjectPage] Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-white font-sans text-lg font-semibold">
          Something went wrong
        </h2>
        <p className="text-white/50 font-sans text-sm leading-relaxed">
          We couldn&apos;t load this project. This might be a temporary issue —
          try refreshing or go back to your projects list.
        </p>
        {error.digest && (
          <p className="text-white/20 font-mono text-xs mt-1">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset} variant="secondary" size="sm">
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Try again
        </Button>
        <Button
          onClick={() => { window.location.href = '/dashboard/projects' }}
          variant="ghost"
          size="sm"
        >
          Back to Projects
        </Button>
      </div>
    </div>
  )
}
