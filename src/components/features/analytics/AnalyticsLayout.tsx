'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { DateRangePicker } from '@/components/common/DateRangePicker'
import { OverviewTab } from './OverviewTab'
import { GalleryTab } from './GalleryTab'
import { RevenueTab } from './RevenueTab'
import { LeadsTab } from './LeadsTab'
import { AIInsightsTab } from './AIInsightsTab'
import type { AnalyticsTab, DateRange } from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TABS: AnalyticsTab[] = ['Overview', 'Gallery', 'Revenue', 'Leads', 'AI Insights']

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface AnalyticsLayoutProps {
  /** Initial from date (ISO YYYY-MM-DD) from server searchParams */
  initialFrom: string
  /** Initial to date (ISO YYYY-MM-DD) from server searchParams */
  initialTo: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AnalyticsLayout({ initialFrom, initialTo }: AnalyticsLayoutProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('Overview')

  // Prefer URL params (updated by DateRangePicker) over server-provided initial values
  const dateRange: DateRange = {
    from: searchParams.get('from') ?? initialFrom,
    to: searchParams.get('to') ?? initialTo,
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ── Header bar ────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Page title */}
        <div>
          <h1 className="text-[22px] font-bold text-white">Analytics</h1>
          <p className="mt-0.5 text-[12px] text-white/40">
            AI-powered business intelligence & gallery metrics
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <DateRangePicker defaultFrom={initialFrom} defaultTo={initialTo} />
          <button className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white/90">
            <TrendingUp className="h-3.5 w-3.5" />
            Partner Insights
          </button>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center gap-1 px-8 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center gap-1 rounded-2xl p-1"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white/[0.15] font-semibold text-white'
                  : 'text-white/55 hover:text-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4">
        {activeTab === 'Overview' && <OverviewTab dateRange={dateRange} />}
        {activeTab === 'Gallery' && <GalleryTab dateRange={dateRange} />}
        {activeTab === 'Revenue' && <RevenueTab dateRange={dateRange} />}
        {activeTab === 'Leads' && <LeadsTab dateRange={dateRange} />}
        {activeTab === 'AI Insights' && <AIInsightsTab dateRange={dateRange} />}
      </div>
    </div>
  )
}
