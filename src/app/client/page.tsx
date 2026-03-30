'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  Camera,
  Bell,
  MessageSquare,
  ChevronRight,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type ProjectStatus =
  | 'awaiting_selection'
  | 'in_editing'
  | 'ready_to_download'
  | 'preselection_sent'
  | 'delivered'
  | 'revision_requested'

interface ClientProject {
  id: string
  name: string
  photographerName: string
  shootDate: string
  photoCount: number
  selectedCount: number
  status: ProjectStatus
  coverHue: number
  hasPendingAction: boolean
  pendingActionText?: string
  lastActivity: string
}

/* ─── Mock data ──────────────────────────────────────────────────────────── */

const MOCK_PROJECTS: ClientProject[] = [
  {
    id: 'proj-1',
    name: 'Johnson Wedding',
    photographerName: 'Alex Rivera',
    shootDate: 'March 15, 2026',
    photoCount: 428,
    selectedCount: 0,
    status: 'awaiting_selection',
    coverHue: 25,
    hasPendingAction: true,
    pendingActionText: 'Your selection is needed',
    lastActivity: '2 hours ago',
  },
  {
    id: 'proj-2',
    name: 'Engagement Session',
    photographerName: 'Alex Rivera',
    shootDate: 'January 22, 2026',
    photoCount: 180,
    selectedCount: 45,
    status: 'in_editing',
    coverHue: 200,
    hasPendingAction: false,
    lastActivity: '3 days ago',
  },
  {
    id: 'proj-3',
    name: 'Family Portraits',
    photographerName: 'Alex Rivera',
    shootDate: 'November 8, 2025',
    photoCount: 94,
    selectedCount: 30,
    status: 'ready_to_download',
    coverHue: 120,
    hasPendingAction: true,
    pendingActionText: 'Finals are ready to download',
    lastActivity: '1 day ago',
  },
]

const ACTIVITY_FEED = [
  { id: 'a1', text: 'Alex Rivera uploaded edited finals for Family Portraits', time: '1 day ago', icon: CheckCircle2, color: 'text-emerald-400' },
  { id: 'a2', text: 'Your Johnson Wedding gallery is ready for selection', time: '2 hours ago', icon: Star, color: 'text-amber-400' },
  { id: 'a3', text: 'Alex Rivera replied to your comment on DSC_4821.ARW', time: '4 hours ago', icon: MessageSquare, color: 'text-primary' },
  { id: 'a4', text: 'Engagement Session is currently in editing', time: '3 days ago', icon: Camera, color: 'text-sky-400' },
]

/* ─── Status badge ───────────────────────────────────────────────────────── */

const STATUS_MAP: Record<ProjectStatus, { label: string; color: string; icon: React.ElementType }> = {
  awaiting_selection: { label: 'Select your favorites', color: 'bg-amber-400/10 text-amber-400', icon: Star },
  in_editing:         { label: 'In editing', color: 'bg-sky-400/10 text-sky-400', icon: Camera },
  ready_to_download:  { label: 'Ready to download', color: 'bg-emerald-400/10 text-emerald-400', icon: Download },
  preselection_sent:  { label: 'Preview ready', color: 'bg-violet-400/10 text-violet-400', icon: Eye },
  delivered:          { label: 'Delivered', color: 'bg-emerald-400/10 text-emerald-400', icon: CheckCircle2 },
  revision_requested: { label: 'Revision requested', color: 'bg-orange-400/10 text-orange-400', icon: AlertCircle },
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_MAP[status]
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

/* ─── Project card ───────────────────────────────────────────────────────── */

function ProjectCard({ project }: { project: ClientProject }) {
  return (
    <Link
      href={`/gallery/${project.id}`}
      className="block bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-outline-variant/30 transition-all group"
    >
      {/* Cover */}
      <div
        className="h-40 relative"
        style={{ background: `linear-gradient(135deg, hsl(${project.coverHue},40%,14%) 0%, hsl(${project.coverHue},55%,22%) 100%)` }}
      >
        {/* Pending action banner */}
        {project.hasPendingAction && (
          <div className="absolute top-3 left-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <p className="text-[10px] font-mono font-bold text-amber-400">{project.pendingActionText}</p>
          </div>
        )}

        {/* Photo count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
          <Camera className="w-3 h-3 text-white/60" />
          <span className="text-[10px] font-mono text-white/70">{project.photoCount} photos</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-on-surface-variant/50 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {project.shootDate} · {project.photographerName}
          </p>
        </div>

        <StatusBadge status={project.status} />

        {project.selectedCount > 0 && (
          <p className="text-[10px] font-mono text-on-surface-variant/50">
            {project.selectedCount} photos selected
          </p>
        )}
      </div>
    </Link>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ClientDashboard() {
  const pendingProjects = MOCK_PROJECTS.filter((p) => p.hasPendingAction)
  const otherProjects = MOCK_PROJECTS.filter((p) => !p.hasPendingAction)

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-outline-variant/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-headline font-bold text-on-surface">View1</span>
            <span className="text-on-surface-variant/30 mx-1">·</span>
            <span className="text-sm text-on-surface-variant/60">Client Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-surface-container transition-colors">
              <Bell className="w-5 h-5 text-on-surface-variant/60" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-primary">S</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tighter text-on-surface italic">
            Hi Sarah 👋
          </h1>
          <p className="text-on-surface-variant/60 mt-1">
            {pendingProjects.length > 0
              ? `You have ${pendingProjects.length} project${pendingProjects.length > 1 ? 's' : ''} that need your attention.`
              : 'All caught up! Your photographer will update you when something is ready.'}
          </p>
        </div>

        {/* Pending actions */}
        {pendingProjects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Action needed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* All projects */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
              All projects
            </h2>
            <div className="space-y-3">
              {otherProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>

          {/* Activity feed */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
              Recent activity
            </h2>
            <div className="space-y-1">
              {ACTIVITY_FEED.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
                  <div className="w-7 h-7 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-on-surface leading-snug">{item.text}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant/40 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
