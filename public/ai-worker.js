/**
 * AI classification worker — served as a static public file so it is
 * NEVER processed by Turbopack or Webpack. Loads @xenova/transformers
 * directly from CDN as an ES module, which also ensures the ONNX WASM
 * binaries are fetched from a stable absolute URL.
 *
 * Instantiate with: new Worker('/ai-worker.js', { type: 'module' })
 */

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.js'

// Allow Hugging Face model downloads and cache in IndexedDB
env.allowRemoteModels = true
env.useBrowserCache = true

// Always resolve WASM from the CDN — avoids any local path resolution issues
env.backends.onnx.wasm.wasmPaths =
  'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/'

let classificationPipeline = null

self.addEventListener('message', async (event) => {
  const { type, photoId, imageData, labels, topK } = event.data

  // ── Load model ────────────────────────────────────────────────────────────
  if (type === 'loadModel') {
    try {
      classificationPipeline = await pipeline(
        'zero-shot-image-classification',
        'Xenova/clip-vit-base-patch32',
        {
          progress_callback: (info) => {
            if (info && typeof info.progress === 'number') {
              self.postMessage({ type: 'loadProgress', progress: Math.round(info.progress) })
            }
          },
        }
      )
      self.postMessage({ type: 'modelLoaded' })
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
    return
  }

  // ── Classify one photo ────────────────────────────────────────────────────
  if (type === 'classify') {
    if (!classificationPipeline) {
      self.postMessage({ type: 'error', photoId, message: 'Model not loaded yet' })
      return
    }
    try {
      const rawOutput = await classificationPipeline(imageData, labels ?? [], { topk: topK ?? 5 })
      self.postMessage({
        type: 'result',
        photoId,
        // category is resolved by the UI using preset label mappings
        results: rawOutput.map((item) => ({
          photoId,
          label: item.label,
          score: item.score,
          category: 'other',
        })),
      })
    } catch (err) {
      self.postMessage({
        type: 'error',
        photoId,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }
})
