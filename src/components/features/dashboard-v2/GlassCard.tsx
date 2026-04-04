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
        // Rainbow gradient border — Pencil metallic design system
        border: '1.5px solid transparent',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        backgroundImage: [
          'linear-gradient(180deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 100%)',
          'linear-gradient(135deg, #F59E0B 0%, #3B82F6 22%, #A855F7 45%, #EC4899 68%, #3B82F6 84%, #F59E0B 100%)',
        ].join(','),
        boxShadow: '0 8px 32px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </div>
  )
}
