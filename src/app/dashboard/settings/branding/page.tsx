'use client'

import { useCallback, useRef, useState } from 'react'
import {
  Camera,
  Check,
  ChevronDown,
  Clock,
  Droplets,
  Eye,
  Globe,
  Grid3x3,
  ImageIcon,
  Palette,
  Type,
  Upload,
  X,
} from 'lucide-react'
import type { GalleryThemeOption } from '@/types/gallery-builder'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type WatermarkPosition = 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'

const POSITION_LABELS: Record<WatermarkPosition, string> = {
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

const POSITION_GRID: WatermarkPosition[][] = [
  ['tl', 'tc', 'tr'],
  ['ml', 'mc', 'mr'],
  ['bl', 'bc', 'br'],
]

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'lora', label: 'Lora' },
  { value: 'montserrat', label: 'Montserrat' },
  { value: 'merriweather', label: 'Merriweather' },
]

interface ThemePreviewData {
  id: GalleryThemeOption
  name: string
  description: string
  bg: string
  text: string
  accent: string
}

const GALLERY_THEMES: ThemePreviewData[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dramatic dark with light text',
    bg: '#0A0A0A',
    text: '#FFFFFF',
    accent: '#5749F4',
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white with dark text',
    bg: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#5749F4',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Generous spacing, no borders',
    bg: '#F5F5F0',
    text: '#333333',
    accent: '#888888',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style, serif headings',
    bg: '#1A1916',
    text: '#E8E4DD',
    accent: '#D4A574',
  },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-medium">
      {children}
    </span>
  )
}

function GlassCard({
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

function CardHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon size={18} className="text-primary" />
      <h2 className="font-headline font-bold text-lg text-on-surface">{children}</h2>
    </div>
  )
}

function SavedBadge({ show }: { show: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Check size={11} />
      Saved
    </span>
  )
}

