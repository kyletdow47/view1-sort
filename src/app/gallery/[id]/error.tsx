'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/common'

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GalleryError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-10 h-10 text-error mx-auto mb-4" />
        <h2 className="font-headline text-lg text-on-surface mb-2">Gallery unavailable</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          We couldn't load this gallery. It may have been removed or you may not have access.
        </p>
        <Button onClick={reset} className="flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}
