'use client'

import {
  Eye,
  Download,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FileDown,
  Globe,
  BarChart3,
  Image,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface KPI {
  label: string
  value: string
  change: string
  positive: boolean
  icon: React.ElementType
  color: string
}

const kpis: KPI[] = [
  {
    label: 'Gallery Views',
    value: '8.2k',
    change: '+12.3%',
    positive: true,
    icon: Eye,
    color: 'text-primary',
  },
  {
    label: 'Download Rate',
    value: '34%',
    change: '+2.1%',
    positive: true,
    icon: Download,
    color: 'text-secondary',
  },
  {
    label: 'Avg Session Duration',
    value: '4m 12s',
    change: '-0.8%',
    positive: false,
    icon: Clock,
    color: 'text-tertiary',
  },
  {
    label: 'Client Retention',
    value: '84%',
    change: '+5.2%',
    positive: true,
    icon: Users,
    color: 'text-primary',
  },
]

const topProjects = [
  { name: 'Johnson Wedding', category: 'Wedding', views: 2847, trend: 'up' },
  { name: 'Meridian Hotel Brand', category: 'Commercial', views: 1923, trend: 'up' },
  { name: 'Torres Portrait Session', category: 'Portrait', views: 1204, trend: 'down' },
  { name: 'Neon Editorial Spread', category: 'Editorial', views: 982, trend: 'up' },
  { name: 'Coastal Real Estate', category: 'Real Estate', views: 756, trend: 'up' },
]

const engagementCategories = [
  { name: 'Weddings', pct: 38, color: 'bg-primary' },
  { name: 'Commercial', pct: 26, color: 'bg-secondary' },
  { name: 'Portraits', pct: 18, color: 'bg-tertiary' },
  { name: 'Editorial', pct: 12, color: 'bg-[#a18d80]' },
  { name: 'Other', pct: 6, color: 'bg-surface-container-highest' },
]

const geoData = [
  { region: 'United States', pct: 42 },
  { region: 'United Kingdom', pct: 18 },
  { region: 'Canada', pct: 14 },
  { region: 'Australia', pct: 9 },
  { region: 'Germany', pct: 7 },
  { region: 'Other', pct: 10 },
]

// SVG chart data points for the line chart
const chartPoints = [
  { x: 0, y: 65 },
  { x: 1, y: 58 },
  { x: 2, y: 72 },
  { x: 3, y: 68 },
  { x: 4, y: 80 },
  { x: 5, y: 75 },
  { x: 6, y: 85 },
  { x: 7, y: 78 },
  { x: 8, y: 92 },
  { x: 9, y: 88 },
  { x: 10, y: 95 },
  { x: 11, y: 100 },
]

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  // Build SVG path
  const svgW = 800
  const svgH = 200
  const padX = 40
  const padY = 20
  const plotW = svgW - padX * 2
  const plotH = svgH - padY * 2

  const points = chartPoints.map((p, i) => ({
    cx: padX + (i / (chartPoints.length - 1)) * plotW,
    cy: padY + plotH - (p.y / 100) * plotH,
  }))

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.cy}`)
    .join(' ')

  const areaPath = `${linePath} L${points[points.length - 1].cx},${padY + plotH} L${points[0].cx},${padY + plotH} Z`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">
            Analytics & Insights
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Performance metrics across all galleries and projects
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary">
          <FileDown size={16} />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="!p-5">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>{kpi.label}</SectionLabel>
                <Icon size={18} className={kpi.color} />
              </div>
              <p className="font-headline text-3xl font-extrabold text-on-surface">
                {kpi.value}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                {kpi.positive ? (
                  <ArrowUpRight size={14} className="text-green-400" />
                ) : (
                  <ArrowDownRight size={14} className="text-red-400" />
                )}
                <span
                  className={`text-xs font-medium ${kpi.positive ? 'text-green-400' : 'text-red-400'}`}
                >
                  {kpi.change}
                </span>
                <span className="text-xs text-on-surface-variant/40">
                  vs last month
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Views Over Time chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-on-surface">
              Views Over Time
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {['7D', '30D', '12M'].map((range) => (
              <button
                key={range}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  range === '12M'
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant/50 hover:text-on-surface-variant'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="areaGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ffb780" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffb780" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffb780" />
              <stop offset="100%" stopColor="#d48441" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <line
              key={pct}
              x1={padX}
              y1={padY + plotH * pct}
              x2={padX + plotW}
              y2={padY + plotH * pct}
              stroke="#534439"
              strokeOpacity={0.2}
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={3}
              fill="#151312"
              stroke="#ffb780"
              strokeWidth={2}
            />
          ))}

          {/* X-axis labels */}
          {months.map((m, i) => (
            <text
              key={m}
              x={padX + (i / (months.length - 1)) * plotW}
              y={svgH - 2}
              textAnchor="middle"
              fill="#a18d80"
              fontSize={10}
              fontFamily="var(--font-space-grotesk), monospace"
            >
              {m}
            </text>
          ))}
        </svg>
      </Card>

      {/* Bottom grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Performing Projects */}
        <Card className="col-span-12 lg:col-span-5">
          <div className="flex items-center gap-2 mb-5">
            <Image size={16} className="text-primary" />
            <h2 className="font-headline font-bold text-on-surface">
              Top Performing Projects
            </h2>
          </div>

          <div className="space-y-1">
            {topProjects.map((project, i) => (
              <div
                key={project.name}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {project.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant/50">
                    {project.category}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-on-surface">
                    {project.views.toLocaleString()}
                  </span>
                  {project.trend === 'up' ? (
                    <ArrowUpRight size={12} className="text-green-400" />
                  ) : (
                    <ArrowDownRight size={12} className="text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Client Engagement */}
        <Card className="col-span-12 lg:col-span-4">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-secondary" />
            <h2 className="font-headline font-bold text-on-surface">
              Client Engagement
            </h2>
          </div>
          <SectionLabel>By Category</SectionLabel>

          <div className="mt-4 space-y-3">
            {engagementCategories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">{cat.name}</span>
                  <span className="text-xs font-medium text-on-surface-variant">
                    {cat.pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-container-highest">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card className="col-span-12 lg:col-span-3">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={16} className="text-tertiary" />
            <h2 className="font-headline font-bold text-on-surface">
              Geography
            </h2>
          </div>

          <div className="space-y-2.5">
            {geoData.map((g) => (
              <div key={g.region} className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">
                  {g.region}
                </span>
                <span className="text-sm font-medium text-on-surface">
                  {g.pct}%
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center rounded-xl bg-surface-container p-6">
            <div className="text-center space-y-1">
              <Globe size={32} className="mx-auto text-on-surface-variant/20" />
              <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-wider">
                Map visualization
              </p>
              <p className="text-[10px] text-on-surface-variant/20">
                Coming in v2
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
