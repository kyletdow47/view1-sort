'use client'

import { GlassPanel } from './GlassPanel'

const deliveries = [
  {
    dot: 'bg-green-400',
    name: 'Johnson',
    gallery: 'Wedding Gallery',
    status: 'Delivered',
    statusBg: 'bg-green-400/[0.13]',
  },
  {
    dot: 'bg-amber-400',
    name: 'Smith Corp',
    gallery: 'Headshots',
    status: 'Pending',
    statusBg: 'bg-white/[0.08]',
  },
  {
    dot: 'bg-blue-400',
    name: 'Travel Blog',
    gallery: 'Portugal Set',
    status: 'Processing',
    statusBg: 'bg-white/[0.08]',
  },
]

export function ProjectDeliveries() {
  return (
    <GlassPanel variant="subtle" className="flex h-full flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-headline text-[14px] font-semibold text-white">
          Project Deliveries
        </span>
        <div className="rounded-full bg-white/15 px-2.5 py-1">
          <span className="text-[11px] font-medium text-white">3 unpaid</span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-1 flex-col gap-2">
        {deliveries.map((d, i) => (
          <div
            key={i}
            className="flex flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.08] p-3"
          >
            <div className={`h-2 w-2 shrink-0 rounded-full ${d.dot}`} />
            <span className="text-[13px] font-medium text-white">{d.name}</span>
            <span className="text-xs text-white/50">&rarr;</span>
            <span className="text-xs text-white/70">{d.gallery}</span>
            <div className="flex-1" />
            <div className={`rounded-full ${d.statusBg} px-2 py-0.5`}>
              <span className="text-[11px] font-medium text-white">
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
