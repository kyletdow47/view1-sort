'use client'

import { TopNav } from './TopNav'

interface V2ShellProps {
  children: React.ReactNode
  /** Which nav item is currently active */
  activeNav?: string
}

/**
 * Shared shell for all v2 dashboard pages.
 * Provides the blue gradient background, floating TopNav, and scrollable content area.
 */
export function V2Shell({ children, activeNav = 'Dashboard' }: V2ShellProps) {
  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{
        background:
          'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)',
      }}
    >
      {/* Radial highlight overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 20% 10%, rgba(255,255,255,0.07) 0%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col">
        <TopNav activeNav={activeNav} />
        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6 md:px-10 lg:px-[85px]">
          {children}
        </main>
      </div>
    </div>
  )
}
