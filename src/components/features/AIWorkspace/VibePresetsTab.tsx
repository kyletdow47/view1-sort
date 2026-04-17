'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  Edit3,
  MessageSquare,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react'

import type { VibePreset, VibeStyleParams } from '@/types/vibe-presets'
import { useVibePresets } from '@/hooks/useVibePresets'

import { VibeChat } from './VibeChat'
import type { VibeChatBuiltInOption, VibeChatFinalizeEvent } from './VibeChat'

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
   CoachLauncher — replaces the single-shot form
   ───────────────────────────────────────────── */

function CoachLauncher({ onStart }: { onStart: () => void }) {
  return (
    <GlassCard className="flex flex-1 flex-col gap-5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5749F4]/20">
          <Wand2 className="h-4 w-4 text-[#818CF8]" />
        </div>
        <div>
          <h4 className="font-[Geist,sans-serif] text-sm font-semibold text-white">
            Teach the AI your eye
          </h4>
          <p className="mt-0.5 font-[Geist,sans-serif] text-[11px] text-white/50">
            The style coach asks a few targeted questions and saves the result as a preset.
          </p>
        </div>
      </div>

      {/* Bullets — what the user should expect */}
      <ul className="flex flex-col gap-2">
        {[
          'Two or three questions, one at a time.',
          'Built with Claude — mirrors your own words.',
          'Skip to an existing preset at any point.',
        ].map((line) => (
          <li
            key={line}
            className="flex items-start gap-2 font-[Geist,sans-serif] text-[12px] text-white/60"
          >
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#818CF8]" />
            {line}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onStart}
        className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl
          bg-[#5749F4] font-[Geist,sans-serif] text-sm font-semibold text-white
          transition-colors hover:bg-[#4f46e5]"
      >
        <MessageSquare className="h-4 w-4" />
        Start coach chat
      </button>

      <p className="text-center font-[Geist,sans-serif] text-[10px] text-white/30">
        Takes about 30 seconds · 5 question cap
      </p>
    </GlassCard>
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

  const [chatOpen, setChatOpen] = useState(false)
  const [applyingPreset, setApplyingPreset] = useState<VibePreset | null>(null)

  // Offer existing saved presets as "skip to" options inside the coach.
  const skipOptions = useMemo<VibeChatBuiltInOption[]>(
    () => presets.map((p) => ({ id: p.id, name: p.name, icon: '🎨' })),
    [presets],
  )

  const handleDelete = useCallback(
    (id: string) => {
      void deletePresetFromCloud(id)
    },
    [deletePresetFromCloud],
  )

  const handleEdit = useCallback(
    (_preset: VibePreset) => {
      // Editing an existing preset means re-teaching: open a fresh coach session.
      setChatOpen(true)
    },
    [],
  )

  const handleConfirmApply = useCallback(() => {
    if (!applyingPreset) return
    void applyPresetToCloud(applyingPreset.id)
    setApplyingPreset(null)
  }, [applyingPreset, applyPresetToCloud])

  const handleChatFinalize = useCallback(
    async (event: VibeChatFinalizeEvent) => {
      if (event.type === 'builtIn') {
        await applyPresetToCloud(event.presetId)
        setChatOpen(false)
        return
      }
      const saved = await savePresetToCloud({
        name: event.preset.name,
        description: event.preset.description,
        styleParams: event.preset.styleParams,
        source: 'ai_parsed',
      })
      if (saved) {
        await applyPresetToCloud(saved.id)
      }
      setChatOpen(false)
    },
    [applyPresetToCloud, savePresetToCloud],
  )

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
            onClick={() => setChatOpen(true)}
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
                Chat with the coach to create your first one
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="mt-1 flex items-center gap-1.5 rounded-lg bg-[#5749F4]/20 border border-[#5749F4]/30
                px-3 py-2 text-xs font-medium text-[#818CF8] transition-colors
                hover:bg-[#5749F4]/30 hover:text-white"
            >
              <MessageSquare className="h-3 w-3" />
              Start coach chat
            </button>
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

      {/* ── Right: Coach launcher ── */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <CoachLauncher onStart={() => setChatOpen(true)} />
      </div>

      {/* ── Coach Chat Overlay ── */}
      <VibeChat
        open={chatOpen}
        projectId={projectId}
        builtInPresets={skipOptions}
        onClose={() => setChatOpen(false)}
        onFinalize={(event) => void handleChatFinalize(event)}
      />

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
