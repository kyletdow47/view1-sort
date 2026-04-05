'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BookingsPhotoPageError({ error, reset }: ErrorProps) {
  return (
    <div className="flex h-full items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-3xl"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-white mb-1">Page Builder Failed to Load</h2>
          <p className="text-[13px] text-white/45 leading-relaxed">
            {error.message || 'Something went wrong loading the booking page builder.'}
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #3b82f6 50%, #a855f7 100%)' }}
        >
          <RefreshCw size={13} />
          Try Again
        </button>
      </div>
    </div>
  )
}
