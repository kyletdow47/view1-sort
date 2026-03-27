'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/common'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[SettingsError]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <AlertTriangle className="w-10 h-10 text-error mb-4" />
      <h2 className="font-headline text-lg text-on-surface mb-2">Failed to load settings</h2>
      <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
        We couldn&apos;t load your settings. Please try again.
      </p>
      <Button onClick={reset} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  )
}
