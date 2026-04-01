'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  Link2,
  ExternalLink,
  Copy,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Send,
  Sparkles,
  CalendarDays,
  Gift,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  Inbox,
  Lock,
  MessageSquare,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServicePackage {
  id: string
  photographer_id: string
  name: string
  description: string
  price_cents: number
  hours: number
  deliverables: string[]
  deposit_percent: number // TODO: add deposit_percent column to packages table
  is_active: boolean
  sort_order: number
}

type LeadStatus = 'new' | 'contacted' | 'quoted' | 'converted' | 'lost'

interface Lead {
  id: string
  photographer_id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  shoot_type: string | null
  event_date: string | null
  budget_range: string | null
  source: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
}

// ─── Status config ─────────────────────────────────────────────────────────

const LEAD_STATUS: Record<LeadStatus, { label: string; fill: string; text: string }> = {
  new:       { label: 'New',       fill: 'bg-[#6b7280]/15', text: 'text-[#9ca3af]' },
  contacted: { label: 'Contacted', fill: 'bg-[#3b82f6]/15', text: 'text-[#60a5fa]' },
  quoted:    { label: 'Quoted',    fill: 'bg-[#818cf8]/15', text: 'text-[#818cf8]' },
  converted: { label: 'Converted', fill: 'bg-[#34d399]/15', text: 'text-[#34d399]' },
  lost:      { label: 'Lost',      fill: 'bg-[#f87171]/15', text: 'text-[#f87171]' },
}

// ─── Seed / mock data ──────────────────────────────────────────────────────

const SEED_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-1',
    photographer_id: '',
    name: 'Essential',
    description: 'Perfect for intimate ceremonies and small events.',
    price_cents: 150000,
    hours: 4,
    deliverables: ['150 edited photos', 'Online gallery', 'Print release'],
    deposit_percent: 25,
    is_active: true,
    sort_order: 0,
  },
  {
    id: 'pkg-2',
    photographer_id: '',
    name: 'Premier Wedding',
    description: 'Full-day coverage with premium album and second shooter.',
    price_cents: 320000,
    hours: 10,
    deliverables: ['800 edited photos', 'Online gallery', '12×12 album', 'Second shooter', 'Print release'],
    deposit_percent: 30,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'pkg-3',
    photographer_id: '',
    name: 'Portrait Session',
    description: 'Studio or on-location portrait session.',
    price_cents: 65000,
    hours: 2,
    deliverables: ['50 edited photos', 'Online gallery', '1 location'],
    deposit_percent: 50,
    is_active: true,
    sort_order: 2,
  },
]

