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
}

/**
 * AISortWorkspace — The core AI sorting workspace tab content.
 *
 * Layout: Sort Controls (left) | Category Columns (center) | AI Analysis (right)
 *
 * Features:
 * - AI confidence threshold slider that determines which photos go to "Needs Review"
 * - Sort algorithm selector (category→quality, quality→category, chronological)
 * - Duplicate and blur detection toggles
 * - Editable category mappings
 * - Batch re-classify action
 * - Quality distribution visualization
 * - Flagged issues summary
 */
export function AISortWorkspace({
  categoryColumns,
  allMedia,
  selectedIds,
  onSelect,
  onDoubleClick,
  onReviewFlags,
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

    // Use mock data if no real confidence scores available
    if (allMedia.length === 0 || (high === 0 && medium === 0 && low === allMedia.length)) {
      return { high: 312, medium: 423, low: 112 }
    }

    return { high, medium, low }
  }, [allMedia])

  // Count photos below the confidence threshold ("Needs Review")
  const needsReviewCount = useMemo(() => {
    const threshold = settings.confidenceThreshold / 100
    return allMedia.filter(
      (m) => m.ai_confidence == null || m.ai_confidence < threshold,
    ).length
  }, [allMedia, settings.confidenceThreshold])

  // Mock flagged counts — in production, derived from AI classifier results
  // TODO: Replace with real AI classifier output when SigLIP Web Worker is ready
  const duplicateCount = 12
  const blurryCount = 5

  const totalPhotos = allMedia.length || 847 // fallback for mock display

  // Filter category columns based on enabled mappings
  const filteredColumns = useMemo(() => {
    const enabledCategories = new Set(
      settings.categoryMappings.filter((m) => m.enabled).map((m) => m.displayCategory),
    )
    return categoryColumns.filter((col) => enabledCategories.has(col.name))
  }, [categoryColumns, settings.categoryMappings])

  // Batch reclassify handler
  const handleBatchReclassify = useCallback(() => {
    setIsReclassifying(true)

    // TODO: Wire up actual AI classification via Web Worker
    // This would call the SigLIP classifier with updated settings
    if (reclassifyTimerRef.current) {
      clearTimeout(reclassifyTimerRef.current)
    }
    reclassifyTimerRef.current = setTimeout(() => {
      setIsReclassifying(false)
      reclassifyTimerRef.current = null
    }, 3000)
  }, [])

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

      {/* Center: Category Columns */}
      <div className="flex gap-3 flex-1 min-h-0">
        {filteredColumns.map((col) => (
          <CategoryColumn
            key={col.id}
            name={col.name}
            color={col.color}
            photos={col.photos}
            selectedIds={selectedIds}
            onSelect={onSelect}
            onDoubleClick={onDoubleClick}
          />
        ))}
      </div>

      {/* Right: AI Analysis Panel */}
      <AIAnalysisPanel
        totalPhotos={totalPhotos}
        qualityDistribution={qualityDistribution}
        duplicateCount={duplicateCount}
        blurryCount={blurryCount}
        onReviewFlags={onReviewFlags}
      />
    </div>
  )
}
