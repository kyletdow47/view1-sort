'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Camera, Clock, DollarSign, Check } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

interface Service {
  id: string
  name: string
  price: string
  duration: string
  priceValue: number
}

const SERVICES: Service[] = [
  { id: 's1', name: 'Portrait Session',       price: '$250',  duration: '30 min',   priceValue: 250  },
  { id: 's2', name: 'Wedding Consultation',   price: 'Free',  duration: '30 min',   priceValue: 0    },
  { id: 's3', name: 'Commercial Shoot',       price: '$500',  duration: '120 min',  priceValue: 500  },
  { id: 's4', name: 'Event Coverage',         price: '$400',  duration: '90 min',   priceValue: 400  },
  { id: 's5', name: 'Mini Session',           price: '$150',  duration: '20 min',   priceValue: 150  },
]

const TIME_SLOTS = ['10:00 AM', '1:00 PM', '3:30 PM', '5:00 PM']

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// April 10, 2026 is highlighted as selected date
const AVAILABLE_DAYS = [2, 4, 7, 9, 10, 12, 14, 16, 17, 21, 23, 24, 28, 30]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PublicBookingPage() {
  const [selectedService, setSelectedService] = useState<string | null>('s1')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(10)
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00 AM')
  const [payDeposit, setPayDeposit] = useState(true)

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedServiceObj = SERVICES.find((s) => s.id === selectedService)
  const depositAmount = selectedServiceObj ? Math.round(selectedServiceObj.priceValue * 0.25) : 0

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: '#050508',
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-12 gap-6">

          {/* ===== Left: Photographer + Services ===== */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-5">
            {/* Photographer profile */}
            <div className="flex flex-col items-start gap-3">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-[20px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
              >
                JD
              </div>
              <div>
                <h1 className="text-[22px] font-bold text-white">Jessica Davis</h1>
                <p className="text-[13px] text-white/55">Wedding &amp; Portrait Photographer</p>
              </div>
            </div>

            {/* Service list */}
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">Select a service</p>
              {SERVICES.map((service) => {
                const active = selectedService === service.id
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all"
                    style={{
                      background: active ? 'rgba(99,102,241,0.20)' : 'rgba(255,255,255,0.07)',
                      border: `1px solid ${active ? 'rgba(99,102,241,0.50)' : 'rgba(255,255,255,0.10)'}`,
                    }}
                  >
                    {/* Selection indicator */}
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: active ? '#6366F1' : 'transparent',
                        border: `2px solid ${active ? '#6366F1' : 'rgba(255,255,255,0.25)'}`,
                      }}
                    >
                      {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white/90">{service.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-white/45">
                        <Clock className="h-3 w-3" />
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    <span
                      className="shrink-0 text-[13px] font-bold"
                      style={{ color: active ? '#A5B4FC' : 'rgba(255,255,255,0.65)' }}
                    >
                      {service.price}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Photographer info */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4 text-white/40" />
                <span className="text-[12px] font-medium text-white/60">About Jessica</span>
              </div>
              <p className="text-[12px] text-white/45 leading-relaxed">
                Award-winning wedding and portrait photographer based in San Francisco. 8+ years capturing life&apos;s most precious moments.
              </p>
            </div>
          </div>

          {/* ===== Right: Calendar + Form ===== */}
          <div className="col-span-12 md:col-span-8 flex flex-col gap-5">
            {/* Calendar */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {/* Calendar header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[15px] font-semibold text-white">{monthName}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-medium text-white/35">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  const isAvailable = day ? AVAILABLE_DAYS.includes(day) : false
                  const isSelected = day === selectedDay
                  return (
                    <button
                      key={i}
                      disabled={!isAvailable}
                      onClick={() => day && setSelectedDay(day)}
                      className={`flex aspect-square items-center justify-center rounded-xl text-[13px] font-medium transition-colors ${
                        !day
                          ? 'invisible'
                          : isSelected
                          ? 'font-bold text-white'
                          : isAvailable
                          ? 'text-white/80 hover:bg-white/15'
                          : 'cursor-default text-white/20'
                      }`}
                      style={
                        isSelected
                          ? { background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }
                          : {}
                      }
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDay && (
              <div>
                <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-white/40">
                  Available times for Apr {selectedDay}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((time) => {
                    const active = selectedTime === time
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className="rounded-xl px-5 py-2 text-[13px] font-medium transition-all"
                        style={{
                          background: active ? 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' : 'rgba(255,255,255,0.08)',
                          border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                          color: active ? '#ffffff' : 'rgba(255,255,255,0.70)',
                        }}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Booking form */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <p className="mb-4 text-[14px] font-semibold text-white">Complete Your Booking</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-white/45">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Mitchell"
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none placeholder:text-white/25"
                    style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-white/45">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@email.com"
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none placeholder:text-white/25"
                    style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-white/45">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none placeholder:text-white/25"
                    style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-white/45">Notes (optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us about your vision…"
                    className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 outline-none placeholder:text-white/25"
                    style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
              </div>

              {/* Deposit toggle */}
              {selectedServiceObj && selectedServiceObj.priceValue > 0 && (
                <div
                  className="mt-4 flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div>
                    <p className="text-[13px] font-medium text-white/80">Pay deposit to confirm</p>
                    <p className="text-[11px] text-white/40">25% to secure your booking</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-bold text-white/90">
                      ${depositAmount}
                    </span>
                    <button
                      onClick={() => setPayDeposit(!payDeposit)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${payDeposit ? 'bg-violet-500' : 'bg-white/20'}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${payDeposit ? 'left-[22px]' : 'left-0.5'}`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm button */}
              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
              >
                <DollarSign className="h-4 w-4" />
                Confirm Booking
                {selectedServiceObj && selectedServiceObj.priceValue > 0 && payDeposit && (
                  <span className="opacity-80">— ${depositAmount} deposit</span>
                )}
              </button>
            </div>

            <p className="text-center text-[11px] text-white/25">
              Powered by View1 Studio · No account required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
