/**
 * Web Worker for non-blocking AI image classification.
 *
 * Usage (from main thread):
 *   const worker = new Worker(new URL('./worker.ts', import.meta.url))
 *   worker.postMessage({ type: 'loadModel' })
 *   worker.postMessage({ type: 'classify', photoId: 'abc', imageData: 'data:...' })
 *   worker.onmessage = (e) => console.log(e.data)
 */

import { loadModel, classify, embed } from './classifier'
import type { ClassificationResult } from './classifier'

export type WorkerRequest =
  | { type: 'loadModel' }
  | { type: 'classify'; photoId: string; imageData: string; labels?: string[]; topK?: number; captureEmbedding?: boolean }
  | { type: 'embed'; photoId: string; imageData: string }

export type WorkerResponse =
  | { type: 'modelLoaded' }
  | { type: 'loadProgress'; progress: number }
  | { type: 'result'; photoId: string; results: ClassificationResult[]; embedding?: number[] | null }
  | { type: 'embedding'; photoId: string; embedding: number[] }
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
      const results = await classify(req.imageData, req.photoId, req.labels, req.topK ?? 5)
      let embedding: number[] | null = null
      if (req.captureEmbedding) {
        try {
          embedding = await embed(req.imageData)
        } catch (embErr) {
          // Non-fatal — classification still succeeds.
          console.warn('[worker] embedding failed:', embErr)
        }
      }
      const response: WorkerResponse = { type: 'result', photoId: req.photoId, results, embedding }
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

  if (req.type === 'embed') {
    try {
      const embedding = await embed(req.imageData)
      const response: WorkerResponse = { type: 'embedding', photoId: req.photoId, embedding }
      self.postMessage(response)
    } catch (err) {
      const response: WorkerResponse = {
        type: 'error',
        photoId: req.photoId,
        message: err instanceof Error ? err.message : 'Embedding failed',
      }
      self.postMessage(response)
    }
  }
})
