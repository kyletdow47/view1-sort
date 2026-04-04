'use client'

import Link from 'next/link'
import { CheckCircle, FolderOpen, Camera, CalendarDays, ArrowUpRight } from 'lucide-react'
import { GlassPanel } from './GlassPanel'
import { ProgressRing } from './ProgressRing'

interface QuickStatsProps {
  activeProjectCount?: number
  upcomingShoots?: number
  revenueThisMonth?: number
  pendingActions?: number
}

export function QuickStats({
  activeProjectCount = 0,
  upcomingShoots = 0,
  revenueThisMonth = 0,
  pendingActions = 0,
}: QuickStatsProps) {
  const stats = [
    {
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      value: String(pendingActions || 12),
      label: 'Pending Actions',
      progress: pendingActions > 0 ? Math.min(100, pendingActions * 10) : 60,
      colors: ['var(--chart-orange, #FF8E53)', 'var(--chart-red, #FF6B6B)'] as [string, string],
      id: 'actions',
    },
    {
      icon: <FolderOpen className="h-5 w-5 text-white" />,
      value: String(activeProjectCount || 4),
      label: 'Active Projects',
      progress: activeProjectCount > 0 ? Math.min(100, activeProjectCount * 20) : 80,
      colors: ['var(--chart-teal, #4ECDC4)', 'var(--chart-green, #44CF6C)'] as [string, string],
      id: 'projects',
    },
    {
      icon: <Camera className="h-5 w-5 text-white" />,
      value: String(upcomingShoots || 3),
      label: 'Upcoming Shoots',
      progress: upcomingShoots > 0 ? Math.min(100, upcomingShoots * 15) : 30,
      colors: ['var(--chart-purple, #C77DFF)', 'var(--chart-violet, #7B2FBE)'] as [string, string],
      id: 'shoots',
    },
    {
      icon: <CalendarDays className="h-5 w-5 text-white" />,
      value: revenueThisMonth > 0 ? `$${(revenueThisMonth / 100).toLocaleString()}` : '$3.2k',
      label: 'Revenue this Month',
      progress: revenueThisMonth > 0 ? Math.min(100, (revenueThisMonth / 500000) * 100) : 67,
      colors: ['var(--chart-yellow, #FFD93D)', 'var(--chart-amber, #FF9F43)'] as [string, string],
      id: 'revenue',
    },
  ]

  return (
    <GlassPanel className="flex h-full w-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold tracking-[0.5px] text-white/[0.67]">
          Quick Stats
        </span>
        <Link href="/dashboard/analytics" className="text-white/[0.67] transition-colors hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 2x2 Grid */}
      <div className="grid flex-1 grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col items-center justify-center gap-1.5"
          >
            <ProgressRing
              progress={stat.progress}
              gradientColors={stat.colors}
              gradientId={`ring-${stat.id}`}
              icon={stat.icon}
              value={stat.value}
            />
            <span className="w-full text-center text-[11px] text-white/[0.67]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
