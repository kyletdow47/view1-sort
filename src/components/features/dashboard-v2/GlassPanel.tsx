'use client'

import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'subtle'
}

export function GlassPanel({ children, className, variant = 'default' }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-white/10 overflow-hidden',
        variant === 'default' && [
          'backdrop-blur-[32px]',
          'bg-gradient-to-b from-white/[0.12] to-white/[0.03]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.16),0_1px_0_rgba(255,255,255,0.15)]',
        ],
        variant === 'subtle' && [
          'backdrop-blur-[16px]',
          'bg-gradient-to-b from-white/[0.08] to-transparent',
          'shadow-[0_1px_0_rgba(255,255,255,0.1)]',
        ],
        className
      )}
    >
      {/* Top highlight border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {children}
    </div>
  )
}
