'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronDown,
  FolderOpen,
  Grid3X3,
  List,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Sparkles,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Skeleton } from '@/components/common/Skeleton'
import { StatusBadge } from '@/components/features/projects/StatusBadge'
import type { Project } from '@/types/supabase'
import type { ProjectPipelineStatus } from '@/components/features/projects/StatusBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'date' | 'name' | 'status'
type ViewMode = 'grid' | 'list'

// ─── Constants ────────────────────────────────────────────────────────────────

const PIPELINE_STATUSES: Array<{ value: ProjectPipelineStatus | ''; label: string }> = [
  { value: '',             label: 'All statuses' },
  { value: 'inquiry',     label: 'Inquiry' },
  { value: 'quoted',      label: 'Quoted' },
  { value: 'booked',      label: 'Booked' },
  { value: 'contracted',  label: 'Contracted' },
  { value: 'prepped',     label: 'Prepped' },
  { value: 'shooting',    label: 'Shooting' },
  { value: 'processing',  label: 'Processing' },
  { value: 'review',      label: 'In Review' },
  { value: 'gallery_live',label: 'Gallery Live' },
  { value: 'delivered',   label: 'Delivered' },
]

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'date',   label: 'Date (newest)' },
  { value: 'name',   label: 'Name (A–Z)' },
  { value: 'status', label: 'Status' },
]

const GRADIENT_FALLBACKS = [
  'from-violet-500/30 to-blue-500/30',
  'from-pink-500/30 to-rose-500/30',
  'from-amber-500/30 to-orange-500/30',
  'from-teal-500/30 to-cyan-500/30',
  'from-indigo-500/30 to-purple-500/30',
]

function getGradient(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENT_FALLBACKS[sum % GRADIENT_FALLBACKS.length]
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-surface border border-outline-variant/20">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="line" className="w-2/3 h-4" />
        <Skeleton variant="line" className="w-1/2 h-3" />
        <Skeleton variant="line" className="w-1/3 h-3" />
      </div>
    </div>
  )
}

function ProjectRowSkeleton() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="line" className="h-3 w-full" />
        </td>
      ))}
    </tr>
  )
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

interface ProjectGridCardProps {
  project: Project
}

