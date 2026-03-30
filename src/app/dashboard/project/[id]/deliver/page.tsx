'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Eye,
  Star,
  Download,
  Edit3,
  Send,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  ChevronRight,
  ImageIcon,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Share2,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type DeliveryStage = 1 | 2 | 3

interface StageConfig {
  id: DeliveryStage
  name: string
  subtitle: string
  icon: React.ElementType
  clientCan: string[]
  photographerSees: string
  nextAction: string
  nextLabel: string
  color: string
}

/* ─── Mock data ──────────────────────────────────────────────────────────── */

const MOCK_PHOTOS = Array.from({ length: 48 }, (_, i) => ({
  id: `p${i}`,
  name: `DSC_${String(1000 + i * 47).padStart(4, '0')}.ARW`,
  hue: [25, 180, 340, 50, 210, 290][i % 6],
  starred: i % 7 === 0,
  clientFavorited: i % 5 === 0,
  hasComments: i % 4 === 0,
  edited: i % 3 === 0,
}))

const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'Preselection',
    subtitle: 'Send sorted gallery for client review',
    icon: Eye,
    clientCan: ['Preview all photos', 'Leave comments', 'No downloads'],
    photographerSees: 'Client opens gallery and leaves feedback',
    nextAction: 'Open for client selection',
    nextLabel: 'Move to Stage 2',
    color: 'amber',
  },
  {
    id: 2,
    name: 'Client Selection',
    subtitle: 'Client favorites the photos they want',
    icon: Star,
    clientCan: ['Favorite/unfavorite photos', 'Leave comments', 'No downloads'],
    photographerSees: 'Real-time selection count and which photos are favorited',
    nextAction: 'Mark as "In Editing" and lock selection',
    nextLabel: 'Move to Stage 3',
    color: 'sky',
  },
  {
    id: 3,
    name: 'Finals Ready',
    subtitle: 'Edited files delivered — downloads open',
    icon: Download,
    clientCan: ['Download selected photos', 'Request revisions', 'Leave comments'],
    photographerSees: 'Download activity and revision requests',
    nextAction: 'Project complete',
    nextLabel: 'Mark Complete',
    color: 'emerald',
  },
]

const colorMap: Record<string, { badge: string; ring: string; btn: string; icon: string }> = {
  amber: {
    badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    ring: 'ring-amber-400/30',
    btn: 'bg-amber-500 text-black',
    icon: 'text-amber-400',
  },
  sky: {
    badge: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    ring: 'ring-sky-400/30',
    btn: 'bg-sky-500 text-white',
    icon: 'text-sky-400',
  },
  emerald: {
    badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    ring: 'ring-emerald-400/30',
    btn: 'bg-emerald-500 text-white',
    icon: 'text-emerald-400',
  },
}

/* ─── Photo thumb ────────────────────────────────────────────────────────── */

function PhotoThumb({
  photo,
  stage,
}: {
  photo: (typeof MOCK_PHOTOS)[0]
  stage: DeliveryStage
}) {
  return (
    <div className="relative rounded-xl overflow-hidden aspect-square group cursor-pointer">
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, hsl(${photo.hue},40%,18%) 0%, hsl(${photo.hue},55%,28%) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Stage-specific overlays */}
      {stage === 2 && photo.clientFavorited && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
          <Star className="w-3 h-3 text-black fill-black" />
        </div>
      )}
      {stage === 3 && photo.edited && (
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
      {photo.hasComments && (
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-primary/80 flex items-center justify-center">
          <MessageSquare className="w-2.5 h-2.5 text-on-primary" />
        </div>
      )}
    </div>
  )
}

/* ─── Stage card ─────────────────────────────────────────────────────────── */

