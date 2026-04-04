'use client'

import { useState } from 'react'
import { CheckCircle2, ExternalLink, Unlink } from 'lucide-react'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Types & Data ───────────────────────────────────────────────────────── */

interface Integration {
  id: string
  name: string
  description: string
  category: string
  dot: string
  connected: boolean
  connectedAs?: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payments & Invoicing',
    category: 'Payments',
    dot: 'bg-amber-400',
    connected: true,
    connectedAs: 'kyle@kyledavis.com',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync your bookings',
    category: 'Productivity',
    dot: 'bg-sky-400',
    connected: true,
    connectedAs: 'kyle@gmail.com',
  },
  {
    id: 'lightroom',
    name: 'Adobe Lightroom',
    description: 'Import / export workflow',
    category: 'Photography',
    dot: 'bg-orange-400',
    connected: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Auto-post from Content Hub',
    category: 'Social',
    dot: 'bg-pink-400',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows',
    category: 'Automation',
    dot: 'bg-orange-500',
    connected: false,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Backup & storage',
    category: 'Storage',
    dot: 'bg-blue-400',
    connected: false,
  },
]

const CATEGORIES = ['All', 'Payments', 'Photography', 'Productivity', 'Social', 'Automation', 'Storage']

/* ─── Integration Card ───────────────────────────────────────────────────── */

function IntegrationCard({ integration, onToggle }: {
  integration: Integration
  onToggle: (id: string) => void
}) {
  return (
    <GlassCard className={`transition-all ${integration.connected ? 'border border-white/[0.18]' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
            <span className="font-headline text-sm font-bold text-white">{integration.name[0]}</span>
            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1a1b26] ${integration.dot}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{integration.name}</p>
            <p className="text-xs text-white/50">{integration.description}</p>
            {integration.connected && integration.connectedAs && (
              <p className="mt-1 text-[11px] text-emerald-400">{integration.connectedAs}</p>
            )}
          </div>
        </div>

        {integration.connected ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span className="text-[11px] font-medium text-emerald-400">Connected</span>
            </div>
            <button
              onClick={() => onToggle(integration.id)}
              className="rounded-lg p-1.5 text-white/30 hover:text-rose-400 transition-colors"
              title="Disconnect"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onToggle(integration.id)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:opacity-90/20 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Connect
          </button>
        )}
      </div>

      {integration.connected && (
        <div className="mt-3 border-t border-white/[0.07] pt-3">
          <p className="text-[11px] text-white/30">
            {integration.id === 'stripe' && 'Last sync: 2 hours ago · $12,450 processed this month'}
            {integration.id === 'google-calendar' && 'Last sync: 15 minutes ago · 4 upcoming bookings synced'}
          </p>
        </div>
      )}
    </GlassCard>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [activeCategory, setActiveCategory] = useState('All')

  function toggleIntegration(id: string) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected, connectedAs: !i.connected ? 'kyle@example.com' : undefined } : i)),
    )
  }

  const visible = integrations.filter(
    (i) => activeCategory === 'All' || i.category === activeCategory,
  )

  const connectedCount = integrations.filter((i) => i.connected).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-bold text-white">Integrations</h1>
          <p className="text-sm text-white/50">Connect your favorite tools · {connectedCount} of {integrations.length} connected</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === c
                ? 'bg-cta text-white'
                : 'bg-white/[0.07] text-white/60 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {visible.map((i) => (
          <IntegrationCard key={i.id} integration={i} onToggle={toggleIntegration} />
        ))}
      </div>
    </div>
  )
}
