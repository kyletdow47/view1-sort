'use client'

import { Check, Lock, Eye, Type, Code, Palette } from 'lucide-react'
import { useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface Theme {
  id: string
  name: string
  desc: string
  bg: string
  surface: string
  accent: string
  textColor: string
  status: 'Active' | 'Draft'
}

const themes: Theme[] = [
  {
    id: 'dark-room',
    name: 'Dark Room',
    desc: 'Deep darks with warm amber accents. Cinematic gallery feel.',
    bg: '#151312',
    surface: '#1d1b1a',
    accent: '#ffb780',
    textColor: '#e7e1df',
    status: 'Active',
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    desc: 'Clean white canvas that lets the photography speak.',
    bg: '#fafafa',
    surface: '#ffffff',
    accent: '#1a1a1a',
    textColor: '#1a1a1a',
    status: 'Draft',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    desc: 'High contrast grayscale. Magazine-inspired layouts.',
    bg: '#2a2a2a',
    surface: '#3a3a3a',
    accent: '#e0e0e0',
    textColor: '#e0e0e0',
    status: 'Draft',
  },
  {
    id: 'amber-glow',
    name: 'Amber Glow',
    desc: 'Warm gradient tones with rich gold highlights.',
    bg: '#1c1510',
    surface: '#2a1f16',
    accent: '#d48441',
    textColor: '#ffdcc4',
    status: 'Draft',
  },
]

const fontPairings = [
  { heading: 'Manrope', body: 'Inter', label: 'Modern Sans' },
  { heading: 'Playfair Display', body: 'Inter', label: 'Classic Serif' },
  { heading: 'Space Grotesk', body: 'Inter', label: 'Technical' },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ThemesPage() {
  const [selected, setSelected] = useState('dark-room')
  const [fontPairing, setFontPairing] = useState('Modern Sans')

  const activeTheme = themes.find((t) => t.id === selected) ?? themes[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">
          Gallery Aesthetic
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Define the look and feel of your client-facing galleries
        </p>
      </div>

      {/* Theme Grid */}
      <div>
        <SectionLabel>Theme Collection</SectionLabel>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => {
            const isSelected = selected === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => setSelected(theme.id)}
                className={`group relative rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/20'
                }`}
              >
                {/* Preview */}
                <div
                  className="aspect-video w-full rounded-xl overflow-hidden border border-outline-variant/10 mb-4"
                  style={{ backgroundColor: theme.bg }}
                >
                  <div className="h-full p-4 flex flex-col justify-between">
                    {/* Mock header */}
                    <div className="flex items-center justify-between">
                      <div
                        className="h-2 w-16 rounded-full"
                        style={{ backgroundColor: theme.accent, opacity: 0.8 }}
                      />
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-1.5 w-6 rounded-full"
                            style={{
                              backgroundColor: theme.textColor,
                              opacity: 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Mock gallery grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="aspect-square rounded"
                          style={{
                            backgroundColor: theme.surface,
                            opacity: i % 2 === 0 ? 0.6 : 0.8,
                          }}
                        />
                      ))}
                    </div>

                    {/* Mock footer */}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-10 rounded-full"
                        style={{
                          backgroundColor: theme.textColor,
                          opacity: 0.2,
                        }}
                      />
                      <div
                        className="h-5 w-14 rounded"
                        style={{
                          backgroundColor: theme.accent,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface">
                      {theme.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-on-surface-variant leading-relaxed">
                      {theme.desc}
                    </p>
                  </div>
                  {theme.status === 'Active' ? (
                    <span className="flex items-center gap-1 shrink-0 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-medium text-green-400">
                      <Check size={10} />
                      Active
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-medium text-on-surface-variant/50">
                      Draft
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Live Preview */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Eye size={16} className="text-primary" />
          <h2 className="font-headline font-bold text-on-surface">
            Live Preview
          </h2>
          <span className="font-label text-[10px] uppercase tracking-widest text-primary/60 ml-1">
            {activeTheme.name}
          </span>
        </div>

        <div
          className="rounded-xl overflow-hidden border border-outline-variant/10"
          style={{ backgroundColor: activeTheme.bg }}
        >
          <div className="p-6 space-y-4">
            {/* Mock gallery header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div
                  className="h-5 w-40 rounded"
                  style={{
                    backgroundColor: activeTheme.textColor,
                    opacity: 0.9,
                  }}
                />
                <div
                  className="h-3 w-56 rounded"
                  style={{
                    backgroundColor: activeTheme.textColor,
                    opacity: 0.3,
                  }}
                />
              </div>
              <div
                className="h-8 w-20 rounded-lg"
                style={{ backgroundColor: activeTheme.accent, opacity: 0.8 }}
              />
            </div>

            {/* Mock image grid */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-lg"
                  style={{
                    backgroundColor: activeTheme.surface,
                    opacity: 0.5 + (i % 3) * 0.15,
                  }}
                />
              ))}
            </div>

            {/* Mock footer */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full`}
                  style={{
                    backgroundColor:
                      i === 1 ? activeTheme.accent : activeTheme.textColor,
                    opacity: i === 1 ? 0.8 : 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Typography & CSS */}
      <div className="grid grid-cols-12 gap-6">
        {/* Typography */}
        <Card className="col-span-12 lg:col-span-7">
          <div className="flex items-center gap-2 mb-5">
            <Type size={16} className="text-primary" />
            <h2 className="font-headline font-bold text-on-surface">
              Typography
            </h2>
          </div>

          <SectionLabel>Font Pairing</SectionLabel>
          <div className="mt-3 space-y-2">
            {fontPairings.map((fp) => (
              <button
                key={fp.label}
                onClick={() => setFontPairing(fp.label)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${
                  fontPairing === fp.label
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {fp.label}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {fp.heading} / {fp.body}
                  </p>
                </div>
                {fontPairing === fp.label && (
                  <Check size={16} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Custom CSS */}
        <Card className="col-span-12 lg:col-span-5 relative">
          <div className="flex items-center gap-2 mb-4">
            <Code size={16} className="text-on-surface-variant/40" />
            <h2 className="font-headline font-bold text-on-surface/40">
              Custom CSS
            </h2>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-medium text-on-surface-variant/40">
              <Lock size={10} />
              v3
            </span>
          </div>

          <div className="relative">
            <textarea
              disabled
              rows={8}
              placeholder="/* Custom styles for your gallery... */"
              className="w-full resize-none rounded-xl bg-surface-container p-4 font-mono text-xs text-on-surface-variant/30 outline-none opacity-40 cursor-not-allowed"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl bg-surface-container-low/90 px-5 py-3 text-center backdrop-blur-sm">
                <Lock size={20} className="mx-auto text-on-surface-variant/30 mb-1" />
                <p className="text-[11px] font-medium text-on-surface-variant/50">
                  Available in v3
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
