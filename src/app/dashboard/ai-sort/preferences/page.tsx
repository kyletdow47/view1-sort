'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  Home,
  Briefcase,
  Camera,
  Plane,
  CalendarDays,
  Sliders,
  Save,
  Zap,
} from 'lucide-react'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Preset = 'Wedding' | 'Real Estate' | 'Commercial' | 'Portrait' | 'Travel' | 'Event'
type Category = 'Bridal' | 'Groom' | 'Ceremony' | 'Reception' | 'Portraits' | 'Details' | 'BTS'

interface QualityFilter {
  label: string
  key: string
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const PRESETS: { name: Preset; icon: React.ElementType; gradient: string }[] = [
  { name: 'Wedding',     icon: Heart,       gradient: 'from-rose-400 to-pink-500' },
  { name: 'Real Estate', icon: Home,        gradient: 'from-sky-400 to-blue-500' },
  { name: 'Commercial',  icon: Briefcase,   gradient: 'from-slate-400 to-slate-600' },
  { name: 'Portrait',    icon: Camera,      gradient: 'from-violet-400 to-purple-500' },
  { name: 'Travel',      icon: Plane,       gradient: 'from-emerald-400 to-teal-500' },
  { name: 'Event',       icon: CalendarDays,gradient: 'from-amber-400 to-orange-500' },
]

const CATEGORIES: Category[] = ['Bridal', 'Groom', 'Ceremony', 'Reception', 'Portraits', 'Details', 'BTS']

const QUALITY_FILTERS: QualityFilter[] = [
  { label: 'Blur Detection',      key: 'blur' },
  { label: 'Duplicate Detection', key: 'duplicates' },
  { label: 'Eyes Closed',         key: 'eyesClosed' },
  { label: 'Blink Detection',     key: 'blink' },
  { label: 'Lens Flare',          key: 'lensFlare' },
  { label: 'Obstruction',         key: 'obstruction' },
]

const AI_TABS = [
  { label: 'Upload',     href: '/dashboard/ai-sort' },
  { label: 'Workspace',  href: '/dashboard/ai-workspace' },
  { label: 'Preferences',href: '/dashboard/ai-sort/preferences' },
  { label: 'Vibe Presets', href: '/dashboard/presets' },
]

/* ─── Toggle ─────────────────────────────────────────────────────────────── */

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? 'bg-indigo-500' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function AIPreferencesPage() {
  const [activePreset, setActivePreset] = useState<Preset>('Wedding')
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set(['Bridal', 'Ceremony', 'Reception']))
  const [filters, setFilters] = useState<Record<string, boolean>>({
    blur: true, duplicates: true, eyesClosed: true, blink: false, lensFlare: true, obstruction: false,
  })
  const [sensitivity, setSensitivity] = useState(72)
  const [saved, setSaved] = useState(false)

  function toggleCategory(c: Category) {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      next.has(c) ? next.delete(c) : next.add(c)
      return next
    })
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.07] p-1 self-start w-fit">
        {AI_TABS.map((tab) => {
          const active = tab.href === '/dashboard/ai-sort/preferences'
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-white/[0.13] text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Card 1 — Sorting Preset */}
      <GlassCard>
        <h2 className="mb-4 font-headline text-base font-semibold text-white">Sorting Preset</h2>
        <div className="grid grid-cols-6 gap-3">
          {PRESETS.map(({ name, icon: Icon, gradient }) => {
            const active = activePreset === name
            return (
              <button
                key={name}
                onClick={() => setActivePreset(name)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                  active
                    ? 'border-indigo-400/40 bg-indigo-500/15'
                    : 'border-white/[0.1] bg-white/[0.04] hover:border-white/[0.2] hover:bg-white/[0.07]'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className={`text-xs font-medium ${active ? 'text-white' : 'text-white/60'}`}>{name}</span>
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* Card 2 — Category Configuration */}
      <GlassCard>
        <h2 className="mb-4 font-headline text-base font-semibold text-white">Category Configuration</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = activeCategories.has(c)
            return (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'border-indigo-400/50 bg-indigo-500/20 text-white'
                    : 'border-white/[0.15] bg-white/[0.05] text-white/50 hover:border-white/[0.25] hover:text-white'
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-white/30">
          {activeCategories.size} of {CATEGORIES.length} categories selected. AI will sort photos into these groups.
        </p>
      </GlassCard>

      {/* Card 3 — Quality Filters */}
      <GlassCard>
        <h2 className="mb-4 font-headline text-base font-semibold text-white">Quality Filters</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {QUALITY_FILTERS.map((f) => (
            <div key={f.key} className="flex items-center justify-between">
              <span className="text-sm text-white/70">{f.label}</span>
              <Toggle on={filters[f.key]} onChange={(v) => setFilters((prev) => ({ ...prev, [f.key]: v }))} />
            </div>
          ))}
        </div>

        {/* Sensitivity slider */}
        <div className="mt-5 border-t border-white/[0.08] pt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-white/70">
              <Sliders className="h-3.5 w-3.5" />
              Sensitivity
            </span>
            <span className="text-sm font-semibold text-white">{sensitivity}%</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${sensitivity}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-white/30">
            <span>Permissive</span>
            <span>Strict</span>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button className="rounded-xl border border-white/[0.15] px-5 py-2.5 text-sm text-white/70 hover:border-white/[0.25] hover:text-white transition-colors">
          Save as Default
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-cta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-colors"
        >
          {saved ? <Save className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Apply to Current Sort'}
        </button>
      </div>
    </div>
  )
}
