'use client'

import { Images, Calendar } from 'lucide-react'

// ---------------------------------------------------------------------------
// Component — stats panel from the right column (frame XOUvs)
// ---------------------------------------------------------------------------

interface StatsCardProps {
  totalPhotos: number
  galleriesCount: number
}

export function StatsCard({ totalPhotos, galleriesCount }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 backdrop-blur-lg">
      <h3 className="text-[12px] font-medium uppercase tracking-wider text-white/40 mb-4">
        Overview
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Images className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-mono text-2xl font-bold text-white">
            {totalPhotos}
          </p>
          <p className="text-[12px] text-white/40">Total Photos</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
        <Calendar className="h-4 w-4 text-white/40" />
        <div>
          <p className="text-[13px] font-medium text-white/70">
            {galleriesCount} Galleries
          </p>
          <p className="text-[11px] text-white/30">All collections</p>
        </div>
      </div>
    </div>
  )
}
