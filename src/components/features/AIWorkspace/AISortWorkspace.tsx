'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { CategoryColumn } from './CategoryColumn'
import { SortControlsPanel } from './SortControlsPanel'
import { AIAnalysisPanel } from './AIAnalysisPanel'

import type { MediaItem } from '@/types/media'
import type { CategoryColumn as CategoryColumnType } from '@/types/ai-workspace'
import type { AISortSettings, QualityDistribution } from '@/types/ai-sort-workspace'
import { DEFAULT_AI_SORT_SETTINGS } from '@/types/ai-sort-workspace'

interface AISortWorkspaceProps {
  categoryColumns: Array<CategoryColumnType & { photos: MediaItem[] }>
  allMedia: MediaItem[]
  selectedIds: Set<string>
  onSelect: (id: string, shiftKey: boolean) => void
  onDoubleClick: (id: string) => void
  onReviewFlags: () => void
  onCategoryDrop?: (mediaId: string, targetCategory: string) => void
  onBatchReclassify?: () => void
}

/**
 * AISortWorkspace — The core AI sorting workspace tab content.
 *
 * Layout: Sort Controls (left) | Category Columns (center) | AI Analysis (right)
 */
export function AISortWorkspace({
  categoryColumns,
  allMedia,
  selectedIds,
  onSelect,
  onDoubleClick,
  onReviewFlags,
  onCategoryDrop,
  onBatchReclassify,
}: AISortWorkspaceProps) {
  const [settings, setSettings] = useState<AISortSettings>(DEFAULT_AI_SORT_SETTINGS)
  const [isReclassifying, setIsReclassifying] = useState(false)
  const reclassifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute quality distribution from media confidence scores
  const qualityDistribution = useMemo<QualityDistribution>(() => {
    let high = 0
    let medium = 0
    let low = 0

    for (const media of allMedia) {
      const confidence = media.ai_confidence != null ? media.ai_confidence * 100 : 0
      if (confidence >= 90) {
        high++
      } else if (confidence >= 70) {
        medium++
      } else {
        low++
      }
    }

    return { high, medium, low }
  }, [allMedia])

  // Photos below the confidence threshold go to "Needs Review"
  const { filteredColumns, needsReviewPhotos } = useMemo(() => {
    const threshold = settings.confidenceThreshold / 100
    const enabledCategories = new Set(
      settings.categoryMappings.filter((m) => m.enabled).map((m) => m.displayCategory),
    )

    // Partition each column: photos above threshold stay, below → Needs Review
    const filtered = categoryColumns
      .filter((col) => enabledCategories.has(col.name))
      .map((col) => ({
        ...col,
        photos: col.photos.filter(
          (p) => p.ai_confidence == null || p.ai_confidence >= threshold,
        ),
      }))

    const needsReview = categoryColumns
      .filter((col) => enabledCategories.has(col.name))
      .flatMap((col) =>
        col.photos.filter(
          (p) => p.ai_confidence != null && p.ai_confidence < threshold,
        ),
      )

    return { filteredColumns: filtered, needsReviewPhotos: needsReview }
  }, [categoryColumns, settings.confidenceThreshold, settings.categoryMappings])

  const needsReviewCount = needsReviewPhotos.length
  const totalPhotos = allMedia.length

  // Real culling counts from DB flags
  const blurryCount = allMedia.filter((m) => m.is_blurry).length
  const duplicateCount = allMedia.filter((m) => m.is_duplicate).length
  const overexposedCount = allMedia.filter((m) => m.is_overexposed).length
  const underexposedCount = allMedia.filter((m) => m.is_underexposed).length
  const keepCount = allMedia.filter((m) => m.review_flag === 'keep').length
  const rejectCount = allMedia.filter((m) => m.review_flag === 'reject').length

  // Batch reclassify handler — calls the real AI sort pipeline from parent
  const handleBatchReclassify = useCallback(() => {
    if (onBatchReclassify) {
      onBatchReclassify()
    } else {
      // Fallback spinner for when no handler is wired (shouldn't happen in practice)
      setIsReclassifying(true)
      if (reclassifyTimerRef.current) clearTimeout(reclassifyTimerRef.current)
      reclassifyTimerRef.current = setTimeout(() => {
        setIsReclassifying(false)
        reclassifyTimerRef.current = null
      }, 3000)
    }
  }, [onBatchReclassify])

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      {/* Left: Sort Controls Panel */}
      <SortControlsPanel
        settings={settings}
        onSettingsChange={setSettings}
        onBatchReclassify={handleBatchReclassify}
        isReclassifying={isReclassifying}
        totalPhotos={totalPhotos}
        needsReviewCount={needsReviewCount}
      />

      {/* Center: Category Columns + Needs Review */}
      <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto">
        {filteredColumns.map((col) => (
          <CategoryColumn
            key={col.id}
            name={col.name}
            color={col.color}
            photos={col.photos}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onDoubleClick={onDoubleClick}
            onDrop={onCategoryDrop}
          />
        ))}

        {/* Needs Review column — only shown when threshold > 0 and items exist */}
        {needsReviewCount > 0 && (
          <CategoryColumn
            key="needs-review"
            name="Needs Review"
            color="#f59e0b"
            photos={needsReviewPhotos}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onDoubleClick={onDoubleClick}
          />
        )}
      </div>

      {/* Right: AI Analysis Panel */}
      <AIAnalysisPanel
        totalPhotos={totalPhotos}
        qualityDistribution={qualityDistribution}
        duplicateCount={duplicateCount}
        blurryCount={blurryCount}
        overexposedCount={overexposedCount}
        underexposedCount={underexposedCount}
        keepCount={keepCount}
        rejectCount={rejectCount}
        onReviewFlags={onReviewFlags}
      />
    </div>
  )
}
