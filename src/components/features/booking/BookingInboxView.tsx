'use client'

import { useState, useMemo, useCallback } from 'react'
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
import {
  Plus,
  CalendarDays,
  DollarSign,
  MoreHorizontal,
  Trash2,
  Pencil,
  Check,
  X,
  Mail,
  Phone,
} from 'lucide-react'
import type { BookingRecord, BookingStage } from '@/types/booking'

/* ------------------------------------------------------------------ */
/*  Column definitions                                                   */
/* ------------------------------------------------------------------ */

interface ColumnDef {
  key: BookingStage
  label: string
  dotColor: string
}

const COLUMNS: ColumnDef[] = [
  { key: 'inquiry',   label: 'Inquiry',   dotColor: '#94A3B8' },
  { key: 'quoted',    label: 'Quoted',    dotColor: '#60A5FA' },
  { key: 'booked',    label: 'Booked',    dotColor: '#A78BFA' },
  { key: 'shooting',  label: 'Shooting',  dotColor: '#FBBF24' },
  { key: 'delivered', label: 'Delivered', dotColor: '#34D399' },
  { key: 'paid',      label: 'Paid',      dotColor: '#10B981' },
]

/* ------------------------------------------------------------------ */
/*  Avatar helpers                                                       */
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ------------------------------------------------------------------ */
/*  BookingCard                                                          */
/* ------------------------------------------------------------------ */

interface BookingCardProps {
  booking: BookingRecord
  isDragging?: boolean
  onDelete?: (id: string) => void
  onEdit?: (booking: BookingRecord) => void
}

