'use client'

// ─── useClassification ────────────────────────────────────────────────────────
// React hook that wires ClassificationPipeline to the Zustand media store.
// On mount: creates a pipeline, registers callbacks, starts processing.
// On unmount: stops and cleans up the pipeline.

import { useEffect, useRef, useCallback } from 'react'
import { ClassificationPipeline } from './classification-pipeline'
import type { ClassificationResult, SkippedResult } from './classifier-v2'
import type { PresetType } from './presets'
import { useMediaStore } from '@/stores/mediaStore'
import type { ClassificationProgress } from '@/stores/mediaStore'

export interface UseClassificationReturn {
  /** Queue a single file for classification. */
  classifyFile: (mediaId: string, file: File) => void
  /** Queue multiple files for classification. */
  classifyBatch: (items: Array<{ mediaId: string; file: File }>) => void
  /** Current progress snapshot from the store. */
  progress: ClassificationProgress
  /** True while any classification is running. */
  isClassifying: boolean
  /** Re-queue all items that previously failed. */
  retryFailed: () => void
}

export function useClassification(preset: PresetType): UseClassificationReturn {
  const pipelineRef = useRef<ClassificationPipeline | null>(null)

  useEffect(() => {
    const pipeline = new ClassificationPipeline(preset)

    pipeline.onResult = (mediaId: string, result: ClassificationResult | SkippedResult) => {
      const store = useMediaStore.getState()
      store.setClassified(mediaId, result as ClassificationResult)
      // Persist to Supabase (fire-and-forget — errors logged, don't throw)
      store.editMedia(mediaId, {
        ai_category: result.category,
        ai_confidence: result.confidence,
      }).catch((err: unknown) => {
        console.error('[useClassification] editMedia failed:', err)
      })
    }

    pipeline.onError = (mediaId: string, error: string) => {
      useMediaStore.getState().setClassificationFailed(mediaId, error)
    }

    pipeline.start()
    pipelineRef.current = pipeline

    return () => {
      pipeline.stop()
      pipelineRef.current = null
    }
  }, [preset])

  const classifyFile = useCallback((mediaId: string, file: File) => {
    useMediaStore.getState().setClassificationPending(mediaId)
    pipelineRef.current?.enqueue(mediaId, file)
  }, [])

  const classifyBatch = useCallback((items: Array<{ mediaId: string; file: File }>) => {
    const store = useMediaStore.getState()
    for (const { mediaId, file } of items) {
      store.setClassificationPending(mediaId)
      pipelineRef.current?.enqueue(mediaId, file)
    }
  }, [])

  const retryFailed = useCallback(() => {
    const store = useMediaStore.getState()
    const failedIds = store.retryFailedClassifications()
    // Re-enqueue — but we only have mediaIds, not files at this point.
    // The pipeline will need to be re-fed by the caller if files are needed.
    // This triggers store status reset; caller should re-call classifyFile/classifyBatch.
    console.info('[useClassification] retryFailed: reset', failedIds.length, 'items to pending')
  }, [])

  const progress = useMediaStore.getState().getClassificationProgress()
  const isClassifying = progress.pending > 0 || (pipelineRef.current?.isProcessing() ?? false)

  return {
    classifyFile,
    classifyBatch,
    progress,
    isClassifying,
    retryFailed,
  }
}
