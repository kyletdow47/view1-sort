'use client'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  noPad?: boolean
}

export function GlassCard({ children, className = '', noPad = false }: GlassCardProps) {
  return (
    <div
      className={`rounded-3xl backdrop-blur-[32px] ${noPad ? '' : 'p-4'} ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {children}
    </div>
  )
}
