'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useMediaStore } from '@/stores/mediaStore'
import { useUploadStore } from '@/stores/uploadStore'
import { useBatchSelect } from '@/hooks/useBatchSelect'
import { useAIClassifier } from '@/hooks/useAIClassifier'
import { useAuth } from '@/hooks/useAuth'
import { useStyleProfile } from '@/hooks/useStyleProfile'
import { applyPersonalization } from '@/lib/ai/style-profile'
import type { CullResult } from '@/lib/ai/culling'
import { Lightbox } from '@/components/features/Lightbox'
import { UploadZone } from '@/components/features/UploadZone'

import { ProjectHeader } from './ProjectHeader'
import { TabBar } from './TabBar'
import { SubTabRow } from './SubTabRow'
import { CategoryColumn } from './CategoryColumn'
import { AIAnalysisPanel } from './AIAnalysisPanel'
import { AISortWorkspace } from './AISortWorkspace'
import { AISortPreferences } from './AISortPreferences'
import { VibePresetsTab } from './VibePresetsTab'
import { CullingReviewPanel } from './CullingReviewPanel'
import { CullSliderBar } from './CullSliderBar'
import { WorkspaceSelectionToolbar } from './WorkspaceSelectionToolbar'
import { PersonalizationProgress } from './PersonalizationProgress'
import { UploadPhotoGrid } from './UploadPhotoGrid'

import { getPreset } from '@/lib/ai/presets'

import type { Media, Project } from '@/types/supabase'
import type { MediaItem } from '@/types/media'
import type {
  WorkspaceTab,
  AISortSubTab,
  ProjectStatus,
} from '@/types/ai-workspace'
import { DEFAULT_CATEGORIES } from '@/types/ai-workspace'

/** Color palette cycled across dynamically-generated preset category columns */
const PRESET_COLORS = [
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#A855F7', // purple
  '#EC4899', // pink
  '#10B981', // emerald
  '#F97316', // orange
  '#06B6D4', // cyan
  '#8B5CF6', // violet
]

function mediaToItem(m: Media): MediaItem {
  return {
    id: m.id,
    filename: m.filename,
    thumbnail_url: m.thumbnail_url,
    cloudflare_image_id: m.cloudflare_image_id,
    ai_category: m.ai_category,
    ai_confidence: m.ai_confidence,
    orientation: m.orientation,
    is_blurry: m.is_blurry,
    is_duplicate: m.is_duplicate,
    is_overexposed: m.is_overexposed,
    is_underexposed: m.is_underexposed,
    culling_confidence: m.culling_confidence,
    is_starred: m.is_starred,
    review_flag: m.review_flag,
  }
}

export interface AIWorkspaceViewProps {
  project: Project
  initialMedia: Media[]
}

