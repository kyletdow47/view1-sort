'use client'

import { WelcomeSection } from './WelcomeSection'
import { QuickActions } from './QuickActions'
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
  upcomingShoots?: number
  revenueThisMonth?: number
  pendingActions?: number
}

export function DashboardV2({
  userName,
  projects = [],
  photoCounts = {},
  activeProjectCount = 0,
  upcomingShoots = 0,
  revenueThisMonth = 0,
  pendingActions = 0,
}: DashboardV2Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Welcome / chat */}
      <WelcomeSection userName={userName} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Row 1: Activity + Projects + Quick Stats */}
      <div className="grid h-auto gap-4 grid-cols-1 md:grid-cols-2 lg:h-[320px] lg:grid-cols-3">
        <RecentActivity />
        <RecentProjects projects={projects} photoCounts={photoCounts} />
        <div className="md:col-span-2 lg:col-span-1">
          <QuickStats
            activeProjectCount={activeProjectCount}
            upcomingShoots={upcomingShoots}
            revenueThisMonth={revenueThisMonth}
            pendingActions={pendingActions}
          />
        </div>
      </div>

      {/* Row 2: Calendar + Deliveries + Inbox */}
      <div className="grid h-auto gap-4 grid-cols-1 md:grid-cols-2 lg:h-[310px] lg:grid-cols-3">
        <CalendarWidget />
        <ProjectDeliveries />
        <div className="md:col-span-2 lg:col-span-1">
          <InboxWidget />
        </div>
      </div>
    </div>
  )
}
