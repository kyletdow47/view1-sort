'use client'

import { useMemo, useCallback, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { ClientRecord, ClientStage } from '@/types/clients'

/* ------------------------------------------------------------------ */
/*  Column definitions (spec: Inquiry → Quoted → Booked → Shooting → Delivered → Paid) */
/* ------------------------------------------------------------------ */

interface ColumnDef {
  key: ClientStage
  label: string
  dotColor: string
  bg: string
}

const COLUMNS: ColumnDef[] = [
  { key: 'inquiry',   label: 'Inquiry',   dotColor: '#94A3B8', bg: 'rgba(255,255,255,0.06)' },
  { key: 'quoted',    label: 'Quoted',    dotColor: '#60A5FA', bg: 'rgba(96,165,250,0.10)' },
  { key: 'booked',    label: 'Booked',    dotColor: '#A78BFA', bg: 'rgba(167,139,250,0.10)' },
  { key: 'shooting',  label: 'Shooting',  dotColor: '#FBBF24', bg: 'rgba(251,191,36,0.10)' },
  { key: 'delivered', label: 'Delivered', dotColor: '#34D399', bg: 'rgba(52,211,153,0.10)' },
  { key: 'paid',      label: 'Paid',      dotColor: '#10B981', bg: 'rgba(16,185,129,0.15)' },
]

/* ------------------------------------------------------------------ */
/*  Mock data (used when no real clients passed in)                    */
/* ------------------------------------------------------------------ */

export const MOCK_CLIENTS: ClientRecord[] = [
  { id: 'sarah-mitchell', email: 'sarah.mitchell@gmail.com',  displayName: 'Sarah Mitchell',      shootType: 'Wedding · June 13th',      price: '$2.5k',  stage: 'booked',    projectCount: 3, lastActive: '2026-04-03' },
  { id: 'james-priya',    email: 'james.priya@outlook.com',   displayName: 'James & Priya',        shootType: 'Engagement Session',        price: '$900',   stage: 'booked',    projectCount: 1, lastActive: '2026-03-28' },
  { id: 'marcus-cole',    email: 'marcus.cole@gmail.com',     displayName: 'Marcus Cole',          shootType: 'Commercial Shoot',          price: '$1.5k',  stage: 'inquiry',   projectCount: 1, lastActive: '2026-04-01' },
  { id: 'elena-torres',   email: 'elena.torres@icloud.com',   displayName: 'Elena Torres',         shootType: 'Portrait Session',          price: '$350',   stage: 'quoted',    projectCount: 1, lastActive: '2026-03-30' },
  { id: 'ryan-ashley',    email: 'ryan.nguyen@gmail.com',     displayName: 'Ryan & Ashley Nguyen', shootType: 'Wedding · Sept 20th',       price: '$3.2k',  stage: 'shooting',  projectCount: 2, lastActive: '2026-04-04' },
  { id: 'lisa-patel',     email: 'lisa.patel@yahoo.com',      displayName: 'Lisa Patel',           shootType: 'Newborn Session',           price: '$400',   stage: 'delivered', projectCount: 2, lastActive: '2026-04-02' },
  { id: 'alex-kim',       email: 'alex.kim@gmail.com',        displayName: 'Alex Kim',             shootType: 'Branding Shoot',            price: '$800',   stage: 'paid',      projectCount: 1, lastActive: '2026-03-25' },
  { id: 'carter-olivia',  email: 'carter.brown@outlook.com',  displayName: 'Carter & Olivia',      shootType: 'Elopement',                 price: '$1.8k',  stage: 'inquiry',   projectCount: 1, lastActive: '2026-04-01' },
  { id: 'priya-sharma',   email: 'priya.sharma@gmail.com',    displayName: 'Priya Sharma',         shootType: 'Mini Session',              price: '$150',   stage: 'quoted',    projectCount: 1, lastActive: '2026-03-29' },
  { id: 'tom-wilson',     email: 'tom.wilson@icloud.com',     displayName: 'Tom Wilson',           shootType: 'Corporate Headshots',       price: '$600',   stage: 'paid',      projectCount: 2, lastActive: '2026-03-20' },
  { id: 'maya-chen',      email: 'maya.chen@gmail.com',       displayName: 'Maya Chen',            shootType: 'Family · Spring',           price: '$500',   stage: 'booked',    projectCount: 1, lastActive: '2026-04-03' },
  { id: 'daniel-ross',    email: 'daniel.ross@icloud.com',    displayName: 'Daniel Ross',          shootType: 'Real Estate',               price: '$700',   stage: 'quoted',    projectCount: 1, lastActive: '2026-04-02' },
]

/* ------------------------------------------------------------------ */
/*  Avatar helpers                                                      */
/* ------------------------------------------------------------------ */

const GRADIENTS = [
  'from-teal-400 to-cyan-600',
  'from-blue-400 to-indigo-600',
  'from-pink-400 to-rose-600',
  'from-amber-400 to-orange-600',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-green-600',
]

function getGradient(email: string): string {
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]!
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  ClientCard                                                          */
/* ------------------------------------------------------------------ */

interface ClientCardProps {
  client: ClientRecord
  isDragging?: boolean
}

function ClientCard({ client, isDragging = false }: ClientCardProps) {
  const grad = getGradient(client.email)
  const initials = getInitials(client.displayName)

  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className={`flex items-center gap-2.5 rounded-xl p-3 transition-all hover:bg-white/10 cursor-pointer select-none ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
      onClick={(e) => {
        // Allow drag without triggering navigation
        if (isDragging) e.preventDefault()
      }}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-[11px] font-bold text-white`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-white/90">{client.displayName}</p>
        <p className="truncate text-[11px] text-white/40">{client.shootType}</p>
      </div>
      {client.price && (
        <span className="shrink-0 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
          {client.price}
        </span>
      )}
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  DraggableCard wrapper                                              */
/* ------------------------------------------------------------------ */

function DraggableClientCard({ client }: { client: ClientRecord }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: client.id,
    data: { client },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ touchAction: 'none' }}
    >
      <ClientCard client={client} isDragging={isDragging} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DroppableColumn                                                    */
/* ------------------------------------------------------------------ */

interface DroppableColumnProps {
  col: ColumnDef
  clients: ClientRecord[]
  onAddClick: (stage: ClientStage) => void
}

function DroppableColumn({ col, clients, onAddClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key })

  return (
    <div
      ref={setNodeRef}
      className="flex w-[210px] shrink-0 flex-col gap-2 rounded-2xl p-3 transition-all"
      style={{
        background: isOver
          ? 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)',
        backdropFilter: 'blur(20px)',
        border: isOver
          ? `1px solid ${col.dotColor}40`
          : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: col.dotColor }} />
          <span className="text-[12px] font-semibold text-white/80">{col.label}</span>
        </div>
        <span
          className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-white/60"
          style={{ background: 'rgba(255,255,255,0.10)' }}
        >
          {clients.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {clients.length > 0 ? (
          clients.map((client) => (
            <DraggableClientCard key={client.id} client={client} />
          ))
        ) : (
          <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/10">
            <span className="text-[11px] text-white/20">No clients</span>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddClick(col.key)}
        className="flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
      >
        <Plus className="h-3 w-3" />
        Add
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ClientsKanbanView                                                  */
/* ------------------------------------------------------------------ */

interface ClientsKanbanViewProps {
  clients: ClientRecord[]
  searchQuery: string
  onAddClient: (defaultStage?: ClientStage) => void
}

export function ClientsKanbanView({
  clients: initialClients,
  searchQuery,
  onAddClient,
}: ClientsKanbanViewProps) {
  const [clientList, setClientList] = useState<ClientRecord[]>(
    initialClients.length > 0 ? initialClients : MOCK_CLIENTS,
  )
  const [activeClient, setActiveClient] = useState<ClientRecord | null>(null)

  // Sync if external clients change (Supabase data loaded)
  // Only run on mount via initialClients; local drag state takes over after
  const displayClients = useMemo(() => {
    const base = initialClients.length > 0 ? clientList : clientList
    if (!searchQuery.trim()) return base
    const q = searchQuery.toLowerCase()
    return base.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.shootType.toLowerCase().includes(q),
    )
  }, [clientList, searchQuery])

  /* dnd-kit sensors */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const client = clientList.find((c) => c.id === event.active.id)
      setActiveClient(client ?? null)
    },
    [clientList],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveClient(null)
      const { active, over } = event
      if (!over) return

      const draggedId = active.id as string
      const newStage = over.id as ClientStage

      // Validate new stage is a known column
      if (!COLUMNS.some((c) => c.key === newStage)) return

      setClientList((prev) =>
        prev.map((c) => (c.id === draggedId ? { ...c, stage: newStage } : c)),
      )
      // TODO: persist stage change to Supabase client_profiles table
      // await supabase.from('client_profiles').update({ stage: newStage }).eq('id', draggedId)
    },
    [],
  )

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        data-testid="clients-kanban-scroll"
        className="flex flex-1 gap-3 overflow-x-auto scroll-smooth pl-6 py-4"
      >
        {COLUMNS.map((col) => {
          const colClients = displayClients.filter((c) => c.stage === col.key)
          return (
            <DroppableColumn
              key={col.key}
              col={col}
              clients={colClients}
              onAddClick={onAddClient}
            />
          )
        })}
        {/* Trailing spacer preserves right-side breathing room during horizontal
            scroll — WebKit/Blink drop padding-right from the scrollable extent
            of overflow-x flex containers, which clipped the final "Paid" column. */}
        <div aria-hidden="true" data-testid="clients-kanban-trailing-spacer" className="w-6 shrink-0" />
      </div>

      {/* Drag overlay — rendered outside columns to avoid clipping */}
      <DragOverlay>
        {activeClient ? (
          <div className="rotate-2 opacity-90">
            <ClientCard client={activeClient} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
