'use client'

import { useState, useRef } from 'react'

interface HoverCardProps {
  children: React.ReactNode
  /** Tooltip content shown on hover */
  tooltip: React.ReactNode
  className?: string
}

/**
 * Effect 19: Hover tooltip card that scales in from below
 * with a smooth cubic-bezier transition.
 */
export function HoverCard({ children, tooltip, className = '' }: HoverCardProps) {
  const [show, setShow] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  function handleEnter() {
    clearTimeout(timeoutRef.current)
    setShow(true)
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setShow(false), 150)
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-50 w-64 rounded-xl border border-zinc-700/60 bg-zinc-900/95 backdrop-blur-lg p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] pointer-events-none transition-all duration-200 ${
          show
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {tooltip}
      </div>
    </div>
  )
}
