'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

interface AnimatedCounterProps {
  /** The target value to count to (numeric part only) */
  target: number
  /** Prefix before the number (e.g. "$") */
  prefix?: string
  /** Suffix after the number (e.g. "+", "K", " mins") */
  suffix?: string
  /** Duration of the count animation in ms */
  duration?: number
  className?: string
}

export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 2000,
  className = '',
}: AnimatedCounterProps) {
  const [ref, inView] = useInView({ threshold: 0.5 })
  const [value, setValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    const start = performance.now()

    function update(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [inView, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  )
}