function ColorPicker({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
}) {
  return (
    <div className="space-y-1.5">
      <SectionLabel>{label}</SectionLabel>
      <div className="flex items-center gap-3 rounded-lg bg-surface-container px-3 py-2 ring-1 ring-outline-variant/20 focus-within:ring-primary/40 transition-shadow">
        <div className="relative shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8"
            aria-label={`${label} color picker`}
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
          onBlur={onBlur}
          className="flex-1 bg-transparent text-sm text-on-surface uppercase outline-none font-mono"
          placeholder="#000000"
          maxLength={7}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BrandingPage() {
  // Logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSaved, setLogoSaved] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#5749F4')
  const [secondaryColor, setSecondaryColor] = useState('#10B981')
  const [accentColor, setAccentColor] = useState('#F59E0B')
  const [colorSaved, setColorSaved] = useState(false)

  // Typography
  const [headingFont, setHeadingFont] = useState('playfair')
  const [bodyFont, setBodyFont] = useState('inter')
  const [typographySaved, setTypographySaved] = useState(false)

  // Gallery theme
  const [defaultTheme, setDefaultTheme] = useState<GalleryThemeOption>('dark')
  const [themeSaved, setThemeSaved] = useState(false)

  // Watermark
  const [watermarkText, setWatermarkText] = useState('Aperture Studios')
  const [watermarkOpacity, setWatermarkOpacity] = useState(30)
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('br')
  const [useLogoAsWatermark, setUseLogoAsWatermark] = useState(false)
  const [watermarkSaved, setWatermarkSaved] = useState(false)

  // Custom domain
  const [customDomain, setCustomDomain] = useState('')

  /* Flash-saved helpers */
  const flashSaved = useCallback(
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      setter(true)
      setTimeout(() => setter(false), 2500)
    },
    [],
  )

  /* Logo upload */
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string)
      // TODO(db-migration): upload to Supabase Storage at branding/{user_id}/logo.{ext}
      flashSaved(setLogoSaved)
    }
    reader.readAsDataURL(file)
  }

  function handleLogoRemove() {
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
    // TODO(db-migration): delete from Supabase Storage
    flashSaved(setLogoSaved)
  }

  /* Auto-save on blur helpers */
  function handleColorBlur() {
    // TODO(db-migration): persist primary/secondary/accent to profiles table
    flashSaved(setColorSaved)
  }

  function handleTypographyChange(field: 'heading' | 'body', val: string) {
    if (field === 'heading') setHeadingFont(val)
    else setBodyFont(val)
    // TODO(db-migration): persist typography prefs to profiles table
    flashSaved(setTypographySaved)
  }

  function handleThemeChange(theme: GalleryThemeOption) {
    setDefaultTheme(theme)
    // TODO(db-migration): persist default_gallery_theme to profiles table
    flashSaved(setThemeSaved)
  }

  function handleWatermarkBlur() {
    // TODO(db-migration): persist watermark settings to profiles table
    flashSaved(setWatermarkSaved)
  }

  /* Derived preview data */
  const activeThemeData =
    GALLERY_THEMES.find((t) => t.id === defaultTheme) ?? GALLERY_THEMES[0]

  const wm = watermarkPosition
  const wmVertical = wm.startsWith('t') ? 'top-1' : wm.startsWith('m') ? 'top-1/2 -translate-y-1/2' : 'bottom-1'
  const wmHorizontal = wm.endsWith('l') ? 'left-1' : wm.endsWith('c') ? 'left-1/2 -translate-x-1/2' : 'right-1'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dim">
            <Palette size={20} className="text-on-primary" />
          </div>
          Brand Identity
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Customize your gallery branding for a white-label experience
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ====== LEFT COLUMN ====== */}
        <div className="col-span-12 lg:col-span-7 space-y-6">

          {/* 1. Logo Upload */}
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <CardHeading icon={Camera}>Logo</CardHeading>
              <SavedBadge show={logoSaved} />
            </div>

            <div className="flex items-start gap-6">
              {/* Logo preview */}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container hover:border-primary/40 transition-colors overflow-hidden"
                aria-label="Click to upload logo"
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Studio logo preview"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <Camera size={28} className="text-on-surface-variant/20" />
                )}
              </button>

              {/* Upload zone */}
              <div className="flex-1 space-y-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => logoInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && logoInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container p-5 text-center hover:border-primary/30 transition-colors cursor-pointer focus:outline-none focus:border-primary/50"
                >
                  <Upload size={22} className="mx-auto text-on-surface-variant/30 mb-2" />
                  <p className="text-sm font-medium text-on-surface">Drag & drop your logo</p>
                  <p className="text-xs text-on-surface-variant/50 mt-1">
                    PNG, SVG, or JPG · max 2 MB · 400×100 px recommended
                  </p>
                  <span className="mt-3 inline-block rounded-lg bg-surface-container-highest px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
                    Browse Files
                  </span>
                </div>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={13} />
                    Remove logo
                  </button>
                )}
              </div>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg"
              onChange={handleLogoChange}
              className="sr-only"
              aria-label="Logo file upload"
            />
          </GlassCard>

          {/* 2. Color Palette */}
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <CardHeading icon={Droplets}>Color Palette</CardHeading>
              <SavedBadge show={colorSaved} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <ColorPicker
                label="Primary Color"
                value={primaryColor}
                onChange={setPrimaryColor}
                onBlur={handleColorBlur}
              />
              <ColorPicker
                label="Secondary Color"
                value={secondaryColor}
                onChange={setSecondaryColor}
                onBlur={handleColorBlur}
              />
              <ColorPicker
                label="Accent Color"
                value={accentColor}
                onChange={setAccentColor}
                onBlur={handleColorBlur}
              />
            </div>

            {/* Palette preview strip */}
            <div className="mt-5 space-y-1.5">
              <SectionLabel>Preview</SectionLabel>
              <div className="flex items-center gap-0.5 rounded-lg overflow-hidden h-8 ring-1 ring-outline-variant/10">
                <div className="flex-1 h-full" style={{ backgroundColor: primaryColor }} />
                <div className="flex-1 h-full" style={{ backgroundColor: secondaryColor }} />
                <div className="flex-1 h-full" style={{ backgroundColor: accentColor }} />
                <div className="w-10 h-full bg-on-surface/70" />
              </div>
              <p className="text-[10px] text-on-surface-variant/40">
                Primary · Secondary · Accent · Text
              </p>
            </div>
          </GlassCard>

          {/* 3. Typography */}
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <CardHeading icon={Type}>Typography</CardHeading>
              <SavedBadge show={typographySaved} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Heading font */}
              <div className="space-y-1.5">
                <SectionLabel>Heading Font</SectionLabel>
                <div className="relative">
                  <select
                    value={headingFont}
                    onChange={(e) => handleTypographyChange('heading', e.target.value)}
                    className="w-full appearance-none rounded-lg bg-surface-container px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                  />
                </div>
              </div>

              {/* Body font */}
              <div className="space-y-1.5">
                <SectionLabel>Body Font</SectionLabel>
                <div className="relative">
                  <select
                    value={bodyFont}
                    onChange={(e) => handleTypographyChange('body', e.target.value)}
                    className="w-full appearance-none rounded-lg bg-surface-container px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                  />
                </div>
              </div>
            </div>

            {/* Font preview */}
            <div className="mt-5 rounded-xl bg-surface-container p-4 border border-outline-variant/15">
              <SectionLabel>Preview</SectionLabel>
              <p className="mt-2 text-xl font-bold text-on-surface">
                {FONT_OPTIONS.find((f) => f.value === headingFont)?.label} Heading
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {FONT_OPTIONS.find((f) => f.value === bodyFont)?.label} — Lorem ipsum dolor sit
                amet, consectetur adipiscing elit.
              </p>
            </div>
          </GlassCard>

          {/* 4. Default Gallery Theme */}
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <CardHeading icon={Palette}>Default Gallery Theme</CardHeading>
              <SavedBadge show={themeSaved} />
            </div>
            <p className="text-xs text-on-surface-variant/60 mb-4">
              Applied to new projects automatically. Can be changed per gallery.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {GALLERY_THEMES.map((theme) => {
                const isActive = defaultTheme === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeChange(theme.id)}
                    className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left ${
                      isActive
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-outline-variant/20 hover:border-outline-variant/50'
                    }`}
                  >
                    {/* Theme swatch */}
                    <div
                      className="h-16 p-3 flex items-end justify-between"
                      style={{ backgroundColor: theme.bg }}
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-sm"
                            style={{ backgroundColor: `${theme.text}18` }}
                          />
                        ))}
                      </div>
                      <div
                        className="rounded px-1.5 py-0.5 text-[8px] font-bold"
                        style={{ backgroundColor: theme.accent, color: theme.bg }}
                      >
                        View
                      </div>
                    </div>

                    {/* Theme info */}
                    <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-surface-container">
                      <div>
                        <p className="text-xs font-semibold text-on-surface">{theme.name}</p>
                        <p className="text-[10px] text-on-surface-variant/50 mt-0.5">
                          {theme.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check size={11} className="text-on-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* 5. Watermark */}
          <GlassCard>
            <div className="flex items-center justify-between mb-5">
              <CardHeading icon={Grid3x3}>Default Watermark</CardHeading>
              <SavedBadge show={watermarkSaved} />
            </div>

            <div className="space-y-5">
              {/* Use logo toggle */}
              <div className="flex items-center justify-between rounded-xl bg-surface-container px-4 py-3 border border-outline-variant/15">
                <div>
                  <p className="text-sm font-medium text-on-surface">Use logo as watermark</p>
                  <p className="text-[11px] text-on-surface-variant/50 mt-0.5">
                    Overlay your logo instead of text on gallery photos
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useLogoAsWatermark}
                  onClick={() => {
                    setUseLogoAsWatermark((prev) => !prev)
                    // TODO(db-migration): persist to profiles table
                    flashSaved(setWatermarkSaved)
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface-container ${
                    useLogoAsWatermark ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      useLogoAsWatermark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Watermark text (shown when not using logo) */}
              {!useLogoAsWatermark && (
                <div className="space-y-1.5">
                  <SectionLabel>Watermark Text</SectionLabel>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    onBlur={handleWatermarkBlur}
                    placeholder="Your studio name"
                    className="w-full rounded-lg bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none ring-1 ring-outline-variant/20 focus:ring-primary/50"
                  />
                </div>
              )}

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
                  onMouseUp={handleWatermarkBlur}
                  onTouchEnd={handleWatermarkBlur}
                  className="w-full accent-primary"
                  aria-label="Watermark opacity"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant/50">
                  <span>Subtle</span>
                  <span>Bold</span>
                </div>
              </div>

              {/* Position grid */}
              <div className="space-y-2">
                <SectionLabel>Position</SectionLabel>
                <div className="inline-grid grid-cols-3 gap-1.5 rounded-xl bg-surface-container p-2 border border-outline-variant/15">
                  {POSITION_GRID.map((row) =>
                    row.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => {
                          setWatermarkPosition(pos)
                          // TODO(db-migration): persist
                          flashSaved(setWatermarkSaved)
                        }}
                        className={`h-8 w-8 rounded-lg transition-all ${
                          watermarkPosition === pos
                            ? 'bg-gradient-to-br from-primary to-primary-dim'
                            : 'bg-surface-container-highest hover:bg-surface-container-highest/80'
                        }`}
                        title={POSITION_LABELS[pos]}
                        aria-label={POSITION_LABELS[pos]}
                        aria-pressed={watermarkPosition === pos}
                      >
                        <div
                          className={`mx-auto rounded-full transition-all ${
                            watermarkPosition === pos
                              ? 'h-2 w-2 bg-on-primary'
                              : 'h-1.5 w-1.5 bg-on-surface-variant/20'
                          }`}
                        />
                      </button>
                    )),
                  )}
                </div>
                <span className="text-xs text-on-surface-variant/40">
                  {POSITION_LABELS[watermarkPosition]}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* 6. Custom Domain */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-2">
              <Globe size={18} className="text-on-surface-variant/40" />
              <h2 className="font-headline font-bold text-lg text-on-surface/60">Custom Domain</h2>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-0.5 text-[10px] font-medium text-on-surface-variant/50">
                <Clock size={10} />
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-on-surface-variant/40 mb-4">
              Serve galleries from your own domain (e.g., galleries.yourstudio.com)
            </p>
            <div className="relative">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="galleries.yourstudio.com"
                disabled
                className="w-full rounded-lg bg-surface-container/40 px-4 py-2.5 text-sm text-on-surface-variant/40 placeholder-on-surface-variant/20 outline-none ring-1 ring-outline-variant/10 cursor-not-allowed"
              />
            </div>
            <p className="mt-2 text-[10px] text-on-surface-variant/30">
              Custom domain support will be available in a future release.
            </p>
          </GlassCard>
        </div>

        {/* ====== RIGHT COLUMN — Live Preview ====== */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-4">
            <GlassCard className="overflow-hidden">
              <CardHeading icon={Eye}>Live Preview</CardHeading>

              {/* Gallery preview shell */}
              <div
                className="rounded-xl overflow-hidden border border-outline-variant/20"
                style={{ backgroundColor: activeThemeData.bg }}
              >
                {/* Gallery header */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: `${activeThemeData.text}10` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Studio logo"
                        className="h-5 w-auto object-contain"
                      />
                    ) : (
                      <div
                        className="h-5 w-5 rounded"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}
                    <span
                      className="text-xs font-bold"
                      style={{ color: activeThemeData.text }}
                    >
                      {watermarkText || 'Your Studio'}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: `${activeThemeData.text}70` }}>
                    Sarah & James — Wedding Collection
                  </p>
                </div>

                {/* Photo grid */}
                <div className="p-3 grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 9 }, (_, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded flex items-center justify-center"
                      style={{ backgroundColor: `${activeThemeData.text}08` }}
                    >
                      <ImageIcon
                        size={14}
                        style={{ color: `${activeThemeData.text}20` }}
                      />
                      {/* Watermark overlay */}
                      <div
                        className={`absolute ${wmVertical} ${wmHorizontal}`}
                        style={{ opacity: watermarkOpacity / 100 }}
                      >
                        <span
                          className="text-[5px] font-medium whitespace-nowrap"
                          style={{ color: primaryColor }}
                        >
                          {useLogoAsWatermark ? '⬛ logo' : watermarkText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gallery footer */}
                <div
                  className="px-4 py-2.5 border-t flex items-center justify-between"
                  style={{ borderColor: `${activeThemeData.text}10` }}
                >
                  <span className="text-[9px]" style={{ color: `${activeThemeData.text}50` }}>
                    48 photos · $12/photo
                  </span>
                  <div
                    className="rounded px-2 py-0.5 text-[8px] font-bold"
                    style={{ backgroundColor: primaryColor, color: activeThemeData.bg }}
                  >
                    View Gallery
                  </div>
                </div>
              </div>

              {/* Theme label */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant/40">
                  Theme: {activeThemeData.name}
                </span>
                <div className="flex items-center gap-2">
                  {[primaryColor, secondaryColor, accentColor].map((color, i) => (
                    <div
                      key={i}
                      className="h-3.5 w-3.5 rounded-full border border-outline-variant/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Settings summary */}
            <div className="rounded-xl bg-surface-container/50 border border-outline-variant/15 p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/40 font-medium mb-3">
                Current Configuration
              </p>
              {[
                { label: 'Logo', value: logoPreview ? 'Uploaded ✓' : 'Not set' },
                { label: 'Primary', value: primaryColor.toUpperCase() },
                { label: 'Default Theme', value: activeThemeData.name },
                { label: 'Watermark', value: useLogoAsWatermark ? 'Logo overlay' : watermarkText || 'Not set' },
                { label: 'Domain', value: customDomain || 'Default (view1.app)' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <span className="text-[11px] text-on-surface-variant/50">{label}</span>
                  <span className="text-[11px] text-on-surface font-medium truncate max-w-[160px]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
