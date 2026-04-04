'use client'

import { useState } from 'react'
import {
  Eye,
  Smartphone,
  Monitor,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  GripVertical,
  Palette,
  Globe,
  Save,
  ExternalLink,
} from 'lucide-react'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type BlockType = 'hero' | 'bio' | 'gallery' | 'services' | 'cta'
type PreviewSize = 'desktop' | 'mobile'

interface Block {
  id: string
  type: BlockType
  label: string
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: 'hero',     label: 'Hero Banner',    icon: ImageIcon, desc: 'Full-width header with name & tagline' },
  { type: 'bio',      label: 'About / Bio',    icon: Type,      desc: 'Your story and photography style' },
  { type: 'gallery',  label: 'Portfolio Grid', icon: ImageIcon, desc: 'Showcase your best work' },
  { type: 'services', label: 'Services',       icon: LinkIcon,  desc: 'Packages and what you offer' },
  { type: 'cta',      label: 'Book Now CTA',   icon: Globe,     desc: 'Booking form or link' },
]

const INITIAL_BLOCKS: Block[] = [
  { id: 'b1', type: 'hero',     label: 'Hero Banner' },
  { id: 'b2', type: 'bio',      label: 'About / Bio' },
  { id: 'b3', type: 'gallery',  label: 'Portfolio Grid' },
  { id: 'b4', type: 'cta',      label: 'Book Now CTA' },
]

const BLOCK_PREVIEW: Record<BlockType, React.ReactNode> = {
  hero: (
    <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/40 to-purple-600/40">
      <div className="text-center">
        <p className="font-headline text-base font-bold text-white">Kyle Davis Photography</p>
        <p className="text-xs text-white/60">Capturing moments that matter</p>
      </div>
    </div>
  ),
  bio: (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
      <p className="mb-1 text-xs font-semibold text-white">About Me</p>
      <p className="text-[11px] leading-relaxed text-white/50">
        Award-winning photographer based in Portland, OR. Specializing in weddings, portraits, and commercial photography with a candid, story-driven approach.
      </p>
    </div>
  ),
  gallery: (
    <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
      {['from-rose-400/60 to-pink-600/60', 'from-amber-400/60 to-orange-500/60', 'from-violet-400/60 to-purple-600/60', 'from-sky-400/60 to-blue-600/60', 'from-emerald-400/60 to-teal-600/60', 'from-indigo-400/60 to-blue-600/60'].map((g, i) => (
        <div key={i} className={`h-12 rounded bg-gradient-to-br ${g}`} />
      ))}
    </div>
  ),
  services: (
    <div className="space-y-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
      {['Wedding — from $2,800', 'Portrait — from $450', 'Commercial — from $900'].map((s) => (
        <div key={s} className="flex items-center justify-between">
          <span className="text-[11px] text-white/70">{s.split('—')[0]}</span>
          <span className="text-[11px] text-white/40">{s.split('—')[1]}</span>
        </div>
      ))}
    </div>
  ),
  cta: (
    <div className="flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
      <span className="text-xs font-semibold text-indigo-300">Book a Session →</span>
    </div>
  ),
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function PhotoPageBuilderPage() {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS)
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop')
  const [pageTitle, setPageTitle] = useState('Kyle Davis Photography')
  const [slug, setSlug] = useState('kyledavis')
  const [published, setPublished] = useState(false)

  function addBlock(type: BlockType, label: string) {
    setBlocks((prev) => [...prev, { id: `b${Date.now()}`, type, label }])
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-bold text-white">Photo Page Builder</h1>
          <p className="text-sm text-white/50">Build your public photography portfolio page</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-white/[0.1] px-3 py-2 text-xs text-white/60 hover:text-white transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
            Preview live
          </button>
          <button
            onClick={() => setPublished(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            {published ? 'Published ✓' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4 h-[calc(100vh-180px)]">
        {/* ── Left panel: settings + blocks ── */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {/* Page settings */}
          <GlassCard>
            <h3 className="mb-3 text-xs font-semibold text-white/60 uppercase tracking-wider">Page Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-white/50">Page title</label>
                <input
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-400/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">URL slug</label>
                <div className="flex items-center rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-2">
                  <span className="text-xs text-white/30">view1sort.com/p/</span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="flex-1 bg-transparent text-sm text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Add blocks */}
          <GlassCard>
            <h3 className="mb-3 text-xs font-semibold text-white/60 uppercase tracking-wider">Add Block</h3>
            <div className="space-y-2">
              {BLOCK_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.type}
                    onClick={() => addBlock(opt.type, opt.label)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left hover:border-white/[0.15] hover:bg-white/[0.06] transition-all"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-indigo-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white">{opt.label}</p>
                      <p className="truncate text-[10px] text-white/40">{opt.desc}</p>
                    </div>
                    <Plus className="h-3.5 w-3.5 shrink-0 text-white/30" />
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* Current blocks */}
          <GlassCard>
            <h3 className="mb-3 text-xs font-semibold text-white/60 uppercase tracking-wider">Page Blocks</h3>
            <div className="space-y-1.5">
              {blocks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-2"
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/20" />
                  <span className="flex-1 text-xs text-white/70">{b.label}</span>
                  <button
                    onClick={() => removeBlock(b.id)}
                    className="text-white/20 hover:text-rose-400 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── Right panel: live preview ── */}
        <GlassCard noPad className="flex flex-col overflow-hidden">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.07] p-1">
              {([['desktop', Monitor], ['mobile', Smartphone]] as const).map(([size, Icon]) => (
                <button
                  key={size}
                  onClick={() => setPreviewSize(size as PreviewSize)}
                  className={`rounded-md p-1.5 transition-colors ${previewSize === size ? 'bg-white/[0.13] text-white' : 'text-white/40 hover:text-white'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1">
              <Globe className="h-3 w-3 text-white/40" />
              <span className="text-[11px] text-white/50">view1sort.com/p/{slug}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-white/30">
              <Eye className="h-3 w-3" />
              Live preview
            </div>
          </div>

          {/* Preview area */}
          <div className="flex flex-1 items-start justify-center overflow-y-auto bg-black/20 p-6">
            <div
              className={`space-y-3 rounded-2xl bg-[#0d0e14] p-4 transition-all ${
                previewSize === 'mobile' ? 'w-[375px]' : 'w-full max-w-[900px]'
              }`}
            >
              {/* Preview nav */}
              <div className="mb-4 flex items-center justify-between">
                <span className="font-headline text-sm font-bold text-white">{pageTitle}</span>
                <button className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white">Book Now</button>
              </div>
              {/* Render blocks */}
              {blocks.map((b) => (
                <div key={b.id}>{BLOCK_PREVIEW[b.type]}</div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
