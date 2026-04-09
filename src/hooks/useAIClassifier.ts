'use client'

/**
 * useAIClassifier — Orchestrates the full AI sort pipeline.
 *
 * Responsibilities:
 *  1. Spawn + manage the CLIP Web Worker via useClassifier
 *  2. classifyBatch: classify all project media by thumbnail URL in batches
 *  3. writeToDB: POST results to /api/media/classify
 *  4. runCulling: run canvas-based blur/duplicate/exposure analysis
 *  5. Track overall progress across a run
 */

import { useCallback, useState } from 'react'
import { useClassifier } from './useClassifier'
import { analyzeFile, type CullResult } from '@/lib/ai/culling'
import type { ClassificationResult } from '@/lib/ai/classifier'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ClassifyMediaInput {
  id: string
  thumbnail_url: string | null
}

export interface AIClassifierOutput {
  id: string
  category: string
  confidence: number
}

export interface CullInput {
  id: string
  file: File
}

export interface UseAIClassifierReturn {
  /** Worker model status (loading / ready / classifying / error) */
  status: ReturnType<typeof useClassifier>['status']
  /** Model download progress 0–100 */
  loadProgress: number
  /** Overall batch run progress 0–100 */
  runProgress: number
  /** True while a batch run is in progress */
  isRunning: boolean
  /** Error message if something went wrong */
  error: string | null
  /**
   * Classify all media items using their thumbnail URLs.
   * Batches in groups of 10 to keep the UI responsive.
   * Returns results and also POSTs them to /api/media/classify.
   */
  classifyBatch: (
    mediaItems: ClassifyMediaInput[],
    options?: { projectId?: string; presetId?: string },
  ) => Promise<AIClassifierOutput[]>
  /**
   * Run canvas-based culling (blur / duplicate / overexposed) on File objects.
   * Used during upload flow where raw files are available.
   * Returns a map of mediaId → CullResult.
   */
  runCulling: (files: CullInput[]) => Promise<Map<string, CullResult>>
  /**
   * Run canvas-based culling on raw File objects during upload.
   * Returns a map of filename → CullResult for later reconciliation with media IDs.
   */
  runCullingOnFiles: (files: File[]) => Promise<Map<string, CullResult>>
}

const BATCH_SIZE = 10

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAIClassifier(): UseAIClassifierReturn {
  const { status, loadProgress, error: workerError, classify } = useClassifier()
  const [runProgress, setRunProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const classifyBatch = useCallback(
    async (
      mediaItems: ClassifyMediaInput[],
      options: { projectId?: string; presetId?: string } = {},
    ): Promise<AIClassifierOutput[]> => {
      if (status !== 'ready') {
        throw new Error('AI model is not ready — wait for model to finish loading')
      }
      if (mediaItems.length === 0) return []

      setIsRunning(true)
      setRunProgress(0)
      setError(null)

      const startTime = Date.now()
      const outputs: AIClassifierOutput[] = []

      try {
        for (let i = 0; i < mediaItems.length; i += BATCH_SIZE) {
          const batch = mediaItems.slice(i, i + BATCH_SIZE)

          const batchResults = await Promise.allSettled(
            batch.map(async ({ id, thumbnail_url }) => {
              if (!thumbnail_url) return null
              // Create a synthetic File-like object from the URL for classify().
              // Since useClassifier.classify() calls fileToBase64(file), we need
              // to fetch the thumbnail and wrap it as a Blob/File.
              const res = await fetch(thumbnail_url)
              const blob = await res.blob()
              const file = new File([blob], `${id}.jpg`, { type: blob.type || 'image/jpeg' })
              const results: ClassificationResult[] = await classify(file, id)
              // Take the top result as the canonical category
              const top = results[0]
              if (!top) return null
              return {
                id,
                category: top.category as string,
                confidence: top.score,
              } satisfies AIClassifierOutput
            }),
          )

          for (const settled of batchResults) {
            if (settled.status === 'fulfilled' && settled.value !== null) {
              outputs.push(settled.value)
            }
          }

          const processed = Math.min(i + BATCH_SIZE, mediaItems.length)
          setRunProgress(Math.round((processed / mediaItems.length) * 100))

          // Yield to the browser between batches
          await new Promise((r) => setTimeout(r, 0))
        }

        // Persist to Supabase via API route
        if (outputs.length > 0 && options.projectId) {
          await fetch('/api/media/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: options.projectId,
              results: outputs.map(({ id, category, confidence }) => ({
                mediaId: id,
                category,
                confidence,
              })),
              durationMs: Date.now() - startTime,
              presetId: options.presetId,
            }),
          })
        }

        setRunProgress(100)
        return outputs
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Classification failed'
        setError(msg)
        throw new Error(msg)
      } finally {
        setIsRunning(false)
      }
    },
    [status, classify],
  )

  const runCulling = useCallback(async (files: CullInput[]): Promise<Map<string, CullResult>> => {
    const resultMap = new Map<string, CullResult>()
    const hashMap = new Map<string, string>()

    for (const { id, file } of files) {
      try {
        const { result, hash } = await analyzeFile(file, id, hashMap)
        resultMap.set(id, result)
        if (hash) hashMap.set(id, hash)
      } catch {
        // Non-fatal — skip this file
      }
    }

    return resultMap
  }, [])

  const runCullingOnFiles = useCallback(async (files: File[]): Promise<Map<string, CullResult>> => {
    const resultMap = new Map<string, CullResult>()
    const hashMap = new Map<string, string>()

    for (const file of files) {
      try {
        // Use filename as key — reconciled with media ID after upload completes
        const { result, hash } = await analyzeFile(file, file.name, hashMap)
        resultMap.set(file.name, result)
        if (hash) hashMap.set(file.name, hash)
      } catch {
        // Non-fatal — skip this file
      }
    }

    return resultMap
  }, [])

  return {
    status,
    loadProgress,
    runProgress,
    isRunning,
    error: error ?? workerError,
    classifyBatch,
    runCulling,
    runCullingOnFiles,
  }
}
