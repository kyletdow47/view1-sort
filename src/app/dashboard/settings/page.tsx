'use client'

import { useState } from 'react'
import {
  Brain,
  Building2,
  CreditCard,
  Palette,
  Plug,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Data ────────────────────────────────────────────────────────────────── */

const sidebarItems = [
  { icon: Building2, label: 'Studio', active: true },
  { icon: Palette, label: 'Branding', active: false },
  { icon: Users, label: 'Team', active: false },
  { icon: Plug, label: 'Integrations', active: false },
  { icon: CreditCard, label: 'Billing', active: false },
]

const shootingStyles = [
  { label: 'Moody', active: true },
  { label: 'Film', active: true },
  { label: 'Lifestyle', active: false },
  { label: 'Cinematic', active: false },
  { label: 'Editorial', active: false },
  { label: 'Rustic', active: false },
]

const sortCategories = ['Hero Shots', 'Details', 'Group Shots', 'Candids', 'B-Roll']
const rejectRules = ['Blurry', 'Eyes Closed', 'Overexposed']

/* ─── Toggle Component ────────────────────────────────────────────────────── */

function Toggle({ enabled = true }: { enabled?: boolean }) {
  const [on, setOn] = useState(enabled)
  return (
    <button
      onClick={() => setOn(!on)}
      className={`h-5 w-9 rounded-full p-0.5 transition-colors ${on ? 'bg-indigo-600' : 'bg-white/20'}`}
    >
      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${on ? 'translate-x-4' : ''}`} />
    </button>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const [confidence, setConfidence] = useState(75)

  return (
    <V2Shell activeNav="Settings">
      <div className="mx-auto flex max-w-[1280px] gap-6">
        {/* Sidebar */}
        <div className="w-[200px] shrink-0">
          <GlassCard className="space-y-1">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">General/Studio</p>
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    item.active ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </GlassCard>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* AI Setup Wizard Header */}
          <div>
            <h1 className="font-headline text-3xl font-bold text-white">AI Setup Wizard</h1>
            <p className="mt-1 text-sm text-white/60">
              Configure your AI preferences: train your custom style, set default sorting categories, and let AI handle tedious parts of your workflow.
            </p>
          </div>

          {/* Tell us about your business */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Tell us about your photography business</h3>
            <textarea
              rows={3}
              placeholder="Describe your photography style, specialties, and typical shoots..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <div className="flex gap-2">
              {['Portrait/Editorial', 'Weddings/Events', 'Commercial'].map((tag) => (
                <button key={tag} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white">
                  {tag}
                </button>
              ))}
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300">Advanced Settings</button>
          </GlassCard>

          {/* Automation Configuration */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Automation Configuration</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Auto-Sort on Upload</p>
                <p className="text-[10px] text-white/40">Automatically sort photos when uploaded</p>
              </div>
              <Toggle />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">Watermark First Look</p>
                <p className="text-[10px] text-white/40">Add watermark to gallery previews</p>
              </div>
              <Toggle enabled={false} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Auto Confidence</span>
                <span className="text-xs font-mono text-white/60">{confidence}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>Model Configuration</span>
              <span>&middot;</span>
              <span>AI Time Log</span>
            </div>
          </GlassCard>

          {/* AI Preferences */}
          <h2 className="text-lg font-semibold text-white">AI Preferences</h2>

          {/* Shooting Styles */}
          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Shooting Styles</h3>
            <div className="flex flex-wrap gap-2">
              {shootingStyles.map((s) => (
                <button
                  key={s.label}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    s.active ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Auto-Sort Categories */}
          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Auto-Sort Categories</h3>
            {sortCategories.map((cat) => (
              <div key={cat} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5">
                <span className="text-sm text-white/80">{cat}</span>
                <Toggle />
              </div>
            ))}
          </GlassCard>

          {/* Confidence Threshold */}
          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Confidence Threshold</h3>
            <input type="range" min={0} max={100} defaultValue={70} className="w-full accent-indigo-600" />
          </GlassCard>

          {/* Auto-Reject Rules */}
          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Auto-Reject Rules</h3>
            {rejectRules.map((rule) => (
              <div key={rule} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5">
                <span className="text-sm text-white/80">{rule}</span>
                <Toggle />
              </div>
            ))}
          </GlassCard>

          {/* Face/Skin Retouching */}
          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Face/Skin Retouching</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Portrait Mode</span>
              <Toggle enabled={false} />
            </div>
          </GlassCard>

          {/* Vibe Keywords */}
          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Vibe Keywords</h3>
            <input
              type="text"
              placeholder="e.g. golden hour, dreamy, editorial..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
          </GlassCard>

          {/* Deliver Schedule */}
          <GlassCard className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Deliver Schedule</h3>
            <div className="flex gap-2">
              {['Same Day', '24 Hours', '48 Hours', '1 Week'].map((opt) => (
                <button key={opt} className="rounded-lg bg-white/8 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/15">
                  {opt}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </V2Shell>
  )
}
