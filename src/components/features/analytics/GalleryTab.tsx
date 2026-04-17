'use client'

import { Eye, Download, Heart, Share2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DateRange } from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const GALLERY_STATS = [
  { label: 'Total Gallery Views', value: '1,847', change: '+8%', positive: true, color: '#60A5FA' },
  { label: 'Selections Made', value: '284', change: '+15%', positive: true, color: '#34D399' },
  { label: 'Downloads', value: '143', change: '+3%', positive: true, color: '#A78BFA' },
  { label: 'Avg. Time in Gallery', value: '4m 22s', change: '+0:18', positive: true, color: '#FBBF24' },
]

const DAILY_VIEWS = [
  { day: 'Mon', views: 142 },
  { day: 'Tue', views: 98 },
  { day: 'Wed', views: 215 },
  { day: 'Thu', views: 180 },
  { day: 'Fri', views: 267 },
  { day: 'Sat', views: 320 },
  { day: 'Sun', views: 190 },
]

const TOP_GALLERIES = [
  { name: 'Sarah & James Wedding', views: 340, selections: 84, downloads: 42, favorites: 28 },
  { name: 'Meridian Hotel Brand', views: 218, selections: 42, downloads: 30, favorites: 15 },
  { name: 'Torres Engagement', views: 155, selections: 31, downloads: 22, favorites: 11 },
  { name: 'Smith Family Portraits', views: 94, selections: 28, downloads: 18, favorites: 7 },
  { name: 'Marcus Cole Commercial', views: 67, selections: 15, downloads: 9, favorites: 4 },
]

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {children}
    </div>
  )
}

function ViewsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: 'rgba(26,24,46,0.95)', border: '1px solid rgba(255,255,255,0.18)' }}
    >
      <p className="text-white/60">{label}</p>
      <p className="font-mono text-blue-400">{payload[0]!.value} views</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

interface GalleryTabProps {
  dateRange: DateRange
}

export function GalleryTab({ dateRange }: GalleryTabProps) {
  // TODO(analytics-api): fetch real gallery metrics for dateRange
  void dateRange

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      {/* Stat cards */}
      <div className="grid shrink-0 grid-cols-4 gap-3">
        {GALLERY_STATS.map((s) => (
          <GlassCard key={s.label} className="flex flex-col gap-2 p-4">
            <span className="text-[11px] text-white/50">{s.label}</span>
            <p className="font-mono text-[22px] font-bold leading-none text-white">{s.value}</p>
            <span className={`text-[11px] font-medium`} style={{ color: s.color }}>
              {s.change} vs prior period
            </span>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid shrink-0 grid-cols-12 gap-4">
        {/* Daily views bar chart */}
        <GlassCard className="col-span-8 flex flex-col gap-3 p-5">
          <span className="text-[13px] font-semibold text-white">Daily Gallery Views</span>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_VIEWS} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.40)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ViewsTooltip />} />
                <Bar dataKey="views" fill="#60A5FA" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Engagement breakdown */}
        <GlassCard className="col-span-4 flex flex-col gap-3 p-5">
          <span className="text-[13px] font-semibold text-white">Engagement</span>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Views', value: 1847, max: 1847, icon: Eye, color: '#60A5FA' },
              { label: 'Selections', value: 284, max: 1847, icon: Download, color: '#34D399' },
              { label: 'Downloads', value: 143, max: 1847, icon: Download, color: '#A78BFA' },
              { label: 'Favorites', value: 65, max: 1847, icon: Heart, color: '#F472B6' },
            ].map((item) => {
              const Icon = item.icon
              const pct = Math.round((item.value / item.max) * 100)
              return (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3" style={{ color: item.color }} />
                      <span className="text-[12px] text-white/65">{item.label}</span>
                    </div>
                    <span className="font-mono text-[12px] font-semibold text-white/80">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* Top galleries table */}
      <GlassCard className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <span className="text-[13px] font-semibold text-white">Top Galleries by Engagement</span>
          <button className="text-[11px] text-white/40 transition-colors hover:text-white/70">
            View all
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Gallery', 'Views', 'Selections', 'Downloads', 'Favorites'].map((col) => (
                <th
                  key={col}
                  className="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-white/35"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOP_GALLERIES.map((row) => (
              <tr key={row.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="py-2.5 pr-3 text-[12px] font-medium text-white/80">{row.name}</td>
                <td className="py-2.5 font-mono text-[12px] text-white/55">{row.views}</td>
                <td className="py-2.5 font-mono text-[12px] text-white/55">{row.selections}</td>
                <td className="py-2.5 font-mono text-[12px] text-white/55">{row.downloads}</td>
                <td className="py-2.5 font-mono text-[12px] text-white/55">{row.favorites}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </GlassCard>
    </div>
  )
}
