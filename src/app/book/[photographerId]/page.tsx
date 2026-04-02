'use client'

import { useState } from 'react'
import {
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react'

/* ─── Mock Data ───────────────────────────────────────────────────────────── */

const shootTypes = [
  { name: 'Portrait Session', desc: 'Studio or outdoor portraits', price: '$250', duration: '60 min' },
  { name: 'Wedding Consultation', desc: 'Pre-wedding planning', price: 'Free', duration: '30 min' },
  { name: 'Commercial Shoot', desc: 'Product & brand photography', price: '$600', duration: '120 min' },
  { name: 'Event Coverage', desc: 'Conferences & live events', price: '$400', duration: '180 min' },
  { name: 'Mini Session', desc: '15-minute quick session', price: '$150', duration: '30 min' },
]

const timeSlots = ['10:00 AM', '1:00 PM', '3:30 PM', '5:00 PM']

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const availableDates = [3, 7, 8, 10, 11, 14, 17, 18, 21, 24, 25, 28, 29]

/* ─── GlassCard ───────────────────────────────────────────────────────────── */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl backdrop-blur-[32px] p-4 ${className}`}
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)', border: '1px solid rgba(255,255,255,0.18)' }}>
      {children}
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function PublicBookingPage() {
  const [selectedType, setSelectedType] = useState('Portrait Session')
  const [selectedDate, setSelectedDate] = useState(10)
  const [selectedTime, setSelectedTime] = useState('1:00 PM')
  const [depositEnabled, setDepositEnabled] = useState(true)

  const year = 2026
  const month = 3 // April
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return day > 0 && day <= daysInMonth ? day : null
  })

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #3B2D8F 25%, #4A3DA8 50%, #5A4FBF 75%, #6B61D6 100%)' }}>
      <div className="mx-auto flex max-w-[1100px] gap-8 px-6 py-12">
        {/* Left: Photographer Profile */}
        <div className="w-[280px] shrink-0 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/30 text-3xl font-bold text-white ring-4 ring-white/10">
              JD
            </div>
            <h1 className="mt-4 font-headline text-2xl font-bold text-white">Jessica Davis</h1>
            <p className="mt-1 text-sm text-white/60">Wedding &amp; Portrait Photographer</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-white/40">Choose a shoot type</p>
            {shootTypes.map((type) => (
              <button
                key={type.name}
                onClick={() => setSelectedType(type.name)}
                className={`w-full rounded-xl p-3 text-left transition-all ${
                  selectedType === type.name
                    ? 'bg-white/15 ring-2 ring-indigo-400/50'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{type.name}</p>
                  <span className="text-xs font-mono text-white/70">{type.price}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-white/40">{type.desc}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-white/30">
                  <Clock className="h-2.5 w-2.5" /> {type.duration}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Calendar + Form */}
        <div className="flex-1 space-y-6">
          {/* Calendar */}
          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">April 2026</h2>
              <div className="flex gap-1">
                <button className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4" /></button>
                <button className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/10"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-medium uppercase text-white/40">{d}</div>
              ))}
              {calendarDays.map((day, i) => {
                const available = day ? availableDates.includes(day) : false
                const selected = day === selectedDate
                return (
                  <button
                    key={i}
                    disabled={!available}
                    onClick={() => day && setSelectedDate(day)}
                    className={`flex h-10 items-center justify-center rounded-lg text-sm transition-all ${
                      selected
                        ? 'bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400/50'
                        : available
                          ? 'text-white/80 hover:bg-white/10 cursor-pointer'
                          : day
                            ? 'text-white/20 cursor-default'
                            : ''
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </GlassCard>

          {/* Time Slots */}
          <div>
            <p className="mb-2 text-sm font-medium text-white">Available times for Apr {selectedDate}</p>
            <div className="flex gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-xl px-4 py-2 text-sm transition-all ${
                    selectedTime === time
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-white/8 text-white/70 hover:bg-white/15'
                  }`}
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-bold text-white">Complete Your Booking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase text-white/40">Full Name</label>
                <input type="text" placeholder="Jane Smith" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase text-white/40">Email</label>
                <input type="email" placeholder="jane@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase text-white/40">Phone</label>
                <input type="tel" placeholder="+1 (555) 123-4567" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase text-white/40">Notes</label>
                <input type="text" placeholder="Any special requests..." className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
              </div>
            </div>

            {/* Deposit toggle */}
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm text-white/80">Pay deposit to confirm</p>
                <p className="text-[10px] text-white/40">$50 deposit secures your booking</p>
              </div>
              <button
                onClick={() => setDepositEnabled(!depositEnabled)}
                className={`h-5 w-9 rounded-full p-0.5 transition-colors ${depositEnabled ? 'bg-indigo-600' : 'bg-white/20'}`}
              >
                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${depositEnabled ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </GlassCard>

          {/* Confirm Button */}
          <button className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-center font-headline text-lg font-bold text-white hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" /> Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}
