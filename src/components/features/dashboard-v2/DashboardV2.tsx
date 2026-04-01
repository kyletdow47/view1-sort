'use client'

import { TopNav } from './TopNav'
import { WelcomeSection } from './WelcomeSection'
import { RecentActivity } from './RecentActivity'
import { RecentProjects } from './RecentProjects'
import { QuickStats } from './QuickStats'
import { CalendarWidget } from './CalendarWidget'
import { ProjectDeliveries } from './ProjectDeliveries'
import { InboxWidget } from './InboxWidget'
import { TodoPanel } from './TodoPanel'
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
    <div className="relative h-screen w-[1440px] mx-auto overflow-hidden rounded-2xl border border-white/[0.13]"
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
        <div className="flex flex-1 items-start justify-center overflow-hidden">
          {/* Center content column */}
          <div className="relative flex w-[1438px] shrink-0 flex-col gap-6 px-[85px] pb-[85px] pt-8">
            {/* Welcome / chat */}
            <WelcomeSection userName={userName} />

            {/* Row 1: Activity + Projects + Quick Stats */}
            <div className="flex h-[290px] gap-4">
              <div className="w-[284px] shrink-0">
                <RecentActivity />
              </div>
              <div className="flex-1">
                <RecentProjects projects={projects} photoCounts={photoCounts} />
              </div>
              <div className="w-[239px] shrink-0">
                <QuickStats />
              </div>
            </div>

            {/* Row 2: Calendar + Deliveries + Inbox */}
            <div className="flex flex-1 gap-4">
              <div className="w-[283px] shrink-0">
                <CalendarWidget />
              </div>
              <div className="w-[375px] shrink-0">
                <ProjectDeliveries />
              </div>
              <div className="w-[238px] shrink-0">
                <InboxWidget />
              </div>
            </div>

            {/* Floating To-do Panel */}
            <TodoPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
