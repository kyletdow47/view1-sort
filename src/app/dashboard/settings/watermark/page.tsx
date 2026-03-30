'use client'

import React, { useState, useRef } from 'react'
import {
  Droplets,
  Upload,
  X,
  Check,
  Eye,
  Sliders,
  ImageIcon,
  Save,
  RefreshCw,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Placement =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

interface WatermarkConfig {
  logoUrl: string | null
  placement: Placement
  size: number     // 5–40% of image width
  opacity: number  // 0–100
  padding: number  // px from edge (scaled to % of image)
}

const DEFAULT_CONFIG: WatermarkConfig = {
  logoUrl: null,
  placement: 'bottom-right',
  size: 15,
  opacity: 70,
  padding: 3,
}

const PLACEMENT_GRID: Placement[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['center-left', 'center', 'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
]

/* ─── Slider ─────────────────────────────────────────────────────────────── */

function LabeledSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">{label}</label>
        <span className="text-xs font-mono font-bold text-primary">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-surface-container-highest accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-[9px] font-mono text-on-surface-variant/30">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

/* ─── Preview canvas ─────────────────────────────────────────────────────── */

function WatermarkPreview({ config }: { config: WatermarkConfig }) {
  const placementStyle = (): React.CSSProperties => {
    const pad = `${config.padding}%`
    const base: React.CSSProperties = { position: 'absolute', opacity: config.opacity / 100 }
    switch (config.placement) {
      case 'top-left':     return { ...base, top: pad, left: pad }
      case 'top-center':   return { ...base, top: pad, left: '50%', transform: 'translateX(-50%)' }
      case 'top-right':    return { ...base, top: pad, right: pad }
      case 'center-left':  return { ...base, top: '50%', left: pad, transform: 'translateY(-50%)' }
      case 'center':       return { ...base, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }
      case 'center-right': return { ...base, top: '50%', right: pad, transform: 'translateY(-50%)' }
      case 'bottom-left':  return { ...base, bottom: pad, left: pad }
      case 'bottom-center':return { ...base, bottom: pad, left: '50%', transform: 'translateX(-50%)' }
      case 'bottom-right': return { ...base, bottom: pad, right: pad }
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 select-none">
      {/* Sample photo placeholder */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, hsl(25,40%,18%) 0%, hsl(200,55%,28%) 100%)' }} />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-white/10" />
      </div>

      {/* Watermark */}
      <div style={{ ...placementStyle(), width: `${config.size}%` }}>
        {config.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={config.logoUrl} alt="Watermark" className="w-full h-auto" />
        ) : (
          <div
            className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg text-white/80 font-headline font-bold text-xs"
            style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}
          >
            Your Logo
          </div>
        )}
      </div>

      {/* Preview label */}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 rounded-md text-[9px] font-mono text-white/60 uppercase tracking-widest">
        Preview
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function WatermarkPage() {
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const update = <K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    update('logoUrl', url)
  }

  const save = () => {
    // In production: POST to API / save to Supabase profile
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <Droplets className="w-8 h-8 text-primary" />
            Watermark
          </h1>
          <p className="text-on-surface-variant/60 font-body mt-1 text-sm">
            Configure your watermark. Applied via Cloudflare Images on delivery — originals are never modified.
          </p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          {/* Logo upload */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Logo</p>
            <div className="flex items-center gap-3">
              {config.logoUrl ? (
                <div className="relative w-24 h-16 bg-surface-container-high rounded-xl overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={config.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                  <button
                    onClick={() => update('logoUrl', null)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-mono text-on-surface-variant/60"
                >
                  <Upload className="w-4 h-4" />
                  Upload logo (PNG recommended)
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
            <p className="text-[10px] font-mono text-on-surface-variant/40">
              PNG with transparency recommended. Max 2MB.
            </p>
          </div>

          {/* Placement grid */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Placement</p>
            <div className="grid grid-cols-3 gap-2 w-48">
              {PLACEMENT_GRID.map((row) =>
                row.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => update('placement', pos)}
                    className={[
                      'aspect-square rounded-xl border-2 transition-all',
                      config.placement === pos
                        ? 'border-primary bg-primary/20'
                        : 'border-outline-variant/20 hover:border-outline-variant/40 bg-surface-container',
                    ].join(' ')}
                    title={pos.replace('-', ' ')}
                  >
                    {config.placement === pos && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-sm bg-primary" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            <LabeledSlider
              label="Size"
              value={config.size}
              min={5}
              max={40}
              unit="%"
              onChange={(v) => update('size', v)}
            />
            <LabeledSlider
              label="Opacity"
              value={config.opacity}
              min={10}
              max={100}
              unit="%"
              onChange={(v) => update('opacity', v)}
            />
            <LabeledSlider
              label="Padding from edge"
              value={config.padding}
              min={1}
              max={10}
              unit="%"
              onChange={(v) => update('padding', v)}
            />
          </div>

          {/* Reset */}
          <button
            onClick={() => { setConfig(DEFAULT_CONFIG); setSaved(false) }}
            className="flex items-center gap-2 text-xs font-mono text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to defaults
          </button>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-on-surface-variant/50" />
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Live preview</p>
          </div>
          <WatermarkPreview config={config} />
          <div className="bg-surface-container rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/40">Applied to</p>
            {[
              'All client gallery previews',
              'Stage 1 preselection photos',
              'Stage 2 selection previews',
              'Not applied to final downloads',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono text-on-surface-variant/60">
                <div className={['w-1.5 h-1.5 rounded-full', i < 3 ? 'bg-primary' : 'bg-emerald-500'].join(' ')} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
