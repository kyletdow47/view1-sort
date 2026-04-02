'use client'

import { V2Shell } from './V2Shell'
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
    <V2Shell activeNav="Dashboard">
      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-6">
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
          <div className="flex-1">
            <ProjectDeliveries />
          </div>
          <div className="w-[238px] shrink-0">
            <InboxWidget />
          </div>
        </div>

        {/* Floating To-do Panel */}
        <TodoPanel />
      </div>
    </V2Shell>
  )
}
