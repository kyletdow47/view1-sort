'use client'

import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { Booking } from '@/types/supabase'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CalendarViewProps {
  bookings: Booking[]
  todayYear: number
  todayMonth: number
  todayDay: number
}

export function CalendarView({ bookings, todayYear, todayMonth, todayDay }: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(todayYear)
  const [currentMonth, setCurrentMonth] = useState(todayMonth)
  const [selectedDay, setSelectedDay] = useState<number | null>(todayDay)

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  function bookingsForDay(day: number): Booking[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.filter((b) => b.shoot_date === dateStr)
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11) }
    else setCurrentMonth((m) => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0) }
    else setCurrentMonth((m) => m + 1)
    setSelectedDay(null)
  }

  const isToday = (day: number) =>
    currentYear === todayYear && currentMonth === todayMonth && day === todayDay

  const selectedBookings = selectedDay ? bookingsForDay(selectedDay) : []
  const selectedBooking = selectedBookings[0] ?? null

  const cells: React.ReactNode[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(
      <div
        key={`e-${i}`}
        className="h-28 border-r border-b border-outline-variant/5 bg-surface-container-lowest/20"
      />,
    )
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayBookings = bookingsForDay(d)
    const hasEvent = dayBookings.length > 0
    const isSelected = selectedDay === d

    cells.push(
      <div
        key={d}
        onClick={() => setSelectedDay(d)}
        className={[
          'h-28 border-r border-b border-outline-variant/5 p-2 transition-all cursor-pointer group relative',
          isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-high/20',
          isToday(d) && !isSelected ? 'bg-surface-container-high/40' : '',
        ].join(' ')}
      >
        <div className="flex justify-between items-start">
          <span
            className={[
              'text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all',
              isSelected
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant/40 group-hover:text-on-surface',
              isToday(d) && !isSelected ? 'ring-1 ring-primary/40 text-primary' : '',
            ].join(' ')}
          >
            {d}
          </span>
          {hasEvent && (
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {dayBookings.length > 1 && (
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              )}
            </div>
          )}
        </div>

        {hasEvent && (
          <div className="mt-2 space-y-1 overflow-hidden">
            {dayBookings.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className="px-2 py-1 bg-surface-container-high rounded-md border-l-2 border-primary overflow-hidden"
              >
                <p className="text-[9px] font-headline font-bold text-on-surface truncate">
                  {b.client_name}
                </p>
                {b.shoot_time && (
                  <p className="text-[8px] font-mono text-on-surface-variant/60 uppercase tracking-widest truncate">
                    {b.shoot_time}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>,
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Studio Availability
          </h2>
          <p className="text-on-surface-variant font-body mt-2">
            Manage your shoot schedule, availability slots, and booking confirmations.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all border border-outline-variant/10 text-on-surface">
            <Search className="w-4 h-4" />
            Find Slot
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary rounded-xl text-xs font-mono font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            <Plus className="w-4 h-4" />
            Add Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden shadow-sm">
            {/* Month header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-headline font-extrabold tracking-tighter italic text-on-surface">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <div className="flex gap-1 p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-surface-container-high text-primary rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest">
                  Month
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-outline-variant/10 bg-surface-container-high/30">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/60"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">{cells}</div>
          </div>
        </div>

        {/* Day Inspector */}
        <div className="lg:col-span-4 space-y-6">
          {selectedDay ? (
            <div
              key={`${currentMonth}-${selectedDay}`}
              className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest mb-1">
                    Agenda for
                  </p>
                  <h3 className="text-3xl font-headline font-extrabold tracking-tighter italic text-on-surface">
                    {MONTHS[currentMonth]} {selectedDay}, {currentYear}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-xl font-mono font-bold text-on-surface">
                  {selectedDay}
                </div>
              </div>

              <div className="space-y-4">
                {selectedBookings.length > 0 ? (
                  selectedBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 space-y-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                      <div className="flex justify-between items-start">
                        <div>
                          {b.package_type && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-mono font-bold uppercase tracking-widest rounded-md">
                              {b.package_type}
                            </span>
                          )}
                          <h4 className="text-xl font-headline font-bold mt-2 text-on-surface">
                            {b.client_name}
                          </h4>
                        </div>
                        <div
                          className={[
                            'flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest',
                            b.status === 'confirmed' ? 'text-secondary' : 'text-tertiary',
                          ].join(' ')}
                        >
                          {b.status === 'confirmed' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {b.status}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {b.shoot_time && (
                          <div className="flex items-center gap-3 text-on-surface-variant/60">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-headline">{b.shoot_time}</span>
                          </div>
                        )}
                        {b.location && (
                          <div className="flex items-center gap-3 text-on-surface-variant/60">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs font-headline">{b.location}</span>
                          </div>
                        )}
                        {b.client_email && (
                          <div className="flex items-center gap-3 text-on-surface-variant/60">
                            <User className="w-4 h-4" />
                            <span className="text-xs font-headline">{b.client_email}</span>
                          </div>
                        )}
                        {b.amount_cents != null && (
                          <p className="text-sm font-bold text-on-surface">
                            ${(b.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                          </p>
                        )}
                      </div>

                      {b.notes && (
                        <p className="text-xs text-on-surface-variant/60 border-t border-outline-variant/10 pt-3">
                          {b.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant/40 gap-4 border-2 border-dashed border-outline-variant/10 rounded-2xl">
                    <CalendarIcon className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-headline italic">No events scheduled</p>
                    <button className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary hover:underline">
                      + Add Booking
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-outline-variant/10">
                <h4 className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest font-bold mb-4">
                  Availability Slots
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {['09:00 - 11:00', '13:00 - 15:00', '16:00 - 18:00'].map((slot) => (
                    <button
                      key={slot}
                      className="py-2 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-[9px] font-mono text-on-surface-variant/60 hover:border-primary/40 hover:text-primary transition-all"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-sm h-96 flex flex-col items-center justify-center text-on-surface-variant/40 gap-4">
              <CalendarIcon className="w-16 h-16 opacity-10" />
              <p className="text-sm font-headline italic">Select a day to view agenda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
