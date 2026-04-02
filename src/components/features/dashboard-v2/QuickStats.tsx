'use client'

import { CheckCircle, FolderOpen, Camera, CalendarDays } from 'lucide-react'
import { GlassPanel } from './GlassPanel'
import { ProgressRing } from './ProgressRing'

const stats = [
  {
    icon: <CheckCircle className="h-5 w-5 text-white" />,
    value: '12',
    label: 'Unfinished Tasks',
    progress: 60,
    colors: ['#FF8E53', '#FF6B6B'] as [string, string],
    id: 'tasks',
  },
  {
    icon: <FolderOpen className="h-5 w-5 text-white" />,
    value: '4',
    label: 'Active Projects',
    progress: 80,
    colors: ['#4ECDC4', '#44CF6C'] as [string, string],
    id: 'projects',
  },
  {
    icon: <Camera className="h-5 w-5 text-white" />,
    value: '3',
    label: 'Shoots Pending',
    progress: 30,
    colors: ['#C77DFF', '#7B2FBE'] as [string, string],
    id: 'shoots',
  },
  {
    icon: <CalendarDays className="h-5 w-5 text-white" />,
    value: '8',
    label: 'Shoots this Month',
    progress: 67,
    colors: ['#FFD93D', '#FF9F43'] as [string, string],
    id: 'monthly',
  },
]

export function QuickStats() {
  return (
    <GlassPanel className="flex h-full w-full flex-col gap-3 p-4">
      <span className="text-[14px] font-semibold tracking-[0.5px] text-white/[0.67]">
        Quick Stats
      </span>

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
