import { pipeline, env } from '@huggingface/transformers'
import type { PhotoCategory } from './labels'
import { LABEL_STRINGS, getCategoryForLabel } from './labels'

// Allow remote model downloads and cache in browser IndexedDB
env.allowRemoteModels = true
env.useBrowserCache = true

export interface ClassificationResult {
  photoId: string
  label: string
  score: number
  category: PhotoCategory
}

type RawPipelineResult = Array<{ label: string; score: number }>

// SigLIP model for zero-shot image classification (much stronger than CLIP ViT-Base)
const MODEL_ID = 'Xenova/siglip-base-patch16-224'

type ClassificationPipeline = Awaited<ReturnType<typeof pipeline>>
let pipelineInstance: ClassificationPipeline | null = null

type ProgressInfo = { status: string; progress?: number }

/**
 * Load (or reuse a cached) zero-shot image classification pipeline.
 * Calls onProgress with [0-100] as the model downloads.
 */
export async function loadModel(onProgress?: (progress: number) => void): Promise<void> {
  if (pipelineInstance !== null) return

  pipelineInstance = await pipeline('zero-shot-image-classification', MODEL_ID, {
    progress_callback: (info: unknown) => {
      if (!onProgress) return
      const p = info as ProgressInfo
      if (typeof p?.progress === 'number') {
        onProgress(Math.round(p.progress))
      }
    },
  })
}

/**
 * Classify an image against a set of labels.
 *
 * @param imageSource  Base64 data URL, object URL, or remote URL
 * @param photoId      Caller-supplied ID attached to each result
 * @param topK         Number of top labels to return (default 5)
 * @param labels       Custom label strings to classify against (defaults to base taxonomy)
 */
export async function classify(
  imageSource: string,
  photoId: string,
  topK = 5,
  labels?: string[]
): Promise<ClassificationResult[]> {
  if (pipelineInstance === null) {
    await loadModel()
  }

  const labelSet = labels ?? LABEL_STRINGS
  const pipe = pipelineInstance as ClassificationPipeline
  const rawOutput = (await (pipe as unknown as (image: string, labels: string[], opts: { topk: number }) => Promise<RawPipelineResult>)(imageSource, labelSet, { topk: topK }))

  return rawOutput.map((item) => ({
    photoId,
    label: item.label,
    score: item.score,
    category: getCategoryForLabel(item.label),
  }))
}

/** Reset the cached pipeline (useful for testing). */
export function resetModel(): void {
  pipelineInstance = null
}
