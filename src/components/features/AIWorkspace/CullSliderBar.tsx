'use client'

import { Sparkles } from 'lucide-react'

interface CullSliderBarProps {
  keepCount: number
  totalCount: number
  aiRecommendation: number
  onKeepCountChange: (count: number) => void
}

export function CullSliderBar({
  keepCount,
  totalCount,
  aiRecommendation,
  onKeepCountChange,
}: CullSliderBarProps) {
  const percentage = totalCount > 0 ? (keepCount / totalCount) * 100 : 0

  return (
    <div className="flex items-center justify-between px-10 py-3 border-t border-white/[0.06] bg-white/[0.03] w-full">
      {/* Left: Cull Controls */}
      <div className="flex items-center gap-3">
        <span className="text-white/70 font-sans text-sm font-medium">Keep top:</span>
        <span className="text-white font-sans text-base font-bold">{keepCount}</span>
        <span className="text-white/50 font-sans text-sm">of {totalCount}</span>

        {/* Slider Track */}
        <div className="relative w-[200px] h-1.5 rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
          <input
            type="range"
            min={0}
            max={totalCount}
            value={keepCount}
            onChange={(e) => onKeepCountChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Cull slider - photos to keep"
          />
        </div>
      </div>

      {/* Right: AI Recommendation */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-400/10 text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          AI recommends {aiRecommendation}
        </div>
      </div>
    </div>
  )
}
