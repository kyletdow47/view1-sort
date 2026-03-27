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
  MapPin,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaces } from '@/lib/queries/projects'
import type { Booking, BookingStatus } from '@/types/supabase'

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const statusConfig: Record<BookingStatus, {
  label: string
  color: string
  icon: React.ElementType
  bg: string
}> = {
  pending: { label: 'Pending', color: 'text-[#ffb780]', icon: AlertCircle, bg: 'bg-[#ffb780]/15' },
  confirmed: { label: 'Confirmed', color: 'text-[#95d1d1]', icon: CheckCircle2, bg: 'bg-[#95d1d1]/15' },
  completed: { label: 'Completed', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/15' },
  cancelled: { label: 'Cancelled', color: 'text-[#e7765f]', icon: XCircle, bg: 'bg-[#e7765f]/15' },
}

const pipelineColumns: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

/* ------------------------------------------------------------------ */
/*  Sub-components (pure render — no client state needed)              */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
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
  const initials = booking.client_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()

  const shootDate = new Date(booking.shoot_date + 'T00:00:00')
  const formattedDate = shootDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 hover:border-outline-variant/40 transition-colors space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary flex-shrink-0">
          {initials}
        </div>
        <span className="text-sm font-medium text-on-surface truncate">
          {booking.client_name}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <CalendarDays size={12} className="text-on-surface-variant/50" />
          {formattedDate}
          {booking.shoot_time && ` at ${booking.shoot_time}`}
        </div>
        {booking.package_type && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Camera size={12} className="text-on-surface-variant/50" />
            {booking.package_type}
          </div>
        )}
        {booking.location && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
            <MapPin size={12} className="text-on-surface-variant/40" />
            {booking.location}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15">
        <span className="text-sm font-bold text-on-surface">
          {booking.amount_cents != null
            ? `$${(booking.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
            : '—'}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  )
}

function MiniCalendar({
  bookedDays,
  pendingDays,
}: {
  bookedDays: number[]
  pendingDays: number[]
}) {
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const now = new Date()
  const today = now.getDate()
  const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  // First day of month (0=Sun)
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-on-surface">{monthLabel}</h3>
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
        {dayNames.map((d, i) => (
          <div
            key={`h-${i}`}
            className="flex h-8 items-center justify-center text-[10px] font-medium text-on-surface-variant/40"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="h-8" />
          const isToday = day === today
          const isBooked = bookedDays.includes(day)
          const isPending = pendingDays.includes(day)
          return (
            <div
              key={`d-${day}`}
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

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const workspaces = await getWorkspaces(supabase, user.id)
  const workspace = workspaces[0]

  let bookings: Booking[] = []

  if (workspace) {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('shoot_date', { ascending: true })

    bookings = (data ?? []) as Booking[]
  }

  const upcoming = bookings.filter((b) => b.status === 'confirmed').length
  const pending = bookings.filter((b) => b.status === 'pending').length
  const completed = bookings.filter((b) => b.status === 'completed').length

  // Calendar: compute booked/pending day numbers for current month
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed
  const bookedDays = bookings
    .filter((b) => b.status === 'confirmed')
    .map((b) => new Date(b.shoot_date + 'T00:00:00'))
    .filter((d) => d.getFullYear() === currentYear && d.getMonth() === currentMonth)
    .map((d) => d.getDate())

  const pendingDays = bookings
    .filter((b) => b.status === 'pending')
    .map((b) => new Date(b.shoot_date + 'T00:00:00'))
    .filter((d) => d.getFullYear() === currentYear && d.getMonth() === currentMonth)
    .map((d) => d.getDate())

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
              const columnBookings = bookings.filter((b) => b.status === status)
              return (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={config.color} />
                      <span className="text-sm font-medium text-on-surface">{config.label}</span>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-highest text-[10px] font-medium text-on-surface-variant">
                      {columnBookings.length}
                    </span>
                  </div>

                  <div className={`h-1 rounded-full ${config.bg}`} />

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
          <MiniCalendar bookedDays={bookedDays} pendingDays={pendingDays} />
        </div>
      </div>
    </div>
  )
}
