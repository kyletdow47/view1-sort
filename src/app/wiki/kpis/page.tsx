import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { KPICard } from '@/components/features/wiki/KPICard'
import {
  Users,
  Image,
  GalleryHorizontal,
  CreditCard,
  Target,
  Rocket,
  CheckCircle2,
  Circle,
  Clock,
  BarChart3,
} from 'lucide-react'

export const metadata = { title: 'KPIs & Milestones — View1 Bible' }

const MILESTONES = [
  {
    date: 'Apr 5, 2026',
    label: 'Phase 1 Build Begins',
    description: 'Foundation complete. DB schema, auth, gallery shell deployed.',
    status: 'complete' as const,
  },
  {
    date: 'Apr 10, 2026',
    label: 'Upload Pipeline Live',
    description: 'tus resumable uploads, IndexedDB queue, Cloudflare Images integration.',
    status: 'in-progress' as const,
  },
  {
    date: 'Apr 15, 2026',
    label: 'AI Classifier Working',
    description: 'SigLIP browser-side classifier sorting photos into categories.',
    status: 'pending' as const,
  },
  {
    date: 'Apr 20, 2026',
    label: 'Stripe Billing Active',
    description: 'Subscription plans, checkout, billing portal, and photographer payouts.',
    status: 'pending' as const,
  },
  {
    date: 'Apr 25, 2026',
    label: '5 Pilot Users Onboarded',
    description: 'Real photographers using the product, collecting feedback.',
    status: 'pending' as const,
  },
  {
    date: 'Apr 30, 2026',
    label: 'Public Launch',
    description: 'Product Hunt, Twitter/X announcement, landing page live.',
    status: 'pending' as const,
  },
  {
    date: 'May 15, 2026',
    label: '20 Pilot Users',
    description: 'Target: 20 active pilot photographers paying for access.',
    status: 'pending' as const,
  },
]

const LAUNCH_GOALS = [
  { label: 'Pilot Users', current: 0, target: 20, unit: 'photographers', color: 'bg-violet-500' },
  { label: 'Galleries Created', current: 0, target: 50, unit: 'galleries', color: 'bg-indigo-500' },
  { label: 'Photos Sorted by AI', current: 0, target: 5000, unit: 'photos', color: 'bg-emerald-500' },
  { label: 'MRR', current: 0, target: 500, unit: '$/mo', color: 'bg-amber-500' },
]

async function fetchKPIs() {
  try {
    const supabase = await createClient()

    const [usersResult, mediaResult, galleriesResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('media_files').select('*', { count: 'exact', head: true }),
      supabase.from('galleries').select('*', { count: 'exact', head: true }),
    ])

    let subscriptionCount = 0
    let mrr = 0
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const subs = await stripe.subscriptions.list({ status: 'active', limit: 100, expand: ['data.items'] })
        subscriptionCount = subs.data.length
        mrr = subs.data.reduce((acc, sub) => {
          const amount = sub.items?.data?.[0]?.price?.unit_amount ?? 0
          return acc + amount / 100
        }, 0)
      }
    } catch {
      // Stripe not configured
    }

    return {
      users: usersResult.count ?? 0,
      mediaFiles: mediaResult.count ?? 0,
      galleries: galleriesResult.count ?? 0,
      subscriptions: subscriptionCount,
      mrr,
    }
  } catch {
    return { users: 0, mediaFiles: 0, galleries: 0, subscriptions: 0, mrr: 0 }
  }
}

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0)
  return (
    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default async function KPIsPage() {
  const kpis = await fetchKPIs()

  const today = new Date()
  const launchDate = new Date('2026-04-30')
  const daysToLaunch = Math.max(0, Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-400/70">
            KPIs & Milestones
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">How We Measure</h1>
        <p className="text-white/40 text-sm">
          Live metrics, launch timeline, and progress toward pilot goals.
        </p>
      </div>

      {/* Days to launch callout */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-violet-500/15 to-indigo-500/10 border border-violet-500/25 p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30 flex-shrink-0">
          <Rocket className="h-5 w-5 text-violet-400" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs text-violet-400/70 font-medium uppercase tracking-wide mb-0.5">Launch Countdown</p>
          <p className="text-white font-semibold text-lg">
            {daysToLaunch === 0 ? 'Launch Day!' : `${daysToLaunch} days to launch`}
            <span className="text-white/40 font-normal text-sm ml-2">April 30, 2026</span>
          </p>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">Live Metrics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPICard label="Total Users" value={kpis.users} source="Supabase" icon={Users} />
          <KPICard label="Media Files" value={kpis.mediaFiles} source="Supabase" icon={Image} />
          <KPICard label="Galleries" value={kpis.galleries} source="Supabase" icon={GalleryHorizontal} />
          <KPICard label="Active Subs" value={kpis.subscriptions} source="Stripe" icon={CreditCard} />
        </div>
      </div>

      {/* Launch Goals Progress */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">Launch Goals</h2>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.05]">
          {LAUNCH_GOALS.map(({ label, current, target, unit, color }, i) => {
            const actualCurrent =
              label === 'Pilot Users'
                ? kpis.users
                : label === 'Galleries Created'
                ? kpis.galleries
                : label === 'Photos Sorted by AI'
                ? kpis.mediaFiles
                : label === 'MRR'
                ? kpis.mrr
                : current

            const pct = Math.min(100, target > 0 ? (actualCurrent / target) * 100 : 0)

            return (
              <div key={i} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-white/30" strokeWidth={1.75} />
                    <span className="text-sm text-white/70 font-medium">{label}</span>
                  </div>
                  <span className="text-sm text-white/50">
                    <span className="text-white font-semibold">{actualCurrent.toLocaleString()}</span>
                    {' / '}
                    {target.toLocaleString()} {unit}
                    {' · '}
                    <span className="text-white/30">{pct.toFixed(0)}%</span>
                  </span>
                </div>
                <ProgressBar current={actualCurrent} target={target} color={color} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Milestone Timeline */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">Milestone Timeline</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-3 bottom-3 w-px bg-white/[0.06]" />

          <div className="space-y-1">
            {MILESTONES.map(({ date, label, description, status }, i) => (
              <div key={i} className="relative flex gap-4 pl-1">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0 mt-3.5">
                  {status === 'complete' && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                  )}
                  {status === 'in-progress' && (
                    <Clock className="h-5 w-5 text-amber-400 animate-pulse" strokeWidth={1.75} />
                  )}
                  {status === 'pending' && (
                    <Circle className="h-5 w-5 text-white/20" strokeWidth={1.75} />
                  )}
                </div>

                {/* Content */}
                <div
                  className={[
                    'flex-1 rounded-xl px-4 py-3 mb-1 border',
                    status === 'complete'
                      ? 'bg-emerald-500/[0.06] border-emerald-500/[0.12]'
                      : status === 'in-progress'
                      ? 'bg-amber-500/[0.06] border-amber-500/[0.15]'
                      : 'bg-white/[0.02] border-white/[0.05]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={[
                          'text-sm font-semibold',
                          status === 'complete'
                            ? 'text-emerald-300/90'
                            : status === 'in-progress'
                            ? 'text-amber-300/90'
                            : 'text-white/50',
                        ].join(' ')}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{description}</p>
                    </div>
                    <span className="text-[11px] text-white/25 whitespace-nowrap mt-0.5">{date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
