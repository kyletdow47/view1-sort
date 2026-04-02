'use client'

import { useRef } from 'react'
import { useScrollY } from '@/hooks/useScrollY'

interface ScrollCardProps {
  children: React.ReactNode
  rotation?: number
  depth?: number
  className?: string
}

export function ScrollCard({ children, rotation = 0, depth = 1, className = '' }: ScrollCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollY = useScrollY()

  const getTransform = () => {
    if (!ref.current) return {}
    const rect = ref.current.getBoundingClientRect()
    const windowH = typeof window !== 'undefined' ? window.innerHeight : 900
    const center = rect.top + rect.height / 2
    const progress = (center - windowH / 2) / windowH
    const clampedProgress = Math.max(-1, Math.min(1, progress))

    const translateY = clampedProgress * 30 * depth
    const rotateZ = rotation + clampedProgress * 2 * depth
    const scale = 1 - Math.abs(clampedProgress) * 0.03

    return {
      transform: `perspective(1200px) translateY(${translateY}px) rotateZ(${rotateZ}deg) rotateX(${clampedProgress * 3}deg) scale(${scale})`,
      transition: 'transform 0.1s ease-out',
    }
  }

  // scrollY is used to trigger re-renders on scroll
  void scrollY

  return (
    <div
      ref={ref}
      className={className}
      style={getTransform()}
    >
      {children}
    </div>
  )
}
