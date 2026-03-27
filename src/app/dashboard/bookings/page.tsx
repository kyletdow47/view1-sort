'use client'

import { useState } from 'react'
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Camera,
  Users,
  DollarSign,
  MapPin,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                   */
/* ------------------------------------------------------------------ */

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

interface Booking {
  id: string
  clientName: string
  clientInitials: string
  date: string
  time: string
  packageType: string
  amount: number
  status: BookingStatus
  location: string
}

const mockBookings: Booking[] = [
  { id: 'bk-001', clientName: 'Sarah Mitchell', clientInitials: 'SM', date: '2026-03-28', time: '10:00 AM', packageType: 'Wedding Full Day', amount: 2800, status: 'confirmed', location: 'The Plaza Hotel' },
  { id: 'bk-002', clientName: 'James Rivera', clientInitials: 'JR', date: '2026-03-30', time: '2:00 PM', packageType: 'Portrait Session', amount: 450, status: 'confirmed', location: 'Central Park' },
  { id: 'bk-003', clientName: 'Elena Vasquez', clientInitials: 'EV', date: '2026-04-02', time: '11:00 AM', packageType: 'Engagement Shoot', amount: 650, status: 'pending', location: 'Brooklyn Bridge' },
  { id: 'bk-004', clientName: 'Michael Chen', clientInitials: 'MC', date: '2026-04-05', time: '9:00 AM', packageType: 'Corporate Headshots', amount: 1200, status: 'pending', location: 'Client Office' },
  { id: 'bk-005', clientName: 'Olivia Kim', clientInitials: 'OK', date: '2026-04-08', time: '3:00 PM', packageType: 'Family Session', amount: 550, status: 'pending', location: 'Riverside Park' },
  { id: 'bk-006', clientName: 'David Park', clientInitials: 'DP', date: '2026-03-15', time: '10:00 AM', packageType: 'Wedding Half Day', amount: 1800, status: 'completed', location: 'Botanical Gardens' },
  { id: 'bk-007', clientName: 'Lisa Thompson', clientInitials: 'LT', date: '2026-03-12', time: '1:00 PM', packageType: 'Product Photography', amount: 900, status: 'completed', location: 'Studio A' },
  { id: 'bk-008', clientName: 'Anna Kowalski', clientInitials: 'AK', date: '2026-03-20', time: '4:00 PM', packageType: 'Portrait Session', amount: 450, status: 'cancelled', location: 'Central Park' },
]

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: React.ElementType; bg: string }> = {
  pending: { label: 'Pending', color: 'text-[#ffb780]', icon: AlertCircle, bg: 'bg-[#ffb780]/15' },
  confirmed: { label: 'Confirmed', color: 'text-[#95d1d1]', icon: CheckCircle2, bg: 'bg-[#95d1d1]/15' },
  completed: { label: 'Completed', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/15' },
  cancelled: { label: 'Cancelled', color: 'text-[#e7765f]', icon: XCircle, bg: 'bg-[#e7765f]/15' },
}

const pipelineColumns: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{label}</SectionLabel>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-extrabold text-on-surface">{value}</p>
    </div>
  )
}

function BookingCard({ booking }: { booking: Booking }) {
  const config = statusConfig[booking.status]
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 hover:border-outline-variant/40 transition-colors space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
            {booking.clientInitials}
          </div>
          <span className="text-sm font-medium text-on-surface">{booking.clientName}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <CalendarDays size={12} className="text-on-surface-variant/50" />
          {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {booking.time}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <Camera size={12} className="text-on-surface-variant/50" />
          {booking.packageType}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
          <MapPin size={12} className="text-on-surface-variant/40" />
          {booking.location}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15">
        <span className="text-sm font-bold text-on-surface">${booking.amount.toLocaleString()}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>
    </div>
  )
}

function MiniCalendar() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const today = 26
  const bookedDays = [28, 30]
  const pendingDays = [2, 5, 8]

  // March 2026 starts on Sunday (index 0)
  const startDay = 0
  const daysInMonth = 31

  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-on-surface">March 2026</h3>
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-1 text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="rounded-lg p-1 text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={`h-${i}`} className="flex h-8 items-center justify-center text-[10px] font-medium text-on-surface-variant/40">
            {day}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-8" />
          const isToday = day === today
          const isBooked = bookedDays.includes(day)
          const isPending = pendingDays.includes(day)
          return (
            <div
              key={`d-${i}`}
              className={`flex h-8 items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isToday
                  ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600] font-bold'
                  : isBooked
                  ? 'bg-[#95d1d1]/15 text-[#95d1d1]'
                  : isPending
                  ? 'bg-[#ffb780]/10 text-[#ffb780]'
                  : 'text-on-surface-variant/60 hover:bg-surface-container'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-outline-variant/15">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#ffb780] to-[#d48441]" />
          <span className="text-[10px] text-on-surface-variant/50">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#95d1d1]" />
          <span className="text-[10px] text-on-surface-variant/50">Confirmed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffb780]/50" />
          <span className="text-[10px] text-on-surface-variant/50">Pending</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BookingsPage() {
  const upcoming = mockBookings.filter((b) => b.status === 'confirmed').length
  const pending = mockBookings.filter((b) => b.status === 'pending').length
  const completed = mockBookings.filter((b) => b.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl italic font-extrabold text-on-surface flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
              <CalendarDays size={20} className="text-[#4e2600]" />
            </div>
            Bookings
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage your booking pipeline and schedule
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-5 py-2.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Upcoming" value={upcoming} icon={CalendarDays} color="bg-[#95d1d1]/15 text-[#95d1d1]" />
        <StatCard label="Pending" value={pending} icon={Clock} color="bg-[#ffb780]/15 text-[#ffb780]" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} color="bg-emerald-500/15 text-emerald-400" />
      </div>

      {/* Main content: Pipeline + Calendar */}
      <div className="grid grid-cols-12 gap-6">
        {/* Pipeline columns */}
        <div className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-4 gap-4">
            {pipelineColumns.map((status) => {
              const config = statusConfig[status]
              const Icon = config.icon
              const columnBookings = mockBookings.filter((b) => b.status === status)
              return (
                <div key={status} className="space-y-3">
                  {/* Column header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={config.color} />
                      <span className="text-sm font-medium text-on-surface">{config.label}</span>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-highest text-[10px] font-medium text-on-surface-variant">
                      {columnBookings.length}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className={`h-1 rounded-full ${config.bg}`} />

                  {/* Cards */}
                  <div className="space-y-3">
                    {columnBookings.length > 0 ? (
                      columnBookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-outline-variant/20 p-6 flex flex-col items-center gap-2">
                        <Icon size={20} className="text-on-surface-variant/15" />
                        <span className="text-[10px] text-on-surface-variant/30">No bookings</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendar sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <MiniCalendar />
        </div>
      </div>
    </div>
  )
}
