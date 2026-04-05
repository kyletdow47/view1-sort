'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react'
import { ClientsKanbanView } from '@/components/features/clients/ClientsKanbanView'
import { ClientsListView } from '@/components/features/clients/ClientsListView'
import { AddClientModal } from '@/components/features/clients/AddClientModal'
import { MOCK_CLIENTS } from '@/components/features/clients/ClientsKanbanView'
import type {
  ClientRecord,
  ClientView,
  ClientStage,
  NewClientFormData,
  ProjectType,
} from '@/types/clients'

/* ------------------------------------------------------------------ */
/*  Stage options for filter dropdown                                  */
/* ------------------------------------------------------------------ */

const STAGE_OPTIONS: { value: ClientStage | 'all'; label: string }[] = [
  { value: 'all',       label: 'All stages' },
  { value: 'inquiry',   label: 'Inquiry' },
  { value: 'quoted',    label: 'Quoted' },
  { value: 'booked',    label: 'Booked' },
  { value: 'shooting',  label: 'Shooting' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'paid',      label: 'Paid' },
]

const PROJECT_TYPES: (ProjectType | 'all')[] = [
  'all',
  'Wedding',
  'Engagement',
  'Portrait',
  'Family',
  'Newborn',
  'Maternity',
  'Commercial',
  'Branding',
  'Corporate',
  'Event',
  'Mini Session',
  'Elopement',
  'Other',
]

/* ------------------------------------------------------------------ */
/*  Stat pill                                                          */
/* ------------------------------------------------------------------ */

interface StatPillProps {
  label: string
  value: number
  dotColor: string
}

function StatPill({ label, value, dotColor }: StatPillProps) {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
      <span className="text-[11px] font-medium text-white/60">{label}</span>
      <span className="text-[11px] font-bold text-white/80">{value}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ClientsPageClient                                                  */
/* ------------------------------------------------------------------ */

interface ClientsPageClientProps {
  initialClients: ClientRecord[]
}

export function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
  const clients = initialClients.length > 0 ? initialClients : MOCK_CLIENTS

  const [view, setView] = useState<ClientView>('kanban')
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<ClientStage | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultModalStage, setDefaultModalStage] = useState<ClientStage | undefined>(undefined)

  /* Derived: apply stage + type filters (search applied in sub-components) */
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false
      if (typeFilter !== 'all' && c.projectType !== typeFilter) return false
      return true
    })
  }, [clients, stageFilter, typeFilter])

  /* Summary stats for pills */
  const totalClients = clients.length
  const activeCount = clients.filter((c) =>
    ['inquiry', 'quoted', 'booked', 'shooting'].includes(c.stage),
  ).length
  const paidCount = clients.filter((c) => c.stage === 'paid').length

  /* Add client handler */
  const handleAddClient = useCallback((defaultStage?: ClientStage) => {
    setDefaultModalStage(defaultStage)
    setModalOpen(true)
  }, [])

  const handleClientAdded = useCallback(
    (data: NewClientFormData) => {
      // TODO: persist to Supabase client_profiles table
      // await supabase.from('client_profiles').insert({ ...data, workspace_id })
      // For now, the kanban view manages its own state with the mock data
      console.info('New client added (mock — no DB write):', data)
    },
    [],
  )

  /* Derived: active filters count for badge */
  const activeFilterCount = (stageFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ============ HEADER ============ */}
      <div
        className="flex shrink-0 flex-col gap-3 px-8 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Top row: title + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-[18px] font-bold text-white">Clients</h1>
            {/* Summary stats */}
            <div className="hidden items-center gap-2 sm:flex">
              <StatPill label="Total" value={totalClients} dotColor="#94A3B8" />
              <StatPill label="Active" value={activeCount} dotColor="#A78BFA" />
              <StatPill label="Paid" value={paidCount} dotColor="#10B981" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div
              className="flex items-center rounded-xl p-1"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all ${
                  view === 'kanban'
                    ? 'bg-white/12 text-white/90'
                    : 'text-white/35 hover:text-white/60'
                }`}
                aria-label="Kanban view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all ${
                  view === 'list'
                    ? 'bg-white/12 text-white/90'
                    : 'text-white/35 hover:text-white/60'
                }`}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'border-[#5749F4]/40 bg-[#5749F4]/10 text-white/80'
                  : 'border-white/15 text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#5749F4] px-1 text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* New client */}
            <button
              onClick={() => handleAddClient()}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Client
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, email, or shoot type…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-[13px] text-white/80 placeholder-white/20 outline-none transition-all focus:border-white/20 focus:bg-white/7"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div
            className="flex flex-wrap items-center gap-3 rounded-xl p-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Stage filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/35 font-medium uppercase tracking-wider">Stage</span>
              <div className="relative">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as ClientStage | 'all')}
                  className="appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-3 pr-7 text-[12px] text-white/70 outline-none focus:border-white/20 cursor-pointer"
                >
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
              </div>
            </div>

            {/* Project type filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/35 font-medium uppercase tracking-wider">Type</span>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as ProjectType | 'all')}
                  className="appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-3 pr-7 text-[12px] text-white/70 outline-none focus:border-white/20 cursor-pointer"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'all' ? 'All types' : t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setStageFilter('all')
                  setTypeFilter('all')
                }}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============ CONTENT ============ */}
      {view === 'kanban' ? (
        <ClientsKanbanView
          clients={filteredClients}
          searchQuery={search}
          onAddClient={handleAddClient}
        />
      ) : (
        <ClientsListView clients={filteredClients} searchQuery={search} />
      )}

      {/* ============ ADD CLIENT MODAL ============ */}
      <AddClientModal
        isOpen={modalOpen}
        defaultStage={defaultModalStage}
        onClose={() => setModalOpen(false)}
        onAdd={handleClientAdded}
      />
    </div>
  )
}
