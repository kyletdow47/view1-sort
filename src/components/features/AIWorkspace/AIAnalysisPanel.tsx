'use client'

import {
  BarChart3,
  AlertTriangle,
  Copy,
  Sun,
  Eye,
} from 'lucide-react'

interface AIAnalysisPanelProps {
  totalPhotos: number
  qualityConfidence: number
  duplicateCount: number
  blurryCount: number
  overexposedCount: number
  flaggedIssues: string[]
  onReviewFlags: () => void
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

export function AIAnalysisPanel({
  totalPhotos,
  qualityConfidence,
  duplicateCount,
  blurryCount,
  overexposedCount,
  flaggedIssues,
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
        <span className="text-white/90 font-sans text-sm font-semibold">AI Analysis</span>
        <BarChart3 className="w-4 h-4 text-white/40" />
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Quality Section */}
      <div className="flex flex-col gap-2.5">
        <span className="text-white/60 font-sans text-xs font-medium uppercase tracking-wider">
          Quality Confidence
        </span>
        <div className="flex items-center gap-3">
          <ProgressBar value={qualityConfidence} color="#34D399" />
          <span className="text-white font-mono text-sm font-semibold">
            {qualityConfidence}%
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <span className="text-white/60 font-sans text-xs font-medium uppercase tracking-wider">
            Flagged Items
          </span>

          <div className="flex items-center gap-2 text-sm">
            <Copy className="w-3.5 h-3.5 text-amber-400/70" />
            <span className="text-white/60 text-xs">{duplicateCount} duplicates</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-3.5 h-3.5 text-red-400/70" />
            <span className="text-white/60 text-xs">{blurryCount} blurry</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sun className="w-3.5 h-3.5 text-yellow-400/70" />
            <span className="text-white/60 text-xs">{overexposedCount} overexposed</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Flags Section */}
      <div className="flex flex-col gap-2.5">
        <span className="text-white/60 font-sans text-xs font-medium uppercase tracking-wider">
          Flags
        </span>
        {flaggedIssues.length === 0 ? (
          <span className="text-white/30 text-xs">No issues flagged</span>
        ) : (
          flaggedIssues.map((issue, i) => (
            <div key={i} className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-amber-400/70 shrink-0" />
              <span className="text-white/50 text-xs">{issue}</span>
            </div>
          ))
        )}
      </div>

      {/* Review Button */}
      <button
        onClick={onReviewFlags}
        className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl
          text-sm font-medium text-indigo-300
          bg-indigo-400/[0.13] border border-indigo-400/25
          hover:bg-indigo-400/[0.20] transition-all"
      >
        <Eye className="w-4 h-4" />
        Review Flags
      </button>
    </div>
  )
}
