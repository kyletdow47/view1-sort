'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GalleryBuilderError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-1">
          Gallery Builder Error
        </h2>
        <p className="text-sm text-white/50 max-w-md">
          {error.message || 'Something went wrong loading the gallery builder. Please try again.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          bg-white/[0.08] border border-white/10 text-white/80
          hover:bg-white/[0.12] transition-colors"
      >
        <RotateCcw size={14} />
        Try Again
      </button>
    </div>
  )
}
