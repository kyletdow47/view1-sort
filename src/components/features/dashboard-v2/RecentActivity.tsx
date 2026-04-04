'use client'

import Link from 'next/link'
import { ArrowUpRight, Activity } from 'lucide-react'
import { GlassPanel } from './GlassPanel'

interface ActivityItem {
  color: string
  text: string
  time: string
}

interface RecentActivityProps {
  activities?: ActivityItem[]
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  { color: 'bg-green-400', text: 'Johnson Wedding gallery published', time: '2 hours ago' },
  { color: 'bg-indigo-400', text: 'AI sorted 156 photos — Oak Street', time: '5 hours ago' },
  { color: 'bg-amber-400', text: 'Client viewed Portugal Travel gallery', time: 'Yesterday' },
  { color: 'bg-red-400', text: 'Payment received — $1,200', time: '2 days ago' },
  { color: 'bg-indigo-400', text: 'New project created — Corporate Headshots', time: '3 days ago' },
]

export function RecentActivity({ activities }: RecentActivityProps) {
  const items = activities ?? MOCK_ACTIVITIES

  return (
    <GlassPanel className="flex h-full flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold text-white">
          Recent Activity
        </span>
        <Link href="/dashboard/notifications" className="text-white/[0.67] transition-colors hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Activity List or Empty State */}
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <Activity className="h-8 w-8 text-white/20" />
          <span className="text-xs text-white/40">No recent activity</span>
          <span className="text-[10px] text-white/25">
            Activity will appear here as you work
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
            >
              <div className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-xs font-medium text-white/[0.87]">
                  {item.text}
                </span>
                <span className="text-[10px] text-white/40">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  )
}
