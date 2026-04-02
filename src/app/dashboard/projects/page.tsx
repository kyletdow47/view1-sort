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
import { V2Shell } from '@/components/features/dashboard-v2/V2Shell'
import { GlassCard } from '@/components/features/dashboard-v2/GlassCard'
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
    <div className="group relative rounded-xl overflow-hidden bg-surface border border-outline-variant/20 hover:border-outline-variant/50 transition-all duration-150">
      {/* Cover */}
      <Link href={`/dashboard/project/${project.id}`}>
        <div
          className={clsx(
            'h-44 relative overflow-hidden bg-gradient-to-br',
            !project.cover_image_url && getGradient(project.id),
          )}
        >
          {project.cover_image_url && (
            <img
              src={project.cover_image_url}
              alt={project.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={project.status} />
          </div>
        </div>
      </Link>

      {/* Options menu */}
      <div className="absolute top-3 right-3" data-menu>
        <button
          type="button"
          aria-label="Project options"
          aria-expanded={menuOpen}
          className="p-1.5 rounded-lg bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((prev) => !prev)
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-8 z-20 w-44 bg-surface border border-outline-variant/40 rounded-xl shadow-elev-3 overflow-hidden">
              <Link
                href={`/dashboard/project/${project.id}`}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-on-surface/70 hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                View project
              </Link>
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-on-surface/70 hover:text-on-surface hover:bg-surface-container transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Share2 className="w-4 h-4" />
                Share gallery
              </button>
            </div>
          </>
        )}
      </div>

      {/* Card body */}
      <Link href={`/dashboard/project/${project.id}`} className="block p-4 space-y-2">
        <h3 className="font-sans font-semibold text-on-surface text-sm leading-snug truncate group-hover:text-primary transition-colors">
          {project.name}
        </h3>

        {project.preset && (
          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
            {project.preset}
          </span>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <span className="font-mono text-[11px] text-on-surface-variant">
            {shootDate}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
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

  return (
    <V2Shell activeNav="Projects">
    <div className="mx-auto max-w-[1280px] space-y-6">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline font-bold text-4xl text-white tracking-tight">Projects</h1>
          <p className="text-sm text-white/60 mt-0.5">
            {loading
              ? 'Loading…'
              : 'Browse, search, and manage all your projects'}
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length || 24 },
          { label: 'Pending Review', value: projects.filter(p => p.status === 'published').length || 7 },
          { label: 'Complete', value: projects.filter(p => p.status === 'archived').length || 18 },
          { label: 'Total Billed', value: '$12.4k' },
        ].map((stat) => (
          <GlassCard key={stat.label}>
            <p className="font-mono text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-white/50">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-lg bg-surface border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/40 text-sm pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40 hover:border-outline-variant/50 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setStatusDropdownOpen((prev) => !prev)
              setSortDropdownOpen(false)
            }}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50 transition-colors"
          >
            {activeStatusLabel}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {statusDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 w-48 rounded-xl border border-outline-variant/40 bg-surface shadow-elev-3 overflow-hidden">
                {PIPELINE_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(s.value)
                      setStatusDropdownOpen(false)
                    }}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors',
                      statusFilter === s.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
                    )}
                  >
                    {s.value ? <StatusBadge status={s.value} /> : s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setSortDropdownOpen((prev) => !prev)
              setStatusDropdownOpen(false)
            }}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50 transition-colors"
          >
            {activeSortLabel}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {sortDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-xl border border-outline-variant/40 bg-surface shadow-elev-3 overflow-hidden">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      setSortBy(s.value)
                      setSortDropdownOpen(false)
                    }}
                    className={clsx(
                      'w-full flex items-center px-3 py-2.5 text-sm text-left transition-colors',
                      sortBy === s.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* View toggle */}
        <div className="ml-auto flex items-center rounded-lg border border-outline-variant/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={clsx(
              'flex items-center justify-center p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={clsx(
              'flex items-center justify-center p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Error state ────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
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
          <p className="text-on-surface-variant text-sm mb-3">No projects match your filters.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProjects.map((project) => (
            <ProjectGridCard key={project.id} project={project} />
          ))}

          {/* Create new tile */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 py-16 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
          >
            <Plus className="w-8 h-8 mb-2" />
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
    </V2Shell>
  )
}
