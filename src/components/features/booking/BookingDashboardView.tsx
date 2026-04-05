'use client'

import { useState, useMemo } from 'react'
import {
  Inbox,
  Package,
  CalendarDays,
  Globe,
  Settings,
  Plus,
  Search,
  X,
  ChevronDown,
  DollarSign,
  Users,
  TrendingUp,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react'
import type { BookingRecord, BookingTabKey, BookingPackage, BookingType } from '@/types/booking'
import { BookingInboxView } from './BookingInboxView'
import { BookingPackagesView } from './BookingPackagesView'
import { BookingCalendarView } from './BookingCalendarView'
import { BookingPageEditorView } from './BookingPageEditorView'

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

export const MOCK_BOOKINGS: BookingRecord[] = [
  {
    id: 'b-001',
    clientName: 'Sarah & James Mitchell',
    clientEmail: 'sarah.mitchell@gmail.com',
    clientPhone: '+1 (555) 234-5678',
    bookingType: 'Wedding',
    price: '$3,200',
    priceCents: 320000,
    depositCents: 80000,
    depositPaid: true,
    stage: 'booked',
    shootDate: '2026-06-13',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
    notes: 'Outdoor ceremony at Napa Valley. Golden hour portraits a priority.',
  },
  {
    id: 'b-002',
    clientName: 'Elena Torres',
    clientEmail: 'elena.torres@icloud.com',
    bookingType: 'Portrait',
    price: '$350',
    priceCents: 35000,
    depositCents: 0,
    depositPaid: false,
    stage: 'inquiry',
    createdAt: '2026-04-03T11:00:00Z',
    updatedAt: '2026-04-03T11:00:00Z',
  },
  {
    id: 'b-003',
    clientName: 'Ryan & Ashley Nguyen',
    clientEmail: 'ryan.nguyen@gmail.com',
    bookingType: 'Engagement',
    price: '$800',
    priceCents: 80000,
    depositCents: 20000,
    depositPaid: true,
    stage: 'quoted',
    shootDate: '2026-05-04',
    createdAt: '2026-03-28T16:00:00Z',
    updatedAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'b-004',
    clientName: 'Marcus Cole',
    clientEmail: 'marcus.cole@gmail.com',
    bookingType: 'Commercial',
    price: '$1,500',
    priceCents: 150000,
    depositCents: 50000,
    depositPaid: false,
    stage: 'inquiry',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-04-01T08:00:00Z',
    notes: 'Product shoot for new collection.',
  },
  {
    id: 'b-005',
    clientName: 'Maya Chen',
    clientEmail: 'maya.chen@gmail.com',
    bookingType: 'Family',
    price: '$500',
    priceCents: 50000,
    depositCents: 12500,
    depositPaid: true,
    stage: 'shooting',
    shootDate: '2026-04-06',
    createdAt: '2026-03-20T12:00:00Z',
    updatedAt: '2026-04-04T08:00:00Z',
  },
  {
    id: 'b-006',
    clientName: 'Lisa Patel',
    clientEmail: 'lisa.patel@yahoo.com',
    bookingType: 'Newborn',
    price: '$400',
    priceCents: 40000,
    depositCents: 10000,
    depositPaid: true,
    stage: 'delivered',
    shootDate: '2026-03-28',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-03T14:00:00Z',
  },
  {
    id: 'b-007',
    clientName: 'Tom Wilson',
    clientEmail: 'tom.wilson@icloud.com',
    bookingType: 'Corporate',
    price: '$600',
    priceCents: 60000,
    depositCents: 15000,
    depositPaid: true,
    stage: 'paid',
    shootDate: '2026-03-15',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-03-25T16:00:00Z',
  },
  {
    id: 'b-008',
    clientName: 'Priya Sharma',
    clientEmail: 'priya.sharma@gmail.com',
    bookingType: 'Mini Session',
    price: '$150',
    priceCents: 15000,
    depositCents: 0,
    depositPaid: false,
    stage: 'quoted',
    createdAt: '2026-04-02T15:00:00Z',
    updatedAt: '2026-04-02T15:00:00Z',
  },
  {
    id: 'b-009',
    clientName: 'Carter & Olivia Brown',
    clientEmail: 'carter.brown@outlook.com',
    bookingType: 'Elopement',
    price: '$1,800',
    priceCents: 180000,
    depositCents: 45000,
    depositPaid: false,
    stage: 'inquiry',
    createdAt: '2026-04-04T07:00:00Z',
    updatedAt: '2026-04-04T07:00:00Z',
    notes: 'Remote location in Montana. Need travel fee discussion.',
  },
]

export const MOCK_PACKAGES: BookingPackage[] = [
  {
    id: 'pkg-1',
    name: 'Wedding Essentials',
    description: 'Perfect for intimate ceremonies and elopements.',
    priceCents: 250000,
    price: '$2,500',
    durationMinutes: 480,
    includes: ['8 hours coverage', '1 photographer', '400+ edited photos', 'Online gallery'],
    applicableTypes: ['Wedding', 'Elopement'],
    active: true,
    sortOrder: 1,
  },
  {
    id: 'pkg-2',
    name: 'Wedding Premium',
    description: 'Full day coverage for your dream wedding.',
    priceCents: 400000,
    price: '$4,000',
    durationMinutes: 720,
    includes: ['12 hours coverage', '2 photographers', '700+ edited photos', 'Online gallery', 'Engagement session', 'USB delivery'],
    applicableTypes: ['Wedding'],
    active: true,
    sortOrder: 2,
  },
  {
    id: 'pkg-3',
    name: 'Portrait Session',
    description: 'Timeless portraits for individuals and couples.',
    priceCents: 35000,
    price: '$350',
    durationMinutes: 60,
    includes: ['1 hour session', '30+ edited photos', 'Online gallery', '2 print-ready files'],
    applicableTypes: ['Portrait', 'Engagement'],
    active: true,
    sortOrder: 3,
  },
  {
    id: 'pkg-4',
    name: 'Family Session',
    description: 'Capture the whole family together.',
    priceCents: 50000,
    price: '$500',
    durationMinutes: 90,
    includes: ['90 min session', '50+ edited photos', 'Online gallery', '5 print-ready files'],
    applicableTypes: ['Family', 'Newborn', 'Maternity'],
    active: true,
    sortOrder: 4,
  },
  {
    id: 'pkg-5',
    name: 'Commercial Half-Day',
    description: 'Professional imagery for brands and businesses.',
    priceCents: 120000,
    price: '$1,200',
    durationMinutes: 240,
    includes: ['4 hours coverage', '80+ edited photos', 'Commercial license', 'Online delivery'],
    applicableTypes: ['Commercial', 'Branding', 'Corporate'],
    active: false,
    sortOrder: 5,
  },
]

/* ------------------------------------------------------------------ */
/*  Tab config                                                          */
/* ------------------------------------------------------------------ */

interface TabDef {
  key: BookingTabKey
  label: string
  icon: React.ElementType
}

const TABS: TabDef[] = [
  { key: 'inbox',       label: 'Inbox',       icon: Inbox },
  { key: 'packages',    label: 'Packages',    icon: Package },
  { key: 'calendar',    label: 'Calendar',    icon: CalendarDays },
  { key: 'page-editor', label: 'Page Editor', icon: Globe },
  { key: 'settings',    label: 'Settings',    icon: Settings },
]

/* ------------------------------------------------------------------ */
/*  Stat pill                                                           */
/* ------------------------------------------------------------------ */

interface StatPillProps {
  icon: React.ElementType
  label: string
  value: string
  color: string
}

function StatPill({ icon: Icon, label, value, color }: StatPillProps) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: `${color}22` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div>
        <p className="font-mono text-[14px] font-bold text-white/90">{value}</p>
        <p className="text-[10px] text-white/40">{label}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Add Booking Modal                                                   */
/* ------------------------------------------------------------------ */

interface AddBookingModalProps {
  onClose: () => void
  onSave: (data: BookingRecord) => void
  defaultStage?: BookingRecord['stage']
}

const BOOKING_TYPES: BookingType[] = [
  'Wedding', 'Engagement', 'Portrait', 'Family', 'Newborn', 'Maternity',
  'Commercial', 'Branding', 'Corporate', 'Event', 'Mini Session', 'Elopement', 'Other',
]

function AddBookingModal({ onClose, onSave, defaultStage = 'inquiry' }: AddBookingModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [bookingType, setBookingType] = useState<BookingType>('Wedding')
  const [priceStr, setPriceStr] = useState('')
  const [shootDate, setShootDate] = useState('')
  const [stage, setStage] = useState<BookingRecord['stage']>(defaultStage)
  const [notes, setNotes] = useState('')

  function handleSave() {
    if (!clientName.trim() || !clientEmail.trim()) return
    const priceCents = Math.round(parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0') * 100)
    const now = new Date().toISOString()
    onSave({
      id: `b-${Date.now()}`,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      bookingType,
      price: priceStr.trim() ? `$${priceStr.replace(/[^0-9.]/g, '')}` : '',
      priceCents,
      depositCents: Math.round(priceCents * 0.25),
      depositPaid: false,
      stage,
      shootDate: shootDate || undefined,
      createdAt: now,
      updatedAt: now,
      notes: notes.trim() || undefined,
    })
  }

  const isValid = clientName.trim().length > 0 && clientEmail.trim().length > 0

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
          <h3 className="text-[16px] font-bold text-white">New Booking</h3>
          <button onClick={onClose} className="rounded-xl p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-white/40 mb-1">Client Name *</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Sarah Mitchell"
              className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1">Email *</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="sarah@email.com"
              className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Booking Type</label>
              <div className="relative">
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value as BookingType)}
                  className="w-full appearance-none rounded-xl px-3 py-2.5 pr-8 text-[13px] text-white/90 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {BOOKING_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-white/40 mb-1">Stage</label>
              <div className="relative">
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as BookingRecord['stage'])}
                  className="w-full appearance-none rounded-xl px-3 py-2.5 pr-8 text-[13px] text-white/90 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {(['inquiry','quoted','booked','shooting','delivered','paid'] as const).map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Price</label>
              <input
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="2500"
                className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
                style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
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
            <label className="block text-[11px] text-white/40 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Client vision, location, special requests…"
              rows={2}
              className="w-full resize-none rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 px-5 py-2 text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 px-5 py-2 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Plus size={13} />
            Add Booking
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BookingDashboardView                                               */
/* ------------------------------------------------------------------ */

