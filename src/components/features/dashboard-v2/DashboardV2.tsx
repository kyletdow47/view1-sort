'use client'

import { TopNav } from './TopNav'
import { WelcomeSection } from './WelcomeSection'
import { RecentActivity } from './RecentActivity'
import { RecentProjects } from './RecentProjects'
import { QuickStats } from './QuickStats'
import { CalendarWidget } from './CalendarWidget'
import { ProjectDeliveries } from './ProjectDeliveries'
import { InboxWidget } from './InboxWidget'
import type { Project } from '@/types/supabase'

export interface DashboardV2Props {
  userName?: string
  projects?: Project[]
  photoCounts?: Record<string, number>
  activeProjectCount?: number
}

export function DashboardV2({
  userName,
  projects = [],
  photoCounts = {},
  activeProjectCount = 0,
}: DashboardV2Props) {
  return (
    <div className="relative h-screen w-full max-w-[1440px] mx-auto overflow-x-hidden rounded-2xl border border-white/[0.13]"
      style={{
        background: 'linear-gradient(135deg, #1A3A8F 0%, #2D60D4 20%, #3B7DE8 40%, #5A6FE8 60%, #7B5EA7 80%, #1E2FA8 100%)',
      }}
    >
      {/* Radial highlight */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 20% 10%, rgba(255,255,255,0.07) 0%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col">
        <TopNav />

        {/* Main layout */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto overflow-x-hidden">
          {/* Center content column */}
          <div className="relative flex w-full max-w-[1280px] flex-col gap-5 px-10 pb-10 pt-8">
            {/* Welcome / chat */}
            <WelcomeSection userName={userName} />

            {/* Row 1: Activity + Projects + Quick Stats — 1:2:1 ratio */}
            <div className="grid min-h-[290px] grid-cols-[1fr_2fr_1fr] gap-4">
              <RecentActivity />
              <RecentProjects projects={projects} photoCounts={photoCounts} />
              <QuickStats />
            </div>

            {/* Row 2: Calendar + Deliveries + Inbox — same 1:2:1 ratio */}
            <div className="grid min-h-[280px] grid-cols-[1fr_2fr_1fr] gap-4">
              <CalendarWidget />
              <ProjectDeliveries />
              <InboxWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
