// ─── Classifier Worker Utilities ─────────────────────────────────────────────
// Factory functions for spawning the MobileNet Web Worker and sending
// classification jobs to it.

import type { ClassificationResult } from './classifier-v2'
import type { PresetType } from './presets'
import type { WorkerInMessage, WorkerOutMessage } from './classifier.worker'

/**
 * Spawn the MobileNet classifier Web Worker.
 * Must be called from a browser context (not Node.js).
 */
export function createClassifierWorker(): Worker {
  return new Worker(new URL('./classifier.worker.ts', import.meta.url))
}

/**
 * Send a classify message to the worker and await the result.
 * Resolves with ClassificationResult on success; rejects on error.
 *
 * @param worker   The classifier worker created by createClassifierWorker()
 * @param imageData  ImageData from canvas or extractVideoFrame
 * @param preset   PresetType to classify against
 * @param mediaId  Unique identifier for this classification job
 */
export function classifyViaWorker(
  worker: Worker,
  imageData: ImageData,
  preset: PresetType,
  mediaId: string,
): Promise<ClassificationResult> {
  return new Promise<ClassificationResult>((resolve, reject) => {
    const handler = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data
      if (msg.type === 'result' && msg.mediaId === mediaId) {
        worker.removeEventListener('message', handler)
        resolve(msg.result)
      } else if (msg.type === 'error' && msg.mediaId === mediaId) {
        worker.removeEventListener('message', handler)
        reject(new Error(msg.error))
      }
    }

    worker.addEventListener('message', handler)

    const request: WorkerInMessage = { type: 'classify', mediaId, imageData, preset }
    worker.postMessage(request)
  })
}

/**
 * Cleanly terminate the classifier worker.
 */
export function terminateClassifierWorker(worker: Worker): void {
  worker.terminate()
}
