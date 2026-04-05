'use client'

import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CheckoutError({ error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0D0B1A] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/25">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h1 className="text-[20px] font-bold text-white">Something went wrong</h1>
        <p className="mt-2 text-[13px] text-white/45">
          {error.message || 'An unexpected error occurred during checkout.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl bg-[#5749F4] px-6 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}
