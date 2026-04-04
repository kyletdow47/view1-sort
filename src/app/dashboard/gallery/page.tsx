'use client'

import { useState } from 'react'
import {
  Camera,
  ChevronRight,
  Eye,
  Grid3X3,
  Heart,
  ImageIcon,
  Palette,
  Plus,
  Star,
} from 'lucide-react'
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const tabs = ['All Photos', 'Hero Shots', 'B-Roll Photos', 'Favorites'] as const

const themes = [
  { name: 'Minimal Grid', desc: 'Clean symmetric layout' },
  { name: 'Elegant Masonry', desc: 'Pinterest-style flow' },
  { name: 'Filmstrip', desc: 'Cinematic horizontal' },
  { name: 'Polaroid Cluster', desc: 'Scattered instant prints' },
  { name: 'Minimal Full Bleed', desc: 'Edge-to-edge immersive' },
]

const mosaicColors = [
  'from-emerald-400/60 to-teal-600/60',
  'from-rose-400/60 to-pink-600/60',
  'from-amber-400/60 to-orange-600/60',
  'from-violet-400/60 to-purple-600/60',
  'from-sky-400/60 to-blue-600/60',
  'from-lime-400/60 to-green-600/60',
  'from-fuchsia-400/60 to-pink-500/60',
  'from-cyan-400/60 to-teal-500/60',
  'from-yellow-400/60 to-amber-500/60',
  'from-indigo-400/60 to-blue-600/60',
  'from-red-400/60 to-rose-600/60',
  'from-emerald-300/60 to-cyan-600/60',
]

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<string>('All Photos')
  const [activeTheme, setActiveTheme] = useState('Minimal Grid')

  return (
    <V2Shell>
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Sub-tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-cta text-white'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Hero Mosaic */}
        <GlassCard noPad className="relative overflow-hidden">
          {/* Mosaic grid */}
          <div className="grid h-[420px] grid-cols-6 grid-rows-3 gap-1 p-1">
            {mosaicColors.map((color, i) => (
              <div
                key={i}
                className={`rounded-lg bg-gradient-to-br ${color} ${
                  i === 0 ? 'col-span-2 row-span-2' : ''
                } ${i === 5 ? 'col-span-2' : ''}`}
              />
            ))}
          </div>

          {/* Center overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
            <h1 className="font-headline text-4xl font-bold text-white drop-shadow-lg">
              Sarah &amp; James Wedding
            </h1>
            <p className="mt-2 text-sm text-white/80">
              848 Photos &middot; June 15, 2026
            </p>
            <div className="mt-6 flex gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                <Eye className="h-4 w-4" />
                View Photos
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                <Plus className="h-4 w-4" />
                Create Gallery
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Gallery Theme */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-white/60" />
            <h2 className="text-sm font-semibold text-white/90">Gallery Theme</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {themes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => setActiveTheme(theme.name)}
                className={`flex-shrink-0 rounded-2xl p-4 text-left transition-all ${
                  activeTheme === theme.name
                    ? 'bg-white/20 ring-2 ring-white/40'
                    : 'bg-white/8 hover:bg-white/12'
                }`}
                style={{
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  width: 160,
                }}
              >
                {/* Theme preview placeholder */}
                <div className="mb-2 h-16 rounded-lg bg-white/10" />
                <p className="text-xs font-semibold text-white">{theme.name}</p>
                <p className="mt-0.5 text-[10px] text-white/50">{theme.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Note section */}
        <GlassCard>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
              Note
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            Live Preview: Liquid Glass aesthetic &mdash; frosted glass overlay, depth blur, parallax.
            Gallery will use the selected theme with automatic responsive breakpoints and client-facing
            download controls.
          </p>
        </GlassCard>

        {/* Photo count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/40">
            <span className="font-mono text-white/70">877</span> photos in gallery
          </p>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white/8 p-2 text-white/50 hover:text-white">
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button className="rounded-lg bg-white/8 p-2 text-white/50 hover:text-white">
              <ImageIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </V2Shell>
  )
}
