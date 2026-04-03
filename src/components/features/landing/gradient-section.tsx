'use client'

import { useRef, useEffect } from 'react'

interface GradientSectionProps {
  children: React.ReactNode
  /** CSS color for when section is above viewport */
  fromColor?: string
  /** CSS color for when section is in viewport */
  toColor?: string
  className?: string
  id?: string
}

/**
 * Effect 10: Section background smoothly transitions between two colors
 * based on scroll position. Creates cinematic pacing between sections.
 */
export function GradientSection({
  children,
  fromColor = '#09090b',
  toColor = '#0a0a2e',
  className = '',
  id,
}: GradientSectionProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function onScroll() {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight))
      el.style.background = `linear-gradient(180deg, ${fromColor} ${Math.max(0, 50 - progress * 60)}%, ${toColor} ${Math.min(100, progress * 120)}%)`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [fromColor, toColor])

  return (
    <section ref={ref} id={id} className={`${className}`}>
      {children}
    </section>
  )
}
