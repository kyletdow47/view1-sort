'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Camera,
  Calendar,
  FolderOpen,
  Plus,
  Eye,
  FileText,
  Layers,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  Hash,
  Image as ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { InvoiceCreator } from '@/components/features/finances/InvoiceCreator'
import type { InvoiceFormData } from '@/types/invoice'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type ClientProjectStatus = 'completed' | 'in_progress' | 'delivered'

export interface ClientProject {
  id: string
  name: string
  status: ClientProjectStatus
  date: string       // ISO YYYY-MM-DD (shoot date)
  photos: number
  amount: number     // in dollars (display value)
  type: string       // e.g. 'Wedding', 'Portrait', 'Family'
  thumbnailUrl?: string | null
}

export interface ClientDetailProjectsTabProps {
  clientId?: string
  clientName?: string
  clientEmail?: string
  /** Total revenue from this client (all time) — shown in summary bar */
  totalRevenue?: number
  /** Mock projects — replace with Supabase query when tables exist */
  projects?: ClientProject[]
}

/* ─── Mock data (TODO: replace with Supabase query on projects table) ───── */

const MOCK_PROJECTS: ClientProject[] = [
  { id: 'p-001', name: 'Engagement Shoot — Central Park',          status: 'completed',  date: '2025-04-12', photos: 342,  amount: 650,  type: 'Engagement',   thumbnailUrl: null },
  { id: 'p-002', name: 'Wedding Day — The Plaza Hotel',            status: 'completed',  date: '2025-06-28', photos: 1847, amount: 2400, type: 'Wedding',       thumbnailUrl: null },
  { id: 'p-003', name: 'Family Portraits — Riverside',             status: 'completed',  date: '2025-09-05', photos: 186,  amount: 450,  type: 'Portrait',      thumbnailUrl: null },
  { id: 'p-004', name: 'Holiday Mini Session',                     status: 'completed',  date: '2025-12-14', photos: 94,   amount: 250,  type: 'Mini Session',  thumbnailUrl: null },
  { id: 'p-005', name: 'Anniversary Portraits — Brooklyn Bridge',  status: 'delivered',  date: '2026-02-08', photos: 278,  amount: 550,  type: 'Portrait',      thumbnailUrl: null },
  { id: 'p-006', name: 'Spring Family Session',                    status: 'in_progress',date: '2026-03-22', photos: 412,  amount: 500,  type: 'Family',        thumbnailUrl: null },
  { id: 'p-007', name: 'Newborn Session — Home Studio',            status: 'completed',  date: '2025-08-19', photos: 156,  amount: 800,  type: 'Newborn',       thumbnailUrl: null },
  { id: 'p-008', name: 'Maternity Shoot — Botanical Garden',       status: 'completed',  date: '2025-07-10', photos: 203,  amount: 600,  type: 'Maternity',     thumbnailUrl: null },
  { id: 'p-009', name: 'Corporate Headshots — Mitchell & Co',      status: 'completed',  date: '2025-11-02', photos: 48,   amount: 350,  type: 'Corporate',     thumbnailUrl: null },
]

/* ─── Status config ─────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ClientProjectStatus,
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  completed:   { label: 'Completed',   badge: 'bg-emerald-500/15 text-emerald-400', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', badge: 'bg-amber-500/15 text-amber-400',    icon: Clock },
  delivered:   { label: 'Delivered',   badge: 'bg-teal-500/15 text-teal-400',      icon: Truck },
}

type StatusFilter = ClientProjectStatus | 'all'
type SortField = 'date' | 'status' | 'amount'
type SortDir = 'asc' | 'desc'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delivered',   label: 'Delivered' },
  { value: 'completed',   label: 'Completed' },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function fmt(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ─── Action Menu (per-card dropdown) ──────────────────────────────────── */

interface ActionMenuProps {
  project: ClientProject
  open: boolean
  onOpen: (id: string) => void
  onClose: () => void
  onCreateInvoice: (project: ClientProject) => void
}

