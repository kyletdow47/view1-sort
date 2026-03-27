'use client'

import { useState } from 'react'
import {
  Palette,
  Upload,
  Type,
  Droplets,
  Eye,
  ImageIcon,
  Grid3x3,
  Save,
  ChevronDown,
  Camera,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                   */
/* ------------------------------------------------------------------ */

type WatermarkPosition = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'

const fontOptions = [
  { value: 'inter', label: 'Inter' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'lora', label: 'Lora' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'merriweather', label: 'Merriweather' },
]

const positionLabels: Record<WatermarkPosition, string> = {
  tl: 'Top Left',
  tc: 'Top Center',
  tr: 'Top Right',
  ml: 'Middle Left',
  mc: 'Center',
  mr: 'Middle Right',
  bl: 'Bottom Left',
  bc: 'Bottom Center',
  br: 'Bottom Right',
}

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
    <div className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}>
      {children}
    </div>
  )
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <SectionLabel>{label}</SectionLabel>
      <div className="flex items-center gap-3 rounded-lg bg-surface-container px-3 py-2 ring-1 ring-outline-variant/20">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
          />
          <div
            className="h-8 w-8 rounded-lg border border-outline-variant/30 cursor-pointer"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-on-surface uppercase outline-none font-mono"
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BrandingPage() {
  const [primaryColor, setPrimaryColor] = useState('#ffb780')
  const [secondaryColor, setSecondaryColor] = useState('#95d1d1')
  const [bgColor, setBgColor] = useState('#151312')
  const [headingFont, setHeadingFont] = useState('playfair')
  const [bodyFont, setBodyFont] = useState('inter')
  const [watermarkText, setWatermarkText] = useState('Aperture Studios')
  const [watermarkOpacity, setWatermarkOpacity] = useState(30)
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('br')

  const positionGrid: WatermarkPosition[][] = [
    ['tl', 'tc', 'tr'],
    ['ml', 'mc', 'mr'],
    ['bl', 'bc', 'br'],
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Palette size={20} className="text-[#4e2600]" />
          </div>
          Brand Identity
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Customize your gallery branding for a white-label experience
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ====== LEFT COLUMN (7) ====== */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Logo Upload */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Camera size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Logo
              </h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container hover:border-primary/40 transition-colors cursor-pointer">
                <Camera size={28} className="text-on-surface-variant/20" />
              </div>
              <div className="flex-1">
                <div className="rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Upload size={24} className="mx-auto text-on-surface-variant/30 mb-2" />
                  <p className="text-sm font-medium text-on-surface">
                    Drag & drop your logo
                  </p>
                  <p className="text-xs text-on-surface-variant/50 mt-1">
                    PNG, SVG, or JPG up to 2MB. Recommended 400x100px
                  </p>
                  <button className="mt-3 rounded-lg bg-surface-container-highest px-4 py-2 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Color Palette */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Droplets size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Color Palette
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ColorPicker label="Primary Color" value={primaryColor} onChange={setPrimaryColor} />
              <ColorPicker label="Secondary Color" value={secondaryColor} onChange={setSecondaryColor} />
              <ColorPicker label="Background" value={bgColor} onChange={setBgColor} />
            </div>

            {/* Palette preview strip */}
            <div className="mt-5 flex items-center gap-2">
              <SectionLabel>Preview</SectionLabel>
              <div className="flex-1 flex items-center gap-0.5 rounded-lg overflow-hidden h-6">
                <div className="flex-1 h-full" style={{ backgroundColor: bgColor }} />
                <div className="flex-1 h-full" style={{ backgroundColor: primaryColor }} />
                <div className="flex-1 h-full" style={{ backgroundColor: secondaryColor }} />
                <div className="w-8 h-full bg-[#e7e1df]" />
              </div>
            </div>
          </Card>

          {/* Typography */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Type size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Typography
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <SectionLabel>Heading Font</SectionLabel>
                <div className="relative">
                  <select
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                    className="w-full appearance-none rounded-lg bg-surface-container px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <SectionLabel>Body Font</SectionLabel>
                <div className="relative">
                  <select
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    className="w-full appearance-none rounded-lg bg-surface-container px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                </div>
              </div>
            </div>

            {/* Font preview */}
            <div className="mt-5 rounded-xl bg-surface-container p-4 border border-outline-variant/15">
              <SectionLabel>Preview</SectionLabel>
              <p className="mt-2 text-xl font-bold text-on-surface">
                {fontOptions.find((f) => f.value === headingFont)?.label} Heading
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {fontOptions.find((f) => f.value === bodyFont)?.label} body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </Card>

          {/* Watermark */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Grid3x3 size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Watermark
              </h2>
            </div>

            <div className="space-y-5">
              {/* Watermark text */}
              <div className="space-y-1.5">
                <SectionLabel>Watermark Text</SectionLabel>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Your studio name"
                  className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                />
              </div>

              {/* Opacity slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <SectionLabel>Opacity</SectionLabel>
                  <span className="text-xs font-medium text-primary">{watermarkOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full accent-[#d48441]"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant/50">
                  <span>Subtle</span>
                  <span>Bold</span>
                </div>
              </div>

              {/* Position selector (9-grid) */}
              <div className="space-y-2">
                <SectionLabel>Position</SectionLabel>
                <div className="inline-grid grid-cols-3 gap-1.5 rounded-xl bg-surface-container p-2 border border-outline-variant/15">
                  {positionGrid.map((row, ri) =>
                    row.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setWatermarkPosition(pos)}
                        className={`h-8 w-8 rounded-lg text-[8px] font-medium transition-all ${
                          watermarkPosition === pos
                            ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                            : 'bg-surface-container-highest text-on-surface-variant/30 hover:text-on-surface-variant/60'
                        }`}
                        title={positionLabels[pos]}
                      >
                        {pos === watermarkPosition ? (
                          <div className="h-2 w-2 rounded-full bg-[#4e2600] mx-auto" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-on-surface-variant/20 mx-auto" />
                        )}
                      </button>
                    ))
                  )}
                </div>
                <span className="text-xs text-on-surface-variant/40">
                  {positionLabels[watermarkPosition]}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ====== RIGHT COLUMN (5) — Live Preview ====== */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 mb-5">
                <Eye size={18} className="text-primary" />
                <h2 className="font-headline font-bold text-lg text-on-surface">
                  Live Preview
                </h2>
              </div>

              {/* Gallery preview */}
              <div
                className="rounded-xl overflow-hidden border border-outline-variant/20"
                style={{ backgroundColor: bgColor }}
              >
                {/* Gallery header */}
                <div className="px-5 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-5 w-5 rounded"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span
                      className="text-sm font-bold"
                      style={{ color: '#e7e1df' }}
                    >
                      {watermarkText || 'Your Studio'}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: '#a18d80' }}>
                    Sarah & James Wedding Collection
                  </p>
                </div>

                {/* Photo grid */}
                <div className="p-3 grid grid-cols-3 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}08` }}
                    >
                      <ImageIcon
                        size={14}
                        style={{ color: `${primaryColor}30` }}
                      />
                      {/* Watermark overlay */}
                      <div
                        className={`absolute ${
                          watermarkPosition.startsWith('t') ? 'top-1' : watermarkPosition.startsWith('m') ? 'top-1/2 -translate-y-1/2' : 'bottom-1'
                        } ${
                          watermarkPosition.endsWith('l') ? 'left-1' : watermarkPosition.endsWith('c') ? 'left-1/2 -translate-x-1/2' : 'right-1'
                        }`}
                        style={{ opacity: watermarkOpacity / 100 }}
                      >
                        <span
                          className="text-[5px] font-medium whitespace-nowrap"
                          style={{ color: primaryColor }}
                        >
                          {watermarkText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gallery footer */}
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: '#a18d80' }}>
                    48 photos &middot; $12/photo
                  </span>
                  <div
                    className="rounded px-2 py-0.5 text-[8px] font-bold"
                    style={{
                      backgroundColor: primaryColor,
                      color: bgColor,
                    }}
                  >
                    View Gallery
                  </div>
                </div>
              </div>

              {/* Color swatches below preview */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-outline-variant/20" style={{ backgroundColor: primaryColor }} />
                  <span className="text-[10px] text-on-surface-variant/50">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-outline-variant/20" style={{ backgroundColor: secondaryColor }} />
                  <span className="text-[10px] text-on-surface-variant/50">Secondary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-outline-variant/20" style={{ backgroundColor: bgColor }} />
                  <span className="text-[10px] text-on-surface-variant/50">Background</span>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-3.5 font-headline font-bold text-[#4e2600] transition-opacity hover:opacity-90 shadow-lg shadow-[#d48441]/20">
              <Save size={18} />
              Save Brand Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