export function AIWorkspaceView({ project, initialMedia }: AIWorkspaceViewProps) {
  const router = useRouter()
  const { user } = useAuth()

  // Store & selection
  const {
    setMedia,
    fetchMedia,
    groupedByCategory,
    filteredMedia,
    removeMedia,
    editMedia,
    media: allRawMedia,
  } = useMediaStore()

  const uploadItems = useUploadStore((s) => s.items)
  const { selectedIds, toggle, selectRange, selectAll, deselectAll } = useBatchSelect()

  // AI classifier
  const {
    status: classifierStatus,
    loadProgress,
    runProgress,
    isRunning: isAIRunning,
    cullingProgress,
    classifyBatch,
    runCullingOnFiles,
  } = useAIClassifier()

  // Style profile learning
  const {
    feedback: recordStyleFeedback,
    progress: personalizationProgress,
    unlocked: personalizationUnlocked,
    profile: styleProfile,
  } = useStyleProfile(user?.id)
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true)

  // UI state
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('ai-sort')
  const [activeSubTab, setActiveSubTab] = useState<AISortSubTab>('workspace')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [keepCountOverride, setKeepCountOverride] = useState<number | null>(null)
  const [autoSortEnabled] = useState(true)
  const lastSelectedRef = useRef<string | null>(null)

  // Culling results from upload flow — keyed by filename, reconciled after upload
  const pendingCullResultsRef = useRef<Map<string, CullResult>>(new Map())
  // Track whether we had active uploads this session to detect batch completion
  const hadActiveUploadsRef = useRef(false)

  // Seed store on mount
  useEffect(() => {
    setMedia(initialMedia)
  }, [initialMedia, setMedia])

  // Watch upload store — when a batch transitions from active → all-complete, auto-sort
  useEffect(() => {
    const items = Object.values(uploadItems)
    const projectItems = items.filter((i) => i.projectId === project.id)
    if (projectItems.length === 0) return

    const hasActive = projectItems.some((i) => i.status === 'uploading' || i.status === 'pending')
    if (hasActive) {
      hadActiveUploadsRef.current = true
      return
    }

    // All items for this project are complete/error — check if we just finished a batch
    if (!hadActiveUploadsRef.current) return
    hadActiveUploadsRef.current = false

    if (!autoSortEnabled || classifierStatus !== 'ready' || isAIRunning) return

    // Refresh media from DB, then classify new items
    void (async () => {
      try {
        await fetchMedia(project.id)
        // fetchMedia updates the store; read latest media via the store state directly
        // Small delay to let Zustand re-render propagate
        await new Promise((r) => setTimeout(r, 200))

        const latestMedia = useMediaStore.getState().media
        const itemsToClassify = latestMedia
          .filter((m) => m.thumbnail_url && !m.ai_category)
          .map((m) => ({ id: m.id, thumbnail_url: m.thumbnail_url }))

        if (itemsToClassify.length === 0) return

        // Read presetId inline from project metadata so this effect doesn't need
        // activePresetId in its dependency array (which would cause re-sort on every
        // preferences change even with no new uploads).
        const metaPresetId = (
          (project.metadata as Record<string, unknown> | null)
            ?.ai_preferences as { presetId?: string } | undefined
        )?.presetId ?? 'wedding'

        const results = await classifyBatch(itemsToClassify, { projectId: project.id, presetId: metaPresetId })

        // Update local store + apply any culling results we have
        await Promise.all(
          results.map(async ({ id, category, confidence }) => {
            const mediaRow = latestMedia.find((m) => m.id === id)
            const cullResult = mediaRow
              ? pendingCullResultsRef.current.get(mediaRow.filename)
              : undefined

            const cullFlags = cullResult?.flags ?? []
            const isBlurry = cullFlags.some((f) => f.type === 'blurry')
            const isDuplicate = cullFlags.some((f) => f.type === 'duplicate')
            const isOverexposed = cullFlags.some((f) => f.type === 'overexposed')
            const isUnderexposed = cullFlags.some((f) => f.type === 'underexposed')
            const cullingConfidence = cullFlags.length > 0
              ? Math.max(...cullFlags.map((f) => f.confidence))
              : undefined

            await editMedia(id, {
              ai_category: category,
              ai_confidence: confidence,
              ...(cullResult ? {
                is_blurry: isBlurry,
                is_duplicate: isDuplicate,
                is_overexposed: isOverexposed,
                is_underexposed: isUnderexposed,
                culling_confidence: cullingConfidence,
              } : {}),
            } as Parameters<typeof editMedia>[1])
          }),
        )

        // Clear processed cull results
        pendingCullResultsRef.current.clear()
      } catch (err) {
        console.error('[auto-sort] Failed:', err)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadItems])

  // Derived data
  const groups = useMemo(() => groupedByCategory(), [groupedByCategory])
  const allMedia = useMemo(() => filteredMedia(), [filteredMedia])
  const flatMediaItems = useMemo(() => allMedia.map(mediaToItem), [allMedia])
  const totalPhotos = allMedia.length

  // ─── Culling slider data ────────────────────────────────────────────────────
  // Count of photos without any culling flags = AI recommended keep count
  const aiRecommendedKeep = useMemo(() => {
    return allMedia.filter(
      (m) => !m.is_blurry && !m.is_duplicate && !m.is_overexposed && !m.is_underexposed,
    ).length
  }, [allMedia])
  const keepCount = keepCountOverride ?? aiRecommendedKeep

  // ─── Preset resolution ───────────────────────────────────────────────────────
  // Reads the presetId stored in project.metadata.ai_preferences, defaulting to
  // 'wedding' so existing projects keep their current column layout.
  const activePresetId = useMemo(() => {
    const meta = project.metadata as Record<string, unknown> | null
    const prefs = meta?.ai_preferences as { presetId?: string } | undefined
    return prefs?.presetId ?? 'wedding'
  }, [project.metadata])

  const activePreset = useMemo(() => getPreset(activePresetId), [activePresetId])

  // Category columns with photo counts.
  // When an active preset is resolved its SortCategory list drives the columns
  // (names like 'Architecture', 'Street', 'Food' for the travel preset).
  // Falls back to DEFAULT_CATEGORIES (Ceremony/Portraits/Reception/Details)
  // only when no preset is found — this should never happen in practice because
  // every project defaults to 'wedding'.
  const categoryColumns = useMemo(() => {
    if (activePreset) {
      return activePreset.categories.map((cat, i) => ({
        id: cat.name.toLowerCase().replace(/[\s&/]+/g, '-'),
        name: cat.name,
        color: PRESET_COLORS[i % PRESET_COLORS.length],
        photos: (groups[cat.name] ?? []).map(mediaToItem),
        photoCount: (groups[cat.name] ?? []).length,
      }))
    }
    return DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      photos: (groups[cat.name] ?? []).map(mediaToItem),
      photoCount: (groups[cat.name] ?? []).length,
    }))
  }, [activePreset, groups])

  // Uncategorized photos
  const uncategorizedPhotos = useMemo(() => {
    const knownCategories = new Set(DEFAULT_CATEGORIES.map((c) => c.name))
    return Object.entries(groups)
      .filter(([key]) => !knownCategories.has(key))
      .flatMap(([, photos]) => photos.map(mediaToItem))
  }, [groups])

  // Whether AI sort has run — true if any media has an ai_category assigned
  const hasAICategories = useMemo(
    () => allMedia.some((m) => m.ai_category != null),
    [allMedia],
  )

  void uncategorizedPhotos // used by child components when needed

  // ─── Upload handlers ────────────────────────────────────────────────────────

  // Called by UploadZone as soon as valid files are queued (before upload begins).
  // Runs culling while we still have the raw File objects in memory.
  const handleFilesQueued = useCallback(
    (files: File[]) => {
      void runCullingOnFiles(files).then((results) => {
        results.forEach((result, filename) => {
          pendingCullResultsRef.current.set(filename, result)
        })
      })
    },
    [runCullingOnFiles],
  )

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (id: string, shiftKey: boolean) => {
      if (shiftKey && lastSelectedRef.current) {
        const allIds = flatMediaItems.map((m) => m.id)
        selectRange(lastSelectedRef.current, id, allIds)
      } else {
        toggle(id)
        lastSelectedRef.current = id
      }
    },
    [flatMediaItems, toggle, selectRange],
  )

  const handleDoubleClick = useCallback(
    (id: string) => {
      const idx = flatMediaItems.findIndex((m) => m.id === id)
      if (idx !== -1) setLightboxIndex(idx)
    },
    [flatMediaItems],
  )

  const handleRunAI = useCallback(async () => {
    if (classifierStatus !== 'ready' || isAIRunning) return

    const itemsToClassify = allRawMedia
      .filter((m) => m.thumbnail_url)
      .map((m) => ({ id: m.id, thumbnail_url: m.thumbnail_url }))

    if (itemsToClassify.length === 0) return

    try {
      let results = await classifyBatch(itemsToClassify, {
        projectId: project.id,
        presetId: activePresetId,
      })

      // Apply personalized re-ranking if enabled and unlocked
      if (personalizationEnabled && styleProfile?.personalizedModeUnlocked && styleProfile) {
        const reranked = applyPersonalization(
          results.map((r) => ({ category: r.category, score: r.confidence, id: r.id })),
          styleProfile,
          activePresetId,
        )
        results = reranked.map((r) => ({ id: r.id, category: r.category, confidence: r.score }))
      }

      // Update the local media store with AI results
      await Promise.all(
        results.map(({ id, category, confidence }) =>
          editMedia(id, { ai_category: category, ai_confidence: confidence }),
        ),
      )
    } catch (err) {
      console.error('AI Sort failed:', err)
    }
  }, [classifierStatus, isAIRunning, allRawMedia, classifyBatch, project.id, activePresetId, editMedia, personalizationEnabled, styleProfile])

  const handlePublish = useCallback(() => {
    router.push(`/dashboard/project/${project.id}/publish`)
  }, [router, project.id])

  const handleDeleteSelected = useCallback(async () => {
    if (!confirm(`Delete ${selectedIds.size} photo(s)? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/media/batch-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      if (res.ok) {
        await removeMedia(Array.from(selectedIds))
        deselectAll()
      }
    } catch (err) {
      console.error('Failed to delete photos:', err)
    }
  }, [selectedIds, removeMedia, deselectAll])

  // Star — toggle is_starred for all selected photos
  const handleStar = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    // Check if all are starred → toggle off, else star all
    const allStarred = ids.every((id) => {
      const m = allRawMedia.find((media) => media.id === id)
      return m?.is_starred === true
    })
    const starring = !allStarred
    await Promise.all(
      ids.map((id) => {
        const m = allRawMedia.find((media) => media.id === id)
        // Starring = positive feedback for the category assignment
        if (starring && m?.ai_category) {
          recordStyleFeedback(activePresetId, m.ai_category, true)
        }
        return editMedia(id, { is_starred: starring })
      }),
    )
  }, [selectedIds, allRawMedia, editMedia, recordStyleFeedback, activePresetId])

  // Flag red = reject
  const handleFlagRed = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    await Promise.all(
      ids.map((id) => {
        const m = allRawMedia.find((media) => media.id === id)
        if (m?.ai_category) {
          recordStyleFeedback(activePresetId, m.ai_category, false)
        }
        return editMedia(id, { review_flag: 'reject' })
      }),
    )
  }, [selectedIds, allRawMedia, editMedia, recordStyleFeedback])

  // Flag green = keep
  const handleFlagGreen = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    await Promise.all(
      ids.map((id) => {
        const m = allRawMedia.find((media) => media.id === id)
        if (m?.ai_category) {
          recordStyleFeedback(activePresetId, m.ai_category, true)
        }
        return editMedia(id, { review_flag: 'keep' })
      }),
    )
  }, [selectedIds, allRawMedia, editMedia, recordStyleFeedback])

  // Move selected photos to a specific category (called by the category dropdown in toolbar)
  const handleMoveTo = useCallback(async (targetCategory: string) => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    await Promise.all(
      ids.map((id) => {
        const m = allRawMedia.find((media) => media.id === id)
        if (m?.ai_category) {
          recordStyleFeedback(activePresetId, m.ai_category, false)
          recordStyleFeedback(activePresetId, targetCategory, true)
        }
        return editMedia(id, { ai_category: targetCategory })
      }),
    )
    deselectAll()
  }, [selectedIds, allRawMedia, editMedia, recordStyleFeedback, deselectAll])

  // Handle drag-drop between category columns
  const handleCategoryDrop = useCallback(
    async (mediaId: string, targetCategory: string) => {
      const m = allRawMedia.find((media) => media.id === mediaId)
      if (m?.ai_category === targetCategory) return
      if (m?.ai_category) {
        recordStyleFeedback(activePresetId, m.ai_category, false)
      }
      recordStyleFeedback(activePresetId, targetCategory, true)
      await editMedia(mediaId, { ai_category: targetCategory })
    },
    [allRawMedia, editMedia, recordStyleFeedback],
  )

  const handleReviewFlags = useCallback(() => {
    setActiveTab('review')
  }, [])

  // Keep/Reject handlers for the Culling Review Panel
  const handleKeepSingle = useCallback(async (id: string) => {
    await editMedia(id, { review_flag: 'keep' })
  }, [editMedia])

  const handleRejectSingle = useCallback(async (id: string) => {
    await editMedia(id, { review_flag: 'reject' })
  }, [editMedia])

  const handleKeepBatch = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map((id) => editMedia(id, { review_flag: 'keep' })))
  }, [editMedia])

  const handleRejectBatch = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map((id) => editMedia(id, { review_flag: 'reject' })))
  }, [editMedia])

  // Approve all — set review_flag = 'keep' for every photo that hasn't been flagged yet
  const handleApproveAll = useCallback(async () => {
    const unflagged = allRawMedia.filter((m) => !m.review_flag)
    if (unflagged.length === 0) return
    await Promise.all(unflagged.map((m) => editMedia(m.id, { review_flag: 'keep' })))
  }, [allRawMedia, editMedia])

  const projectStatus = (project.status ?? 'processing') as ProjectStatus

  // Derive Run AI button label from classifier status
  const runAILabel = useMemo(() => {
    if (classifierStatus === 'loading') return `Downloading AI model (${loadProgress}%)…`
    if (isAIRunning) {
      const done = Math.round(runProgress * totalPhotos / 100)
      return `Sorting… ${runProgress}% (${done}/${totalPhotos})`
    }
    return 'Run AI Sort'
  }, [classifierStatus, loadProgress, isAIRunning, runProgress, totalPhotos])

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden">
      {/* Project Header */}
      <ProjectHeader
        projectName={project.name}
        status={projectStatus}
        photoCount={totalPhotos}
        onRunAI={handleRunAI}
        onPublish={handlePublish}
        isAIRunning={isAIRunning || classifierStatus === 'loading'}
        runAILabel={runAILabel}
      />

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        photoCount={totalPhotos}
      />

      {/* AI Model Download Notice — shown while model is downloading (first use only) */}
      {classifierStatus === 'loading' && (
        <div className="mx-6 mt-3 flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <span>
            <strong className="font-semibold text-violet-100">Downloading AI model (~330MB)</strong>
            {' '}— this only happens once and is cached in your browser. It may take 1–2 minutes on first use.
          </span>
        </div>
      )}

      {/* Culling Analysis Progress */}
      {cullingProgress.isRunning && (
        <div className="mx-6 mt-3 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <svg className="h-4 w-4 shrink-0 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>
            <strong className="font-semibold text-amber-100">Analyzing quality…</strong>
            {' '}{cullingProgress.current}/{cullingProgress.total}
          </span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-col flex-1 min-h-0 gap-4 px-6">
        {activeTab === 'ai-sort' && (
          <>
            {/* Personalization Progress */}
            <PersonalizationProgress
              feedbackCount={styleProfile?.feedbackCount ?? 0}
              unlocked={personalizationUnlocked}
              progress={personalizationProgress}
              enabled={personalizationEnabled}
              onToggle={setPersonalizationEnabled}
            />

            <SubTabRow
              activeSubTab={activeSubTab}
              onSubTabChange={setActiveSubTab}
              onApproveAll={handleApproveAll}
              onReSort={handleRunAI}
            />

            {activeSubTab === 'workspace' ? (
              !hasAICategories && totalPhotos > 0 ? (
                /* Empty state: photos uploaded but AI sort hasn't run yet */
                <div className="flex flex-col items-center justify-center flex-1 gap-5 text-center px-8">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 max-w-sm">
                    <div className="text-4xl mb-4">✨</div>
                    <h3 className="text-lg font-semibold text-white mb-2">Run AI Sort first</h3>
                    <p className="text-sm text-white/50 mb-5">
                      Your {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} will be automatically categorized and analyzed for quality issues.
                    </p>
                    <button
                      type="button"
                      onClick={handleRunAI}
                      disabled={isAIRunning || classifierStatus === 'loading'}
                      className="w-full rounded-xl bg-[#5749F4] px-4 py-2.5 text-sm font-semibold text-white
                        hover:bg-[#4a3de0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {runAILabel}
                    </button>
                  </div>
                </div>
              ) : totalPhotos === 0 ? (
                /* Empty state: no photos yet */
                <div className="flex flex-col items-center justify-center flex-1 gap-4 text-white/30">
                  <p className="text-sm">No photos yet — upload some on the Upload tab.</p>
                </div>
              ) : (
                <AISortWorkspace
                  categoryColumns={categoryColumns}
                  allMedia={allMedia}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  onDoubleClick={handleDoubleClick}
                  onReviewFlags={handleReviewFlags}
                  onCategoryDrop={handleCategoryDrop}
                  onBatchReclassify={handleRunAI}
                />
              )
            ) : activeSubTab === 'upload' ? (
              <div className="flex flex-col flex-1 min-h-0 gap-4">
                <UploadZone projectId={project.id} onFilesQueued={handleFilesQueued} />
                <UploadPhotoGrid
                  projectId={project.id}
                  uploadItems={uploadItems}
                  completedMedia={allRawMedia}
                  classifierReady={classifierStatus === 'ready'}
                  isAIRunning={isAIRunning}
                  runAILabel={runAILabel}
                  onStartAISort={handleRunAI}
                />
              </div>
            ) : activeSubTab === 'preferences' ? (
              <AISortPreferences projectId={project.id} />
            ) : activeSubTab === 'vibe-presets' ? (
              <VibePresetsTab
                projectId={project.id}
                categoryDistribution={categoryColumns.map((col) => ({
                  name: col.name,
                  count: col.photoCount,
                }))}
              />
            ) : (
              <div className="flex gap-4 flex-1 min-h-0">
                <div className="flex gap-3 flex-1 min-h-0">
                  {categoryColumns.map((col) => (
                    <CategoryColumn
                      key={col.id}
                      name={col.name}
                      color={col.color}
                      photos={col.photos}
                      selectedIds={selectedIds}
                      onSelect={handleSelect}
                      onDoubleClick={handleDoubleClick}
                      onDrop={handleCategoryDrop}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'review' && (
          <CullingReviewPanel
            media={flatMediaItems}
            onKeep={handleKeepSingle}
            onReject={handleRejectSingle}
            onKeepAll={handleKeepBatch}
            onRejectAll={handleRejectBatch}
          />
        )}

        {activeTab === 'shot-list' && (
          <div className="flex items-center justify-center flex-1 text-white/30 text-lg">
            Shot List tab — coming soon
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="flex items-center justify-center flex-1 text-white/30 text-lg">
            Gallery Preview tab — coming soon
          </div>
        )}

        {activeTab === 'client' && (
          <div className="flex items-center justify-center flex-1 text-white/30 text-lg">
            Client Management tab — coming soon
          </div>
        )}

        {activeTab === 'details' && (
          <div className="flex items-center justify-center flex-1 text-white/30 text-lg">
            Project Details tab — coming soon
          </div>
        )}
      </div>

      {/* Cull Slider Bar — only shown when real photos exist and AI sort has run */}
      {activeTab === 'ai-sort' && hasAICategories && totalPhotos > 0 && (
        <CullSliderBar
          keepCount={keepCount}
          totalCount={totalPhotos}
          aiRecommendation={aiRecommendedKeep}
          onKeepCountChange={setKeepCountOverride}
        />
      )}

      {/* Selection Toolbar */}
      <WorkspaceSelectionToolbar
        selectedCount={selectedIds.size}
        categories={DEFAULT_CATEGORIES}
        onStar={handleStar}
        onFlagRed={handleFlagRed}
        onFlagGreen={handleFlagGreen}
        onMoveTo={handleMoveTo}
        onDelete={handleDeleteSelected}
        onDeselect={deselectAll}
      />

      {/* Upload Zone Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white/10 border border-white/20
                flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              &times;
            </button>
            <UploadZone projectId={project.id} onFilesQueued={handleFilesQueued} />
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          media={flatMediaItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
