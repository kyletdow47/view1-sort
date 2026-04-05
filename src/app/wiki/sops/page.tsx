import { DocCard } from '@/components/features/wiki/DocCard'
import {
  BookOpen,
  MapPin,
  Megaphone,
  Layers,
  GitBranch,
  Shield,
  Zap,
  FileText,
} from 'lucide-react'

export const metadata = { title: 'SOPs & Guides — View1 Bible' }

const DOCS = [
  {
    title: 'GTM Launch Plan',
    description: 'Full go-to-market strategy from April 5 to May 15 launch. Pilot users, channels, and weekly actions.',
    href: '/wiki/marketing',
    icon: MapPin,
    category: 'Marketing',
    status: 'complete' as const,
    lastModified: 'Apr 2026',
  },
  {
    title: 'Marketing Strategy',
    description: 'Brand voice, ICP (wedding/event photographers), content pillars, and channel strategy.',
    href: '/wiki/marketing',
    icon: Megaphone,
    category: 'Marketing',
    status: 'complete' as const,
    lastModified: 'Apr 2026',
  },
  {
    title: 'Content Batch 001',
    description: '32 pre-written social posts across 4 pillars for Day 1–30 of the launch campaign.',
    href: '/wiki/marketing',
    icon: FileText,
    category: 'Content',
    status: 'complete' as const,
    lastModified: 'Apr 2026',
  },
  {
    title: 'Product Specification',
    description: 'Full MVP spec: user roles, Phase 1 features, deferred scope, data model.',
    href: '/wiki/product',
    icon: Layers,
    category: 'Product',
    status: 'complete' as const,
    lastModified: 'Apr 2026',
  },
  {
    title: 'Agent System & Build Loops',
    description: 'Two-loop autonomous build system: coding agent (30 min) + QA agent (60 min).',
    href: '/wiki/operations',
    icon: Zap,
    category: 'Operations',
    status: 'complete' as const,
    lastModified: 'Apr 2026',
  },
  {
    title: 'Architecture Decisions',
    description: 'Resolved decisions on fonts, AI arch, status enum, charts, drag-drop, e-signature, DB tables.',
    href: '/wiki/product',
    icon: GitBranch,
    category: 'Product',
    status: 'draft' as const,
    lastModified: 'Apr 2026',
  },
  {
    title: 'Security Runbook',
    description: 'RLS policies, auth patterns, API key handling, and incident response procedures.',
    icon: Shield,
    category: 'Security',
    status: 'planned' as const,
  },
  {
    title: 'Onboarding Guide',
    description: 'Step-by-step guide for onboarding a new pilot photographer onto View1 Sort.',
    icon: BookOpen,
    category: 'Operations',
    status: 'planned' as const,
  },
]

export default function SOPsPage() {
  const complete = DOCS.filter((d) => d.status === 'complete')
  const draft = DOCS.filter((d) => d.status === 'draft')
  const planned = DOCS.filter((d) => d.status === 'planned')

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-pink-400" strokeWidth={1.75} />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-pink-400/70">
            SOPs & Guides
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">The Library</h1>
        <p className="text-white/40 text-sm">
          All completed processes, how-to guides, and reference documents for View1 Studio.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        {[
          { label: 'Complete', count: complete.length, color: 'text-emerald-400' },
          { label: 'Draft', count: draft.length, color: 'text-amber-400' },
          { label: 'Planned', count: planned.length, color: 'text-white/30' },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-display ${color}`}>{count}</span>
            <span className="text-xs text-white/30">{label}</span>
          </div>
        ))}
      </div>

      {/* Complete docs */}
      {complete.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400/60 mb-3">Complete</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {complete.map((doc) => (
              <DocCard key={doc.title} {...doc} />
            ))}
          </div>
        </div>
      )}

      {/* Draft docs */}
      {draft.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-400/60 mb-3">Draft</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {draft.map((doc) => (
              <DocCard key={doc.title} {...doc} />
            ))}
          </div>
        </div>
      )}

      {/* Planned docs */}
      {planned.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/20 mb-3">Planned</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {planned.map((doc) => (
              <DocCard key={doc.title} {...doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
