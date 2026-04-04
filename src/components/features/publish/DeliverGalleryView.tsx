'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Star,
  Download,
  CheckCircle2,
  ChevronRight,
  ImageIcon,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import type { Project } from '@/types/supabase'
import type { DeliveryStage, DeliveryStageConfig, DeliveryStats } from '@/types/publish'

/* ── Stage config matching Pencil frame ykpo7 ─────────────────────────── */

const STAGES: DeliveryStageConfig[] = [
  {
    id: 1,
    label: 'Stage 1 · Preselection',
    activeLabel: 'Active',
    description:
      'AI-curated selects sent for client preview. Client can view but not download.',
    ctaLabel: 'Open for Client Selection',
    nextStage: 2,
    borderActiveClass: 'border-emerald-400/[0.25]',
    badgeClasses:
      'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    ctaBgClass: 'bg-gradient-to-r from-[#5749F4] to-[#7C3AED]',
    statColorClass: 'text-emerald-400',
  },
  {
    id: 2,
    label: 'Stage 2 · Client Selection',
    activeLabel: 'In Progress',
    description:
      'Client picks favourites and requests edits. You review selections before finals.',
    ctaLabel: 'Advance to Finals',
    nextStage: 3,
    borderActiveClass: 'border-amber-400/[0.25]',
    badgeClasses: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    ctaBgClass: 'bg-gradient-to-r from-[#5749F4] to-[#7C3AED]',
    statColorClass: 'text-amber-400',
  },
  {
    id: 3,
    label: 'Stage 3 · Finals Ready',
    activeLabel: 'Complete',
    description:
      'Full-res download unlocked. Invoice auto-sent on completion.',
    ctaLabel: 'Mark Project Complete',
    nextStage: null,
    borderActiveClass: 'border-white/[0.15]',
    badgeClasses: 'bg-white/[0.08] text-white/60 border border-white/10',
    ctaBgClass: 'bg-emerald-500',
    statColorClass: 'text-white/60',
  },
]

/* ── Mock stats (TODO: replace with Supabase query) ──────────────────── */

function getMockStats(photoCount: number, stage: DeliveryStage): DeliveryStats {
  const clientFavorites = Math.round(photoCount * 0.4)
  const openComments = Math.round(photoCount * 0.12)
  const editedPhotos = stage >= 3 ? Math.round(photoCount * 0.85) : 0
  return { totalPhotos: photoCount, clientFavorites, openComments, editedPhotos }
}

/* ── Stage card ──────────────────────────────────────────────────────── */

interface StageCardProps {
  config: DeliveryStageConfig
  isActive: boolean
  isComplete: boolean
  isLocked: boolean
  stats: DeliveryStats
  advancing: boolean
  onAdvance: (nextStage: DeliveryStage | null) => void
}

function StageCard({
  config,
  isActive,
  isComplete,
  isLocked,
  stats,
  advancing,
  onAdvance,
}: StageCardProps) {
  const activeBorder = isActive
    ? config.borderActiveClass
    : 'border-white/[0.06]'

  const Icon = isComplete
    ? CheckCircle2
    : config.id === 1
      ? Send
      : config.id === 2
        ? Star
        : Download

  const statText = (): string => {
    if (config.id === 1)
      return `${stats.totalPhotos} photos shared`
    if (config.id === 2)
      return `${stats.clientFavorites} favourites selected`
    return `${stats.editedPhotos} edited files ready`
  }

  return (
    <div
      className={[
        'rounded-2xl border p-5 transition-all duration-200',
        'bg-gradient-to-b from-white/[0.07] to-white/[0.04]',
        activeBorder,
        isLocked ? 'opacity-40' : '',
      ].join(' ')}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex h-8 w-8 items-center justify-center rounded-xl',
              isComplete
                ? 'bg-emerald-400/10'
                : isActive
                  ? 'bg-white/[0.08]'
                  : 'bg-white/[0.04]',
            ].join(' ')}
          >
            <Icon
              size={16}
              className={
                isComplete
                  ? 'text-emerald-400'
                  : isActive
                    ? 'text-white/80'
                    : 'text-white/30'
              }
            />
          </div>
          <span
            className={[
              'text-[14px] font-semibold',
              isLocked ? 'text-white/30' : 'text-white/80',
            ].join(' ')}
          >
            {config.label}
          </span>
        </div>

        {/* Status badge */}
        {(isActive || isComplete) && (
          <span
            className={[
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
              isComplete
                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                : config.badgeClasses,
            ].join(' ')}
          >
            {isComplete ? 'Done' : config.activeLabel}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[12px] text-white/50 leading-relaxed mb-3">
        {config.description}
      </p>

      {/* Stat line */}
      {!isLocked && (
        <p className={`text-[12px] font-medium mb-4 ${config.statColorClass}`}>
          {statText()}
        </p>
      )}

      {/* CTA — only show on active stage */}
      {isActive && (
        <button
          onClick={() => onAdvance(config.nextStage)}
          disabled={advancing}
          className={[
            'flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold',
            'text-white transition-opacity hover:opacity-90 disabled:opacity-50',
            config.ctaBgClass,
          ].join(' ')}
        >
          {advancing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : config.nextStage === null ? (
            <CheckCircle2 size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
          {config.ctaLabel}
        </button>
      )}
    </div>
  )
}

/* ── Stats sidebar ────────────────────────────────────────────────────── */

function StatsSidebar({
  stats,
  stage,
}: {
  stats: DeliveryStats
  stage: DeliveryStage
}) {
  const rows = [
    {
      icon: ImageIcon,
      label: 'Total photos',
      value: stats.totalPhotos,
      color: 'text-white/70',
    },
    {
      icon: Star,
      label: 'Client favourites',
      value: stats.clientFavorites,
      color: 'text-amber-400',
    },
    {
      icon: MessageSquare,
      label: 'Open comments',
      value: stats.openComments,
      color: 'text-[#5749F4]',
    },
    {
      icon: CheckCircle2,
      label: 'Edited & ready',
      value: stats.editedPhotos,
      color: 'text-emerald-400',
    },
  ]

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Project stats
      </p>
      {rows.map((row) => {
        const Icon = row.icon
        const isRelevant =
          row.label !== 'Edited & ready' || stage === 3
        return (
          <div key={row.label} className="flex items-center gap-3">
            <Icon
              size={14}
              className={isRelevant ? row.color : 'text-white/20'}
            />
            <span className="flex-1 text-[12px] text-white/40">
              {row.label}
            </span>
            <span
              className={`text-[13px] font-semibold tabular-nums ${isRelevant ? row.color : 'text-white/20'}`}
            >
              {row.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Progress stepper ─────────────────────────────────────────────────── */

function ProgressStepper({
  currentStage,
  completed,
}: {
  currentStage: DeliveryStage
  completed: boolean
}) {
  return (
    <div className="flex items-center gap-0">
      {([1, 2, 3] as DeliveryStage[]).map((s, idx) => {
        const isDone = completed || s < currentStage
        const isActive = !completed && s === currentStage

        return (
          <div key={s} className="flex items-center">
            {/* Step dot */}
            <div
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all',
                isDone
                  ? 'bg-emerald-400/20 text-emerald-400'
                  : isActive
                    ? 'bg-[#5749F4]/20 text-[#5749F4] ring-1 ring-[#5749F4]/40'
                    : 'bg-white/[0.06] text-white/25',
              ].join(' ')}
            >
              {isDone ? <CheckCircle2 size={14} /> : s}
            </div>

            {/* Connector line (between steps) */}
            {idx < 2 && (
              <div
                className={[
                  'h-[1px] w-16 transition-all',
                  isDone ? 'bg-emerald-400/30' : 'bg-white/[0.08]',
                ].join(' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Main view ────────────────────────────────────────────────────────── */

interface DeliverGalleryViewProps {
  project: Project
  photoCount: number
}

export function DeliverGalleryView({
  project,
  photoCount,
}: DeliverGalleryViewProps) {
  const [currentStage, setCurrentStage] = useState<DeliveryStage>(1)
  const [advancing, setAdvancing] = useState(false)
  const [projectComplete, setProjectComplete] = useState(false)

  const stats = getMockStats(photoCount, currentStage)

  const handleAdvance = useCallback(
    async (nextStage: DeliveryStage | null) => {
      setAdvancing(true)
      try {
        // TODO: Update delivery_stage in Supabase
        // const { error } = await supabase
        //   .from('projects')
        //   .update({ delivery_stage: nextStage ?? currentStage })
        //   .eq('id', project.id)
        // if (error) throw error

        // Simulate async action
        await new Promise<void>((resolve) => setTimeout(resolve, 600))

        if (nextStage === null) {
          setProjectComplete(true)
        } else {
          setCurrentStage(nextStage)
        }
      } finally {
        setAdvancing(false)
      }
    },
    [],
  )

  return (
    <div className="min-h-full px-10 py-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="inline-flex items-center gap-2 text-[13px] text-white/50 hover:text-white/80 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        {project.name}
      </Link>

      {/* Header + stepper */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-1.5">
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Deliver Gallery
          </h1>
          <p className="text-[13px] text-white/50">
            3-stage delivery flow — control what clients see at each stage
          </p>
        </div>
        <ProgressStepper
          currentStage={currentStage}
          completed={projectComplete}
        />
      </div>

      {/* Completion banner */}
      {projectComplete && (
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] px-6 py-5 mb-6 flex items-center gap-4">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">
              Project complete!
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              All photos delivered. Invoice auto-sent to client.
            </p>
          </div>
        </div>
      )}

      {/* Main layout: stage cards + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
        {/* Stage cards */}
        <div className="space-y-4">
          {STAGES.map((config) => (
            <StageCard
              key={config.id}
              config={config}
              isActive={!projectComplete && config.id === currentStage}
              isComplete={projectComplete || config.id < currentStage}
              isLocked={!projectComplete && config.id > currentStage}
              stats={stats}
              advancing={advancing}
              onAdvance={handleAdvance}
            />
          ))}
        </div>

        {/* Stats sidebar */}
        <StatsSidebar stats={stats} stage={currentStage} />
      </div>
    </div>
  )
}
