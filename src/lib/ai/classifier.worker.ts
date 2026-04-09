// ─── MobileNet Web Worker ─────────────────────────────────────────────────────
// Runs MobileNet classification off the main thread.
// Listens for 'classify' and 'preload' messages; posts 'result', 'error',
// and 'ready' responses.

import { loadModel, classifyImage, resetModel } from './classifier-v2'
import type { ClassificationResult } from './classifier-v2'
import type { PresetType } from './presets'

export type WorkerInMessage =
  | { type: 'preload' }
  | { type: 'classify'; mediaId: string; imageData: ImageData; preset: PresetType }

export type WorkerOutMessage =
  | { type: 'ready' }
  | { type: 'result'; mediaId: string; result: ClassificationResult }
  | { type: 'error'; mediaId: string; error: string }

self.addEventListener('message', async (event: MessageEvent<WorkerInMessage>) => {
  const msg = event.data

  if (msg.type === 'preload') {
    try {
      await loadModel()
      const response: WorkerOutMessage = { type: 'ready' }
      self.postMessage(response)
    } catch (err) {
      // Preload failure is non-fatal — worker stays alive
      console.error('[ClassifierWorker] preload failed:', err)
    }
    return
  }

  if (msg.type === 'classify') {
    try {
      const result = await classifyImage(msg.imageData, msg.preset)
      const response: WorkerOutMessage = { type: 'result', mediaId: msg.mediaId, result }
      self.postMessage(response)
    } catch (err) {
      const response: WorkerOutMessage = {
        type: 'error',
        mediaId: msg.mediaId,
        error: err instanceof Error ? err.message : 'Classification failed',
      }
      self.postMessage(response)
    }
  }
})

export { resetModel }
