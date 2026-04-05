'use client'

import {
  FunnelChart,
  Funnel,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import type { DateRange } from '@/types/analytics'

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const FUNNEL_STEPS = [
  { label: 'Inquiries', value: 72, color: '#60A5FA' },
  { label: 'Quotes Sent', value: 48, color: '#818CF8' },
  { label: 'Booked', value: 31, color: '#A78BFA' },
  { label: 'Contracted', value: 28, color: '#C084FC' },
  { label: 'Completed', value: 26, color: '#34D399' },
  { label: 'Paid', value: 24, color: '#10B981' },
]

const LEAD_SOURCES = [
  { source: 'Instagram', count: 28, color: '#EC4899', pct: 39 },
  { source: 'Google', count: 18, color: '#60A5FA', pct: 25 },
  { source: 'Referral', count: 14, color: '#34D399', pct: 19 },
  { source: 'Website', count: 8, color: '#FBBF24', pct: 11 },
  { source: 'Other', count: 4, color: '#94A3B8', pct: 6 },
]

const AVG_TIMES = [
  { stage: 'Inquiry → Quote', days: 1.2 },
  { stage: 'Quote → Booked', days: 3.4 },
  { stage: 'Booked → Contracted', days: 0.8 },
  { stage: 'Contracted → Shoot', days: 42.0 },
  { stage: 'Shoot → Gallery', days: 14.3 },
  { stage: 'Gallery → Paid', days: 7.6 },
]

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {children}
    </div>
  )
}

function FunnelTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: { label: string; value: number } }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: 'rgba(26,24,46,0.95)', border: '1px solid rgba(255,255,255,0.18)' }}
    >
      <p className="font-semibold text-white/80">{d.label}</p>
      <p className="font-mono text-indigo-400">{d.value} leads</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab                                                                */
/* ------------------------------------------------------------------ */

interface LeadsTabProps {
  dateRange: DateRange
}

export function LeadsTab({ dateRange }: LeadsTabProps) {
  // TODO(analytics-api): fetch real lead conversion data for dateRange
  void dateRange

  const conversionRate = Math.round(
    ((FUNNEL_STEPS.at(-1)?.value ?? 0) / (FUNNEL_STEPS[0]?.value ?? 1)) * 100,
  )

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Inquiries', value: '72', change: '+8%', color: '#60A5FA' },
          { label: 'Booking Rate', value: '43%', change: '+5%', color: '#A78BFA' },
          { label: 'End-to-End Conv.', value: `${conversionRate}%`, change: '+2%', color: '#34D399' },
          { label: 'Avg. Lead Value', value: '$1,850', change: '+$120', color: '#FBBF24' },
        ].map((s) => (
          <GlassCard key={s.label} className="flex flex-col gap-2">
            <span className="text-[11px] text-white/50">{s.label}</span>
            <p className="font-mono text-[22px] font-bold leading-none text-white">{s.value}</p>
            <span className="text-[11px] font-medium" style={{ color: s.color }}>
              {s.change} vs prior period
            </span>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Funnel chart */}
        <GlassCard className="col-span-5 flex flex-col gap-3">
          <span className="text-[13px] font-semibold text-white">Conversion Funnel</span>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip content={<FunnelTooltip />} />
                <Funnel
                  dataKey="value"
                  data={FUNNEL_STEPS.map((s) => ({ ...s, fill: s.color, name: s.label }))}
                  isAnimationActive
                >
                  <LabelList
                    position="right"
                    fill="rgba(255,255,255,0.60)"
                    stroke="none"
                    dataKey="label"
                    style={{ fontSize: '11px' }}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <div
            className="pt-2 text-[11px] text-white/35"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {FUNNEL_STEPS[0]!.value} inquiries → {FUNNEL_STEPS.at(-1)!.value} paid ({conversionRate}% end-to-end)
          </div>
        </GlassCard>

        {/* Lead sources */}
        <GlassCard className="col-span-4 flex flex-col gap-3">
          <span className="text-[13px] font-semibold text-white">Lead Sources</span>
          <div className="flex flex-col gap-2.5">
            {LEAD_SOURCES.map((src) => (
              <div key={src.source} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-[12px] text-white/65">{src.source}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-white/[0.08]" style={{ height: '6px' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${src.pct}%`, background: src.color }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-mono text-[12px] font-semibold text-white/75">
                  {src.count}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Average time per stage */}
        <GlassCard className="col-span-3 flex flex-col gap-3">
          <span className="text-[13px] font-semibold text-white">Avg. Stage Duration</span>
          <div className="flex flex-col gap-2">
            {AVG_TIMES.map((t) => (
              <div
                key={t.stage}
                className="flex items-center justify-between rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-[11px] text-white/55">{t.stage}</span>
                <span className="font-mono text-[11px] font-bold text-white/80">
                  {t.days < 1 ? `${Math.round(t.days * 24)}h` : `${t.days}d`}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
