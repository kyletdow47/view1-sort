'use client'

export default function BrandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
        <span className="text-2xl">🎨</span>
      </div>
      <div>
        <h2 className="font-headline font-bold text-xl text-on-surface">
          Couldn&apos;t load branding settings
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
