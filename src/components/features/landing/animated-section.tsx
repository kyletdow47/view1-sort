'use client'

import React from 'react'
import { useInView } from '@/hooks/use-in-view'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  /** Delay in ms before animation starts */
  delay?: number
  /** Animation variant */
  variant?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-up' | 'float-in'
  as?: React.ElementType
}

const variants = {
  'fade-up': {
    hidden: 'opacity-0 translate-y-5',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-in': {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  'scale-in': {
    hidden: 'opacity-0 translate-y-[60px] scale-[0.95]',
    visible: 'opacity-100 translate-y-0 scale-100',
  },
  'slide-up': {
    hidden: 'opacity-0 translate-y-20',
    visible: 'opacity-100 translate-y-0',
  },
  // Effect 6: Card float-in with growing shadow
  'float-in': {
    hidden: 'opacity-0 translate-y-[80px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]',
    visible: 'opacity-100 translate-y-0 shadow-[0_25px_60px_rgba(0,0,0,0.12)]',
  },
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  variant = 'fade-up',
  as: Tag = 'div',
}: AnimatedSectionProps) {
  const [ref, inView] = useInView({ threshold: 0.15 })

  const v = variants[variant]
  const Component = Tag as React.ElementType

  return (
    <Component
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? v.visible : v.hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  )
}