const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    photographer_id: '',
    name: 'Mia & Carlos',
    email: 'mia@example.com',
    phone: null,
    message: 'We are getting married in October and love your work! Do you have availability?',
    shoot_type: 'Wedding',
    event_date: '2026-10-10',
    budget_range: '$3,000 – $4,000',
    source: 'instagram',
    status: 'new',
    notes: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-2',
    photographer_id: '',
    name: 'Harper Collins',
    email: 'harper@example.com',
    phone: '+1 555-234-5678',
    message: 'Looking for a family portrait session, 3 kids ages 4–9.',
    shoot_type: 'Family Portrait',
    event_date: '2026-05-15',
    budget_range: '$500 – $800',
    source: 'referral',
    status: 'contacted',
    notes: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-3',
    photographer_id: '',
    name: 'Priya & Dev',
    email: 'priya@example.com',
    phone: null,
    message: 'We need a photographer for our engagement session. Available in June?',
    shoot_type: 'Engagement',
    event_date: '2026-06-20',
    budget_range: '$1,200 – $1,800',
    source: 'google',
    status: 'quoted',
    notes: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── Utilities ─────────────────────────────────────────────────────────────

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatPrice(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function getDatesInRange(a: string, b: string): string[] {
  const start = new Date(a + 'T00:00:00')
  const end = new Date(b + 'T00:00:00')
  if (start > end) return getDatesInRange(b, a)
  const dates: string[] = []
  const cur = new Date(start)
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

// ─── Shared primitives ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/50">
      {children}
    </span>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low ${className}`}>
      {children}
    </div>
  )
}

// ─── Calendar cell ────────────────────────────────────────────────────────

interface CellProps {
  dateStr: string
  day: number
  isToday: boolean
  isBooked: boolean
  isBlocked: boolean
  inRange: boolean
  onToggle: (key: string) => void
}

function CalendarCell({ dateStr, day, isToday, isBooked, isBlocked, inRange, onToggle }: CellProps) {
  // Both draggable (source) and droppable (target) on the same element
  const { setNodeRef: setDragRef, attributes, listeners } = useDraggable({ id: dateStr, disabled: isBooked })
  const { setNodeRef: setDropRef } = useDroppable({ id: dateStr })

  const mergeRef = useCallback(
    (node: HTMLElement | null) => {
      setDragRef(node)
      setDropRef(node)
    },
    [setDragRef, setDropRef],
  )

  let base =
    'relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium select-none cursor-pointer transition-colors'

  let style = ''
  if (isBooked) {
    style = 'bg-[#818cf8]/20 text-[#818cf8] cursor-default'
  } else if (isBlocked) {
    style = 'bg-surface-container-highest text-on-surface-variant/40 line-through'
  } else if (inRange) {
    style = 'bg-primary/20 text-primary ring-1 ring-primary/40'
  } else if (isToday) {
    style = 'bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold'
  } else {
    style = 'text-on-surface-variant/70 hover:bg-surface-container'
  }

  return (
    <div
      ref={mergeRef}
      {...attributes}
      {...listeners}
      onClick={() => !isBooked && onToggle(dateStr)}
      className={`${base} ${style}`}
    >
      {day}
      {isBooked && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#818cf8]" />
      )}
      {isBlocked && !isBooked && (
        <Lock size={8} className="absolute -top-0.5 -right-0.5 text-on-surface-variant/40" />
      )}
    </div>
  )
}

// ─── Availability Calendar ────────────────────────────────────────────────

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES   = ['S','M','T','W','T','F','S']

interface AvailabilityCalendarProps {
  blockedDates: Set<string>
  bookedDates: Set<string>
  onToggle: (key: string) => void
  onBlockRange: (keys: string[]) => void
}

function AvailabilityCalendar({ blockedDates, bookedDates, onToggle, onBlockRange }: AvailabilityCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragOver,  setDragOver]  = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const dragRangeSet = useMemo<Set<string>>(() => {
    if (!dragStart || !dragOver) return new Set()
    return new Set(getDatesInRange(dragStart, dragOver))
  }, [dragStart, dragOver])

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function handleDragStart({ active }: { active: { id: string | number } }) {
    setDragStart(active.id as string)
  }
  function handleDragOver({ over }: DragOverEvent) {
    setDragOver((over?.id as string) ?? null)
  }
  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      const range = getDatesInRange(active.id as string, over.id as string)
      onBlockRange(range)
    }
    setDragStart(null)
    setDragOver(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Card className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline font-bold text-on-surface">
            {MONTH_NAMES[viewMonth]} <span className="font-mono">{viewYear}</span>
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="rounded-lg p-1.5 text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="rounded-lg p-1.5 text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d, i) => (
            <div key={i} className="flex h-8 items-center justify-center text-[10px] font-medium text-on-surface-variant/40">
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} className="h-9 w-9" />
            const key = dateKey(viewYear, viewMonth, day)
            const isToday = (
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear()
            )
            return (
              <div key={key} className="flex items-center justify-center">
                <CalendarCell
                  dateStr={key}
                  day={day}
                  isToday={isToday}
                  isBooked={bookedDates.has(key)}
                  isBlocked={blockedDates.has(key)}
                  inRange={dragRangeSet.has(key)}
                  onToggle={onToggle}
                />
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-outline-variant/15 flex flex-wrap items-center gap-x-4 gap-y-2">
          {[
            { dot: 'bg-gradient-to-br from-primary to-primary-dim', label: 'Today' },
            { dot: 'bg-[#818cf8]', label: 'Booked' },
            { dot: 'bg-surface-container-highest border border-outline-variant/30', label: 'Blocked' },
            { dot: 'bg-primary/20 ring-1 ring-primary/40', label: 'Drag range' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
              <span className="text-[10px] text-on-surface-variant/50">{label}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[10px] text-on-surface-variant/40 leading-relaxed">
          Click to toggle block · Drag across dates to block a range
        </p>
      </Card>
    </DndContext>
  )
}

// ─── Package Modal ────────────────────────────────────────────────────────

const BLANK_PACKAGE: Omit<ServicePackage, 'id' | 'photographer_id' | 'sort_order'> = {
  name: '',
  description: '',
  price_cents: 0,
  hours: 4,
  deliverables: [],
  deposit_percent: 25,
  is_active: true,
}

interface PackageModalProps {
  initial?: ServicePackage | null
  onSave: (pkg: ServicePackage) => void
  onClose: () => void
}

function PackageModal({ initial, onSave, onClose }: PackageModalProps) {
  const [name,           setName]           = useState(initial?.name ?? '')
  const [description,    setDescription]    = useState(initial?.description ?? '')
  const [priceDollars,   setPriceDollars]   = useState(initial ? String(initial.price_cents / 100) : '')
  const [hours,          setHours]          = useState(initial ? String(initial.hours) : '4')
  const [depositPct,     setDepositPct]     = useState(initial ? String(initial.deposit_percent) : '25')
  const [delivInput,     setDelivInput]     = useState('')
  const [deliverables,   setDeliverables]   = useState<string[]>(initial?.deliverables ?? [])

  function addDeliverable() {
    const t = delivInput.trim()
    if (t && !deliverables.includes(t)) { setDeliverables([...deliverables, t]); setDelivInput('') }
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id:               initial?.id ?? `pkg-${Date.now()}`,
      photographer_id:  initial?.photographer_id ?? '',
      sort_order:       initial?.sort_order ?? 0,
      is_active:        true,
      name:             name.trim(),
      description:      description.trim(),
      price_cents:      Math.round((parseFloat(priceDollars) || 0) * 100),
      hours:            parseInt(hours) || 0,
      deliverables,
      deposit_percent:  parseInt(depositPct) || 25,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-headline font-extrabold text-lg text-on-surface">
            {initial ? 'Edit Package' : 'New Package'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <SectionLabel>Package Name</SectionLabel>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Premier Wedding"
              className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
            />
          </div>

          {/* Price + Hours + Deposit */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Price ($)',    value: priceDollars, set: setPriceDollars, placeholder: '1500' },
              { label: 'Session (hrs)',value: hours,        set: setHours,        placeholder: '4'    },
              { label: 'Deposit (%)',  value: depositPct,   set: setDepositPct,   placeholder: '25'   },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <SectionLabel>{label}</SectionLabel>
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl bg-background px-3 py-2.5 text-sm font-mono text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <SectionLabel>Description</SectionLabel>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's included, who it's for…"
              className="w-full resize-none rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
            />
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <SectionLabel>Deliverables</SectionLabel>
            <div className="flex gap-2">
              <input
                type="text"
                value={delivInput}
                onChange={e => setDelivInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                placeholder="e.g. 200 edited photos"
                className="flex-1 rounded-xl bg-background px-4 py-2 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
              />
              <button onClick={addDeliverable} className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                Add
              </button>
            </div>
            {deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {deliverables.map(d => (
                  <span key={d} className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface">
                    {d}
                    <button onClick={() => setDeliverables(deliverables.filter(x => x !== d))} className="text-on-surface-variant hover:text-on-surface">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-outline-variant/30 px-5 py-2 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-2 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Check size={14} />
            {initial ? 'Save Changes' : 'Create Package'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Package Card ─────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  onEdit,
  onDelete,
}: {
  pkg: ServicePackage
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{pkg.name}</p>
          {pkg.description && (
            <p className="text-xs text-on-surface-variant/60 mt-0.5 line-clamp-1">{pkg.description}</p>
          )}
        </div>
        <p className="font-mono text-base font-extrabold text-primary shrink-0">{formatPrice(pkg.price_cents)}</p>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <div className="flex items-center gap-1 text-xs text-on-surface-variant">
          <Clock size={11} className="text-primary/60" />
          <span className="font-mono">{pkg.hours}h</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-on-surface-variant">
          <Package size={11} className="text-primary/60" />
          <span className="font-mono">{pkg.deposit_percent}%</span> deposit
        </div>
      </div>

      {pkg.deliverables.length > 0 && (
        <ul className="space-y-1">
          {pkg.deliverables.map(d => (
            <li key={d} className="flex items-center gap-1.5 text-xs text-on-surface-variant/70">
              <Gift size={10} className="text-primary/50 shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/15">
        <button onClick={onEdit} className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
          <Pencil size={10} />Edit
        </button>
        <button onClick={onDelete} className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-error/30 hover:text-error transition-colors ml-auto">
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}

// ─── Inquiry Card ─────────────────────────────────────────────────────────

interface InquiryCardProps {
  lead: Lead
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onProposeDate: (id: string) => void
  replyDraft: string
  onReplyChange: (val: string) => void
  onSendReply: (id: string) => void
  onDraftAI: (id: string) => void
  isExpanded: boolean
  onToggleExpand: (id: string) => void
}

function InquiryCard({
  lead,
  onAccept,
  onDecline,
  onProposeDate,
  replyDraft,
  onReplyChange,
  onSendReply,
  onDraftAI,
  isExpanded,
  onToggleExpand,
}: InquiryCardProps) {
  const statusCfg = LEAD_STATUS[lead.status]

  const formattedDate = lead.event_date
    ? new Date(lead.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container transition-colors">
      {/* Header row */}
      <button
        onClick={() => onToggleExpand(lead.id)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary shrink-0 mt-0.5">
          {lead.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-on-surface">{lead.name}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusCfg.fill} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {lead.shoot_type && (
              <span className="text-xs text-on-surface-variant/70">{lead.shoot_type}</span>
            )}
            {formattedDate && (
              <span className="font-mono text-xs text-on-surface-variant/60">{formattedDate}</span>
            )}
            {lead.budget_range && (
              <span className="font-mono text-xs text-primary/70">{lead.budget_range}</span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-on-surface-variant/40 shrink-0 mt-0.5">{timeAgo(lead.created_at)}</span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-outline-variant/15 pt-3">
          {lead.message && (
            <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-high rounded-lg p-3">
              &ldquo;{lead.message}&rdquo;
            </p>
          )}

          {/* Action row: Accept / Decline / Propose */}
          {(lead.status === 'new' || lead.status === 'contacted') && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onAccept(lead.id)}
                className="flex items-center gap-1.5 rounded-lg bg-[#34d399]/15 px-3 py-1.5 text-xs font-medium text-[#34d399] hover:bg-[#34d399]/25 transition-colors"
              >
                <CheckCircle2 size={12} />Accept
              </button>
              <button
                onClick={() => onDecline(lead.id)}
                className="flex items-center gap-1.5 rounded-lg bg-[#f87171]/15 px-3 py-1.5 text-xs font-medium text-[#f87171] hover:bg-[#f87171]/25 transition-colors"
              >
                <XCircle size={12} />Decline
              </button>
              <button
                onClick={() => onProposeDate(lead.id)}
                className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
              >
                <ArrowLeftRight size={12} />Propose Date
              </button>
            </div>
          )}

          {/* Quick reply */}
          <div className="space-y-2">
            <SectionLabel>Quick Reply</SectionLabel>
            <div className="relative">
              <textarea
                rows={3}
                value={replyDraft}
                onChange={e => onReplyChange(e.target.value)}
                placeholder="Type your reply…"
                className="w-full resize-none rounded-xl bg-background px-4 py-2.5 pr-24 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                <button
                  onClick={() => onDraftAI(lead.id)}
                  className="flex items-center gap-1 rounded-lg bg-[#818cf8]/15 px-2 py-1 text-[11px] font-medium text-[#818cf8] hover:bg-[#818cf8]/25 transition-colors"
                >
                  <Sparkles size={10} />Draft
                </button>
                <button
                  onClick={() => onSendReply(lead.id)}
                  disabled={!replyDraft.trim()}
                  className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-primary to-primary-dim px-2 py-1 text-[11px] font-bold text-on-primary hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  <Send size={10} />Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [packages,     setPackages]     = useState<ServicePackage[]>(SEED_PACKAGES)
  const [leads,        setLeads]        = useState<Lead[]>(SEED_LEADS)
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [bookedDates,  setBookedDates]  = useState<Set<string>>(new Set())

  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingPkg,    setEditingPkg]    = useState<ServicePackage | null>(null)
  const [expandedLead,  setExpandedLead]  = useState<string | null>(null)
  const [replyDrafts,   setReplyDrafts]   = useState<Record<string, string>>({})
  const [copied,        setCopied]        = useState(false)

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/kyle`

  // TODO: wire to Supabase — tables: packages, leads, availability_blocks, bookings
  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [pkgRes, leadRes, blockRes, bookRes] = await Promise.allSettled([
        supabase.from('packages').select('*').eq('photographer_id', user.id).eq('is_active', true).order('sort_order'),
        supabase.from('leads').select('*').eq('photographer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('availability_blocks').select('blocked_date').eq('photographer_id', user.id),
        supabase.from('bookings').select('shoot_date').eq('photographer_id', user.id).in('status', ['pending', 'confirmed']),
      ])

      if (pkgRes.status  === 'fulfilled' && pkgRes.value.data?.length)   setPackages(pkgRes.value.data as ServicePackage[])
      if (leadRes.status === 'fulfilled' && leadRes.value.data?.length)  setLeads(leadRes.value.data as Lead[])
      if (blockRes.status === 'fulfilled' && blockRes.value.data) {
        setBlockedDates(new Set(blockRes.value.data.map((r: { blocked_date: string }) => r.blocked_date)))
      }
      if (bookRes.status === 'fulfilled' && bookRes.value.data) {
        setBookedDates(new Set(bookRes.value.data.map((r: { shoot_date: string }) => r.shoot_date)))
      }
    }

    load()
  }, [])

  // ── Package actions ──────────────────────────────────────────────────

  function handleSavePkg(pkg: ServicePackage) {
    setPackages(prev =>
      editingPkg
        ? prev.map(p => (p.id === pkg.id ? pkg : p))
        : [...prev, { ...pkg, sort_order: prev.length }],
    )
    setModalOpen(false)
    setEditingPkg(null)
    // TODO: upsert to Supabase packages table
  }

  function handleDeletePkg(id: string) {
    setPackages(prev => prev.filter(p => p.id !== id))
    // TODO: delete from Supabase packages table
  }

  // ── Calendar actions ─────────────────────────────────────────────────

  function handleToggleDate(key: string) {
    setBlockedDates(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      // TODO: upsert/delete availability_blocks in Supabase
      return next
    })
  }

  function handleBlockRange(keys: string[]) {
    setBlockedDates(prev => {
      const next = new Set(prev)
      const allBlocked = keys.every(k => next.has(k))
      keys.forEach(k => (allBlocked ? next.delete(k) : next.add(k)))
      // TODO: batch upsert/delete availability_blocks in Supabase
      return next
    })
  }

  // ── Inquiry actions ──────────────────────────────────────────────────

  function handleAccept(id: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'converted' } : l))
    // TODO: update leads status in Supabase + create booking + project records
  }

  function handleDecline(id: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'lost' } : l))
    // TODO: update leads status in Supabase
  }

  function handleProposeDate(id: string) {
    setExpandedLead(id)
    setReplyDrafts(prev => ({
      ...prev,
      [id]: "Thanks for reaching out! Your requested date isn't available, but I'd love to work with you. Could we explore an alternative date? I have availability on…",
    }))
  }

  function handleSendReply(id: string) {
    if (!replyDrafts[id]?.trim()) return
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'contacted' } : l))
    setReplyDrafts(prev => ({ ...prev, [id]: '' }))
    // TODO: send email via Resend + update lead status in Supabase
  }

  function handleDraftAI(id: string) {
    const lead = leads.find(l => l.id === id)
    if (!lead) return
    // TODO: call Claude API (Supabase Edge Function) to draft a personalized reply
    setReplyDrafts(prev => ({
      ...prev,
      [id]: `Hi ${lead.name.split(' ')[0]}, thank you for reaching out about your ${lead.shoot_type ?? 'session'}! I'd love to chat more about your vision. Let's set up a quick call — does this week work for you?`,
    }))
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(bookingUrl).catch(() => undefined)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const newInquiryCount = leads.filter(l => l.status === 'new').length

  return (
    <>
      {/* ── Package modal ── */}
      {modalOpen && (
        <PackageModal
          initial={editingPkg}
          onSave={handleSavePkg}
          onClose={() => { setModalOpen(false); setEditingPkg(null) }}
        />
      )}

      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <CalendarDays size={22} className="text-primary shrink-0" />
              <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">Booking</h1>
            </div>
            <p className="mt-1 text-sm text-on-surface-variant">
              Manage your packages, availability, and incoming inquiries
            </p>
          </div>
          {newInquiryCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#fbbf24]/15 px-3 py-1 text-xs font-medium text-[#fbbf24]">
              <Inbox size={12} />
              {newInquiryCount} new {newInquiryCount === 1 ? 'inquiry' : 'inquiries'}
            </span>
          )}
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-12 gap-5 items-start">

          {/* ── LEFT: Booking page + Packages ── */}
          <div className="col-span-12 lg:col-span-3 space-y-4">

            {/* Booking page card */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 size={14} className="text-primary" />
                <SectionLabel>Your Booking Page</SectionLabel>
              </div>
              <p className="font-mono text-xs text-on-surface-variant bg-surface-container rounded-lg px-3 py-2 truncate">
                {bookingUrl}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-outline-variant/30 py-2 text-xs font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {copied ? <Check size={12} className="text-[#34d399]" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-outline-variant/30 py-2 text-xs font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
                >
                  <ExternalLink size={12} />Preview
                </a>
              </div>
            </Card>

            {/* Packages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionLabel>Packages ({packages.length})</SectionLabel>
                <button
                  onClick={() => { setEditingPkg(null); setModalOpen(true) }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-3 py-1.5 text-xs font-bold text-on-primary hover:opacity-90 transition-opacity"
                >
                  <Plus size={12} />Add
                </button>
              </div>

              <div className="space-y-3">
                {packages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-outline-variant/20 p-6 flex flex-col items-center gap-2">
                    <Package size={20} className="text-on-surface-variant/20" />
                    <span className="text-xs text-on-surface-variant/40">No packages yet</span>
                  </div>
                ) : (
                  packages.map(pkg => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onEdit={() => { setEditingPkg(pkg); setModalOpen(true) }}
                      onDelete={() => handleDeletePkg(pkg.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── CENTER: Availability Calendar ── */}
          <div className="col-span-12 lg:col-span-5">
            <div className="space-y-3">
              <SectionLabel>Availability Calendar</SectionLabel>
              <AvailabilityCalendar
                blockedDates={blockedDates}
                bookedDates={bookedDates}
                onToggle={handleToggleDate}
                onBlockRange={handleBlockRange}
              />
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant/50 px-1">
                <span><span className="font-mono font-medium text-on-surface-variant">{blockedDates.size}</span> dates blocked</span>
                <span><span className="font-mono font-medium text-on-surface-variant">{bookedDates.size}</span> dates booked</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Inquiry Inbox ── */}
          <div className="col-span-12 lg:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <SectionLabel>Inquiry Inbox</SectionLabel>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-highest text-[10px] font-medium text-on-surface-variant">
                {leads.length}
              </span>
            </div>

            {leads.length === 0 ? (
              <Card className="p-8 flex flex-col items-center gap-3">
                <MessageSquare size={24} className="text-on-surface-variant/20" />
                <div className="text-center">
                  <p className="text-sm font-medium text-on-surface-variant/60">No inquiries yet</p>
                  <p className="text-xs text-on-surface-variant/40 mt-1">Share your booking page to start receiving inquiries</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {leads.map(lead => (
                  <InquiryCard
                    key={lead.id}
                    lead={lead}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onProposeDate={handleProposeDate}
                    replyDraft={replyDrafts[lead.id] ?? ''}
                    onReplyChange={val => setReplyDrafts(prev => ({ ...prev, [lead.id]: val }))}
                    onSendReply={handleSendReply}
                    onDraftAI={handleDraftAI}
                    isExpanded={expandedLead === lead.id}
                    onToggleExpand={id => setExpandedLead(prev => (prev === id ? null : id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