function ProjectGridCard({ project }: ProjectGridCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const shootDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:scale-[1.01]"
      style={{ border: '1px solid rgba(255,255,255,0.15)' }}
    >
      {/* Cover — full bleed photo */}
      <Link href={`/dashboard/project/${project.id}`}>
        <div
          className={clsx(
            'relative aspect-[4/3] overflow-hidden bg-gradient-to-br',
            !project.cover_image_url && getGradient(project.id),
          )}
        >
          {project.cover_image_url && (
            <img
              src={project.cover_image_url}
              alt={project.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Bottom overlay: title + badges */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="truncate text-[13px] font-semibold text-white">{project.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <StatusBadge status={project.status} />
              {project.preset && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/80">
                  {project.preset}
                </span>
              )}
            </div>
          </div>

          {/* Options menu */}
          <div className="absolute right-2 top-2" data-menu>
            <button
              type="button"
              aria-label="Project options"
              aria-expanded={menuOpen}
              className="rounded-lg bg-black/40 p-1.5 text-white/70 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-black/60 hover:text-white focus:opacity-100 focus:outline-none"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((prev) => !prev) }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl"
                  style={{ background: 'rgba(15,20,50,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <Link
                    href={`/dashboard/project/${project.id}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    View project
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Share2 className="h-4 w-4" />
                    Share gallery
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

// ─── List Row ─────────────────────────────────────────────────────────────────

interface ProjectListRowProps {
  project: Project
  index: number
}

function ProjectListRow({ project, index }: ProjectListRowProps) {
  const shootDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'
  const updatedDate = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <tr
      className={clsx(
        'group border-b border-outline-variant/20 last:border-0 transition-colors hover:bg-surface-container/50',
        index % 2 === 0 ? 'bg-transparent' : 'bg-surface-container/20',
      )}
    >
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/project/${project.id}`}
          className="font-sans font-medium text-sm text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px] block"
        >
          {project.name}
        </Link>
        {project.preset && (
          <span className="text-[10px] text-on-surface-variant">{project.preset}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={project.status} />
      </td>
      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{shootDate}</td>
      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{updatedDate}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/dashboard/project/${project.id}`}
            className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="View project"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Share gallery"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── New Project Modal ────────────────────────────────────────────────────────

type ModalTab = 'ai' | 'manual'

const PRESETS = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Real Estate', 'Custom'] as const
type Preset = (typeof PRESETS)[number]

interface NewProjectModalProps {
  open: boolean
  onClose: () => void
  onCreated: (project: Project) => void
  workspaceId: string | null
}

function NewProjectModal({ open, onClose, onCreated, workspaceId }: NewProjectModalProps) {
  const [tab, setTab] = useState<ModalTab>('ai')
  const [aiPrompt, setAiPrompt] = useState('')
  const [name, setName] = useState('')
  const [preset, setPreset] = useState<Preset | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setTab('ai')
    setAiPrompt('')
    setName('')
    setPreset('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!aiPrompt.trim()) {
      setError('Describe your project to continue')
      return
    }
    if (!workspaceId) {
      setError('Workspace not found. Please refresh and try again.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Extract project name from prompt — basic heuristic (Edge Function wiring TODO)
      // TODO: wire to Supabase Edge Function for full NLP extraction
      const extractedName = aiPrompt.trim().split('\n')[0].slice(0, 80)
      const supabase = createClient()
      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          workspace_id: workspaceId,
          name: extractedName,
          preset: null,
          status: 'inquiry' as string,
          cover_image_url: null,
          gallery_public: false,
          gallery_theme: 'dark',
          pricing_model: 'free',
          flat_fee_cents: null,
          per_photo_cents: null,
          currency: 'usd',
        })
        .select('*')
        .single()

      if (createError) throw createError
      onCreated(data as Project)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    if (!workspaceId) {
      setError('Workspace not found. Please refresh and try again.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: createError } = await supabase
        .from('projects')
        .insert({
          workspace_id: workspaceId,
          name: name.trim(),
          preset: preset || null,
          status: 'inquiry' as string,
          cover_image_url: null,
          gallery_public: false,
          gallery_theme: 'dark',
          pricing_model: 'free',
          flat_fee_cents: null,
          per_photo_cents: null,
          currency: 'usd',
        })
        .select('*')
        .single()

      if (createError) throw createError
      onCreated(data as Project)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Project">
      {/* Tabs */}
      <div className="flex rounded-lg bg-surface-container p-1 mb-5">
        <button
          type="button"
          onClick={() => setTab('ai')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
            tab === 'ai'
              ? 'bg-surface text-on-surface shadow-elev-1'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Setup
        </button>
        <button
          type="button"
          onClick={() => setTab('manual')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors',
            tab === 'manual'
              ? 'bg-surface text-on-surface shadow-elev-1'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Manual
        </button>
      </div>

      {tab === 'ai' ? (
        <form onSubmit={handleAiSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">
              Describe your project
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Smith wedding at Rosewood Estate on June 14th, 2026. Outdoor ceremony, 200 guests, golden hour portraits."
              rows={4}
              className="w-full rounded-lg bg-background border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 text-sm px-3 py-2 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 hover:border-outline-variant/60"
              autoFocus
            />
            <p className="text-[11px] text-on-surface-variant/60">
              View1 AI will extract the project name, date, client, and type automatically.
              {/* TODO: wire to Supabase Edge Function for full NLP extraction */}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading} disabled={!aiPrompt.trim()}>
              <Sparkles className="w-3.5 h-3.5" />
              Create with AI
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <Input
            label="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Smith Wedding 2026"
            autoFocus
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-on-surface">Type (optional)</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={clsx(
                    'rounded-lg border px-3 py-2 text-sm text-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40',
                    preset === p
                      ? 'border-primary bg-primary/10 text-on-surface'
                      : 'border-outline-variant/30 bg-surface text-on-surface-variant hover:border-outline-variant/60 hover:text-on-surface',
                  )}
                  onClick={() => setPreset((prev) => (prev === p ? '' : p))}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading} disabled={!name.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNewProject }: { onNewProject: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <FolderOpen className="h-10 w-10 text-primary/60" />
      </div>
      <h2 className="font-sans font-semibold text-lg text-on-surface mb-2">No projects yet</h2>
      <p className="text-sm text-on-surface-variant max-w-sm mb-8">
        Create your first project to start organising shoots, delivering galleries, and getting paid.
      </p>
      <Button onClick={onNewProject}>
        <Plus className="w-4 h-4" />
        Create your first project
      </Button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const supabase = createClient()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectPipelineStatus | ''>('')
  const [sortBy, setSortBy] = useState<SortKey>('date')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showModal, setShowModal] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  // ── Fetch workspace + projects ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: membership, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .single()

        if (memberError || !membership) {
          if (!cancelled) setLoading(false)
          return
        }

        const wsId = membership.workspace_id
        if (!cancelled) setWorkspaceId(wsId)

        const { data: rows, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('workspace_id', wsId)
          .order('updated_at', { ascending: false })

        if (projectsError) throw projectsError
        if (!cancelled) setProjects((rows as Project[]) ?? [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [supabase])

  // ── Filter + sort ──────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let list = [...projects]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }

    if (statusFilter) {
      list = list.filter((p) => (p.status as string) === statusFilter)
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    return list
  }, [projects, searchQuery, statusFilter, sortBy])

  const handleProjectCreated = useCallback((project: Project) => {
    setProjects((prev) => [project, ...prev])
  }, [])

  const activeStatusLabel =
    PIPELINE_STATUSES.find((s) => s.value === statusFilter)?.label ?? 'All statuses'
  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortBy)?.label ?? 'Sort'

  // Stat counts
  const activeCount = projects.filter(p => p.status === 'active').length
  const pendingReviewCount = projects.length - activeCount
  const deliveredCount = projects.filter(p => p.status === 'published').length

  return (
    <div className="space-y-6 px-10 py-8">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-white">Projects</h1>
          <p className="mt-1 text-[13px] text-white/50">Browse, search and manage all your projects</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white"
          style={{ background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)' }}
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3.5">
        {[
          { label: 'Active Projects', value: loading ? '—' : activeCount, color: '#60A5FA' },
          { label: 'Pending Review', value: loading ? '—' : pendingReviewCount, color: '#FBBF24' },
          { label: 'Delivered', value: loading ? '—' : deliveredCount, color: '#34D399' },
          { label: 'Total Value', value: '$12.4k', color: '#A78BFA' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <p className="text-[32px] font-bold text-white leading-none">{stat.value}</p>
            <p className="mt-2 text-[13px] text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects…"
            className="h-9 w-full rounded-xl border border-white/15 bg-white/[0.07] pl-9 pr-8 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick filter pills */}
        {[
          { label: 'All', value: '' },
          { label: 'Active', value: 'shooting' },
          { label: 'AI Sorting', value: 'processing' },
          { label: 'Delivered', value: 'delivered' },
        ].map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setStatusFilter(f.value as ProjectPipelineStatus | '')}
            className={`rounded-xl px-4 py-1.5 text-[12px] font-medium transition-colors ${statusFilter === f.value ? 'bg-white/[0.15] font-semibold text-white' : 'text-white/50 hover:text-white/80'}`}
          >
            {f.label}
          </button>
        ))}

        {/* Sort dropdown */}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => {
              setSortDropdownOpen((prev) => !prev)
              setStatusDropdownOpen(false)
            }}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.07] px-3 text-[12px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            Sort: {activeSortLabel}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {sortDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)} />
              <div
                className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl"
                style={{ background: 'rgba(15,20,50,0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => { setSortBy(s.value); setSortDropdownOpen(false) }}
                    className={`w-full px-3 py-2.5 text-left text-[13px] transition-colors ${sortBy === s.value ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center overflow-hidden rounded-xl border border-white/15">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`flex items-center justify-center p-2 transition-colors ${viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`flex items-center justify-center p-2 transition-colors ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Error state ────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────── */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container/50">
                  {['Project', 'Status', 'Created', 'Updated', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, i) => <ProjectRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        )
      ) : filteredProjects.length === 0 && !searchQuery && !statusFilter ? (
        <EmptyState onNewProject={() => setShowModal(true)} />
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-white/50 mb-3">No projects match your filters.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setStatusFilter('') }}
            className="rounded-xl border border-white/20 bg-white/[0.08] px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/15 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectGridCard key={project.id} project={project} />
          ))}

          {/* Create new tile */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="group flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 text-white/40 transition-all hover:border-white/40 hover:text-white/60"
          >
            <Plus className="mb-2 h-8 w-8" />
            <span className="text-sm font-medium">New project</span>
          </button>
        </div>
      ) : (
        /* List view */
        <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, i) => (
                <ProjectListRow key={project.id} project={project} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── New Project Modal ───────────────────────────────────────── */}
      <NewProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleProjectCreated}
        workspaceId={workspaceId}
      />

      {/* ── Floating FAB (mobile) ───────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-elev-3 hover:shadow-elev-2 hover:-translate-y-0.5 transition-all md:hidden"
        aria-label="New project"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
