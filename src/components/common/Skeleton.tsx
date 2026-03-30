import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'circle' | 'rect'
}

export function Skeleton({ variant = 'rect', className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        'animate-pulse bg-surface-container-high',
        variant === 'circle' && 'rounded-full',
        variant === 'line' && 'rounded h-4',
        variant === 'rect' && 'rounded-xl',
        className
      )}
      {...props}
    />
  )
}
