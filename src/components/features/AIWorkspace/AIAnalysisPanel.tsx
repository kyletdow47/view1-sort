'use client'

import {
  Brain,
  Flag,
  Eye as EyeIcon,
  Copy,
  Sun,
  Moon,
  Check,
  X,
} from 'lucide-react'

import type { QualityDistribution } from '@/types/ai-sort-workspace'

interface AIAnalysisPanelProps {
  totalPhotos: number
  qualityDistribution: QualityDistribution
  duplicateCount: number
  blurryCount: number
  overexposedCount: number
  underexposedCount: number
  keepCount: number
  rejectCount: number
  onReviewFlags: () => void
}

function QualityBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-white/50 font-mono text-[11px] w-7 shrink-0 text-right">
        {label}
      </span>
      <div className="flex-1 h-2 rounded bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-white/65 font-mono text-[11px] font-medium w-7 shrink-0">
        {count}
      </span>
    </div>
  )
}

export function AIAnalysisPanel({
  totalPhotos,
  qualityDistribution,
  duplicateCount,
  blurryCount,
  overexposedCount,
  underexposedCount,
  keepCount,
  rejectCount,
  onReviewFlags,
}: AIAnalysisPanelProps) {
  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-3xl w-[260px] h-full shrink-0 overflow-y-auto
        backdrop-blur-[40px]
        border border-white/[0.15]"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-white font-sans text-[15px] font-bold">AI Analysis</span>
        <Brain className="w-4 h-4 text-indigo-400" />
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Quality Distribution */}
      <div className="flex flex-col gap-2.5">
        <span className="text-white/80 font-mono text-xs font-semibold">
          Quality Distribution
        </span>
        <QualityBar
          label="90+"
          count={qualityDistribution.high}
          total={totalPhotos}
          color="#34D399"
        />
        <QualityBar
          label="70–89"
          count={qualityDistribution.medium}
          total={totalPhotos}
          color="#F59E0B"
        />
        <QualityBar
          label="<70"
          count={qualityDistribution.low}
          total={totalPhotos}
          color="#EF4444"
        />
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Flagged Issues */}
      <div className="flex flex-col gap-2.5">
        <span className="text-white/80 font-mono text-xs font-semibold">
          Flagged Issues
        </span>

        {/* Blurry Row */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-[10px]
            bg-white/[0.04] border border-white/[0.06]"
        >
          <div className="flex items-center gap-2">
            <EyeIcon className="w-3.5 h-3.5 text-red-400/70" />
            <span className="text-white/60 text-xs">Blurry</span>
          </div>
          <span
            className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium
              bg-red-500/10 text-red-400/80"
          >
            {blurryCount}
          </span>
        </div>

        {/* Duplicates Row */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-[10px]
            bg-white/[0.04] border border-white/[0.06]"
        >
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-amber-400/70" />
            <span className="text-white/60 text-xs">Duplicates</span>
          </div>
          <span
            className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium
              bg-amber-500/10 text-amber-400/80"
          >
            {duplicateCount}
          </span>
        </div>

        {/* Overexposed Row */}
        {overexposedCount > 0 && (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-[10px]
              bg-white/[0.04] border border-white/[0.06]"
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-orange-400/70" />
              <span className="text-white/60 text-xs">Overexposed</span>
            </div>
            <span
              className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium
                bg-orange-500/10 text-orange-400/80"
            >
              {overexposedCount}
            </span>
          </div>
        )}

        {/* Underexposed Row */}
        {underexposedCount > 0 && (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-[10px]
              bg-white/[0.04] border border-white/[0.06]"
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-blue-400/70" />
              <span className="text-white/60 text-xs">Underexposed</span>
            </div>
            <span
              className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium
                bg-blue-500/10 text-blue-400/80"
            >
              {underexposedCount}
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Review Status */}
      <div className="flex flex-col gap-2.5">
        <span className="text-white/80 font-mono text-xs font-semibold">
          Review Status
        </span>

        <div
          className="flex items-center justify-between px-3 py-2 rounded-[10px]
            bg-white/[0.04] border border-white/[0.06]"
        >
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400/70" />
            <span className="text-white/60 text-xs">Kept</span>
          </div>
          <span
            className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium
              bg-emerald-500/10 text-emerald-400/80"
          >
            {keepCount}
          </span>
        </div>

        <div
          className="flex items-center justify-between px-3 py-2 rounded-[10px]
            bg-white/[0.04] border border-white/[0.06]"
        >
          <div className="flex items-center gap-2">
            <X className="w-3.5 h-3.5 text-red-400/70" />
            <span className="text-white/60 text-xs">Rejected</span>
          </div>
          <span
            className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium
              bg-red-500/10 text-red-400/80"
          >
            {rejectCount}
          </span>
        </div>
      </div>

      {/* Review Flags Button */}
      <button
        onClick={onReviewFlags}
        className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl
          text-sm font-semibold text-indigo-300
          bg-indigo-400/[0.13] border border-indigo-400/25
          hover:bg-indigo-400/[0.20] transition-all"
      >
        <Flag className="w-3.5 h-3.5" />
        Review Flags
      </button>
    </div>
  )
}
