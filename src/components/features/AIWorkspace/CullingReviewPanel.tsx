'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Eye, Link2, Sun, Moon, Check, X, Sparkles } from 'lucide-react'

import type { MediaItem } from '@/types/media'

type CullIssueType = 'blurry' | 'duplicate' | 'overexposed' | 'underexposed'

interface FlaggedGroup {
  type: CullIssueType
  label: string
  icon: React.ReactNode
  color: string
  badgeBg: string
  photos: MediaItem[]
}

interface CullingReviewPanelProps {
  media: MediaItem[]
  onKeep: (id: string) => void
  onReject: (id: string) => void
  onKeepAll: (ids: string[]) => void
  onRejectAll: (ids: string[]) => void
}

const ISSUE_CONFIG: Record<CullIssueType, { label: string; icon: React.ReactNode; color: string; badgeBg: string }> = {
  blurry: {
    label: 'Blurry',
    icon: <Eye className="w-4 h-4" />,
    color: 'text-red-400',
    badgeBg: 'bg-red-500/10',
  },
  duplicate: {
    label: 'Duplicate',
    icon: <Link2 className="w-4 h-4" />,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
  },
  overexposed: {
    label: 'Overexposed',
    icon: <Sun className="w-4 h-4" />,
    color: 'text-orange-400',
    badgeBg: 'bg-orange-500/10',
  },
  underexposed: {
    label: 'Underexposed',
    icon: <Moon className="w-4 h-4" />,
    color: 'text-blue-400',
    badgeBg: 'bg-blue-500/10',
  },
}

function CollapsibleGroup({
  group,
  onKeep,
  onReject,
  onKeepAll,
  onRejectAll,
}: {
  group: FlaggedGroup
  onKeep: (id: string) => void
  onReject: (id: string) => void
  onKeepAll: (ids: string[]) => void
  onRejectAll: (ids: string[]) => void
}) {
  const [isOpen, setIsOpen] = useState(true)
  const ids = group.photos.map((p) => p.id)

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden">
      {/* Group Header */}
      <div className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/[0.04] transition-colors">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2.5"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white/40" />
          )}
          <span className={group.color}>{group.icon}</span>
          <span className="text-white/90 text-sm font-semibold">{group.label}</span>
          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium ${group.badgeBg} ${group.color}`}>
            {group.photos.length}
          </span>
        </button>

        {/* Batch actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onKeepAll(ids)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-400
              bg-emerald-500/10 border border-emerald-500/20
              hover:bg-emerald-500/20 transition-colors"
          >
            Keep All
          </button>
          <button
            type="button"
            onClick={() => onRejectAll(ids)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-400
              bg-red-500/10 border border-red-500/20
              hover:bg-red-500/20 transition-colors"
          >
            Reject All
          </button>
        </div>
      </div>

      {/* Photo Cards */}
      {isOpen && (
        <div className="px-4 pb-4 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {group.photos.map((photo) => {
            const confidence = photo.culling_confidence != null
              ? Math.round(photo.culling_confidence * 100)
              : null
            const isKept = photo.review_flag === 'keep'
            const isRejected = photo.review_flag === 'reject'

            return (
              <div
                key={photo.id}
                className={`relative rounded-xl overflow-hidden border transition-all duration-150
                  ${isRejected ? 'opacity-40 border-red-500/30' : isKept ? 'border-emerald-500/30' : 'border-white/[0.08]'}
                  bg-white/[0.04]`}
              >
                {/* Thumbnail */}
                <div className="aspect-[4/3] relative">
                  {photo.thumbnail_url ? (
                    <img
                      src={photo.thumbnail_url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
                      <span className="text-white/20 text-xs truncate px-2">{photo.filename}</span>
                    </div>
                  )}

                  {/* Review flag badge */}
                  {(isKept || isRejected) && (
                    <div className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide backdrop-blur-sm
                      ${isKept ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                      {isKept ? 'Keep' : 'Reject'}
                    </div>
                  )}
                </div>

                {/* Info + Actions */}
                <div className="p-2.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[11px] truncate flex-1 min-w-0">{photo.filename}</span>
                    {confidence != null && (
                      <span className="text-white/30 text-[10px] font-mono ml-1 shrink-0">{confidence}%</span>
                    )}
                  </div>

                  {/* Keep / Reject buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onKeep(photo.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors
                        ${isKept
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                    >
                      <Check className="w-3 h-3" />
                      Keep
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(photo.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors
                        ${isRejected
                          ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                          : 'bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-red-500/10 hover:text-red-400'
                        }`}
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function CullingReviewPanel({
  media,
  onKeep,
  onReject,
  onKeepAll,
  onRejectAll,
}: CullingReviewPanelProps) {
  // Build groups of flagged photos by issue type
  const groups = useMemo<FlaggedGroup[]>(() => {
    const issueTypes: CullIssueType[] = ['blurry', 'duplicate', 'overexposed', 'underexposed']
    const flagKey: Record<CullIssueType, keyof MediaItem> = {
      blurry: 'is_blurry',
      duplicate: 'is_duplicate',
      overexposed: 'is_overexposed',
      underexposed: 'is_underexposed',
    }

    return issueTypes
      .map((type) => ({
        type,
        ...ISSUE_CONFIG[type],
        photos: media.filter((m) => m[flagKey[type]] === true),
      }))
      .filter((g) => g.photos.length > 0)
  }, [media])

  const totalFlagged = useMemo(() => {
    const flaggedIds = new Set<string>()
    for (const group of groups) {
      for (const photo of group.photos) {
        flaggedIds.add(photo.id)
      }
    }
    return flaggedIds.size
  }, [groups])

  // Collect all unique flagged IDs for "Accept AI Recommendations"
  const allFlaggedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const group of groups) {
      for (const photo of group.photos) {
        ids.add(photo.id)
      }
    }
    return Array.from(ids)
  }, [groups])

  const handleAcceptAIRecommendations = useCallback(() => {
    onRejectAll(allFlaggedIds)
  }, [onRejectAll, allFlaggedIds])

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-8">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 max-w-sm">
          <div className="text-4xl mb-4">&#10003;</div>
          <h3 className="text-lg font-semibold text-white mb-2">No flagged photos</h3>
          <p className="text-sm text-white/50">
            All photos passed quality checks. Upload more photos or run AI Sort to continue.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-semibold text-base">Review Flagged Photos</h2>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-amber-500/10 text-amber-400">
            {totalFlagged} flagged
          </span>
        </div>

        <button
          type="button"
          onClick={handleAcceptAIRecommendations}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            text-indigo-300 bg-indigo-400/[0.13] border border-indigo-400/25
            hover:bg-indigo-400/[0.20] transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Accept AI Recommendations
        </button>
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <CollapsibleGroup
          key={group.type}
          group={group}
          onKeep={onKeep}
          onReject={onReject}
          onKeepAll={onKeepAll}
          onRejectAll={onRejectAll}
        />
      ))}
    </div>
  )
}
