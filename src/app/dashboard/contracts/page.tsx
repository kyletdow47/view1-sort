'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Download,
  FileText,
  Plus,
  Search,
  Send,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const subTabs = ['Contracts', 'Templates', 'Questionnaires'] as const
const filterTabs = ['All', 'Signed', 'Pending', 'Draft'] as const

const contracts = [
  { name: 'Smith Wedding Photography', date: 'Apr 12, 2026', type: 'Wedding', status: 'Signed', statusColor: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'Johnson Commercial Shoot', date: 'Apr 10, 2026', type: 'Commercial', status: 'Pending', statusColor: 'bg-amber-500/20 text-amber-400' },
  { name: 'Parker Portrait Session', date: 'Apr 8, 2026', type: 'Portrait', status: 'Draft', statusColor: 'bg-blue-500/20 text-blue-400' },
  { name: 'Architecture Overview', date: 'Mar 28, 2026', type: 'Architecture', status: 'Signed', statusColor: 'bg-emerald-500/20 text-emerald-400' },
]

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<string>('Contracts')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedContract, setSelectedContract] = useState(contracts[0])

  return (
    <V2Shell activeNav="Contracts">
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-4xl font-bold text-white">Contracts &amp; Documents</h1>
            <p className="mt-1 text-sm text-white/60">Generate contracts, manage signatures, and build questionnaires</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
              <FileText className="h-4 w-4" /> From Template
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              <Plus className="h-4 w-4" /> New Contract
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2">
          {subTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:text-white'}`}
            >{tab}</button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input type="text" placeholder="Search contracts..." className="w-full rounded-xl border border-white/15 bg-white/8 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20" />
          </div>
          {filterTabs.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activeFilter === f ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
            >{f}</button>
          ))}
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-4">
          {/* Left: Contract list */}
          <div className="w-[340px] shrink-0">
            <GlassCard noPad className="divide-y divide-white/10">
              {contracts.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedContract(c)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-white/5 ${selectedContract?.name === c.name ? 'bg-white/8' : ''}`}
                >
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-white/40">{c.date} &middot; {c.type}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${c.statusColor}`}>{c.status}</span>
                  </div>
                </button>
              ))}
            </GlassCard>
          </div>

          {/* Right: Contract preview */}
          <div className="flex-1">
            <GlassCard className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedContract.name}</h2>
                  <p className="mt-1 text-xs text-white/50">Created {selectedContract.date} &middot; {selectedContract.type} Package &middot; $4,500</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedContract.statusColor}`}>{selectedContract.status}</span>
              </div>

              {/* Contract details table */}
              <div className="grid grid-cols-4 gap-4 rounded-xl bg-white/5 p-4">
                {[
                  { label: 'Client', value: 'Alex & Jordan Smith' },
                  { label: 'Date', value: 'June 14, 2026' },
                  { label: 'Location', value: 'Grand Ballroom, NYC' },
                  { label: 'Total', value: '$4,500.00' },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="text-[10px] uppercase text-white/40">{d.label}</p>
                    <p className="mt-1 text-sm font-medium text-white">{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Contract body */}
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm leading-relaxed text-white/70">
                  This Photography Services Agreement is entered into between View1 Sort Photography (&ldquo;Photographer&rdquo;) and Alex &amp; Jordan Smith (&ldquo;Client&rdquo;) for wedding photography services.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Services include: 8 hours of coverage, 2 photographers, online gallery delivery within 6 weeks, 500+ edited images, and full rights release.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Payment: 50% deposit ($2,250) due at signing. Remainder due 30 days before event.
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[10px] uppercase text-white/40">Photographer</p>
                  <p className="mt-2 text-sm font-medium text-white">Kyle Dow</p>
                  <p className="text-[10px] text-emerald-400">Signed</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-[10px] uppercase text-white/40">Client</p>
                  <p className="mt-2 text-sm font-medium text-white">Alex &amp; Jordan Smith</p>
                  <p className="text-[10px] text-emerald-400">Signed</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                  <Send className="h-4 w-4" /> Send Copy
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </V2Shell>
  )
}
