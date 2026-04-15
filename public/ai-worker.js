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
let embeddingPipeline = null

/**
 * Convert a Tensor-like object to a plain float array so it can be structured-cloned
 * across the Worker boundary.
 */
function toFloatArray(tensor) {
  if (!tensor) return null
  if (tensor.data instanceof Float32Array) return Array.from(tensor.data)
  if (Array.isArray(tensor)) return tensor.flat(Infinity).map(Number)
  if (ArrayBuffer.isView(tensor)) return Array.from(tensor)
  return null
}

self.addEventListener('message', async (event) => {
  const { type, photoId, imageData, labels, topK, captureEmbedding } = event.data

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
      // Lazy-load the embedding pipeline on first use — not every page needs it.
      self.postMessage({ type: 'modelLoaded' })
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
    return
  }

  // ── Classify one photo (optionally capture its 512-dim embedding) ────────
  if (type === 'classify') {
    if (!classificationPipeline) {
      self.postMessage({ type: 'error', photoId, message: 'Model not loaded yet' })
      return
    }
    try {
      const rawOutput = await classificationPipeline(imageData, labels ?? [], { topk: topK ?? 5 })

      let embedding = null
      if (captureEmbedding) {
        try {
          if (!embeddingPipeline) {
            embeddingPipeline = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32')
          }
          const rawEmbedding = await embeddingPipeline(imageData, { pooling: 'mean', normalize: true })
          embedding = toFloatArray(rawEmbedding)
        } catch (embErr) {
          // Embedding failure is non-fatal — we still return the classification.
          console.warn('[ai-worker] embedding failed:', embErr)
        }
      }

      self.postMessage({
        type: 'result',
        photoId,
        // Worker returns label + score. Category is derived in the hook layer
        // via the preset's label→category map (or labels.ts as a fallback).
        // When captureEmbedding=true we also return the 512-dim vector so the
        // hook can persist it or use it for nearest-neighbor lookups.
        results: rawOutput.map((item) => ({
          photoId,
          label: item.label,
          score: item.score,
        })),
        embedding,
      })
    } catch (err) {
      self.postMessage({
        type: 'error',
        photoId,
        message: err instanceof Error ? err.message : String(err),
      })
    }
    return
  }

  // ── Embedding only (used by correction capture after a photo is already classified) ──
  if (type === 'embed') {
    try {
      if (!embeddingPipeline) {
        embeddingPipeline = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32')
      }
      const rawEmbedding = await embeddingPipeline(imageData, { pooling: 'mean', normalize: true })
      const embedding = toFloatArray(rawEmbedding)
      self.postMessage({ type: 'embedding', photoId, embedding })
    } catch (err) {
      self.postMessage({
        type: 'error',
        photoId,
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }
})
