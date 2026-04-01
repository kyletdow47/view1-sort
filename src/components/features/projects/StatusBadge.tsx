'use client'

import { clsx } from 'clsx'

export type ProjectPipelineStatus =
  | 'inquiry'
  | 'quoted'
  | 'booked'
  | 'contracted'
  | 'prepped'
  | 'shooting'
  | 'processing'
  | 'review'
  | 'gallery_live'
  | 'delivered'

interface StatusConfig {
  label: string
  textClass: string
  bgClass: string
  dotClass: string
  animated?: boolean
}

export const STATUS_CONFIG: Record<ProjectPipelineStatus, StatusConfig> = {
  inquiry:      { label: 'Inquiry',      textClass: 'text-gray-400',    bgClass: 'bg-gray-500/20',    dotClass: 'bg-gray-400' },
  quoted:       { label: 'Quoted',       textClass: 'text-amber-400',   bgClass: 'bg-amber-500/20',   dotClass: 'bg-amber-400' },
  booked:       { label: 'Booked',       textClass: 'text-blue-400',    bgClass: 'bg-blue-500/20',    dotClass: 'bg-blue-400' },
  contracted:   { label: 'Contracted',   textClass: 'text-violet-400',  bgClass: 'bg-violet-500/20',  dotClass: 'bg-violet-400' },
  prepped:      { label: 'Prepped',      textClass: 'text-cyan-400',    bgClass: 'bg-cyan-500/20',    dotClass: 'bg-cyan-400' },
  shooting:     { label: 'Shooting',     textClass: 'text-orange-400',  bgClass: 'bg-orange-500/20',  dotClass: 'bg-orange-400' },
  processing:   { label: 'Processing',   textClass: 'text-yellow-400',  bgClass: 'bg-yellow-500/20',  dotClass: 'bg-yellow-400', animated: true },
  review:       { label: 'In Review',    textClass: 'text-pink-400',    bgClass: 'bg-pink-500/20',    dotClass: 'bg-pink-400' },
  gallery_live: { label: 'Gallery Live', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/20', dotClass: 'bg-emerald-400' },
  delivered:    { label: 'Delivered',    textClass: 'text-gray-400',    bgClass: 'bg-gray-500/20',    dotClass: 'bg-gray-400' },
}

const FALLBACK: StatusConfig = {
  label: 'Unknown',
  textClass: 'text-gray-400',
  bgClass: 'bg-gray-500/20',
  dotClass: 'bg-gray-400',
}

export interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as ProjectPipelineStatus] ?? FALLBACK

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      <span
        className={clsx(
          'inline-block h-1.5 w-1.5 rounded-full shrink-0',
          config.dotClass,
          config.animated && 'animate-pulse',
        )}
      />
      {config.label}
    </span>
  )
}
