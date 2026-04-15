/**
 * Web Worker for non-blocking AI image classification and batch scanning.
 *
 * Usage (from main thread):
 *   const worker = new Worker(new URL('./worker.ts', import.meta.url))
 *   worker.postMessage({ type: 'loadModel' })
 *   worker.postMessage({ type: 'classify', photoId: 'abc', imageData: 'data:...' })
 *   worker.onmessage = (e) => console.log(e.data)
 */

import { loadModel, classify } from './classifier'
import { extractExif } from './exif'
import type { ClassificationResult } from './classifier'
import type { ExifData } from './exif'
import type { PhotoScan } from './batch-scanner'
import type { BatchSummary } from './batch-summary'

export type WorkerRequest =
  | { type: 'loadModel' }
  | { type: 'classify'; photoId: string; imageData: string; topK?: number; labels?: string[] }
  | { type: 'extractExif'; photoId: string; fileBuffer: ArrayBuffer }
  | { type: 'scanBatch'; files: Array<{ photoId: string; imageData: string; fileBuffer: ArrayBuffer }>; labels?: string[]; topK?: number }

export type WorkerResponse =
  | { type: 'modelLoaded' }
  | { type: 'loadProgress'; progress: number }
  | { type: 'result'; photoId: string; results: ClassificationResult[] }
  | { type: 'exifResult'; photoId: string; exif: ExifData }
  | { type: 'scanProgress'; completed: number; total: number; currentPhotoId: string }
  | { type: 'scanComplete'; scans: PhotoScan[]; summary: BatchSummary }
  | { type: 'error'; photoId?: string; message: string }

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data

  if (req.type === 'loadModel') {
    try {
      await loadModel((progress) => {
        const response: WorkerResponse = { type: 'loadProgress', progress }
        self.postMessage(response)
      })
      const response: WorkerResponse = { type: 'modelLoaded' }
      self.postMessage(response)
    } catch (err) {
      const response: WorkerResponse = {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load model',
      }
      self.postMessage(response)
    }
    return
  }

  if (req.type === 'classify') {
    try {
      const results = await classify(req.imageData, req.photoId, req.topK ?? 5, req.labels)
      const response: WorkerResponse = { type: 'result', photoId: req.photoId, results }
      self.postMessage(response)
    } catch (err) {
      const response: WorkerResponse = {
        type: 'error',
        photoId: req.photoId,
        message: err instanceof Error ? err.message : 'Classification failed',
      }
      self.postMessage(response)
    }
    return
  }

  if (req.type === 'extractExif') {
    try {
      const exif = await extractExif(req.fileBuffer)
      const response: WorkerResponse = { type: 'exifResult', photoId: req.photoId, exif }
      self.postMessage(response)
    } catch (err) {
      const response: WorkerResponse = {
        type: 'error',
        photoId: req.photoId,
        message: err instanceof Error ? err.message : 'EXIF extraction failed',
      }
      self.postMessage(response)
    }
    return
  }

  if (req.type === 'scanBatch') {
    try {
      // Lazy import to avoid loading batch-scanner + batch-summary until needed
      const { scanBatchFromWorkerData } = await import('./batch-scanner-worker')
      const { scans, summary } = await scanBatchFromWorkerData(
        req.files,
        { labels: req.labels, topK: req.topK },
        (progress) => {
          const response: WorkerResponse = {
            type: 'scanProgress',
            completed: progress.completed,
            total: progress.total,
            currentPhotoId: progress.currentPhotoId,
          }
          self.postMessage(response)
        }
      )
      const response: WorkerResponse = { type: 'scanComplete', scans, summary }
      self.postMessage(response)
    } catch (err) {
      const response: WorkerResponse = {
        type: 'error',
        message: err instanceof Error ? err.message : 'Batch scan failed',
      }
      self.postMessage(response)
    }
  }
})
