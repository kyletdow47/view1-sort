'use client'

import { Sparkles, Zap } from 'lucide-react'
import { UNLOCK_THRESHOLD } from '@/lib/ai/style-profile'

interface PersonalizationProgressProps {
  feedbackCount: number
  unlocked: boolean
  progress: number // 0-100
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function PersonalizationProgress({
  feedbackCount,
  unlocked,
  progress,
  enabled,
  onToggle,
}: PersonalizationProgressProps) {
  if (unlocked) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border
          border-emerald-500/30 bg-emerald-500/10"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-emerald-300 font-[Geist,sans-serif]">
              Personalized Mode Active
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {feedbackCount} feedback
            </span>
          </div>
          <p className="text-white/40 text-xs font-[Geist,sans-serif] mt-0.5">
            AI sorts are tuned to your style preferences
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            enabled ? 'bg-emerald-500' : 'bg-white/20'
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl border
        border-white/10 bg-white/[0.04]"
    >
      <div className="w-7 h-7 rounded-lg bg-[#5749F4]/20 flex items-center justify-center">
        <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/70 font-[Geist,sans-serif]">
            Personalized Mode
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40 border border-white/10">
            {feedbackCount}/{UNLOCK_THRESHOLD} to unlock
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5749F4] to-[#818CF8] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