interface BookingDashboardViewProps {
  initialBookings: BookingRecord[]
  initialPackages: BookingPackage[]
  photographerSlug: string
}

export function BookingDashboardView({
  initialBookings,
  initialPackages,
  photographerSlug,
}: BookingDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<BookingTabKey>('inbox')
  const [bookings, setBookings] = useState<BookingRecord[]>(
    initialBookings.length > 0 ? initialBookings : MOCK_BOOKINGS,
  )
  const [packages, setPackages] = useState<BookingPackage[]>(
    initialPackages.length > 0 ? initialPackages : MOCK_PACKAGES,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addDefaultStage, setAddDefaultStage] = useState<BookingRecord['stage']>('inquiry')

  /* Stats */
  const stats = useMemo(() => {
    const total = bookings.length
    const activeCount = bookings.filter((b) => !['paid'].includes(b.stage)).length
    const totalRevenue = bookings
      .filter((b) => b.stage === 'paid')
      .reduce((sum, b) => sum + b.priceCents, 0)
    const thisMonthCount = bookings.filter((b) => {
      const d = new Date(b.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return {
      total,
      activeCount,
      totalRevenue: `$${Math.floor(totalRevenue / 100).toLocaleString('en-US')}`,
      thisMonthCount,
    }
  }, [bookings])

  function handleAddBooking(booking: BookingRecord) {
    setBookings((prev) => [booking, ...prev])
    setShowAddModal(false)
  }

  function handleOpenAddModal(stage: BookingRecord['stage'] = 'inquiry') {
    setAddDefaultStage(stage)
    setShowAddModal(true)
  }

  function handleUpdateBooking(updated: BookingRecord) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    // TODO: persist to Supabase bookings table
  }

  function handleDeleteBooking(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
    // TODO: soft-delete in Supabase bookings table
  }

  function handleUpdatePackage(updated: BookingPackage) {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    // TODO: persist to Supabase packages table
  }

  function handleDeletePackage(id: string) {
    setPackages((prev) => prev.filter((p) => p.id !== id))
    // TODO: soft-delete in Supabase packages table
  }

  function handleAddPackage(pkg: BookingPackage) {
    setPackages((prev) => [...prev, pkg])
    // TODO: insert into Supabase packages table
  }

  function handleReorderPackages(reordered: BookingPackage[]) {
    setPackages(reordered)
    // TODO: batch-update sortOrder in Supabase packages table
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <CalendarCheck size={22} className="text-violet-400 shrink-0" />
              <h1 className="text-[28px] font-extrabold italic text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Bookings
              </h1>
            </div>
            <p className="mt-1 text-[13px] text-white/45">
              Manage your booking pipeline, packages, and public booking page
            </p>
          </div>

          {/* Stats + CTA row */}
          <div className="flex flex-wrap items-center gap-3">
            <StatPill icon={Users}       label="Active"       value={String(stats.activeCount)}   color="#60A5FA" />
            <StatPill icon={TrendingUp}  label="Paid out"     value={stats.totalRevenue}          color="#34D399" />
            <StatPill icon={DollarSign}  label="This month"   value={String(stats.thisMonthCount)} color="#FBBF24" />

            <a
              href={`/book/${photographerSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-[13px] font-medium text-white/60 hover:border-violet-400/40 hover:text-violet-300 transition-colors"
            >
              <Globe size={14} />
              View Page
              <ExternalLink size={11} className="opacity-60" />
            </a>

            <button
              onClick={() => handleOpenAddModal('inquiry')}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              New Booking
            </button>
          </div>
        </div>

        {/* Search bar (visible on Inbox tab) */}
        {activeTab === 'inbox' && (
          <div className="mt-4 flex items-center gap-3">
            <div
              className="flex flex-1 max-w-sm items-center gap-2.5 rounded-2xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <Search size={14} className="text-white/30 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client, type…"
                className="flex-1 bg-transparent text-[13px] text-white/80 placeholder:text-white/30 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white/60 transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-1 overflow-x-auto px-6 pb-0 scrollbar-hide"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 shrink-0 px-4 py-3 text-[13px] font-medium transition-all border-b-2 -mb-px ${
                active
                  ? 'text-violet-400 border-violet-400'
                  : 'text-white/40 border-transparent hover:text-white/70 hover:border-white/20'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {activeTab === 'inbox' && (
          <BookingInboxView
            bookings={bookings}
            searchQuery={searchQuery}
            onAddBooking={handleOpenAddModal}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        )}
        {activeTab === 'packages' && (
          <BookingPackagesView
            packages={packages}
            onUpdatePackage={handleUpdatePackage}
            onDeletePackage={handleDeletePackage}
            onAddPackage={handleAddPackage}
            onReorderPackages={handleReorderPackages}
          />
        )}
        {activeTab === 'calendar' && (
          <BookingCalendarView bookings={bookings} />
        )}
        {activeTab === 'page-editor' && (
          <BookingPageEditorView
            photographerSlug={photographerSlug}
            packages={packages}
          />
        )}
        {activeTab === 'settings' && (
          <BookingSettingsView photographerSlug={photographerSlug} />
        )}
      </div>

      {/* Add booking modal */}
      {showAddModal && (
        <AddBookingModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddBooking}
          defaultStage={addDefaultStage}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Booking Settings (inline — lightweight)                            */
/* ------------------------------------------------------------------ */

function BookingSettingsView({ photographerSlug }: { photographerSlug: string }) {
  const [slug, setSlug] = useState(photographerSlug)
  const [depositPercent, setDepositPercent] = useState(25)
  const [instantBooking, setInstantBooking] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [autoReply, setAutoReply] = useState(true)

  const publicUrl = `view1.studio/book/${slug}`

  return (
    <div className="px-6 py-6 max-w-2xl space-y-5">
      {/* Booking URL */}
      <section
        className="rounded-3xl p-5 space-y-3"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <h3 className="text-[13px] font-bold text-white">Booking Page URL</h3>
        <p className="text-[12px] text-white/45">This is the public link clients use to book you.</p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-white/40 font-mono shrink-0">view1.studio/book/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            className="flex-1 rounded-xl px-3 py-2 text-[13px] font-mono text-white/90 outline-none"
            style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        </div>
        <p className="text-[11px] text-white/30 font-mono">{publicUrl}</p>
      </section>

      {/* Deposit settings */}
      <section
        className="rounded-3xl p-5 space-y-4"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <h3 className="text-[13px] font-bold text-white">Payment Settings</h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-white/60">Deposit percentage</span>
            <span className="font-mono text-[13px] font-bold text-violet-400">{depositPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={depositPercent}
            onChange={(e) => setDepositPercent(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <p className="text-[11px] text-white/30">
            Clients pay {depositPercent}% upfront to confirm their booking.
            {/* TODO: Stripe Connect required for deposit collection */}
          </p>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-[13px] text-white/80">Instant Booking</p>
            <p className="text-[11px] text-white/35 mt-0.5">Skip approval — confirm bookings automatically</p>
          </div>
          <button
            onClick={() => setInstantBooking(!instantBooking)}
            className={`relative h-6 w-11 rounded-full transition-colors ${instantBooking ? 'bg-violet-500' : 'bg-white/20'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${instantBooking ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </section>

      {/* Notification settings */}
      <section
        className="rounded-3xl p-5 space-y-3"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <h3 className="text-[13px] font-bold text-white">Notifications</h3>
        {[
          { label: 'Email me on new inquiry', value: emailNotifications, setter: setEmailNotifications },
          { label: 'Send auto-reply to client', value: autoReply, setter: setAutoReply },
        ].map(({ label, value, setter }) => (
          <div key={label} className="flex items-center justify-between py-1.5">
            <span className="text-[13px] text-white/70">{label}</span>
            <button
              onClick={() => setter(!value)}
              className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-violet-500' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
        <p className="text-[11px] text-white/25 pt-1">
          {/* TODO: Resend email integration required for notifications */}
          Email delivery requires Resend integration (see Missing Infrastructure in BUILD-STATE.md).
        </p>
      </section>

      {/* Save button */}
      <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 px-5 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity">
        Save Settings
      </button>
    </div>
  )
}
