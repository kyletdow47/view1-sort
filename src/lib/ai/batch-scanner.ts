/**
 * Batch scanner: orchestrates the pre-scan pipeline for uploaded photos.
 *
 * For each photo in a batch, it runs:
 * 1. SigLIP classification (top labels + scores)
 * 2. Culling analysis (blur, exposure, duplicates)
 * 3. EXIF metadata extraction (timestamp, camera, GPS)
 *
 * This runs in the browser (Web Worker) immediately after upload,
 * before the photographer starts the sorting conversation.
 */

import { classify } from './classifier'
import { analyzeFile, computeHash } from './culling'
import { extractExif } from './exif'
import { fileToBase64 } from './utils'
import type { ClassificationResult } from './classifier'
import type { CullFlag } from './culling'
import type { ExifData } from './exif'
import type { PhotoCategory } from './labels'

export interface PhotoScan {
  photoId: string
  topLabels: Array<{ label: string; score: number; category: PhotoCategory }>
  quality: {
    sharpness: number
    exposure: number
    flags: CullFlag[]
  }
  exif: ExifData
  duplicateGroupId: string | null
  hash: string
}

export interface ScanProgress {
  completed: number
  total: number
  currentPhotoId: string
}

export interface ScanBatchOptions {
  labels?: string[]
  topK?: number
  onProgress?: (progress: ScanProgress) => void
}

/**
 * Scan a batch of photos. Each photo gets classified, quality-checked, and EXIF-extracted.
 *
 * @param files Map of photoId -> File
 * @param options Classification options and progress callback
 * @returns Array of PhotoScan results
 */
export async function scanBatch(
  files: Map<string, File>,
  options: ScanBatchOptions = {}
): Promise<PhotoScan[]> {
  const { labels, topK = 5, onProgress } = options
  const results: PhotoScan[] = []
  const hashes = new Map<string, string>()
  let dupGroupCounter = 0
  const hashToDupGroup = new Map<string, string>()

  let completed = 0
  const total = files.size

  for (const [photoId, file] of files) {
    onProgress?.({ completed, total, currentPhotoId: photoId })

    // Run classification, culling, and EXIF in parallel for each photo
    const imageData = await fileToBase64(file)

    const [classificationResults, cullResult, exifData] = await Promise.all([
      classify(imageData, photoId, topK, labels),
      analyzeFile(file, photoId, hashes),
      extractExif(file),
    ])

    // Track hash for duplicate detection
    const hash = cullResult.hash
    if (hash) {
      hashes.set(photoId, hash)
    }

    // Assign duplicate group IDs
    let duplicateGroupId: string | null = null
    const dupFlag = cullResult.result.flags.find((f) => f.type === 'duplicate')
    if (dupFlag && hash) {
      // Find or create a duplicate group for this hash cluster
      const existingGroup = findDupGroup(hash, hashes, hashToDupGroup)
      if (existingGroup) {
        duplicateGroupId = existingGroup
      } else {
        dupGroupCounter++
        duplicateGroupId = `dup-${dupGroupCounter}`
      }
      hashToDupGroup.set(hash, duplicateGroupId)
    }

    // Extract quality metrics from culling
    const blurFlag = cullResult.result.flags.find((f) => f.type === 'blurry')
    const exposureFlags = cullResult.result.flags.filter(
      (f) => f.type === 'overexposed' || f.type === 'underexposed'
    )

    // Sharpness: 100 = perfectly sharp, lower = blurrier
    const sharpness = blurFlag ? Math.round((1 - blurFlag.confidence) * 100) : 100
    // Exposure: 100 = well-exposed, lower = problematic
    const exposure = exposureFlags.length > 0
      ? Math.round((1 - Math.max(...exposureFlags.map((f) => f.confidence))) * 100)
      : 100

    results.push({
      photoId,
      topLabels: classificationResults.map((r: ClassificationResult) => ({
        label: r.label,
        score: r.score,
        category: r.category,
      })),
      quality: {
        sharpness,
        exposure,
        flags: cullResult.result.flags,
      },
      exif: exifData,
      duplicateGroupId,
      hash,
    })

    completed++
  }

  onProgress?.({ completed: total, total, currentPhotoId: '' })
  return results
}

/**
 * Find an existing duplicate group by checking hamming distance of hashes.
 */
function findDupGroup(
  hash: string,
  allHashes: Map<string, string>,
  hashToGroup: Map<string, string>
): string | null {
  for (const [, existingHash] of allHashes) {
    if (existingHash === hash) continue
    const group = hashToGroup.get(existingHash)
    if (group) {
      // Check if hashes are close enough (hamming distance)
      let dist = 0
      for (let i = 0; i < Math.min(hash.length, existingHash.length); i++) {
        if (hash[i] !== existingHash[i]) dist++
      }
      if (dist <= 8) return group
    }
  }
  return null
}
