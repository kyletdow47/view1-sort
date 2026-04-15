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
import { getCategoryForLabel as getGenericCategoryForLabel } from '@/lib/ai/labels'
import { getPreset, getAllLabels, getCategoryForLabel as getPresetCategoryForLabel, type SortPreset } from '@/lib/ai/presets'
import type { VisionClassifyResponse } from '@/app/api/ai/vision-classify/route'
import type { NearestMatchResponse } from '@/app/api/style/nearest-match/route'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ClassifyMediaInput {
  id: string
  thumbnail_url: string | null
}

export interface AIClassifierOutput {
  id: string
  category: string
  confidence: number
  /** True when Claude vision handled this photo (low CLIP confidence) */
  escalated?: boolean
  /** Set when Claude flagged the photo as not fitting any preset category */
  isAbnormal?: boolean
  /** Claude's suggested new category name (only set when isAbnormal) */
  suggestedCategory?: string
  /** Claude's one-sentence description (only set when escalated) */
  description?: string
  /** Set when the category came from nearest-neighbor match in the user's style library */
  personalised?: boolean
  /** 512-dim CLIP embedding — held on the output so callers can persist it on correction */
  embedding?: number[] | null
}

export interface CullInput {
  id: string
  file: File
}

export interface CullingProgress {
  current: number
  total: number
  isRunning: boolean
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
  /** Culling analysis progress (current file / total files) */
  cullingProgress: CullingProgress
  /** Error message if something went wrong */
  error: string | null
  /**
   * Classify all media items using their thumbnail URLs.
   * Batches in groups of 10 to keep the UI responsive.
   * Returns results and also POSTs them to /api/media/classify.
   */
  classifyBatch: (
    mediaItems: ClassifyMediaInput[],
    options?: {
      projectId?: string
      presetId?: string
      /**
       * CLIP confidence below this value triggers Claude vision escalation.
       * Default 0.22. Set to 0 to disable escalation entirely.
       */
      escalateBelow?: number
      /**
       * When true, also compute 512-dim CLIP embeddings per photo and query
       * the user's style library (/api/style/nearest-match) to personalise
       * predictions. Costs ~30% extra browser time per photo. Default true.
       */
      personalize?: boolean
    },
  ) => Promise<AIClassifierOutput[]>
  /**
   * Compute the 512-dim CLIP embedding for a single image. Used when the
   * caller (e.g. the drag-correction handler) needs to persist an embedding
   * into style_embeddings without re-running full classification.
   */
  embed: (fileOrUrl: File | string, photoId: string) => Promise<number[]>
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

/** CLIP confidence below this triggers Claude vision second-pass. */
const DEFAULT_ESCALATION_THRESHOLD = 0.22

/** Max concurrent vision-classify requests so we don't flood the edge function. */
const VISION_CONCURRENCY = 4

/**
 * Nearest-neighbor tuning.
 * - Need ≥ MIN_LIBRARY_SIZE user corrections before we'll trust the style library over CLIP.
 * - Need ≥ MIN_AGREEMENT of the top-K neighbors to agree on a category before we override.
 * - Need the top neighbor's cosine similarity ≥ MIN_SIMILARITY (avoid confident-but-wrong matches).
 */
const NN_K = 5
const MIN_LIBRARY_SIZE = 10
const MIN_AGREEMENT = 3
const MIN_SIMILARITY = 0.72

interface VisionEscalationInput {
  id: string
  thumbnailUrl: string
  initialDescription?: string
}

/**
 * Runs Claude vision on photos CLIP wasn't confident about. Updates each
 * corresponding output in-place with the vision result. Fails open: if the
 * vision endpoint is unavailable we keep the CLIP result.
 */
async function escalateToVision(
  inputs: VisionEscalationInput[],
  preset: SortPreset,
  outputByIndex: Map<string, { index: number; output: AIClassifierOutput }>,
  outputs: AIClassifierOutput[],
): Promise<void> {
  const presetCategories = preset.categories.map((c) => c.name)
  const presetIdForEdge = preset.id // edge function validates these exact strings

  // Simple concurrency limiter
  let cursor = 0
  const workers: Promise<void>[] = []

  const runOne = async () => {
    while (cursor < inputs.length) {
      const i = cursor++
      const { id, thumbnailUrl, initialDescription } = inputs[i]

      try {
        const res = await fetch('/api/ai/vision-classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoUrl: thumbnailUrl,
            preset: presetIdForEdge,
            categories: presetCategories,
            existingDescription: initialDescription,
          }),
        })

        if (!res.ok) continue

        const json = (await res.json()) as VisionClassifyResponse

        // Degraded fallback — keep the CLIP result
        if (json.source === 'degraded') continue

        const slot = outputByIndex.get(id)
        if (!slot) continue

        // Replace the CLIP result with the vision result
        const merged: AIClassifierOutput = {
          ...slot.output,
          escalated: true,
          description: json.description || undefined,
          isAbnormal: json.isAbnormal,
          ...(json.isAbnormal
            ? {
                category: 'Uncategorized',
                suggestedCategory: json.suggestedCategory,
                confidence: json.confidence,
              }
            : {
                category: json.category || slot.output.category,
                confidence: Math.max(json.confidence, slot.output.confidence),
              }),
        }

        outputs[slot.index] = merged
        slot.output = merged
      } catch {
        // Non-fatal — keep the CLIP result
      }
    }
  }

  for (let w = 0; w < Math.min(VISION_CONCURRENCY, inputs.length); w++) {
    workers.push(runOne())
  }
  await Promise.all(workers)
}

