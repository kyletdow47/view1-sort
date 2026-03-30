'use client'

import React, { useState } from 'react'
import {
  FileText,
  Scissors,
  Sparkles,
  Send,
  Star,
  Camera,
  Eye,
  AlertCircle,
  CheckCircle2,
  Archive,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type ProjectStatusSlug =
  | 'draft'
  | 'culling'
  | 'ai_sorting'
  | 'preselection_sent'
  | 'client_selecting'
  | 'editing'
  | 'review_sent'
  | 'revision_requested'
  | 'final_delivered'
  | 'archived'

export interface StatusEvent {
  status: ProjectStatusSlug
  completedAt?: string // ISO date string, undefined = not reached yet
}

interface StageConfig {
  slug: ProjectStatusSlug
  label: string
  description: string
  icon: React.ElementType
  color: string
}

/* ─── Stage definitions ──────────────────────────────────────────────────── */

const STAGES: StageConfig[] = [
  { slug: 'draft',              label: 'Draft',             description: 'Project created, not yet sent to client.',       icon: FileText,  color: 'text-on-surface-variant/40' },
  { slug: 'culling',            label: 'Culling',           description: 'Removing blurry and duplicate frames.',          icon: Scissors,  color: 'text-amber-400' },
  { slug: 'ai_sorting',        label: 'AI Sorting',        description: 'Photos classified by neural sort.',              icon: Sparkles,  color: 'text-primary' },
  { slug: 'preselection_sent', label: 'Preselection Sent', description: 'Gallery shared with client for preview.',        icon: Send,      color: 'text-sky-400' },
  { slug: 'client_selecting',  label: 'Client Selecting',  description: 'Client is favoriting their chosen photos.',      icon: Star,      color: 'text-amber-400' },
  { slug: 'editing',            label: 'In Editing',        description: 'Photographer is editing selected photos.',       icon: Camera,    color: 'text-violet-400' },
  { slug: 'review_sent',       label: 'Review Sent',       description: 'Edited photos sent for client review.',          icon: Eye,       color: 'text-sky-400' },
  { slug: 'revision_requested','label': 'Revision Requested', description: 'Client requested changes.',                  icon: AlertCircle, color: 'text-orange-400' },
  { slug: 'final_delivered',   label: 'Final Delivered',   description: 'All finals delivered and available to download.', icon: CheckCircle2, color: 'text-emerald-400' },
  { slug: 'archived',           label: 'Archived',          description: 'Project archived.',                             icon: Archive,   color: 'text-on-surface-variant/30' },
]

/* ─── Status badge (compact, for use anywhere) ───────────────────────────── */

export function ProjectStatusBadge({
  status,
  onClick,
}: {
  status: ProjectStatusSlug
  onClick?: () => void
}) {
  const stage = STAGES.find((s) => s.slug === status) ?? STAGES[0]
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-surface-container border border-outline-variant/20 transition-colors hover:border-outline-variant/40',
        stage.color,
      ].join(' ')}
    >
      <stage.icon className="w-3 h-3" />
      {stage.label}
      {onClick && <ChevronDown className="w-2.5 h-2.5 opacity-50" />}
    </button>
  )
}

/* ─── Full timeline ──────────────────────────────────────────────────────── */

interface ProjectStatusTimelineProps {
  currentStatus: ProjectStatusSlug
  events?: StatusEvent[]
  onClose?: () => void
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

export function ProjectStatusTimeline({
  currentStatus,
  events = [],
  onClose,
}: ProjectStatusTimelineProps) {
  const currentIdx = STAGES.findIndex((s) => s.slug === currentStatus)
  const eventMap = new Map(events.map((e) => [e.status, e.completedAt]))

  // Skip 'revision_requested' in the main flow (it's a branch state)
  const mainFlow = STAGES.filter((s) => s.slug !== 'revision_requested' && s.slug !== 'archived')
  const isRevision = currentStatus === 'revision_requested'

  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
        <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Project status</p>
        {onClose && (
          <button onClick={onClose} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Revision alert */}
        {isRevision && (
          <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-5">
            <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-orange-300">A revision was requested. Once addressed, continue from Review Sent.</p>
          </div>
        )}

        {/* Stage list */}
        <div className="space-y-0">
          {mainFlow.map((stage, i) => {
            const stageIdx = STAGES.findIndex((s) => s.slug === stage.slug)
            const isCompleted = stageIdx < currentIdx
            const isCurrent = stage.slug === currentStatus
            const isFuture = stageIdx > currentIdx && !isCurrent
            const completedAt = eventMap.get(stage.slug)

            return (
              <div key={stage.slug} className="flex items-start gap-4">
                {/* Connector line + circle */}
                <div className="flex flex-col items-center">
                  <div className={[
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all',
                    isCompleted ? 'bg-primary border-primary' : isCurrent ? 'bg-primary/20 border-primary' : 'bg-surface-container border-outline-variant/30',
                  ].join(' ')}>
                    {isCompleted
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-on-primary" />
                      : <stage.icon className={['w-3.5 h-3.5', isCurrent ? stage.color : 'text-on-surface-variant/30'].join(' ')} />}
                  </div>
                  {i < mainFlow.length - 1 && (
                    <div className={['w-px flex-1 my-1', isCompleted ? 'bg-primary/30' : 'bg-outline-variant/20'].join(' ')} style={{ minHeight: '20px' }} />
                  )}
                </div>

                {/* Stage info */}
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={['text-sm font-headline font-bold', isCurrent ? 'text-on-surface' : isCompleted ? 'text-on-surface/70' : 'text-on-surface-variant/40'].join(' ')}>
                      {stage.label}
                    </p>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] font-mono font-bold rounded uppercase tracking-widest">
                        Current
                      </span>
                    )}
                  </div>
                  <p className={['text-[10px] font-mono mt-0.5', isFuture ? 'text-on-surface-variant/25' : 'text-on-surface-variant/50'].join(' ')}>
                    {stage.description}
                  </p>
                  {completedAt && (
                    <p className="text-[9px] font-mono text-on-surface-variant/30 mt-0.5">{formatDate(completedAt)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Inline status header with expand ──────────────────────────────────── */

export function ProjectStatusHeader({
  status,
  events,
}: {
  status: ProjectStatusSlug
  events?: StatusEvent[]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <ProjectStatusBadge status={status} onClick={() => setExpanded(!expanded)} />
      {expanded && (
        <div className="mt-3">
          <ProjectStatusTimeline
            currentStatus={status}
            events={events}
            onClose={() => setExpanded(false)}
          />
        </div>
      )}
    </div>
  )
}
