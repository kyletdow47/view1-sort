'use client'

import React, { useState } from 'react'
import {
  DollarSign,
  FolderOpen,
  Eye,
  ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  FileDown,
  TrendingUp,
  Download,
  MessageSquare,
  CreditCard,
  FileText,
  Share2,
  Camera,
  BarChart3,
  Zap,
  Clock,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface KPI {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ElementType
  sparkline: number[]
}

interface Project {
  name: string
  client: string
  views: number
  downloads: number
}

interface Activity {
  icon: React.ElementType
  iconColor: string
  description: string
  time: string
}

interface Category {
  name: string
  count: number
  pct: number
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const kpis: KPI[] = [
  {
    label: 'Revenue This Month',
    value: '$12,480',
    change: '+18.4%',
    positive: true,
    icon: DollarSign,
    sparkline: [40, 55, 48, 62, 58, 74, 80, 76, 88, 92, 85, 100],
  },
  {
    label: 'Active Projects',
    value: '14',
    change: '+3',
    positive: true,
    icon: FolderOpen,
    sparkline: [6, 7, 8, 7, 9, 10, 11, 10, 12, 13, 13, 14],
  },
  {
    label: 'Gallery Views (30d)',
    value: '9,340',
    change: '+22.1%',
    positive: true,
    icon: Eye,
    sparkline: [30, 42, 38, 50, 55, 48, 62, 70, 65, 80, 75, 92],
  },
  {
    label: 'Photos Delivered (30d)',
    value: '2,814',
    change: '-4.2%',
    positive: false,
    icon: ImageIcon,
    sparkline: [90, 85, 88, 80, 76, 82, 78, 72, 70, 68, 65, 62],
  },
]

const monthlyRevenue = [
  { month: 'Oct', value: 7200 },
  { month: 'Nov', value: 8900 },
  { month: 'Dec', value: 11400 },
  { month: 'Jan', value: 9600 },
  { month: 'Feb', value: 10500 },
  { month: 'Mar', value: 12480 },
]

const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value))

const topProjects: Project[] = [
  { name: 'Johnson Wedding', client: 'Emily & Ryan Johnson', views: 3241, downloads: 182 },
  { name: 'Nike Spring Campaign', client: 'Nike — Brand Studio', views: 2817, downloads: 94 },
  { name: 'Smith Family Portraits', client: 'David Smith', views: 1654, downloads: 211 },
  { name: 'Meridian Hotel Rebrand', client: 'Meridian Hotels Group', views: 1309, downloads: 47 },
  { name: 'Coastal Real Estate', client: 'Pacific Properties LLC', views: 987, downloads: 65 },
]

const maxViews = Math.max(...topProjects.map((p) => p.views))

const recentActivity: Activity[] = [
  { icon: Share2, iconColor: 'text-primary', description: 'Gallery shared — Johnson Wedding', time: '2m ago' },
  { icon: Download, iconColor: 'text-primary', description: 'Emily Johnson downloaded 24 photos', time: '14m ago' },
  { icon: CreditCard, iconColor: 'text-primary', description: 'Payment received — $3,200 (Nike Campaign)', time: '1h ago' },
  { icon: MessageSquare, iconColor: 'text-on-surface-variant', description: 'Comment added on Smith Family Portraits', time: '2h ago' },
  { icon: FileText, iconColor: 'text-on-surface-variant', description: 'Contract signed — Coastal Real Estate', time: '3h ago' },
  { icon: Eye, iconColor: 'text-on-surface-variant', description: 'Gallery viewed — Meridian Hotel Rebrand', time: '4h ago' },
  { icon: Download, iconColor: 'text-primary', description: 'Nike Brand Studio downloaded selects pack', time: '5h ago' },
  { icon: Share2, iconColor: 'text-primary', description: 'Gallery shared — Coastal Real Estate', time: '7h ago' },
  { icon: CreditCard, iconColor: 'text-primary', description: 'Payment received — $1,800 (Smith Portraits)', time: '9h ago' },
  { icon: Camera, iconColor: 'text-on-surface-variant', description: 'New project created — Torres Engagement', time: '11h ago' },
]

