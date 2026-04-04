'use client'

import { useState } from 'react'
import {
  FolderKanban,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  MoreHorizontal,
  ChevronRight,
  User,
} from 'lucide-react'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Stage = 'Inquiry' | 'Booked' | 'Editing' | 'Delivery' | 'Complete'

interface Project {
  id: string
  name: string
  client: string
  avatar: string
  initials: string
  date: string
  stage: Stage
  photos: number
  dueIn: string | null
  priority: 'high' | 'medium' | 'low'
}

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const STAGES: Stage[] = ['Inquiry', 'Booked', 'Editing', 'Delivery', 'Complete']

const STAGE_COLORS: Record<Stage, string> = {
  Inquiry:  'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Booked:   'text-sky-400 bg-sky-400/10 border-sky-400/20',
  Editing:  'text-violet-400 bg-violet-400/10 border-violet-400/20',
  Delivery: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Complete: 'text-white/40 bg-white/5 border-white/10',
}

const PROJECTS: Project[] = [
  { id: 'p1', name: 'Smith Wedding', client: 'Sarah & Tom Smith', avatar: 'from-rose-400 to-pink-600', initials: 'SS', date: 'Jun 14, 2026', stage: 'Editing', photos: 1247, dueIn: '3 days', priority: 'high' },
  { id: 'p2', name: 'Meridian Hotel Brand', client: 'James Wilson', avatar: 'from-violet-400 to-purple-600', initials: 'JW', date: 'Apr 5, 2026', stage: 'Delivery', photos: 340, dueIn: null, priority: 'medium' },
  { id: 'p3', name: 'Chen Engagement', client: 'Emily & Ryan Chen', avatar: 'from-amber-400 to-orange-500', initials: 'EC', date: 'Apr 12, 2026', stage: 'Booked', photos: 0, dueIn: '8 days', priority: 'low' },
  { id: 'p4', name: 'Torres Portrait', client: 'Alex Torres', avatar: 'from-emerald-400 to-teal-600', initials: 'AT', date: 'Mar 28, 2026', stage: 'Complete', photos: 210, dueIn: null, priority: 'low' },
  { id: 'p5', name: 'Perez Family', client: 'Maria & Luis Perez', avatar: 'from-sky-400 to-blue-600', initials: 'MP', date: 'Apr 20, 2026', stage: 'Inquiry', photos: 0, dueIn: null, priority: 'medium' },
  { id: 'p6', name: 'Oak Street Product', client: 'Oak Street Goods', avatar: 'from-lime-400 to-green-600', initials: 'OS', date: 'May 1, 2026', stage: 'Booked', photos: 0, dueIn: '26 days', priority: 'low' },
  { id: 'p7', name: 'Johnson Wedding', client: 'Mike & Amy Johnson', avatar: 'from-fuchsia-400 to-pink-500', initials: 'MJ', date: 'Mar 22, 2026', stage: 'Delivery', photos: 892, dueIn: '1 day', priority: 'high' },
]

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-400',
  low: 'bg-white/20',
}

/* ─── Project Card ───────────────────────────────────────────────────────── */

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 transition-all hover:border-white/[0.16] hover:bg-white/[0.07]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${project.avatar} text-[9px] font-bold text-white`}>
            {project.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{project.name}</p>
            <p className="truncate text-[10px] text-white/40">{project.client}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[project.priority]}`} />
          <button className="opacity-0 transition-opacity group-hover:opacity-100 text-white/40 hover:text-white">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {project.date}
        </span>
        {project.dueIn && (
          <span className="flex items-center gap-1 text-amber-400">
            <Clock className="h-3 w-3" />
            Due in {project.dueIn}
          </span>
        )}
        {project.photos > 0 && (
          <span>{project.photos.toLocaleString()} photos</span>
        )}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ManagerPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  const byStage = (stage: Stage) => PROJECTS.filter((p) => p.stage === stage)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-bold text-white">Project Manager</h1>
          <p className="text-sm text-white/50">{PROJECTS.length} active projects across {STAGES.length} stages</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl bg-white/[0.07] p-1">
            {(['kanban', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  view === v ? 'bg-white/[0.13] text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-cta px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            New Project
          </button>
        </div>
      </div>

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="grid grid-cols-5 gap-3 overflow-x-auto">
          {STAGES.map((stage) => {
            const cards = byStage(stage)
            return (
              <div key={stage} className="min-w-[200px]">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STAGE_COLORS[stage]}`}>
                    {stage}
                  </span>
                  <span className="text-[11px] text-white/30">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                  <button className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-white/[0.08] py-2 text-[11px] text-white/30 hover:border-white/20 hover:text-white/50 transition-colors">
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <GlassCard noPad>
          <div className="divide-y divide-white/[0.06]">
            {PROJECTS.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${p.avatar} text-[10px] font-bold text-white`}>
                  {p.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{p.name}</p>
                  <p className="truncate text-xs text-white/40">{p.client}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STAGE_COLORS[p.stage]}`}>
                  {p.stage}
                </span>
                <span className="w-24 text-right text-xs text-white/40">{p.date}</span>
                {p.dueIn ? (
                  <span className="flex w-24 items-center justify-end gap-1 text-xs text-amber-400">
                    <Clock className="h-3 w-3" /> {p.dueIn}
                  </span>
                ) : (
                  <span className="w-24" />
                )}
                <ChevronRight className="h-4 w-4 shrink-0 text-white/20" />
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
