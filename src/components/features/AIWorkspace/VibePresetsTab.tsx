'use client'

import { useCallback, useRef, useState } from 'react'
import {
  ChevronRight,
  Check,
  Edit3,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react'

import type { ParseVibeResponse, VibePreset, VibeStyleParams } from '@/types/vibe-presets'
import { EXAMPLE_PROMPTS } from '@/types/vibe-presets'
import { useVibePresets } from '@/hooks/useVibePresets'

/* ─────────────────────────────────────────────
   Internal UI primitives (scoped to this file)
   ───────────────────────────────────────────── */

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        rounded-2xl border border-white/20
        bg-gradient-to-b from-white/[0.12] to-white/[0.06]
        backdrop-blur-[16px]
        ${className}
      `}
    >
      {children}
    </div>
  )
}

const COLOR_TEMP_STYLES: Record<VibeStyleParams['colorTemp'], string> = {
  warm: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  neutral: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  cool: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

/* ─────────────────────────────────────────────
   PresetCard
   ───────────────────────────────────────────── */

interface PresetCardProps {
  preset: VibePreset
  isActive: boolean
  onApply: (preset: VibePreset) => void
  onEdit: (preset: VibePreset) => void
  onDelete: (id: string) => void
}

function PresetCard({ preset, isActive, onApply, onEdit, onDelete }: PresetCardProps) {
  return (
    <GlassCard
      className={`p-4 flex flex-col gap-3 ${isActive ? 'ring-1 ring-[#5749F4]/60' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Palette className="w-3.5 h-3.5 text-[#818CF8] flex-shrink-0" />
            <span className="font-semibold text-white font-[Geist,sans-serif] text-sm truncate">
              {preset.name}
            </span>
            {isActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5749F4]/30 text-[#818CF8] border border-[#5749F4]/40 flex-shrink-0">
                Active
              </span>
            )}
          </div>
          <p className="text-white/50 text-xs mt-1 line-clamp-2 font-[Geist,sans-serif]">
            {preset.description}
          </p>
        </div>
      </div>

      {/* Style Parameter Chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/15 font-[Geist,sans-serif]">
          {preset.styleParams.mood}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/15 font-[Geist,sans-serif]">
          {preset.styleParams.lighting}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/15 font-[Geist,sans-serif]">
          {preset.styleParams.composition}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full border font-[Geist,sans-serif] ${COLOR_TEMP_STYLES[preset.styleParams.colorTemp]}`}
        >
          {preset.styleParams.colorTemp}
        </span>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/10">
        <button
          type="button"
          onClick={() => onApply(preset)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
            bg-[#5749F4]/20 hover:bg-[#5749F4]/30 border border-[#5749F4]/30 hover:border-[#5749F4]/50
            text-[#818CF8] hover:text-white text-xs font-medium font-[Geist,sans-serif]
            transition-all duration-150"
        >
          <Sparkles className="w-3 h-3" />
          Apply Preset
        </button>
        <button
          type="button"
          onClick={() => onEdit(preset)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
            text-white/40 hover:text-white/70 transition-all duration-150"
          title="Edit preset"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(preset.id)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10
            hover:border-red-500/30 text-white/40 hover:text-red-400 transition-all duration-150"
          title="Delete preset"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </GlassCard>
  )
}

/* ─────────────────────────────────────────────
   StyleParamsPreview — after AI extraction
   ───────────────────────────────────────────── */

interface StyleParamsPreviewProps {
  params: VibeStyleParams
  presetName: string
  onNameChange: (name: string) => void
  onSave: () => void
  onDiscard: () => void
}

function StyleParamsPreview({
  params,
  presetName,
  onNameChange,
  onSave,
  onDiscard,
}: StyleParamsPreviewProps) {
  const paramRows = [
    { label: 'Mood', value: params.mood },
    { label: 'Lighting', value: params.lighting },
    { label: 'Composition', value: params.composition },
    { label: 'Color Temp', value: params.colorTemp },
  ] as const

  return (
    <div className="flex flex-col gap-4">
      {/* Success indicator */}
      <div className="flex items-center gap-2 text-[#34D399]">
        <Check className="w-4 h-4" />
        <span className="text-sm font-medium font-[Geist,sans-serif]">
          Style parameters extracted
        </span>
      </div>

      {/* Param grid */}
      <div className="grid grid-cols-2 gap-2">
        {paramRows.map(({ label, value }) => (
          <div key={label} className="p-2 rounded-lg bg-white/5 border border-white/10">
            <div className="text-white/40 text-[10px] uppercase tracking-wider font-[Geist_Mono,monospace] mb-0.5">
              {label}
            </div>
            <div className="text-white/80 text-xs font-medium font-[Geist,sans-serif] capitalize">
              {value}
            </div>
          </div>
        ))}
      </div>

      {params.subjects.length > 0 && (
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-[Geist_Mono,monospace] mb-1.5">
            Prioritize
          </p>
          <div className="flex flex-wrap gap-1.5">
            {params.subjects.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-0.5 rounded-full bg-[#5749F4]/20 text-[#818CF8]
                  border border-[#5749F4]/30 font-[Geist,sans-serif]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {params.avoidPatterns.length > 0 && (
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-[Geist_Mono,monospace] mb-1.5">
            Avoid
          </p>
          <div className="flex flex-wrap gap-1.5">
            {params.avoidPatterns.map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400
                  border border-red-500/20 font-[Geist,sans-serif]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="text-white/50 text-xs font-medium font-[Geist,sans-serif] block mb-1.5">
          Preset name
        </label>
        <input
          type="text"
          value={presetName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Moody Editorial"
          className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/15
            focus:border-[#5749F4]/60 focus:ring-1 focus:ring-[#5749F4]/30
            text-white text-sm font-[Geist,sans-serif] placeholder-white/30
            outline-none transition-all"
        />
      </div>

      {/* Save / Discard */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!presetName.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg
            bg-[#5749F4] hover:bg-[#4f46e5]
            disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed
            text-white text-sm font-medium font-[Geist,sans-serif] transition-all duration-150"
        >
          <Check className="w-3.5 h-3.5" />
          Save Preset
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="px-4 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
            text-white/50 hover:text-white/80 text-sm font-[Geist,sans-serif] transition-all duration-150"
        >
          Discard
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ApplyPresetModal — before/after comparison
   ───────────────────────────────────────────── */

interface CategoryDistribution {
  name: string
  count: number
}

interface ApplyPresetModalProps {
  preset: VibePreset
  currentDistribution: CategoryDistribution[]
  onConfirm: () => void
  onCancel: () => void
}

/** Predict how preset style params would shift category distribution */
function predictDistribution(
  current: CategoryDistribution[],
  preset: VibePreset,
): CategoryDistribution[] {
  // Heuristic: subjects in the preset get a boost, avoidPatterns get demoted
  const subjects = new Set(preset.styleParams.subjects.map((s) => s.toLowerCase()))
  const avoids = new Set(preset.styleParams.avoidPatterns.map((p) => p.toLowerCase()))

  return current.map((cat) => {
    const lower = cat.name.toLowerCase()
    const subjectMatch = subjects.has(lower) || [...subjects].some((s) => lower.includes(s))
    const avoidMatch = avoids.has(lower) || [...avoids].some((a) => lower.includes(a))

    let multiplier = 1.0
    if (subjectMatch) multiplier = 1.3
    if (avoidMatch) multiplier = 0.5

    return { name: cat.name, count: Math.round(cat.count * multiplier) }
  })
}

const BAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500',
]

function DistributionBars({ items, maxCount }: { items: CategoryDistribution[]; maxCount: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.slice(0, 6).map((item, i) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 w-16 truncate text-right font-[Geist,sans-serif]">
            {item.name}
          </span>
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-500`}
              style={{ width: maxCount > 0 ? `${(item.count / maxCount) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-[10px] text-white/30 w-6 font-[Geist_Mono,monospace]">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  )
}

function ApplyPresetModal({ preset, currentDistribution, onConfirm, onCancel }: ApplyPresetModalProps) {
  const predicted = predictDistribution(currentDistribution, preset)
  const maxCount = Math.max(
    ...currentDistribution.map((d) => d.count),
    ...predicted.map((d) => d.count),
    1,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden border border-white/20
        bg-gradient-to-b from-white/[0.14] to-white/[0.06] backdrop-blur-[40px]
        shadow-2xl p-6 flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-semibold font-[Geist,sans-serif] text-base">
              Apply &ldquo;{preset.name}&rdquo;
            </h3>
            <p className="text-white/50 text-sm font-[Geist,sans-serif] mt-0.5">
              This will rerank all photos based on your preset style.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Before / After Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-white/40 text-xs font-medium font-[Geist,sans-serif] text-center">
              Current Distribution
            </p>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <DistributionBars items={currentDistribution} maxCount={maxCount} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-white/40 text-xs font-medium font-[Geist,sans-serif] text-center">
              {preset.name} Predicted
            </p>
            <div className="rounded-xl bg-[#5749F4]/5 border border-[#5749F4]/20 p-3">
              <DistributionBars items={predicted} maxCount={maxCount} />
            </div>
          </div>
        </div>

        <p className="text-white/40 text-xs font-[Geist,sans-serif] text-center">
          Reranking by: {preset.styleParams.mood} mood &middot;{' '}
          {preset.styleParams.lighting} lighting &middot; {preset.styleParams.colorTemp} tones
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15
              text-white/60 hover:text-white text-sm font-medium font-[Geist,sans-serif] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-[#5749F4] hover:bg-[#4f46e5]
              text-white text-sm font-medium font-[Geist,sans-serif]
              flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Confirm &amp; Apply
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   VibePresetsTab — main export
   ───────────────────────────────────────────── */

export interface VibePresetsTabProps {
  projectId?: string
  categoryDistribution?: CategoryDistribution[]
}

export function VibePresetsTab({ projectId, categoryDistribution = [] }: VibePresetsTabProps) {
  const {
    presets,
    activePresetId,
    savePreset: savePresetToCloud,
    deletePreset: deletePresetFromCloud,
    applyPreset: applyPresetToCloud,
  } = useVibePresets(projectId)
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedResult, setParsedResult] = useState<ParseVibeResponse | null>(null)
  const [presetName, setPresetName] = useState('')
  const [applyingPreset, setApplyingPreset] = useState<VibePreset | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseSource, setParseSource] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleExamplePrompt = useCallback(
    (prompt: string) => {
      setDescription(prompt)
      setParsedResult(null)
      setTimeout(() => textareaRef.current?.focus(), 50)
    },
    [],
  )

  const handleParseVibe = useCallback(async () => {
    if (!description.trim()) return
    setIsProcessing(true)
    setParseError(null)
    setParseSource(null)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)

    try {
      const res = await fetch('/api/ai/parse-vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, projectId }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error('Failed to parse vibe description')
      const data = (await res.json()) as ParseVibeResponse
      setParsedResult(data)
      setPresetName(data.presetName)
      setParseSource(data.source ?? 'claude')
    } catch (err) {
      const msg = err instanceof Error && err.name === 'AbortError'
        ? 'Request timed out. Please try again.'
        : 'Could not analyze style. Please try again.'
      setParseError(msg)
      console.error('[VibePresetsTab] parse error:', err)
    } finally {
      clearTimeout(timeout)
      setIsProcessing(false)
    }
  }, [description, projectId])

  const handleSavePreset = useCallback(async () => {
    if (!parsedResult || !presetName.trim()) return
    await savePresetToCloud({
      name: presetName.trim(),
      description: description.trim(),
      styleParams: parsedResult.styleParams,
      source: 'ai_parsed',
    })
    setParsedResult(null)
    setDescription('')
    setPresetName('')
  }, [parsedResult, presetName, description, savePresetToCloud])

  const handleDiscard = useCallback(() => {
    setParsedResult(null)
    setDescription('')
    setPresetName('')
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      void deletePresetFromCloud(id)
    },
    [deletePresetFromCloud],
  )

  const handleEdit = useCallback((preset: VibePreset) => {
    setDescription(preset.description)
    setParsedResult(null)
    setPresetName('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  const handleConfirmApply = useCallback(() => {
    if (!applyingPreset) return
    void applyPresetToCloud(applyingPreset.id)
    setApplyingPreset(null)
    console.info('[VibePresetsTab] Applying preset:', applyingPreset.id)
  }, [applyingPreset, applyPresetToCloud])

  return (
    <div className="flex gap-4 flex-1 min-h-0 py-3">
      {/* ── Left: Preset Gallery ── */}
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto pr-1">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold font-[Geist,sans-serif] text-sm">
              Your Style Presets
            </h3>
            <p className="text-white/40 text-xs font-[Geist,sans-serif] mt-0.5">
              {presets.length} preset{presets.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDescription('')
              setParsedResult(null)
              setTimeout(() => textareaRef.current?.focus(), 50)
            }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg
              bg-[#5749F4]/20 hover:bg-[#5749F4]/30 border border-[#5749F4]/30 hover:border-[#5749F4]/50
              text-[#818CF8] hover:text-white text-xs font-medium font-[Geist,sans-serif]
              transition-all duration-150"
          >
            <Plus className="w-3 h-3" />
            New Preset
          </button>
        </div>

        {/* Empty State */}
        {presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
            <div
              className="w-12 h-12 rounded-2xl bg-[#5749F4]/10 border border-[#5749F4]/20
              flex items-center justify-center"
            >
              <Palette className="w-5 h-5 text-[#818CF8]" />
            </div>
            <div>
              <p className="text-white/50 text-sm font-[Geist,sans-serif]">No presets yet</p>
              <p className="text-white/30 text-xs font-[Geist,sans-serif] mt-0.5">
                Create your first style preset to teach the AI your eye
              </p>
            </div>
          </div>
        ) : (
          /* Preset Cards Grid */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 auto-rows-max">
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={setApplyingPreset}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Create / Edit Panel ── */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <GlassCard className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
          {/* Panel Header */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#5749F4]/20 flex items-center justify-center">
              <Wand2 className="w-3.5 h-3.5 text-[#818CF8]" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold font-[Geist,sans-serif]">
                Teach the AI
              </h4>
              <p className="text-white/40 text-[11px] font-[Geist,sans-serif]">
                Describe your ideal style in plain English
              </p>
            </div>
          </div>

          {/* Error banner */}
          {parseError && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] text-amber-300/80"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              {parseError}
              <button
                onClick={() => void handleParseVibe()}
                className="ml-auto text-amber-300/60 underline transition-colors hover:text-amber-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* Powered by Claude attribution */}
          {parseSource === 'claude' && parsedResult && (
            <p className="text-[10px] text-indigo-400/50 text-center">
              Powered by Claude
            </p>
          )}

          {!parsedResult ? (
            <>
              {/* Example Prompts */}
              <div className="flex flex-col gap-1.5">
                <p className="text-white/30 text-[10px] uppercase tracking-wider font-[Geist_Mono,monospace]">
                  Example prompts
                </p>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleExamplePrompt(prompt)}
                    className="text-left px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                      border border-white/10 hover:border-white/20
                      text-white/50 hover:text-white/80 text-xs font-[Geist,sans-serif]
                      transition-all duration-150 flex items-start gap-2"
                  >
                    <ChevronRight className="w-3 h-3 flex-shrink-0 text-[#818CF8] mt-0.5" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-white/40 text-xs font-[Geist,sans-serif]">
                  Or write your own:
                </p>
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      void handleParseVibe()
                    }
                  }}
                  placeholder="Describe your ideal photo selection style..."
                  rows={4}
                  className="w-full flex-1 px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/15
                    focus:border-[#5749F4]/50 focus:ring-1 focus:ring-[#5749F4]/20
                    text-white text-sm font-[Geist,sans-serif] placeholder-white/25
                    outline-none resize-none transition-all"
                />
                <p className="text-white/20 text-[10px] font-[Geist,sans-serif]">
                  ⌘ + Enter to extract
                </p>
                <button
                  type="button"
                  onClick={() => void handleParseVibe()}
                  disabled={!description.trim() || isProcessing}
                  className="w-full h-9 rounded-xl flex items-center justify-center gap-2
                    bg-[#5749F4] hover:bg-[#4f46e5]
                    disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed
                    text-white text-sm font-medium font-[Geist,sans-serif]
                    transition-all duration-150"
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Analyzing style...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Extract Style Parameters
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <StyleParamsPreview
              params={parsedResult.styleParams}
              presetName={presetName}
              onNameChange={setPresetName}
              onSave={() => void handleSavePreset()}
              onDiscard={handleDiscard}
            />
          )}
        </GlassCard>
      </div>

      {/* ── Apply Confirmation Modal ── */}
      {applyingPreset !== null && (
        <ApplyPresetModal
          preset={applyingPreset}
          currentDistribution={categoryDistribution}
          onConfirm={handleConfirmApply}
          onCancel={() => setApplyingPreset(null)}
        />
      )}
    </div>
  )
}