function ActionMenu({ project, open, onOpen, onClose, onCreateInvoice }: ActionMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); open ? onClose() : onOpen(project.id) }}
        className="rounded-lg p-1.5 text-on-surface/25 hover:text-on-surface/60 hover:bg-on-surface/5 transition-colors"
        aria-label="Project actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-outline-variant/40 bg-surface-container shadow-xl shadow-black/30 overflow-hidden">
          <Link
            href={`/gallery/${project.id}`}
            onClick={onClose}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface/70 hover:bg-on-surface/5 hover:text-on-surface transition-colors"
          >
            <Eye size={14} className="shrink-0" />
            View Gallery
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}`}
            onClick={onClose}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface/70 hover:bg-on-surface/5 hover:text-on-surface transition-colors"
          >
            <Layers size={14} className="shrink-0" />
            Open Workspace
          </Link>
          <div className="my-1 border-t border-outline-variant/20" />
          <button
            onClick={() => { onCreateInvoice(project); onClose() }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface/70 hover:bg-on-surface/5 hover:text-on-surface transition-colors"
          >
            <FileText size={14} className="shrink-0" />
            Create Invoice
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Project Card ──────────────────────────────────────────────────────── */

interface ProjectCardProps {
  project: ClientProject
  menuOpen: boolean
  onMenuOpen: (id: string) => void
  onMenuClose: () => void
  onCreateInvoice: (project: ClientProject) => void
}

function ProjectCard({ project, menuOpen, onMenuOpen, onMenuClose, onCreateInvoice }: ProjectCardProps) {
  const statusCfg = STATUS_CONFIG[project.status]
  const StatusIcon = statusCfg.icon

  return (
    <div className="group rounded-2xl border border-outline-variant/30 bg-surface-container overflow-hidden hover:border-outline-variant/60 transition-all">
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-surface-highest/20 to-background flex items-center justify-center overflow-hidden">
        {project.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon size={32} className="text-on-surface/10" />
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusCfg.badge}`}>
            <StatusIcon size={9} />
            {statusCfg.label}
          </span>
        </div>

        {/* Photo count badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
          <Camera size={9} />
          {project.photos.toLocaleString()}
        </div>

        {/* Quick-action overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link
            href={`/gallery/${project.id}`}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={12} />
            Gallery
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Layers size={12} />
            Workspace
          </Link>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
              {project.name}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-on-surface/40">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {fmtDate(project.date)}
              </span>
              <span className="flex items-center gap-1">
                <Hash size={10} />
                {project.type}
              </span>
            </div>
          </div>
          <ActionMenu
            project={project}
            open={menuOpen}
            onOpen={onMenuOpen}
            onClose={onMenuClose}
            onCreateInvoice={onCreateInvoice}
          />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/20">
          <span className="text-xs font-medium text-on-surface/40">
            {project.photos.toLocaleString()} photos
          </span>
          <span className="font-mono text-sm font-bold text-on-surface">
            {fmt(project.amount)}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Sort button ────────────────────────────────────────────────────────── */

interface SortButtonProps {
  field: SortField
  label: string
  current: SortField
  dir: SortDir
  onClick: (field: SortField) => void
}

function SortButton({ field, label, current, dir, onClick }: SortButtonProps) {
  const active = current === field
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <button
      onClick={() => onClick(field)}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'bg-primary/15 text-primary'
          : 'text-on-surface/40 hover:text-on-surface/70 hover:bg-on-surface/5'
      }`}
    >
      <Icon size={11} />
      {label}
    </button>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function ClientDetailProjectsTab({
  clientName,
  clientEmail,
  totalRevenue,
  projects = MOCK_PROJECTS,
}: ClientDetailProjectsTabProps) {
  const [statusFilter, setStatusFilter]         = useState<StatusFilter>('all')
  const [sortField, setSortField]               = useState<SortField>('date')
  const [sortDir, setSortDir]                   = useState<SortDir>('desc')
  const [openMenuId, setOpenMenuId]             = useState<string | null>(null)
  const [invoiceCreatorOpen, setInvoiceCreatorOpen] = useState(false)
  const [invoiceProject, setInvoiceProject]     = useState<ClientProject | null>(null)

  /* ── Sort toggle ──────────────────────────────────────────────────────── */
  const handleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return field
      }
      setSortDir('desc')
      return field
    })
  }, [])

  /* ── Filtered + sorted list ──────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const base = statusFilter === 'all'
      ? projects
      : projects.filter((p) => p.status === statusFilter)

    return [...base].sort((a, b) => {
      let cmp = 0
      if (sortField === 'date')   cmp = a.date.localeCompare(b.date)
      if (sortField === 'amount') cmp = a.amount - b.amount
      if (sortField === 'status') cmp = a.status.localeCompare(b.status)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [projects, statusFilter, sortField, sortDir])

  /* ── Summary totals ─────────────────────────────────────────────────── */
  const totalPhotos    = useMemo(() => projects.reduce((s, p) => s + p.photos, 0), [projects])
  const totalBilled    = useMemo(() => projects.reduce((s, p) => s + p.amount, 0), [projects])
  const inProgressCount = useMemo(() => projects.filter((p) => p.status === 'in_progress').length, [projects])

  /* ── Invoice creator ─────────────────────────────────────────────────── */
  const handleCreateInvoice = useCallback((project: ClientProject) => {
    setInvoiceProject(project)
    setInvoiceCreatorOpen(true)
  }, [])

  const handleInvoiceSubmit = useCallback((_data: InvoiceFormData) => {
    // TODO: POST to /api/invoices with Supabase integration
    setInvoiceCreatorOpen(false)
    setInvoiceProject(null)
  }, [])

  /* ── Menu helpers ────────────────────────────────────────────────────── */
  const handleMenuOpen  = useCallback((id: string) => setOpenMenuId(id), [])
  const handleMenuClose = useCallback(() => setOpenMenuId(null), [])

  /* ─── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      {/* ── Header row ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-primary" />
          <h2 className="font-bold text-lg text-on-surface">Projects</h2>
          <span className="rounded-full bg-on-surface/10 px-2 py-0.5 text-xs font-medium text-on-surface/50">
            {projects.length}
          </span>
        </div>
        <Link
          href={`/dashboard/projects?client=${encodeURIComponent(clientName ?? '')}&new=1`}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          New Project
        </Link>
      </div>

      {/* ── Summary bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Projects',   value: String(projects.length),              icon: FolderOpen,  accent: false },
          { label: 'Active',           value: String(inProgressCount),               icon: Clock,       accent: inProgressCount > 0 },
          { label: 'Total Photos',     value: totalPhotos.toLocaleString(),          icon: Camera,      accent: false },
          { label: 'Total Billed',     value: fmt(totalRevenue ?? totalBilled),      icon: TrendingUp,  accent: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container p-4"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.accent ? 'bg-primary/15' : 'bg-on-surface/5'}`}>
              <stat.icon size={16} className={stat.accent ? 'text-primary' : 'text-on-surface/40'} />
            </div>
            <div className="min-w-0">
              <p className={`font-mono text-base font-bold leading-tight ${stat.accent ? 'text-primary' : 'text-on-surface'}`}>
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-on-surface/40 mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters + sort row ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                statusFilter === sf.value
                  ? 'bg-primary text-white shadow-sm shadow-primary/30'
                  : 'bg-on-surface/5 text-on-surface/50 hover:bg-on-surface/10 hover:text-on-surface/80'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-[11px] text-on-surface/30 mr-1">Sort:</span>
          <SortButton field="date"   label="Date"   current={sortField} dir={sortDir} onClick={handleSort} />
          <SortButton field="amount" label="Amount" current={sortField} dir={sortDir} onClick={handleSort} />
          <SortButton field="status" label="Status" current={sortField} dir={sortDir} onClick={handleSort} />
        </div>
      </div>

      {/* ── Project grid ─────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-outline-variant/30">
          <FolderOpen size={36} className="text-on-surface/10 mb-3" />
          <p className="text-sm font-medium text-on-surface/30">No projects found</p>
          <p className="text-xs text-on-surface/20 mt-1">
            {statusFilter !== 'all' ? 'Try changing the status filter' : 'Create a new project to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              menuOpen={openMenuId === project.id}
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
              onCreateInvoice={handleCreateInvoice}
            />
          ))}
        </div>
      )}

      {/* ── Invoice Creator modal ─────────────────────────────────────── */}
      {invoiceCreatorOpen && (
        <InvoiceCreator
          onClose={() => { setInvoiceCreatorOpen(false); setInvoiceProject(null) }}
          onSaveDraft={async (data) => handleInvoiceSubmit(data)}
          onSend={async (data) => handleInvoiceSubmit(data)}
          initialData={{
            clientName: clientName ?? '',
            clientEmail: clientEmail ?? '',
            projectName: invoiceProject?.name ?? null,
          }}
        />
      )}
    </div>
  )
}
