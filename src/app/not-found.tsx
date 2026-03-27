import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="font-label text-primary text-sm mb-3 tracking-widest uppercase">404</p>
        <h1 className="font-headline text-2xl text-on-surface mb-3">Page not found</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-accent text-background hover:bg-accent/90 text-sm px-4 py-2"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