/**
 * Query the user's style library and override CLIP categories when the
 * top-K neighbors agree. In-place mutation of `outputs`. Fails open: any
 * error (network, RLS, empty library) leaves the CLIP results intact.
 */
async function applyPersonalisation(
  outputs: AIClassifierOutput[],
  presetId: string,
): Promise<void> {
  const queries = outputs
    .filter((o) => Array.isArray(o.embedding) && o.embedding.length > 0)
    .map((o) => ({ photoId: o.id, embedding: o.embedding as number[] }))

  if (queries.length === 0) return

  // Batch up to 50 at a time (the route enforces this limit)
  const allMatches: Record<string, NearestMatchResponse['matches'][string]> = {}
  let libraryTotal = 0

  for (let i = 0; i < queries.length; i += 50) {
    const chunk = queries.slice(i, i + 50)
    try {
      const res = await fetch('/api/style/nearest-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId, queries: chunk, k: NN_K }),
      })
      if (!res.ok) continue
      const json = (await res.json()) as NearestMatchResponse
      Object.assign(allMatches, json.matches)
      libraryTotal = Math.max(libraryTotal, json.libraryTotal)
    } catch {
      // Silent — personalisation is a nice-to-have, not a blocker.
    }
  }

  // Skip override entirely when the library isn't big enough to trust.
  if (libraryTotal < MIN_LIBRARY_SIZE) return

  const outputByIndex = new Map<string, { index: number; output: AIClassifierOutput }>()
  outputs.forEach((o, i) => outputByIndex.set(o.id, { index: i, output: o }))

  for (const [photoId, matches] of Object.entries(allMatches)) {
    if (!matches || matches.length === 0) continue

    const top = matches[0]
    // Require the top match to be genuinely similar. Cosine similarity in
    // [0,1]; 0.72 is roughly "same shot from a different angle" territory.
    if (top.similarity < MIN_SIMILARITY) continue

    // Majority-vote the top-K. At least MIN_AGREEMENT of NN_K must agree.
    const counts = new Map<string, number>()
    for (const m of matches) counts.set(m.category, (counts.get(m.category) ?? 0) + 1)

    let bestCat = ''
    let bestCount = 0
    for (const [cat, n] of counts) {
      if (n > bestCount) { bestCount = n; bestCat = cat }
    }

    if (bestCount < MIN_AGREEMENT) continue

    const slot = outputByIndex.get(photoId)
    if (!slot) continue

    // Blend similarity into confidence so the UI can show we're confident
    // not because CLIP said so, but because this photographer's own past
    // corrections point here.
    outputs[slot.index] = {
      ...slot.output,
      category: bestCat,
      confidence: Math.max(slot.output.confidence, top.similarity),
      personalised: true,
      // Escalation no longer applies if we've overridden with a personal match.
      isAbnormal: false,
    }
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAIClassifier(): UseAIClassifierReturn {
  const { status, loadProgress, error: workerError, classify, classifyWithEmbedding, embed } = useClassifier()
  const [runProgress, setRunProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cullingProgress, setCullingProgress] = useState<CullingProgress>({
    current: 0,
    total: 0,
    isRunning: false,
  })

  const classifyBatch = useCallback(
    async (
      mediaItems: ClassifyMediaInput[],
      options: {
        projectId?: string
        presetId?: string
        escalateBelow?: number
        personalize?: boolean
      } = {},
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

          const personalize = options.personalize !== false
          const batchResults = await Promise.allSettled(
            batch.map(async ({ id, thumbnail_url }) => {
              if (!thumbnail_url) return null
              // When personalising, also request the 512-dim embedding so we
              // can later query the user's style library for a better match.
              let results: ClassificationResult[]
              let embedding: number[] | null = null
              if (personalize) {
                const r = await classifyWithEmbedding(thumbnail_url, id, presetLabels)
                results = r.results
                embedding = r.embedding
              } else {
                results = await classify(thumbnail_url, id, presetLabels)
              }
              const top = results[0]
              if (!top) return null
              // Map the winning label to a human-readable preset category name
              // (e.g. 'iconic landmark' → 'Architecture' for the travel preset).
              // Falls back to the generic taxonomy from labels.ts when no preset
              // is active, or when the preset has no mapping for this label.
              const category =
                (preset && getPresetCategoryForLabel(preset, top.label)) ??
                getGenericCategoryForLabel(top.label)
              return {
                id,
                category,
                confidence: top.score,
                embedding,
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

        // ── Claude vision escalation ──
        // Photos where CLIP wasn't confident get a second pass from Claude.
        // Only active when a preset is resolved (edge function needs the
        // preset + category list to reason about what the photo should be).
        const threshold = options.escalateBelow ?? DEFAULT_ESCALATION_THRESHOLD
        if (preset && threshold > 0 && outputs.length > 0) {
          const outputByIndex = new Map<string, { index: number; output: AIClassifierOutput }>()
          outputs.forEach((o, i) => outputByIndex.set(o.id, { index: i, output: o }))

          const escalationInputs: VisionEscalationInput[] = []
          for (const output of outputs) {
            if (output.confidence < threshold) {
              const media = mediaItems.find((m) => m.id === output.id)
              if (media?.thumbnail_url) {
                escalationInputs.push({
                  id: output.id,
                  thumbnailUrl: media.thumbnail_url,
                })
              }
            }
          }

          if (escalationInputs.length > 0) {
            await escalateToVision(escalationInputs, preset, outputByIndex, outputs)
          }
        }

        // ── Personalisation via nearest-neighbor in the user's style library ──
        // Only runs when:
        //   1. A preset is resolved (we query per-preset libraries)
        //   2. At least one output has an embedding (personalize option was on)
        //   3. The library has enough embeddings to trust
        if (preset && options.personalize !== false) {
          await applyPersonalisation(outputs, preset.id)
        }

        // Persist to Supabase via API route
        if (outputs.length > 0 && options.projectId) {
          await fetch('/api/media/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: options.projectId,
              results: outputs.map(({ id, category, confidence, escalated, isAbnormal, suggestedCategory, description, personalised }) => ({
                mediaId: id,
                category,
                confidence,
                ...(escalated ? { escalated: true } : {}),
                ...(personalised ? { personalised: true } : {}),
                ...(isAbnormal ? { isAbnormal: true } : {}),
                ...(suggestedCategory ? { suggestedCategory } : {}),
                ...(description ? { description } : {}),
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
    [status, classify, classifyWithEmbedding],
  )

  const runCulling = useCallback(async (files: CullInput[]): Promise<Map<string, CullResult>> => {
    const resultMap = new Map<string, CullResult>()
    const hashMap = new Map<string, string>()

    setCullingProgress({ current: 0, total: files.length, isRunning: true })

    for (let i = 0; i < files.length; i++) {
      const { id, file } = files[i]
      try {
        const { result, hash } = await analyzeFile(file, id, hashMap)
        resultMap.set(id, result)
        if (hash) hashMap.set(id, hash)
      } catch {
        // Non-fatal — skip this file
      }
      setCullingProgress({ current: i + 1, total: files.length, isRunning: true })
    }

    setCullingProgress({ current: files.length, total: files.length, isRunning: false })
    return resultMap
  }, [])

  const runCullingOnFiles = useCallback(async (files: File[]): Promise<Map<string, CullResult>> => {
    const resultMap = new Map<string, CullResult>()
    const hashMap = new Map<string, string>()

    setCullingProgress({ current: 0, total: files.length, isRunning: true })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Use filename as key — reconciled with media ID after upload completes
        const { result, hash } = await analyzeFile(file, file.name, hashMap)
        resultMap.set(file.name, result)
        if (hash) hashMap.set(file.name, hash)
      } catch {
        // Non-fatal — skip this file
      }
      setCullingProgress({ current: i + 1, total: files.length, isRunning: true })
    }

    setCullingProgress({ current: files.length, total: files.length, isRunning: false })
    return resultMap
  }, [])

  return {
    status,
    loadProgress,
    runProgress,
    isRunning,
    cullingProgress,
    error: error ?? workerError,
    classifyBatch,
    runCulling,
    runCullingOnFiles,
    embed,
  }
}
