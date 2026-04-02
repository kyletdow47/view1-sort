'use client'

import { useState } from 'react'
import {
  Check,
  Move,
  RotateCcw,
  Send,
  Sparkles,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const categories = [
  { name: 'Ceremony', count: 312, color: 'bg-blue-400' },
  { name: 'Portraits', count: 89, color: 'bg-emerald-400' },
  { name: 'Reception', count: 161, color: 'bg-violet-400' },
  { name: 'Details', count: 45, color: 'bg-amber-400' },
]

const subTabs = [
  { label: 'All', count: 461, active: true },
  { label: 'AI Review', count: null, active: false },
  { label: 'Void List', count: null, active: false },
  { label: 'Gallery', count: null, active: false },
  { label: 'Cover', count: null, active: false },
  { label: 'Details', count: null, active: false },
]

const workspaceTabs = ['Upload', 'Workspace', 'Work Progress 263', 'AI Re-Sort']

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function AIWorkspacePage() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('Workspace')
  const [selectedCount] = useState(24)

  return (
    <V2Shell activeNav="AI Sort">
      <div className="mx-auto max-w-[1400px] space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Link href="/dashboard/projects" className="hover:text-white transition-colors">Projects</Link>
          <span>&gt;</span>
          <span className="text-white font-medium">Autumn Wedding — Sarah &amp; James</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {subTabs.map((tab) => (
              <button
                key={tab.label}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab.active ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {tab.label}{tab.count !== null && <span className="ml-1 opacity-70">{tab.count}</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              <Sparkles className="h-4 w-4" /> Run AI Sort
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10">
              <Send className="h-4 w-4" /> Publish Gallery
            </button>
          </div>
        </div>

        {/* Workspace sub-tabs */}
        <div className="flex items-center gap-1">
          {workspaceTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveWorkspaceTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activeWorkspaceTab === tab ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'}`}
            >{tab}</button>
          ))}
          <span className="ml-auto text-xs text-white/40">877 photos</span>
        </div>

        {/* Main: columns + sidebar */}
        <div className="flex gap-4">
          <div className="flex flex-1 gap-3 overflow-x-auto pb-4">
            {categories.map((cat, ci) => (
              <div key={cat.name} className="min-w-[200px] flex-1">
                <GlassCard noPad>
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                      <span className="text-sm font-semibold text-white">{cat.name}</span>
                    </div>
                    <span className="text-xs text-white/40">{cat.count}</span>
                  </div>
                  <div className="space-y-2 p-2">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="aspect-[3/2] rounded-lg" style={{ background: `hsl(${200 + i * 25 + ci * 40}, 40%, 35%)` }} />
                    ))}
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>

          {/* AI Analysis Sidebar */}
          <div className="w-[260px] shrink-0">
            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/50">Quality Parameters</p>
                {[
                  { label: 'Sharpness', value: 85, color: 'bg-emerald-400' },
                  { label: 'Exposure', value: 92, color: 'bg-blue-400' },
                  { label: 'Composition', value: 78, color: 'bg-violet-400' },
                ].map((p) => (
                  <div key={p.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/60">{p.label}</span>
                      <span className="text-white/80">{p.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/50">Flagged Issues</p>
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-xs text-white/70">Blur detected</span>
                  <span className="text-xs font-mono text-amber-400">12</span>
                </div>
              </div>
              {['Blur detection', 'Customization'].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-white/70">{label}</span>
                  <div className="h-5 w-9 rounded-full bg-indigo-600 p-0.5">
                    <div className="h-4 w-4 rounded-full bg-white translate-x-4" />
                  </div>
                </div>
              ))}
              <button className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs text-white/60 hover:text-white transition-colors">
                Manual Priority
              </button>
            </GlassCard>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/50">Image Size: <span className="font-mono text-white/80">340</span></span>
          <div className="h-1 w-32 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-white/30" /></div>
        </div>

        {/* Selection toolbar */}
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-black/40 px-6 py-3 backdrop-blur-xl">
          <span className="text-sm text-white/80">{selectedCount} selected</span>
          <div className="h-4 w-px bg-white/20" />
          {[
            { icon: Star, label: 'Star' },
            { icon: RotateCcw, label: 'Reject' },
            { icon: Check, label: 'Approve' },
            { icon: Move, label: 'Move to…' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors">
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
          <button className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600">
            <Send className="h-3.5 w-3.5" /> Deliver
          </button>
        </div>
      </div>
    </V2Shell>
  )
}
