'use client'

import { useMemo } from 'react'
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

import type { UploadItem } from '@/stores/uploadStore'
import type { Media } from '@/types/supabase'

interface UploadPhotoGridProps {
  projectId: string
  uploadItems: Record<string, UploadItem>
  completedMedia: Media[]
  classifierReady: boolean
  isAIRunning: boolean
  runAILabel: string
  onStartAISort: () => void
}

/**
 * Shows a thumbnail grid of queued/uploaded photos on the Upload sub-tab.
 *
 * - Active uploads (in uploadStore) show per-file progress + status badges.
 * - Already-uploaded media (fetched from Supabase) is shown when the upload
 *   queue is empty, so users revisiting the tab still see their photos.
 * - A "Start AI Sort →" CTA is shown whenever there are photos ready.
 */
export function UploadPhotoGrid({
  projectId,
  uploadItems,
  completedMedia,
  classifierReady,
  isAIRunning,
  runAILabel,
  onStartAISort,
}: UploadPhotoGridProps) {
  // Filter active upload queue to this project only
  const projectItems = useMemo(
    () => Object.values(uploadItems).filter((i) => i.projectId === projectId),
    [uploadItems, projectId],
  )

  // Map filename → thumbnail_url for completed uploads (active queue)
  const thumbnailMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of completedMedia) {
      if (m.thumbnail_url) map.set(m.filename, m.thumbnail_url)
    }
    return map
  }, [completedMedia])

  const activeCount = projectItems.length
  const readyCount = projectItems.filter((i) => i.status === 'complete').length

  // IDs of media already represented in the active upload queue (by filename match)
  const uploadingFilenames = useMemo(
    () => new Set(projectItems.map((i) => i.fileName)),
    [projectItems],
  )

  // Previously-uploaded media NOT currently in the active queue
  const previouslyUploaded = useMemo(
    () => completedMedia.filter((m) => !uploadingFilenames.has(m.filename)),
    [completedMedia, uploadingFilenames],
  )

  const totalPhotos = activeCount + previouslyUploaded.length

  // Nothing to show at all
  if (totalPhotos === 0) return null

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      {/* Header row: count + CTA */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-sm text-white/50">
          {activeCount > 0 && readyCount < activeCount ? (
            <span>
              Uploading{' '}
              <span className="text-white/80 font-medium">
                {readyCount}/{activeCount}
              </span>{' '}
              photos…
            </span>
          ) : (
            <span>
              <span className="text-white/80 font-medium">{totalPhotos}</span>{' '}
              photo{totalPhotos !== 1 ? 's' : ''} ready
            </span>
          )}
        </span>

        <button
          type="button"
          onClick={onStartAISort}
          disabled={!classifierReady || isAIRunning || totalPhotos === 0}
          className="flex items-center gap-2 rounded-xl bg-[#5749F4] px-4 py-2 text-sm font-semibold
            text-white hover:bg-[#4a3de0] disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {isAIRunning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {runAILabel === 'Run AI Sort' ? 'Start AI Sort →' : runAILabel}
        </button>
      </div>

      {/* Photo grid */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 pb-4">
          {/* Active upload queue items */}
          {projectItems.map((item) => {
            const thumb = thumbnailMap.get(item.fileName)
            const isComplete = item.status === 'complete'
            const isError = item.status === 'error'
            const isUploading = item.status === 'uploading'
            const progress = item.fileSize > 0
              ? Math.round((item.bytesUploaded / item.fileSize) * 100)
              : 0

            return (
              <div
                key={item.fileHash}
                className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.06] border border-white/[0.08]"
              >
                {thumb ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumb}
                    alt={item.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
                    <span className="text-[10px] text-white/30 text-center truncate w-full leading-tight">
                      {item.fileName}
                    </span>
                    {isUploading && (
                      <div className="w-3/4 h-0.5 rounded-full bg-white/10 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-1 right-1">
                  {isComplete && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 drop-shadow" />
                  )}
                  {isError && (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 drop-shadow" />
                  )}
                  {isUploading && (
                    <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin drop-shadow" />
                  )}
                  {(item.status === 'pending' || item.status === 'paused') && (
                    <Clock className="w-3.5 h-3.5 text-white/30 drop-shadow" />
                  )}
                </div>
              </div>
            )
          })}

          {/* Previously uploaded media (already in Supabase, not in active queue) */}
          {previouslyUploaded.map((media) => (
            <div
              key={media.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.06] border border-white/[0.08]"
            >
              {media.thumbnail_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={media.thumbnail_url}
                  alt={media.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
                  <span className="text-[10px] text-white/30 text-center truncate w-full leading-tight">
                    {media.filename}
                  </span>
                </div>
              )}
              {/* Already uploaded — show check */}
              <div className="absolute top-1 right-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
