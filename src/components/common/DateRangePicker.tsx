'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar, ChevronDown } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0] as string
}

type Preset = {
  label: string
  from: string
  to: string
}

function buildPresets(): Preset[] {
  const now = new Date()
  const today = isoDate(now)

  const d7 = new Date(now)
  d7.setDate(now.getDate() - 7)

  const d30 = new Date(now)
  d30.setDate(now.getDate() - 30)

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const qMonth = Math.floor(now.getMonth() / 3) * 3
  const thisQuarterStart = new Date(now.getFullYear(), qMonth, 1)

  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31)

  return [
    { label: 'Last 7 days', from: isoDate(d7), to: today },
    { label: 'Last 30 days', from: isoDate(d30), to: today },
    { label: 'This Month', from: isoDate(thisMonthStart), to: today },
    { label: 'Last Month', from: isoDate(lastMonthStart), to: isoDate(lastMonthEnd) },
    { label: 'This Quarter', from: isoDate(thisQuarterStart), to: today },
    { label: 'Last Year', from: isoDate(lastYearStart), to: isoDate(lastYearEnd) },
  ]
}

function formatBadge(from: string, to: string): string {
  const parse = (s: string) => new Date(s + 'T00:00:00')
  const fromFmt = parse(from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const toFmt = parse(to).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${fromFmt} – ${toFmt}`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface DateRangePickerProps {
  defaultFrom?: string
  defaultTo?: string
  /** Extra Tailwind classes on the trigger button */
  className?: string
}

export function DateRangePicker({
  defaultFrom = '',
  defaultTo = '',
  className = '',
}: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentFrom = searchParams.get('from') ?? defaultFrom
  const currentTo = searchParams.get('to') ?? defaultTo

  const [open, setOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customFrom, setCustomFrom] = useState(currentFrom)
  const [customTo, setCustomTo] = useState(currentTo)

  const presets = buildPresets()

  const applyRange = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('from', from)
      params.set('to', to)
      router.replace(`${pathname}?${params.toString()}`)
      setOpen(false)
      setShowCustom(false)
    },
    [router, pathname, searchParams],
  )

  const applyCustom = useCallback(() => {
    if (customFrom && customTo && customFrom <= customTo) {
      applyRange(customFrom, customTo)
    }
  }, [customFrom, customTo, applyRange])

  const isActive = (p: Preset) => currentFrom === p.from && currentTo === p.to

  const label =
    currentFrom && currentTo ? formatBadge(currentFrom, currentTo) : 'Last 30 days'

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white/90 ${className}`}
      >
        <Calendar className="h-3.5 w-3.5" />
        {label}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown panel */}
          <div
            className="absolute right-0 top-full z-50 mt-1.5 min-w-[220px] rounded-2xl p-2"
            style={{
              background: 'rgba(20,18,38,0.97)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.55)',
            }}
          >
            {/* Preset buttons */}
            <div className="flex flex-col gap-0.5">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyRange(preset.from, preset.to)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-[12px] transition-colors ${
                    isActive(preset)
                      ? 'bg-white/[0.14] font-semibold text-white'
                      : 'text-white/65 hover:bg-white/[0.08] hover:text-white/90'
                  }`}
                >
                  {preset.label}
                  {isActive(preset) && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  )}
                </button>
              ))}

              {/* Custom toggle */}
              <button
                onClick={() => setShowCustom((v) => !v)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-[12px] transition-colors ${
                  showCustom
                    ? 'bg-white/[0.10] text-white'
                    : 'text-white/65 hover:bg-white/[0.08] hover:text-white/90'
                }`}
              >
                Custom range
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-150 ${
                    showCustom ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Custom date inputs */}
            {showCustom && (
              <div
                className="mt-1.5 flex flex-col gap-2 rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                      From
                    </label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1.5 text-[11px] text-white outline-none focus:border-indigo-400/50 [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                      To
                    </label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1.5 text-[11px] text-white outline-none focus:border-indigo-400/50 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <button
                  onClick={applyCustom}
                  disabled={!customFrom || !customTo || customFrom > customTo}
                  className="rounded-xl bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  Apply range
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
