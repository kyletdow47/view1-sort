'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  Plus,
  X,
  Calendar,
  ChevronsUpDown,
} from 'lucide-react'

import type {
  AIPreferences,
  ShootingStyle,
  AutoSortCategoryKey,
  AutoRejectKey,
  WatermarkStyle,
  GalleryTheme,
  GalleryExpiry,
} from '@/types/ai-preferences'
import {
  SHOOTING_STYLES,
  WATERMARK_STYLES,
  GALLERY_THEMES,
  GALLERY_EXPIRY_OPTIONS,
  DEFAULT_AI_PREFERENCES,
} from '@/types/ai-preferences'

/* ─── Toggle Switch (reused from SortControlsPanel pattern) ─── */
function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
        ${enabled ? 'bg-[#5749F4]' : 'bg-white/15'}
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200
          ${enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}
        `}
      />
    </button>
  )
}

/* ─── Glass Card wrapper ─── */
function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl backdrop-blur-[16px] bg-white/[0.08] border border-white/20 p-4 ${className}`}
    >
      {children}
    </div>
  )
}

/* ─── Section Header with optional chevron ─── */
function SectionHeader({
  title,
  rightContent,
  showChevron = true,
}: {
  title: string
  rightContent?: React.ReactNode
  showChevron?: boolean
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-white font-[family-name:var(--font-geist-sans)] text-base font-semibold">
        {title}
      </span>
      {rightContent}
      {showChevron && !rightContent && (
        <ChevronDown className="w-4 h-4 text-white/50" />
      )}
    </div>
  )
}

