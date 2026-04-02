'use client'

/**
 * Passthrough wrapper for dashboard sub-pages.
 * DashboardClientLayout already provides gradient, TopNav, padding, and max-width.
 */
export function V2Shell({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
