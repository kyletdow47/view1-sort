import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { KPICard } from '@/components/features/wiki/KPICard'
import {
  Users,
  Image,
  GalleryHorizontal,
  CreditCard,
  Cpu,
  Megaphone,
  BarChart3,
  Bot,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

async function fetchKPIs() {
  try {
    const supabase = await createClient()

    const [usersResult, mediaResult, galleriesResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('media_files').select('*', { count: 'exact', head: true }),
      supabase.from('galleries').select('*', { count: 'exact', head: true }),
    ])

    let subscriptionCount = 0
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 })
        subscriptionCount = subs.data.length
      }
    } catch {
      // Stripe not configured in this env
    }

    return {
      users: usersResult.count ?? 0,
      mediaFiles: mediaResult.count ?? 0,
      galleries: galleriesResult.count ?? 0,
      subscriptions: subscriptionCount,
    }
  } catch {
    return { users: 0, mediaFiles: 0, galleries: 0, subscriptions: 0 }
  }
}

const SECTIONS = [
  {
    href: '/wiki/product',
    icon: Cpu,
    label: 'Product & Tech',
    description: 'Architecture decisions, feature spec, build state, and technical roadmap.',
    color: 'from-violet-500/20 to-indigo-500/10',
    border: 'border-violet-500/20',
  },
  {
    href: '/wiki/marketing',
    icon: Megaphone,
    label: 'Marketing & GTM',
    description: 'Go-to-market plan, brand strategy, ICP, content calendar, and launch playbook.',
    color: 'from-amber-500/15 to-orange-500/5',
    border: 'border-amber-500/20',
  },
  {
    href: '/wiki/kpis',
    icon: BarChart3,
    label: 'KPIs & Milestones',
    description: 'Live metrics, launch timeline, pilot user goals, and growth targets.',
    color: 'from-emerald-500/15 to-teal-500/5',
    border: 'border-emerald-500/20',
  },
  {
    href: '/wiki/operations',
    icon: Bot,
    label: 'Operations & Agents',
    description: 'Two-loop build system, agent roles, Asana workflow, Pencil pipeline.',
    color: 'from-blue-500/15 to-cyan-500/5',
    border: 'border-blue-500/20',
  },
  {
    href: '/wiki/sops',
    icon: BookOpen,
    label: 'SOPs & Guides',
    description: 'Completed processes, how-to guides, runbooks, and reference documents.',
    color: 'from-pink-500/15 to-rose-500/5',
    border: 'border-pink-500/20',
  },
]

export default async function WikiPage() {
  const kpis = await fetchKPIs()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400/70 mb-2">
          View1 Studio
        </p>
        <h1 className="font-display text-3xl font-bold text-white mb-2">The Bible</h1>
        <p className="text-white/40 text-sm">
          Everything about how View1 is built, marketed, and operated — one source of truth.
        </p>
      </div>

      {/* Live KPI Cards */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
          Live Metrics
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPICard
            label="Total Users"
            value={kpis.users}
            source="Supabase"
            icon={Users}
            description="Registered accounts"
          />
          <KPICard
            label="Media Files"
            value={kpis.mediaFiles}
            source="Supabase"
            icon={Image}
            description="Photos uploaded"
          />
          <KPICard
            label="Galleries"
            value={kpis.galleries}
            source="Supabase"
            icon={GalleryHorizontal}
            description="Client galleries created"
          />
          <KPICard
            label="Active Subs"
            value={kpis.subscriptions}
            source="Stripe"
            icon={CreditCard}
            description="Paying subscribers"
          />
        </div>
      </div>

      {/* Section tiles */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">
          Sections
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(({ href, icon: Icon, label, description, color, border }) => (
            <Link
              key={href}
              href={href}
              className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${color} border ${border} p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:pointer-events-none`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] border border-white/[0.08]">
                  <Icon className="h-4 w-4 text-white/60" strokeWidth={1.75} />
                </div>
                <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-1 group-hover:text-white transition-colors">
                {label}
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
