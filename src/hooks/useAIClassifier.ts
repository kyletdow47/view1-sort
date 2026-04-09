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
import { getPreset, getAllLabels, getCategoryForLabel as getPresetCategoryForLabel } from '@/lib/ai/presets'

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

      // Resolve the active preset so we use niche-specific labels and category names.
      // Falls back to the generic labels.ts taxonomy when no preset is provided.
      const preset = options.presetId ? getPreset(options.presetId) : undefined
      const presetLabels = preset ? getAllLabels(preset) : undefined

      try {
        for (let i = 0; i < mediaItems.length; i += BATCH_SIZE) {
          const batch = mediaItems.slice(i, i + BATCH_SIZE)

          const batchResults = await Promise.allSettled(
            batch.map(async ({ id, thumbnail_url }) => {
              if (!thumbnail_url) return null
              // Pass the URL directly — @xenova/transformers fetches it internally,
              // avoiding the CORS preflight we would get from a client-side fetch().
              // Pass preset-specific labels when available so the model scores against
              // niche-appropriate vocabulary (travel, wedding, real-estate, etc.)
              const results: ClassificationResult[] = await classify(thumbnail_url, id, presetLabels)
              // Take the top result as the canonical category
              const top = results[0]
              if (!top) return null
              // Map the winning label to a human-readable preset category name
              // (e.g. 'iconic landmark' → 'Architecture' for the travel preset).
              // Fall back to the PhotoCategory value from labels.ts when no preset is active.
              const category = preset
                ? (getPresetCategoryForLabel(preset, top.label) ?? top.category as string)
                : (top.category as string)
              return {
                id,
                category,
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
