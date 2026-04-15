'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClassificationResult } from '@/lib/ai/classifier'
import type { WorkerRequest, WorkerResponse } from '@/lib/ai/worker'
import { fileToBase64 } from '@/lib/ai/utils'

export type ClassifierStatus = 'idle' | 'loading' | 'ready' | 'classifying' | 'error'

export interface ClassifyResultWithEmbedding {
  results: ClassificationResult[]
  /** Present only when classify() was called with captureEmbedding=true */
  embedding: number[] | null
}

export interface UseClassifierReturn {
  status: ClassifierStatus
  loadProgress: number
  error: string | null
  /**
   * Classify an image.
   * Pass a File/Blob (converted to base64) or a URL string — the CLIP pipeline
   * accepts both. Passing a URL avoids a CORS fetch round-trip.
   * Optionally supply a custom `labels` array (e.g. from a preset) to override
   * the default wedding-only taxonomy in labels.ts.
   */
  classify: (fileOrUrl: File | string, photoId: string, labels?: string[], topK?: number) => Promise<ClassificationResult[]>
  /**
   * Same as classify() but also returns the 512-dim CLIP embedding. Used by
   * the sort + correction flow to populate style_embeddings.
   */
  classifyWithEmbedding: (
    fileOrUrl: File | string,
    photoId: string,
    labels?: string[],
    topK?: number,
  ) => Promise<ClassifyResultWithEmbedding>
  /** Extract only the 512-dim embedding (no classification). */
  embed: (fileOrUrl: File | string, photoId: string) => Promise<number[]>
}

export function useClassifier(): UseClassifierReturn {
  const workerRef = useRef<Worker | null>(null)
  const [status, setStatus] = useState<ClassifierStatus>('idle')
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  type PendingResolver =
    | { kind: 'classify'; resolve: (r: ClassificationResult[]) => void; reject: (e: Error) => void }
    | { kind: 'classifyWithEmbedding'; resolve: (r: ClassifyResultWithEmbedding) => void; reject: (e: Error) => void }
    | { kind: 'embed'; resolve: (r: number[]) => void; reject: (e: Error) => void }

  // Pending resolve/reject keyed by photoId
  const pendingRef = useRef<Map<string, PendingResolver>>(new Map())

  useEffect(() => {
    const worker = new Worker(new URL('@/lib/ai/worker.ts', import.meta.url))
    workerRef.current = worker

    worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data

      switch (msg.type) {
        case 'loadProgress':
          setLoadProgress(msg.progress)
          break

        case 'modelLoaded':
          setStatus('ready')
          setLoadProgress(100)
          break

        case 'result': {
          const pending = pendingRef.current.get(msg.photoId)
          if (pending) {
            if (pending.kind === 'classifyWithEmbedding') {
              pending.resolve({ results: msg.results, embedding: msg.embedding ?? null })
            } else if (pending.kind === 'classify') {
              pending.resolve(msg.results)
            } else {
              pending.reject(new Error('Unexpected result for embed request'))
            }
            pendingRef.current.delete(msg.photoId)
          }
          if (pendingRef.current.size === 0) setStatus('ready')
          break
        }

        case 'embedding': {
          const pending = pendingRef.current.get(msg.photoId)
          if (pending) {
            if (pending.kind === 'embed') pending.resolve(msg.embedding)
            else pending.reject(new Error('Unexpected embedding for non-embed request'))
            pendingRef.current.delete(msg.photoId)
          }
          if (pendingRef.current.size === 0) setStatus('ready')
          break
        }

        case 'error': {
          const message = msg.message
          if (msg.photoId) {
            const pending = pendingRef.current.get(msg.photoId)
            if (pending) {
              pending.reject(new Error(message))
              pendingRef.current.delete(msg.photoId)
            }
            if (pendingRef.current.size === 0) setStatus('ready')
          } else {
            setStatus('error')
            setError(message)
          }
          break
        }
      }
    })

    // Kick off model load immediately
    setStatus('loading')
    const request: WorkerRequest = { type: 'loadModel' }
    worker.postMessage(request)

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const classify = useCallback(
    async (fileOrUrl: File | string, photoId: string, labels?: string[], topK = 5): Promise<ClassificationResult[]> => {
      if (!workerRef.current) throw new Error('Worker not initialised')
      if (status === 'loading') throw new Error('Model is still loading')

      const imageData = typeof fileOrUrl === 'string' ? fileOrUrl : await fileToBase64(fileOrUrl)

      return new Promise<ClassificationResult[]>((resolve, reject) => {
        pendingRef.current.set(photoId, { kind: 'classify', resolve, reject })
        setStatus('classifying')
        const request: WorkerRequest = { type: 'classify', photoId, imageData, labels, topK }
        workerRef.current!.postMessage(request)
      })
    },
    [status]
  )

  const classifyWithEmbedding = useCallback(
    async (
      fileOrUrl: File | string,
      photoId: string,
      labels?: string[],
      topK = 5,
    ): Promise<ClassifyResultWithEmbedding> => {
      if (!workerRef.current) throw new Error('Worker not initialised')
      if (status === 'loading') throw new Error('Model is still loading')

      const imageData = typeof fileOrUrl === 'string' ? fileOrUrl : await fileToBase64(fileOrUrl)

      return new Promise<ClassifyResultWithEmbedding>((resolve, reject) => {
        pendingRef.current.set(photoId, { kind: 'classifyWithEmbedding', resolve, reject })
        setStatus('classifying')
        const request: WorkerRequest = {
          type: 'classify',
          photoId,
          imageData,
          labels,
          topK,
          captureEmbedding: true,
        }
        workerRef.current!.postMessage(request)
      })
    },
    [status]
  )

  const embed = useCallback(
    async (fileOrUrl: File | string, photoId: string): Promise<number[]> => {
      if (!workerRef.current) throw new Error('Worker not initialised')
      if (status === 'loading') throw new Error('Model is still loading')

      const imageData = typeof fileOrUrl === 'string' ? fileOrUrl : await fileToBase64(fileOrUrl)

      return new Promise<number[]>((resolve, reject) => {
        pendingRef.current.set(photoId, { kind: 'embed', resolve, reject })
        setStatus('classifying')
        const request: WorkerRequest = { type: 'embed', photoId, imageData }
        workerRef.current!.postMessage(request)
      })
    },
    [status]
  )

  return { status, loadProgress, error, classify, classifyWithEmbedding, embed }
}