function StageCard({
  stage,
  active,
  completed,
  onAdvance,
}: {
  stage: StageConfig
  active: boolean
  completed: boolean
  onAdvance: () => void
}) {
  const c = colorMap[stage.color]

  return (
    <div
      className={[
        'rounded-2xl border-2 p-5 transition-all',
        active ? `border-outline-variant/30 ring-2 ${c.ring}` : completed ? 'border-outline-variant/10 opacity-70' : 'border-outline-variant/10 opacity-40',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div className={['w-10 h-10 rounded-xl flex items-center justify-center', completed ? 'bg-emerald-500/20' : active ? `bg-${stage.color}-400/10` : 'bg-surface-container'].join(' ')}>
          {completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <stage.icon className={`w-5 h-5 ${active ? c.icon : 'text-on-surface-variant/30'}`} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-on-surface">Stage {stage.id} — {stage.name}</h3>
            {active && (
              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-widest ${c.badge}`}>
                Active
              </span>
            )}
            {completed && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-widest">
                Done
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-0.5">{stage.subtitle}</p>

          {active && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/40 mb-1">Client can</p>
                <ul className="space-y-0.5">
                  {stage.clientCan.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-on-surface-variant/70">
                      <div className="w-1 h-1 rounded-full bg-on-surface-variant/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/40 mb-1">You see</p>
                <p className="text-xs text-on-surface-variant/70">{stage.photographerSees}</p>
              </div>
              {stage.id < 3 && (
                <button
                  onClick={onAdvance}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-headline font-bold mt-2 ${c.btn} hover:opacity-90 transition-opacity`}
                >
                  {stage.nextLabel}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {stage.id === 3 && (
                <button
                  onClick={onAdvance}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-headline font-bold mt-2 bg-emerald-500 text-white hover:opacity-90 transition-opacity"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function DeliverPage() {
  const params = useParams<{ id: string }>()
  const [currentStage, setCurrentStage] = useState<DeliveryStage>(1)
  const [completed, setCompleted] = useState(false)

  const advance = () => {
    if (currentStage < 3) setCurrentStage((s) => (s + 1) as DeliveryStage)
    else setCompleted(true)
  }

  const selectedCount = MOCK_PHOTOS.filter((p) => p.clientFavorited).length
  const commentCount = MOCK_PHOTOS.filter((p) => p.hasComments).length
  const editedCount = MOCK_PHOTOS.filter((p) => p.edited).length

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <Send className="w-8 h-8 text-primary" />
            Delivery Flow
          </h1>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            Manage the 3-stage delivery process for this project.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/project/${params.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Back to project
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors">
            <Share2 className="w-4 h-4" />
            Copy client link
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: completed ? '100%' : `${((currentStage - 1) / 2) * 100}%` }}
          />
        </div>
        <div className="absolute -top-1 flex justify-between w-full">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={[
                'w-4 h-4 rounded-full border-2 transition-all',
                s <= currentStage || completed
                  ? 'bg-primary border-primary'
                  : 'bg-background border-outline-variant/30',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stage cards */}
        <div className="lg:col-span-2 space-y-4">
          {completed ? (
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-headline font-bold text-on-surface">Project Complete</h2>
              <p className="text-on-surface-variant/60 text-sm">
                All photos have been delivered and the client has their downloads.
              </p>
            </div>
          ) : (
            STAGES.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                active={stage.id === currentStage}
                completed={stage.id < currentStage}
                onAdvance={advance}
              />
            ))
          )}
        </div>

        {/* Right: Stats sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-surface-container rounded-2xl p-5 space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">Project stats</p>
            {[
              { label: 'Total photos', value: MOCK_PHOTOS.length, icon: ImageIcon, color: 'text-on-surface' },
              { label: 'Client selected', value: selectedCount, icon: Star, color: 'text-amber-400' },
              { label: 'Comments', value: commentCount, icon: MessageSquare, color: 'text-primary' },
              { label: 'Edited & ready', value: editedCount, icon: CheckCircle2, color: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs font-mono text-on-surface-variant/60 flex-1">{s.label}</span>
                <span className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Stage 2: client selection preview */}
          {currentStage === 2 && (
            <div className="bg-surface-container rounded-2xl p-5 space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
                Client&apos;s favorites ({selectedCount})
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {MOCK_PHOTOS.filter((p) => p.clientFavorited).slice(0, 8).map((p) => (
                  <PhotoThumb key={p.id} photo={p} stage={2} />
                ))}
              </div>
            </div>
          )}

          {/* Stage 1 & 2: Recent comments */}
          {currentStage <= 2 && commentCount > 0 && (
            <div className="bg-surface-container rounded-2xl p-5 space-y-3">
              <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
                Recent comments
              </p>
              {['Great shot of the first dance!', 'Can you brighten this one?', 'Love this — keep it!'].map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[9px] font-mono font-bold text-primary">C</span>
                  </div>
                  <p className="text-xs text-on-surface-variant/70">{c}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo grid for current stage */}
      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
          Gallery preview — Stage {currentStage} view
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {MOCK_PHOTOS.slice(0, 48).map((p) => (
            <PhotoThumb key={p.id} photo={p} stage={currentStage} />
          ))}
        </div>
      </div>
    </div>
  )
}
