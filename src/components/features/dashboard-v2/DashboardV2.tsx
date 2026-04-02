'use client'

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
    <div className="flex flex-col gap-5">
      {/* Welcome / chat */}
      <WelcomeSection userName={userName} />

      {/* Row 1: Activity + Projects + Quick Stats */}
      <div className="grid min-h-[290px] grid-cols-3 gap-4">
        <RecentActivity />
        <RecentProjects projects={projects} photoCounts={photoCounts} />
        <QuickStats />
      </div>

      {/* Row 2: Calendar + Deliveries + Inbox */}
      <div className="grid min-h-[280px] grid-cols-3 gap-4">
        <CalendarWidget />
        <ProjectDeliveries />
        <InboxWidget />
      </div>
    </div>
  )
}
