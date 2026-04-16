import { pipeline, env } from '@xenova/transformers'
import type { PhotoCategory } from './labels'
import { LABEL_STRINGS, getCategoryForLabel } from './labels'

// Allow remote model downloads and cache in browser IndexedDB
env.allowRemoteModels = true
env.useBrowserCache = true

// Fix for Turbopack/Next.js dev mode: when the worker is compiled as a blob
// URL, relative WASM paths (./ort-wasm-simd.wasm) have no valid base and fail
// silently. Point ONNX Runtime to the CDN so WASM is always resolved
// absolutely — works in dev (Turbopack), production (Webpack), and Vercel.
const TRANSFORMERS_VERSION = '2.17.2'
;(env as unknown as { backends: { onnx: { wasm: { wasmPaths: string } } } })
  .backends.onnx.wasm.wasmPaths =
  `https://cdn.jsdelivr.net/npm/@xenova/transformers@${TRANSFORMERS_VERSION}/dist/`

export interface ClassificationResult {
  photoId: string
  label: string
  score: number
  category: PhotoCategory
}

type RawPipelineResult = Array<{ label: string; score: number }>

// SigLIP / CLIP model hosted on Hugging Face via Xenova
const MODEL_ID = 'Xenova/clip-vit-base-patch32'

type ClassificationPipeline = Awaited<ReturnType<typeof pipeline>>
let pipelineInstance: ClassificationPipeline | null = null

type ProgressInfo = { status: string; progress?: number }

/**
 * Load (or reuse a cached) zero-shot image classification pipeline.
 * Calls onProgress with [0–100] as the model downloads.
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
 * Classify an image against the photography label taxonomy.
 *
 * @param imageSource  Base64 data URL, object URL, or remote URL
 * @param photoId      Caller-supplied ID attached to each result
 * @param topK         Number of top labels to return (default 5)
 */
export async function classify(
  imageSource: string,
  photoId: string,
  labels: string[] = LABEL_STRINGS,
  topK = 5
): Promise<ClassificationResult[]> {
  if (pipelineInstance === null) {
    await loadModel()
  }

  const pipe = pipelineInstance as ClassificationPipeline
  const rawOutput = (await (pipe as any)(imageSource, labels, { topk: topK })) as RawPipelineResult

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
