/**
 * Worker-compatible batch scanner.
 *
 * Unlike batch-scanner.ts (which accepts File objects), this module
 * accepts pre-serialized data (base64 strings + ArrayBuffers) that
 * can be passed through postMessage to the Web Worker.
 */

import { classify } from './classifier'
import { extractExif } from './exif'
import { generateBatchSummary } from './batch-summary'
import type { ClassificationResult } from './classifier'
import type { PhotoScan, ScanProgress } from './batch-scanner'
import type { BatchSummary } from './batch-summary'

interface WorkerFileData {
  photoId: string
  imageData: string      // base64 data URL for classification
  fileBuffer: ArrayBuffer // raw bytes for EXIF extraction
}

interface WorkerScanOptions {
  labels?: string[]
  topK?: number
}

/**
 * Run the full scan pipeline on pre-serialized file data from the worker message.
 */
export async function scanBatchFromWorkerData(
  files: WorkerFileData[],
  options: WorkerScanOptions = {},
  onProgress?: (progress: ScanProgress) => void
): Promise<{ scans: PhotoScan[]; summary: BatchSummary }> {
  const { labels, topK = 5 } = options
  const results: PhotoScan[] = []

  let completed = 0
  const total = files.length

  for (const file of files) {
    onProgress?.({ completed, total, currentPhotoId: file.photoId })

    // Run classification and EXIF extraction in parallel
    const [classificationResults, exifData] = await Promise.all([
      classify(file.imageData, file.photoId, topK, labels),
      extractExif(file.fileBuffer),
    ])

    results.push({
      photoId: file.photoId,
      topLabels: classificationResults.map((r: ClassificationResult) => ({
        label: r.label,
        score: r.score,
        category: r.category,
      })),
      quality: {
        // Quality analysis requires canvas (browser main thread only).
        // In the worker context, we skip culling and set defaults.
        // The main thread can run culling separately via analyzeFile().
        sharpness: 100,
        exposure: 100,
        flags: [],
      },
      exif: exifData,
      duplicateGroupId: null,
      hash: '',
    })

    completed++
  }

  onProgress?.({ completed: total, total, currentPhotoId: '' })

  const summary = generateBatchSummary(results)
  return { scans: results, summary }
}
