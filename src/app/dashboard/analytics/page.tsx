import {
  Eye,
  Download,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  FileDown,
  Globe,
  BarChart3,
  Image,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces, getActiveProjectCount } from '@/lib/queries/projects'
import type { GalleryDownload, GalleryPayment, GalleryAccess, Project } from '@/types/supabase'

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
/*  Data helpers                                                       */
/* ------------------------------------------------------------------ */

function buildMonthlyChart(
  downloads: Pick<GalleryDownload, 'created_at'>[],
): { months: string[]; points: { x: number; y: number }[] } {
  const now = new Date()
  const monthLabels: string[] = []
  const counts: number[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthLabels.push(d.toLocaleString('en-US', { month: 'short' }))
    counts.push(0)
  }

  for (const dl of downloads) {
    const d = new Date(dl.created_at)
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (monthsAgo >= 0 && monthsAgo < 12) {
      counts[11 - monthsAgo] += 1
    }
  }

  const max = Math.max(...counts, 1)
  const points = counts.map((c, i) => ({ x: i, y: Math.round((c / max) * 100) }))

  return { months: monthLabels, points }
}

function buildTopProjects(
  projects: Pick<Project, 'id' | 'name'>[],
  downloads: Pick<GalleryDownload, 'project_id'>[],
): { id: string; name: string; downloads: number }[] {
  const counts: Record<string, number> = {}
  for (const dl of downloads) {
    counts[dl.project_id] = (counts[dl.project_id] ?? 0) + 1
  }

  return projects
    .map((p) => ({ id: p.id, name: p.name, downloads: counts[p.id] ?? 0 }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Workspace
  const workspaces = await getWorkspaces(supabase, user.id)
  const workspace = workspaces[0]
  if (!workspace) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-on-surface-variant text-sm">No workspace found.</p>
      </div>
    )
  }

  // Fetch all project IDs for this workspace
  const { data: projectRows } = await supabase
    .from('projects')
    .select('id, name')
    .eq('workspace_id', workspace.id)

  const projects = (projectRows ?? []) as Pick<Project, 'id' | 'name'>[]
  const projectIds = projects.map((p) => p.id)

  // Parallel queries — skip if no projects
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const [
    activeProjectCount,
    downloadsResult,
    clientsResult,
    revenueResult,
  ] = await Promise.all([
    getActiveProjectCount(supabase, workspace.id),
    projectIds.length > 0
      ? supabase
          .from('gallery_downloads')
          .select('project_id, created_at')
          .in('project_id', projectIds)
          .gte('created_at', twelveMonthsAgo.toISOString())
      : Promise.resolve({ data: [] as Pick<GalleryDownload, 'project_id' | 'created_at'>[], error: null }),
    projectIds.length > 0
      ? supabase
          .from('gallery_access')
          .select('email')
          .in('project_id', projectIds)
      : Promise.resolve({ data: [] as Pick<GalleryAccess, 'email'>[], error: null }),
    projectIds.length > 0
      ? supabase
          .from('gallery_payments')
          .select('amount')
          .in('project_id', projectIds)
          .eq('status', 'paid')
      : Promise.resolve({ data: [] as Pick<GalleryPayment, 'amount'>[], error: null }),
  ])

  const downloads = (downloadsResult.data ?? []) as Pick<GalleryDownload, 'project_id' | 'created_at'>[]
  const accessRows = (clientsResult.data ?? []) as Pick<GalleryAccess, 'email'>[]
  const paymentRows = (revenueResult.data ?? []) as Pick<GalleryPayment, 'amount'>[]

  // Derived metrics
  const totalDownloads = downloads.length
  const uniqueClients = new Set(accessRows.map((r) => r.email.toLowerCase())).size
  const totalRevenueCents = paymentRows.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const { months, points: chartPoints } = buildMonthlyChart(downloads)
  const topProjects = buildTopProjects(projects, downloads)

  // SVG chart
  const svgW = 800
  const svgH = 200
  const padX = 40
  const padY = 20
  const plotW = svgW - padX * 2
  const plotH = svgH - padY * 2

  const svgPoints = chartPoints.map((p, i) => ({
    cx: padX + (i / Math.max(chartPoints.length - 1, 1)) * plotW,
    cy: padY + plotH - (p.y / 100) * plotH,
  }))

  const linePath = svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.cy}`).join(' ')
  const areaPath = `${linePath} L${svgPoints[svgPoints.length - 1].cx},${padY + plotH} L${svgPoints[0].cx},${padY + plotH} Z`

  const kpis = [
    {
      label: 'Total Downloads',
      value: totalDownloads >= 1000 ? `${(totalDownloads / 1000).toFixed(1)}k` : String(totalDownloads),
      icon: Download,
      color: 'text-primary',
    },
    {
      label: 'Active Projects',
      value: String(activeProjectCount),
      icon: Eye,
      color: 'text-secondary',
    },
    {
      label: 'Unique Clients',
      value: String(uniqueClients),
      icon: Users,
      color: 'text-tertiary',
    },
    {
      label: 'Total Revenue',
      value: totalRevenueCents > 0
        ? `$${(totalRevenueCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
        : '$0',
      icon: DollarSign,
      color: 'text-primary',
    },
  ]

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
              {kpi.label === 'Total Downloads' && (
                <p className="mt-1.5 text-xs text-on-surface-variant/40">Last 12 months</p>
              )}
            </Card>
          )
        })}
      </div>

      {/* Downloads Over Time chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-headline font-bold text-on-surface">Downloads Over Time</h2>
          </div>
          <span className="text-xs text-on-surface-variant/40">Last 12 months</span>
        </div>

        {totalDownloads === 0 ? (
          <div className="flex items-center justify-center h-32 text-on-surface-variant/30 text-sm">
            No downloads yet
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffb780" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffb780" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffb780" />
                <stop offset="100%" stopColor="#d48441" />
              </linearGradient>
            </defs>

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

            <path d={areaPath} fill="url(#areaGrad)" />
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {svgPoints.map((p, i) => (
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
        )}
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

          {topProjects.length === 0 || topProjects[0].downloads === 0 ? (
            <p className="text-sm text-on-surface-variant/40 py-4 text-center">
              No download activity yet
            </p>
          ) : (
            <div className="space-y-1">
              {topProjects.map((project, i) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-container"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {project.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-on-surface">
                      {project.downloads.toLocaleString()}
                    </span>
                    <ArrowUpRight size={12} className="text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
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

          <div className="mt-6 flex flex-col items-center justify-center gap-3 py-4 text-center">
            <BarChart3 size={32} className="text-on-surface-variant/20" />
            <p className="text-xs text-on-surface-variant/40 uppercase tracking-wider">
              Category analytics
            </p>
            <p className="text-xs text-on-surface-variant/30">
              Coming soon — requires AI sort data
            </p>
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

          <div className="flex items-center justify-center rounded-xl bg-surface-container p-6 mt-2">
            <div className="text-center space-y-1">
              <Globe size={32} className="mx-auto text-on-surface-variant/20" />
              <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-wider">
                Map visualization
              </p>
              <p className="text-[10px] text-on-surface-variant/20">Coming in v2</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
