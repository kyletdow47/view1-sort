'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useMediaStore } from '@/stores/mediaStore'
import { useBatchSelect } from '@/hooks/useBatchSelect'
import { Lightbox } from '@/components/features/Lightbox'
import { UploadZone } from '@/components/features/UploadZone'

import { ProjectHeader } from './ProjectHeader'
import { TabBar } from './TabBar'
import { SubTabRow } from './SubTabRow'
import { CategoryColumn } from './CategoryColumn'
import { AIAnalysisPanel } from './AIAnalysisPanel'
import { AISortWorkspace } from './AISortWorkspace'
import { AISortPreferences } from './AISortPreferences'
import { CullSliderBar } from './CullSliderBar'
import { WorkspaceSelectionToolbar } from './WorkspaceSelectionToolbar'

import type { Media, Project } from '@/types/supabase'
import type { MediaItem } from '@/types/media'
import type {
  WorkspaceTab,
  AISortSubTab,
  ProjectStatus,
} from '@/types/ai-workspace'
import { DEFAULT_CATEGORIES } from '@/types/ai-workspace'

function mediaToItem(m: Media): MediaItem {
  return {
    id: m.id,
    filename: m.filename,
    thumbnail_url: m.thumbnail_url,
    cloudflare_image_id: m.cloudflare_image_id,
    ai_category: m.ai_category,
    ai_confidence: m.ai_confidence,
    orientation: m.orientation,
  }
}

export interface AIWorkspaceViewProps {
  project: Project
  initialMedia: Media[]
}

export function AIWorkspaceView({ project, initialMedia }: AIWorkspaceViewProps) {
  const router = useRouter()

  // Store & selection
  const {
    setMedia,
    groupedByCategory,
    filteredMedia,
    removeMedia,
  } = useMediaStore()
  const { selectedIds, toggle, selectRange, selectAll, deselectAll } = useBatchSelect()

  // UI state
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('ai-sort')
  const [activeSubTab, setActiveSubTab] = useState<AISortSubTab>('workspace')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [isAIRunning, setIsAIRunning] = useState(false)
  const [keepCount, setKeepCount] = useState(340)
  const lastSelectedRef = useRef<string | null>(null)

  // Seed store on mount
  useEffect(() => {
    setMedia(initialMedia)
  }, [initialMedia, setMedia])

  // Derived data
  const groups = useMemo(() => groupedByCategory(), [groupedByCategory])
  const allMedia = useMemo(() => filteredMedia(), [filteredMedia])
  const flatMediaItems = useMemo(() => allMedia.map(mediaToItem), [allMedia])
  const totalPhotos = allMedia.length

  // Category columns with photo counts
  const categoryColumns = useMemo(() => {
    return DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      photos: (groups[cat.name] ?? []).map(mediaToItem),
      photoCount: (groups[cat.name] ?? []).length,
    }))
  }, [groups])

  // Uncategorized photos go to a separate bucket
  const uncategorizedPhotos = useMemo(() => {
    const knownCategories = new Set(DEFAULT_CATEGORIES.map((c) => c.name))
    return Object.entries(groups)
      .filter(([key]) => !knownCategories.has(key))
      .flatMap(([, photos]) => photos.map(mediaToItem))
  }, [groups])

  // Handlers
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

  const handleRunAI = useCallback(() => {
    setIsAIRunning(true)
    // TODO: Wire up actual AI classification via Web Worker
    setTimeout(() => setIsAIRunning(false), 3000)
  }, [])

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

  // Placeholder handlers for selection toolbar actions
  const handleStar = useCallback(() => {
    // TODO: Implement star functionality
  }, [])

  const handleFlagRed = useCallback(() => {
    // TODO: Implement reject flag
  }, [])

  const handleFlagGreen = useCallback(() => {
    // TODO: Implement keep flag
  }, [])

  const handleMove = useCallback(() => {
    // TODO: Implement move to category
  }, [])

  const handleReviewFlags = useCallback(() => {
    // TODO: Navigate to review tab with flags filter
    setActiveTab('review')
  }, [])

  const projectStatus = (project.status ?? 'processing') as ProjectStatus

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden">
      {/* Project Header */}
      <ProjectHeader
        projectName={project.name}
        status={projectStatus}
        photoCount={totalPhotos}
        onRunAI={handleRunAI}
        onPublish={handlePublish}
        isAIRunning={isAIRunning}
      />

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        photoCount={totalPhotos}
      />

      {/* Content Area — grows to fill remaining space */}
      <div className="flex flex-col flex-1 min-h-0 gap-4 px-6">
        {activeTab === 'ai-sort' && (
          <>
            {/* Sub-Tab Row */}
            <SubTabRow
              activeSubTab={activeSubTab}
              onSubTabChange={setActiveSubTab}
              onApproveAll={() => {/* TODO: approve all photos in current category */}}
              onReSort={handleRunAI}
            />

            {/* Main Content: Sort Controls + Category Columns + AI Panel */}
            {activeSubTab === 'workspace' ? (
              <AISortWorkspace
                categoryColumns={categoryColumns}
                allMedia={allMedia}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onDoubleClick={handleDoubleClick}
                onReviewFlags={handleReviewFlags}
              />
            ) : activeSubTab === 'upload' ? (
              <div className="flex items-center justify-center flex-1 text-white/30 text-lg">
                Upload sub-tab — drag photos here or click to upload
              </div>
            ) : activeSubTab === 'preferences' ? (
              <AISortPreferences />
            ) : activeSubTab === 'vibe-presets' ? (
              <div className="flex items-center justify-center flex-1 text-white/30 text-lg">
                Vibe Presets — coming soon
              </div>
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
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'review' && (
          <div className="flex items-center justify-center flex-1 text-white/30 text-lg">
            Review tab — coming soon
          </div>
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

      {/* Cull Slider Bar */}
      {activeTab === 'ai-sort' && (
        <CullSliderBar
          keepCount={keepCount}
          totalCount={totalPhotos || 847}
          aiRecommendation={Math.round((totalPhotos || 847) * 0.4)}
          onKeepCountChange={setKeepCount}
        />
      )}

      {/* Selection Toolbar (floating at bottom) */}
      <WorkspaceSelectionToolbar
        selectedCount={selectedIds.size}
        onStar={handleStar}
        onFlagRed={handleFlagRed}
        onFlagGreen={handleFlagGreen}
        onMove={handleMove}
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
            <UploadZone projectId={project.id} />
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