function BookingCard({ booking, isDragging = false, onDelete, onEdit }: BookingCardProps) {
  const grad = getGradient(booking.clientEmail)
  const initials = getInitials(booking.clientName)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className={`relative flex flex-col gap-2.5 rounded-2xl p-3 transition-all cursor-pointer select-none group ${
        isDragging ? 'opacity-50 scale-95' : 'hover:bg-white/[0.08]'
      }`}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {/* Top row: avatar + name + menu */}
      <div className="flex items-start gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-[10px] font-bold text-white`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-white/90">{booking.clientName}</p>
          <p className="truncate text-[11px] text-white/40">{booking.bookingType}</p>
        </div>

        {/* Context menu trigger */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
            className="rounded-lg p-1 text-white/20 hover:text-white/60 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={13} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 top-6 z-20 w-36 rounded-2xl py-1 shadow-xl"
                style={{ background: 'rgba(28,28,44,0.98)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(booking) }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(booking.id) }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-1.5">
        {booking.price && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <DollarSign size={9} />
            {booking.price}
          </span>
        )}
        {booking.shootDate && (
          <span className="flex items-center gap-1 rounded-full bg-violet-400/15 px-2 py-0.5 text-[10px] font-medium text-violet-300">
            <CalendarDays size={9} />
            {formatDate(booking.shootDate)}
          </span>
        )}
        {booking.depositPaid && (
          <span className="flex items-center gap-1 rounded-full bg-blue-400/15 px-2 py-0.5 text-[10px] font-medium text-blue-300">
            <Check size={9} />
            Deposit
          </span>
        )}
      </div>

      {/* Contact row */}
      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-2">
        <a
          href={`mailto:${booking.clientEmail}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-violet-400 transition-colors"
        >
          <Mail size={9} />
          <span className="truncate max-w-[80px]">{booking.clientEmail.split('@')[0]}</span>
        </a>
        {booking.clientPhone && (
          <a
            href={`tel:${booking.clientPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-violet-400 transition-colors"
          >
            <Phone size={9} />
            <span>{booking.clientPhone}</span>
          </a>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DraggableBookingCard                                                */
/* ------------------------------------------------------------------ */

function DraggableBookingCard({
  booking,
  onDelete,
  onEdit,
}: {
  booking: BookingRecord
  onDelete?: (id: string) => void
  onEdit?: (booking: BookingRecord) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: booking.id,
    data: { booking },
  })

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ touchAction: 'none' }}>
      <BookingCard booking={booking} isDragging={isDragging} onDelete={onDelete} onEdit={onEdit} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  DroppableColumn                                                      */
/* ------------------------------------------------------------------ */

interface DroppableColumnProps {
  col: ColumnDef
  bookings: BookingRecord[]
  onAddClick: (stage: BookingStage) => void
  onDelete?: (id: string) => void
  onEdit?: (booking: BookingRecord) => void
}

function DroppableColumn({ col, bookings, onAddClick, onDelete, onEdit }: DroppableColumnProps) {
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
        border: isOver ? `1px solid ${col.dotColor}40` : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 py-0.5 mb-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: col.dotColor }} />
          <span className="text-[12px] font-semibold text-white/80">{col.label}</span>
        </div>
        <span
          className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-white/60"
          style={{ background: 'rgba(255,255,255,0.10)' }}
        >
          {bookings.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <DraggableBookingCard
              key={booking.id}
              booking={booking}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-white/10">
            <span className="text-[11px] text-white/20">No bookings</span>
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddClick(col.key)}
        className="flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
      >
        <Plus size={11} />
        Add
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Edit Booking Modal (inline, lightweight)                            */
/* ------------------------------------------------------------------ */

function EditBookingModal({
  booking,
  onSave,
  onClose,
}: {
  booking: BookingRecord
  onSave: (updated: BookingRecord) => void
  onClose: () => void
}) {
  const [clientName, setClientName] = useState(booking.clientName)
  const [notes, setNotes] = useState(booking.notes ?? '')
  const [stage, setStage] = useState<BookingStage>(booking.stage)
  const [shootDate, setShootDate] = useState(booking.shootDate ?? '')
  const [depositPaid, setDepositPaid] = useState(booking.depositPaid)

  function handleSave() {
    onSave({
      ...booking,
      clientName: clientName.trim() || booking.clientName,
      notes: notes.trim() || undefined,
      stage,
      shootDate: shootDate || undefined,
      depositPaid,
      updatedAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)' }}>
      <div
        className="w-full max-w-md rounded-3xl p-6"
        style={{
          background: 'linear-gradient(180deg, rgba(40,40,60,0.98) 0%, rgba(20,20,35,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.60)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-white">Edit Booking</h3>
          <button onClick={onClose} className="rounded-xl p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-white/40 mb-1">Client Name</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as BookingStage)}
                className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
                style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                {(['inquiry','quoted','booked','shooting','delivered','paid'] as const).map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Shoot Date</label>
              <input
                type="date"
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none"
                style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          <div className="flex items-center gap-3 py-1">
            <button
              onClick={() => setDepositPaid(!depositPaid)}
              className={`relative h-6 w-11 rounded-full transition-colors ${depositPaid ? 'bg-violet-500' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${depositPaid ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
            <span className="text-[13px] text-white/60">Deposit received</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-white/15 px-5 py-2 text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-5 py-2 text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
          >
            <Check size={13} />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BookingInboxView                                                     */
/* ------------------------------------------------------------------ */

interface BookingInboxViewProps {
  bookings: BookingRecord[]
  searchQuery: string
  onAddBooking: (stage: BookingStage) => void
  onUpdateBooking: (updated: BookingRecord) => void
  onDeleteBooking: (id: string) => void
}

export function BookingInboxView({
  bookings,
  searchQuery,
  onAddBooking,
  onUpdateBooking,
  onDeleteBooking,
}: BookingInboxViewProps) {
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null)
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null)

  const displayBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings
    const q = searchQuery.toLowerCase()
    return bookings.filter(
      (b) =>
        b.clientName.toLowerCase().includes(q) ||
        b.clientEmail.toLowerCase().includes(q) ||
        b.bookingType.toLowerCase().includes(q),
    )
  }, [bookings, searchQuery])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const booking = bookings.find((b) => b.id === event.active.id)
      setActiveBooking(booking ?? null)
    },
    [bookings],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveBooking(null)
      const { active, over } = event
      if (!over) return

      const draggedId = active.id as string
      const newStage = over.id as BookingStage

      if (!COLUMNS.some((c) => c.key === newStage)) return

      const booking = bookings.find((b) => b.id === draggedId)
      if (!booking || booking.stage === newStage) return

      onUpdateBooking({ ...booking, stage: newStage, updatedAt: new Date().toISOString() })
    },
    [bookings, onUpdateBooking],
  )

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-3 overflow-x-auto px-6 py-4 min-h-[500px]">
          {COLUMNS.map((col) => {
            const colBookings = displayBookings.filter((b) => b.stage === col.key)
            return (
              <DroppableColumn
                key={col.key}
                col={col}
                bookings={colBookings}
                onAddClick={onAddBooking}
                onDelete={onDeleteBooking}
                onEdit={(b) => setEditingBooking(b)}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeBooking ? (
            <div className="rotate-2 opacity-90">
              <BookingCard booking={activeBooking} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onSave={onUpdateBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </>
  )
}