const aiCategories: Category[] = [
  { name: 'Portraits', count: 14820, pct: 34 },
  { name: 'Ceremony', count: 9640, pct: 22 },
  { name: 'Reception', count: 7810, pct: 18 },
  { name: 'Detail Shots', count: 5230, pct: 12 },
  { name: 'Landscapes', count: 3490, pct: 8 },
  { name: 'Editorial', count: 2610, pct: 6 },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-outline-variant bg-surface-container-low p-6 ${className}`}>
      {children}
    </div>
  )
}

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon size={16} className="text-primary" />
      <h2 className="font-headline font-bold text-on-surface">{label}</h2>
    </div>
  )
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data)
  const color = positive ? 'bg-primary' : 'bg-on-surface-variant'
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm opacity-70 ${color}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const [activeRange, setActiveRange] = useState('30D')

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-3xl font-extrabold italic text-on-surface">
            Analytics & Insights
          </h1>
          <p className="mt-1 font-body text-sm text-on-surface-variant">
            Performance metrics across all galleries and projects
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 font-body text-sm font-medium text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
          <FileDown size={16} />
          Export CSV
        </button>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {kpi.label}
                </span>
                <Icon size={16} className="text-primary" />
              </div>
              <p className="font-headline text-3xl font-extrabold text-on-surface leading-none">
                {kpi.value}
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {kpi.positive ? (
                    <ArrowUpRight size={13} className="text-primary" />
                  ) : (
                    <ArrowDownRight size={13} className="text-on-surface-variant" />
                  )}
                  <span className={`font-mono text-xs font-medium ${kpi.positive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {kpi.change}
                  </span>
                  <span className="font-mono text-[10px] text-on-surface-variant">vs last mo</span>
                </div>
              </div>
              <Sparkline data={kpi.sparkline} positive={kpi.positive} />
            </Card>
          )
        })}
      </div>

      {/* ── Revenue Bar Chart ── */}
      <Card>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <SectionHeading icon={TrendingUp} label="Monthly Revenue" />
          <div className="flex items-center gap-1 rounded-xl border border-outline-variant p-1">
            {['7D', '30D', '12M'].map((r) => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-colors ${
                  activeRange === r
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-3 h-40">
          {monthlyRevenue.map((m) => {
            const heightPct = (m.value / maxRevenue) * 100
            const isLatest = m.month === 'Mar'
            return (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[10px] text-on-surface-variant">
                  ${(m.value / 1000).toFixed(1)}k
                </span>
                <div className="w-full flex items-end" style={{ height: '96px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${isLatest ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={`font-mono text-[10px] ${isLatest ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {m.month}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
          <span className="font-mono text-xs text-on-surface-variant">6-month total</span>
          <span className="font-headline font-bold text-on-surface">
            ${monthlyRevenue.reduce((acc, m) => acc + m.value, 0).toLocaleString()}
          </span>
        </div>
      </Card>

      {/* ── Two Column: Top Projects + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Projects */}
        <Card>
          <SectionHeading icon={BarChart3} label="Top Projects by Views" />
          <div className="space-y-3">
            {topProjects.map((project, i) => (
              <div key={project.name} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-mono text-[10px] font-bold text-on-surface-variant">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-medium text-on-surface truncate">{project.name}</p>
                      <p className="font-mono text-[10px] text-on-surface-variant truncate">{project.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <Eye size={11} />
                      <span className="font-mono text-xs">{project.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <Download size={11} />
                      <span className="font-mono text-xs">{project.downloads}</span>
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full rounded-full bg-surface-container-highest">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(project.views / maxViews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <SectionHeading icon={Clock} label="Recent Activity" />
          <div className="space-y-0">
            {recentActivity.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-outline-variant last:border-0">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                    <Icon size={13} className={item.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-on-surface leading-snug">{item.description}</p>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant shrink-0 mt-0.5">{item.time}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── AI Sort Stats ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-primary" />
          <h2 className="font-headline font-bold text-on-surface">AI Sort Stats</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Total Sorted (all time)</span>
            <p className="font-headline text-2xl font-extrabold text-on-surface">43,600</p>
            <p className="font-mono text-[10px] text-on-surface-variant">photos processed</p>
          </Card>
          <Card className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Avg Sort Time</span>
            <p className="font-headline text-2xl font-extrabold text-on-surface">1.2s</p>
            <p className="font-mono text-[10px] text-on-surface-variant">per photo</p>
          </Card>
          <Card className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Cull Rate</span>
            <p className="font-headline text-2xl font-extrabold text-on-surface">38%</p>
            <p className="font-mono text-[10px] text-on-surface-variant">avg rejected per shoot</p>
          </Card>
          <Card className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Accuracy</span>
            <p className="font-headline text-2xl font-extrabold text-on-surface">96.4%</p>
            <p className="font-mono text-[10px] text-on-surface-variant">classification confidence</p>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={14} className="text-primary" />
            <span className="font-headline font-bold text-on-surface text-sm">Top Categories Sorted</span>
          </div>
          <div className="space-y-3">
            {aiCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4">
                <span className="font-body text-sm text-on-surface w-28 shrink-0">{cat.name}</span>
                <div className="flex-1 h-2 rounded-full bg-surface-container-highest">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-on-surface-variant w-16 text-right shrink-0">
                  {cat.count.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-on-surface-variant w-8 shrink-0">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
