'use client'

import { cn } from '@/lib/utils'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
  progress: number // 0-100
  gradientColors: [string, string]
  gradientId: string
  icon: React.ReactNode
  value: string
  className?: string
}

export function ProgressRing({
  size = 80,
  strokeWidth = 12,
  progress,
  gradientColors,
  gradientId,
  icon,
  value,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        {icon}
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
    </div>
  )
}