/* ─── Slider Component ─── */
function PreferencesSlider({
  value,
  min = 0,
  max = 100,
  onChange,
  showLabels,
  labels,
}: {
  value: number
  min?: number
  max?: number
  onChange: (val: number) => void
  showLabels?: boolean
  labels?: string[]
}) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative h-4 w-full flex items-center">
        <div className="absolute inset-0 flex items-center">
          <div className="h-1 w-full rounded-full bg-white/[0.12]" />
        </div>
        <div
          className="absolute h-1 rounded-full bg-[#5749F4]"
          style={{ width: `${percent}%`, top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-white pointer-events-none"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>
      {showLabels && labels && (
        <div className="flex justify-between w-full">
          {labels.map((label) => (
            <span
              key={label}
              className="text-white/[0.38] font-[family-name:var(--font-geist-sans)] text-[11px]"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Dropdown Select ─── */
function DropdownSelect<T extends string>({
  value,
  options,
  onChange,
  icon,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (val: T) => void
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = options.find((o) => o.id === value)?.label ?? value

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-[10px] bg-white/[0.08] border border-white/[0.12]
          px-3.5 py-[7px] transition-colors hover:bg-white/[0.12]"
      >
        {icon}
        <span className="text-white font-[family-name:var(--font-geist-sans)] text-[13px] font-medium">
          {selectedLabel}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-white/[0.38]" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-xl
            bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/20 p-1 shadow-xl"
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors
                ${opt.id === value
                  ? 'bg-[#5749F4]/20 text-[#5749F4]'
                  : 'text-white/70 hover:bg-white/[0.08]'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Number Stepper ─── */
function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999,
}: {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const next = value + 10
        onChange(next > max ? min : next)
      }}
      className="flex items-center gap-2 rounded-[10px] bg-white/[0.08] border border-white/[0.12]
        px-3.5 py-[7px] transition-colors hover:bg-white/[0.12]"
    >
      <span className="text-white font-[family-name:var(--font-geist-sans)] text-[13px] font-medium">
        {value}
      </span>
      <ChevronsUpDown className="w-3.5 h-3.5 text-white/[0.38]" />
    </button>
  )
}

/* ─── Main Preferences Component ─── */
export function AISortPreferences() {
  const [prefs, setPrefs] = useState<AIPreferences>({ ...DEFAULT_AI_PREFERENCES })
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save with debounce
  const savePrefs = useCallback((updated: AIPreferences) => {
    setPrefs(updated)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      // TODO: Save to project metadata via Supabase — projects.metadata.ai_preferences JSONB field
      console.log('[AISortPreferences] Auto-saving preferences:', updated)
    }, 800)
  }, [])

  // Shooting style toggle
  const toggleStyle = useCallback(
    (style: ShootingStyle) => {
      const current = prefs.shootingStyles
      const updated = current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style]
      savePrefs({ ...prefs, shootingStyles: updated })
    },
    [prefs, savePrefs],
  )

  // Auto-sort category toggle
  const toggleAutoSortCategory = useCallback(
    (id: AutoSortCategoryKey) => {
      const updated = prefs.autoSortCategories.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c,
      )
      savePrefs({ ...prefs, autoSortCategories: updated })
    },
    [prefs, savePrefs],
  )

  // Confidence threshold
  const setThreshold = useCallback(
    (val: number) => {
      savePrefs({ ...prefs, confidenceThreshold: val })
    },
    [prefs, savePrefs],
  )

  // Auto-reject toggle
  const toggleAutoReject = useCallback(
    (id: AutoRejectKey) => {
      const updated = prefs.autoRejectRules.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r,
      )
      savePrefs({ ...prefs, autoRejectRules: updated })
    },
    [prefs, savePrefs],
  )

  // Hero shot scoring
  const updateHeroScoring = useCallback(
    (key: keyof typeof prefs.heroShotScoring, val: number) => {
      savePrefs({
        ...prefs,
        heroShotScoring: { ...prefs.heroShotScoring, [key]: val },
      })
    },
    [prefs, savePrefs],
  )

  // Vibe keywords
  const [newKeyword, setNewKeyword] = useState('')
  const addKeyword = useCallback(() => {
    const trimmed = newKeyword.trim().toLowerCase()
    if (!trimmed || prefs.vibeKeywords.includes(trimmed)) return
    savePrefs({ ...prefs, vibeKeywords: [...prefs.vibeKeywords, trimmed] })
    setNewKeyword('')
  }, [newKeyword, prefs, savePrefs])

  const removeKeyword = useCallback(
    (keyword: string) => {
      savePrefs({
        ...prefs,
        vibeKeywords: prefs.vibeKeywords.filter((k) => k !== keyword),
      })
    },
    [prefs, savePrefs],
  )

  // Delivery defaults
  const updateDelivery = useCallback(
    <K extends keyof typeof prefs.delivery>(key: K, val: typeof prefs.delivery[K]) => {
      savePrefs({
        ...prefs,
        delivery: { ...prefs.delivery, [key]: val },
      })
    },
    [prefs, savePrefs],
  )

  return (
    <div className="flex-1 overflow-y-auto min-h-0 pb-4">
      <div className="flex flex-col gap-5 max-w-[520px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-white font-[family-name:var(--font-geist-sans)] text-xl font-bold">
            AI Preferences
          </h2>
          <p className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
            Fine-tune how View1 AI sorts, scores, and delivers your photos.
          </p>
        </div>

        {/* 1. Shooting Style */}
        <GlassCard className="flex flex-col gap-3">
          <SectionHeader title="Shooting Style" />
          <div className="flex flex-wrap gap-2">
            {SHOOTING_STYLES.map((style) => {
              const isActive = prefs.shootingStyles.includes(style.id)
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => toggleStyle(style.id)}
                  className={`
                    rounded-[10px] px-3.5 py-1.5 text-xs font-medium transition-all
                    ${isActive
                      ? 'bg-[#5749F4] text-white font-medium'
                      : 'bg-white/[0.12] text-white/80 border border-white/[0.19] hover:bg-white/[0.18]'
                    }
                  `}
                >
                  {style.label}
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* 2. Auto-Sort Categories */}
        <GlassCard className="flex flex-col gap-2.5">
          <SectionHeader title="Auto-Sort Categories" />
          {prefs.autoSortCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between py-2 px-0"
            >
              <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
                {cat.label}
              </span>
              <ToggleSwitch
                enabled={cat.enabled}
                onToggle={() => toggleAutoSortCategory(cat.id)}
              />
            </div>
          ))}
        </GlassCard>

        {/* 3. Confidence Threshold */}
        <GlassCard className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-white font-[family-name:var(--font-geist-sans)] text-base font-semibold">
              Confidence Threshold
            </span>
            <span className="text-[#5749F4] font-[family-name:var(--font-geist-sans)] text-sm font-bold">
              {prefs.confidenceThreshold}%
            </span>
          </div>
          <p className="text-white/50 font-[family-name:var(--font-geist-sans)] text-xs">
            Minimum confidence level for AI auto-sorting. Photos below this threshold are flagged for manual review.
          </p>
          <PreferencesSlider
            value={prefs.confidenceThreshold}
            onChange={setThreshold}
            showLabels
            labels={['0%', '50%', '100%']}
          />
        </GlassCard>

        {/* 4. Auto-Reject Rules */}
        <GlassCard className="flex flex-col gap-2.5">
          <SectionHeader title="Auto-Reject Rules" />
          <p className="text-white/50 font-[family-name:var(--font-geist-sans)] text-xs">
            Photos matching these criteria will be automatically rejected during sorting.
          </p>
          {prefs.autoRejectRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between py-2 px-0"
            >
              <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
                {rule.label}
              </span>
              <ToggleSwitch
                enabled={rule.enabled}
                onToggle={() => toggleAutoReject(rule.id)}
              />
            </div>
          ))}
        </GlassCard>

        {/* 5. Hero Shot Scoring */}
        <GlassCard className="flex flex-col gap-3.5">
          <SectionHeader title="Hero Shot Scoring" />
          {(
            [
              { key: 'sharpness', label: 'Sharpness' },
              { key: 'composition', label: 'Composition' },
              { key: 'expression', label: 'Expression' },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
                  {label}
                </span>
                <span className="text-[#5749F4] font-[family-name:var(--font-geist-sans)] text-[13px] font-semibold">
                  {prefs.heroShotScoring[key]}
                </span>
              </div>
              <PreferencesSlider
                value={prefs.heroShotScoring[key]}
                onChange={(val) => updateHeroScoring(key, val)}
              />
            </div>
          ))}
        </GlassCard>

        {/* 6. Vibe Keywords */}
        <GlassCard className="flex flex-col gap-3">
          <SectionHeader title="Vibe Keywords" />
          <p className="text-white/50 font-[family-name:var(--font-geist-sans)] text-xs">
            Add mood and style keywords that help the AI understand your aesthetic preferences.
          </p>
          <div className="flex flex-wrap gap-2">
            {prefs.vibeKeywords.map((keyword) => (
              <span
                key={keyword}
                className="flex items-center gap-1.5 rounded-[10px] bg-white/[0.12] border border-white/[0.19]
                  px-3 py-[5px]"
              >
                <span className="text-white/80 font-[family-name:var(--font-geist-sans)] text-xs">
                  {keyword}
                </span>
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="text-white/[0.38] hover:text-white/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div
            className="flex items-center gap-2 rounded-[10px] bg-white/[0.08] border border-white/[0.19]
              px-3.5 py-[9px] w-full"
          >
            <Plus className="w-3.5 h-3.5 text-white/[0.38] shrink-0" />
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="Add keyword..."
              className="flex-1 bg-transparent text-white/70 text-[13px] placeholder-white/[0.31]
                font-[family-name:var(--font-geist-sans)] outline-none"
            />
          </div>
        </GlassCard>

        {/* 7. Delivery Defaults */}
        <GlassCard className="flex flex-col gap-3.5">
          <SectionHeader title="Delivery Defaults" />

          {/* Watermark Photos */}
          <div className="flex items-center justify-between py-2">
            <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
              Watermark Photos
            </span>
            <ToggleSwitch
              enabled={prefs.delivery.watermarkEnabled}
              onToggle={() => updateDelivery('watermarkEnabled', !prefs.delivery.watermarkEnabled)}
            />
          </div>

          {/* Max Selects */}
          <div className="flex items-center justify-between py-2">
            <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
              Max Selects
            </span>
            <NumberInput
              value={prefs.delivery.maxSelects}
              onChange={(val) => updateDelivery('maxSelects', val)}
            />
          </div>

          {/* Gallery Expiry */}
          <div className="flex items-center justify-between py-2">
            <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
              Gallery Expiry
            </span>
            <DropdownSelect
              value={prefs.delivery.galleryExpiry}
              options={GALLERY_EXPIRY_OPTIONS}
              onChange={(val) => updateDelivery('galleryExpiry', val)}
              icon={<Calendar className="w-3.5 h-3.5 text-white/[0.38]" />}
            />
          </div>

          {/* Watermark Style */}
          <div className="flex items-center justify-between py-2">
            <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
              Watermark Style
            </span>
            <DropdownSelect
              value={prefs.delivery.watermarkStyle}
              options={WATERMARK_STYLES}
              onChange={(val) => updateDelivery('watermarkStyle', val)}
            />
          </div>

          {/* Gallery Theme */}
          <div className="flex items-center justify-between py-2">
            <span className="text-white/70 font-[family-name:var(--font-geist-sans)] text-[13px]">
              Gallery Theme
            </span>
            <DropdownSelect
              value={prefs.delivery.galleryTheme}
              options={GALLERY_THEMES}
              onChange={(val) => updateDelivery('galleryTheme', val)}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
