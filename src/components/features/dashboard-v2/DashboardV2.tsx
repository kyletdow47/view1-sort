'use client'

import { WelcomeSection } from './WelcomeSection'
import { AIBriefingCard } from './AIBriefingCard'
import { QuickActions } from './QuickActions'
import { RecentActivity } from './RecentActivity'
import { RecentProjects } from './RecentProjects'
import { QuickStats } from './QuickStats'
import type { Project } from '@/types/supabase'

export interface DashboardV2Props {
  userName?: string
  projects?: Project[]
  photoCounts?: Record<string, number>
  activeProjectCount?: number
  upcomingShoots?: number
  revenueThisMonth?: number
  pendingActions?: number
  /** Use hardcoded demo stats instead of fetching real per-user stats. */
  demoMode?: boolean
}

export function DashboardV2({
  userName,
  projects = [],
  photoCounts = {},
  activeProjectCount = 0,
  upcomingShoots = 0,
  revenueThisMonth = 0,
  pendingActions = 0,
  demoMode = false,
}: DashboardV2Props) {
  return (
    <div className="relative flex h-full min-h-0 flex-col gap-4">
      {/* Welcome / chat */}
      <WelcomeSection userName={userName} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Row 1: Activity + Projects + Quick Stats */}
      <div className="grid min-h-0 flex-1 gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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

      {/* AI Briefing — floating bottom-right */}
      <AIBriefingCard userName={userName} demoMode={demoMode} />
    </div>
  )
}
