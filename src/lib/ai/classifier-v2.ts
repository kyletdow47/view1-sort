// ─── MobileNet Classifier ─────────────────────────────────────────────────────
// Loads MobileNet v2 via @tensorflow-models/mobilenet, classifies images using
// ImageNet labels, then maps predictions to photographer preset categories via
// matchPredictionToCategory from presets.ts.

import type * as MobileNetTypes from '@tensorflow-models/mobilenet'
import { matchPredictionToCategory, type PresetType } from './presets'
import { isBrowserDecodable, isVideoFile, extractVideoFrame } from './video-frame'

export interface ClassificationResult {
  category: string
  confidence: number
  predictions: Array<{ className: string; probability: number }>
  allScores: Record<string, number>
}

export interface SkippedResult extends ClassificationResult {
  skipped: true
  skipReason: 'raw_format' | 'file_too_large'
}

// Module-level cache — one model instance per page lifetime.
let cachedModel: MobileNetTypes.MobileNet | null = null

/**
 * Load MobileNet v2 (or return the cached instance on subsequent calls).
 */
export async function loadModel(): Promise<MobileNetTypes.MobileNet> {
  if (cachedModel !== null) return cachedModel
  const mobilenet = await import('@tensorflow-models/mobilenet')
  // Ensure TF.js backend is ready
  await import('@tensorflow/tfjs')
  cachedModel = await mobilenet.load()
  return cachedModel
}

/** Reset the cached model (useful in tests). */
export function resetModel(): void {
  cachedModel = null
}

/**
 * Classify an already-decoded image source against a preset's categories.
 * Accepts ImageData, HTMLImageElement, or HTMLCanvasElement — anything
 * MobileNet's classify() accepts.
 */
export async function classifyImage(
  imageSource: ImageData | HTMLImageElement | HTMLCanvasElement,
  preset: PresetType,
  topK = 5,
): Promise<ClassificationResult> {
  const model = await loadModel()
  const predictions = await model.classify(imageSource as HTMLImageElement, topK)

  const { category, confidence, allScores } = matchPredictionToCategory(predictions, preset)

  return {
    category,
    confidence,
    predictions,
    allScores,
  }
}

/**
 * Classify a File object against a preset's categories.
 *
 * - RAW / HEIC → returns `{ category: 'other', skipped: true, skipReason: 'raw_format' }`
 * - Files > 50 MB → returns `{ category: 'other', skipped: true, skipReason: 'file_too_large' }`
 * - Video (.mp4 / .mov / .webm) → extracts a frame at 25% duration, classifies it
 * - Image (JPEG / PNG / WEBP / TIFF) → loads via HTMLImageElement, classifies it
 */
export async function classifyFile(
  file: File,
  preset: PresetType,
): Promise<ClassificationResult | SkippedResult> {
  // Video files first: extract a single frame then classify
  if (isVideoFile(file.type)) {
    const imageData = await extractVideoFrame(file)
    return classifyImage(imageData, preset)
  }

  // Determine if the file can be decoded by the browser (JPEG/PNG/WEBP/TIFF, ≤50MB)
  const decodable = isBrowserDecodable(file)

  if (!decodable) {
    const skipReason: 'raw_format' | 'file_too_large' =
      file.size > 50 * 1024 * 1024 ? 'file_too_large' : 'raw_format'
    return {
      category: 'other',
      confidence: 0,
      predictions: [],
      allScores: {},
      skipped: true,
      skipReason,
    }
  }

  // Standard image: load via HTMLImageElement
  const imageSource = await loadImageElement(file)
  return classifyImage(imageSource, preset)
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Failed to load image: ${file.name}`))
    }
    img.src = objectUrl
  })
}
