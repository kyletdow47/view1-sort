import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ClassificationResult } from '@/lib/ai/classifier'

// ---------------------------------------------------------------------------
// Mock @/lib/ai/utils — fileToBase64 is called inside the hook before
// posting to the worker, so we replace it with a fast stub.
// ---------------------------------------------------------------------------
vi.mock('@/lib/ai/utils', () => ({
  fileToBase64: vi.fn().mockResolvedValue('data:image/jpeg;base64,MOCK'),
}))

// ---------------------------------------------------------------------------
// Mock Web Worker
// The hook calls: new Worker(new URL('@/lib/ai/worker.ts', import.meta.url))
// We intercept the global Worker constructor and capture the message handler
// so that tests can fire synthetic messages back at the hook.
// ---------------------------------------------------------------------------
const mockWorker = {
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  terminate: vi.fn(),
}

// Capture the 'message' event handler registered by the hook
function getMessageHandler(): ((e: MessageEvent) => void) | undefined {
  const call = mockWorker.addEventListener.mock.calls.find(([event]) => event === 'message')
  return call?.[1] as ((e: MessageEvent) => void) | undefined
}

function emitWorkerMessage(data: unknown) {
  const handler = getMessageHandler()
  handler?.({ data } as MessageEvent)
}

vi.stubGlobal('Worker', vi.fn(() => mockWorker))

// ---------------------------------------------------------------------------
// Import the hook AFTER mocks are set up
// ---------------------------------------------------------------------------
// Dynamic import is required so that vi.mock hoisting works correctly when
// the module under test itself imports from mocked modules.
const { useClassifier } = await import('./useClassifier')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useClassifier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-register the no-op addEventListener so calls are capturable
    mockWorker.addEventListener.mockImplementation(() => {})
  })

  // ── Initial state ────────────────────────────────────────────────────────

  it('starts with loadProgress 0 and no error', () => {
    const { result } = renderHook(() => useClassifier())
    expect(result.current.loadProgress).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('transitions to "loading" on mount and posts loadModel to worker', async () => {
    const { result } = renderHook(() => useClassifier())

    await waitFor(() => {
      expect(result.current.status).toBe('loading')
    })

    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'loadModel' })
  })

  // ── loadProgress messages ────────────────────────────────────────────────

  it('updates loadProgress when the worker emits loadProgress messages', async () => {
    const { result } = renderHook(() => useClassifier())

    act(() => emitWorkerMessage({ type: 'loadProgress', progress: 35 }))
    expect(result.current.loadProgress).toBe(35)

    act(() => emitWorkerMessage({ type: 'loadProgress', progress: 78 }))
    expect(result.current.loadProgress).toBe(78)
  })

  // ── modelLoaded ──────────────────────────────────────────────────────────

  it('transitions to "ready" and sets loadProgress to 100 on modelLoaded', async () => {
    const { result } = renderHook(() => useClassifier())

    act(() => emitWorkerMessage({ type: 'modelLoaded' }))

    expect(result.current.status).toBe('ready')
    expect(result.current.loadProgress).toBe(100)
  })

  // ── classify — happy path ────────────────────────────────────────────────

  it('resolves the classify promise with results on a matching result message', async () => {
    const { result } = renderHook(() => useClassifier())
    act(() => emitWorkerMessage({ type: 'modelLoaded' }))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const mockResults: ClassificationResult[] = [
      { photoId: 'p1', label: 'wedding ceremony', score: 0.92, category: 'event' },
      { photoId: 'p1', label: 'couple portrait', score: 0.85, category: 'portrait' },
    ]

    let classifyPromise!: Promise<ClassificationResult[]>
    act(() => {
      classifyPromise = result.current.classify(mockFile, 'p1', undefined, 2)
    })

    // classify is async: it awaits fileToBase64 before posting to the worker.
    // Wait until the classify postMessage lands before emitting the result.
    await waitFor(() =>
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'classify', photoId: 'p1' }),
      ),
    )
    expect(result.current.status).toBe('classifying')

    act(() => emitWorkerMessage({ type: 'result', photoId: 'p1', results: mockResults }))

    const resolved = await classifyPromise
    expect(resolved).toEqual(mockResults)
  })

  it('returns to "ready" status after classify resolves', async () => {
    const { result } = renderHook(() => useClassifier())
    act(() => emitWorkerMessage({ type: 'modelLoaded' }))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    const mockResults: ClassificationResult[] = [
      { photoId: 'p2', label: 'candid moment', score: 0.75, category: 'candid' },
    ]

    let classifyPromise!: Promise<ClassificationResult[]>
    act(() => {
      classifyPromise = result.current.classify(mockFile, 'p2')
    })

    await waitFor(() =>
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'classify', photoId: 'p2' }),
      ),
    )

    act(() => emitWorkerMessage({ type: 'result', photoId: 'p2', results: mockResults }))
    await classifyPromise

    expect(result.current.status).toBe('ready')
  })

  it('posts classify request to worker with base64 image data', async () => {
    const { result } = renderHook(() => useClassifier())
    act(() => emitWorkerMessage({ type: 'modelLoaded' }))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    act(() => {
      result.current.classify(mockFile, 'p3', undefined, 3)
    })

    // fileToBase64 is async — wait for the postMessage to land
    await waitFor(() =>
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'classify',
          photoId: 'p3',
          imageData: 'data:image/jpeg;base64,MOCK',
          topK: 3,
        }),
      ),
    )
  })

  // ── classify — per-photo error ───────────────────────────────────────────

  it('rejects the classify promise when the worker emits an error with a matching photoId', async () => {
    const { result } = renderHook(() => useClassifier())
    act(() => emitWorkerMessage({ type: 'modelLoaded' }))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    let classifyPromise!: Promise<ClassificationResult[]>
    act(() => {
      classifyPromise = result.current.classify(mockFile, 'p-err')
    })

    await waitFor(() =>
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'classify', photoId: 'p-err' }),
      ),
    )

    act(() => emitWorkerMessage({ type: 'error', photoId: 'p-err', message: 'GPU OOM' }))

    await expect(classifyPromise).rejects.toThrow('GPU OOM')
  })

  it('returns to "ready" after a per-photo error resolves', async () => {
    const { result } = renderHook(() => useClassifier())
    act(() => emitWorkerMessage({ type: 'modelLoaded' }))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    let classifyPromise!: Promise<ClassificationResult[]>
    act(() => {
      classifyPromise = result.current.classify(mockFile, 'p-err2')
    })

    await waitFor(() =>
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'classify', photoId: 'p-err2' }),
      ),
    )

    act(() => emitWorkerMessage({ type: 'error', photoId: 'p-err2', message: 'fail' }))

    await classifyPromise.catch(() => {})
    expect(result.current.status).toBe('ready')
  })

  // ── global error (no photoId) ────────────────────────────────────────────

  it('transitions to "error" state and stores the message on a global worker error', () => {
    const { result } = renderHook(() => useClassifier())

    act(() => emitWorkerMessage({ type: 'error', message: 'Failed to fetch model' }))

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Failed to fetch model')
  })

  // ── guard: classify while loading ───────────────────────────────────────

  it('throws synchronously when classify is called while model is still loading', async () => {
    const { result } = renderHook(() => useClassifier())

    await waitFor(() => expect(result.current.status).toBe('loading'))

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
    await expect(result.current.classify(mockFile, 'p-early')).rejects.toThrow(
      'Model is still loading',
    )
  })

  // ── cleanup ──────────────────────────────────────────────────────────────

  it('terminates the worker when the component unmounts', () => {
    const { unmount } = renderHook(() => useClassifier())
    unmount()
    expect(mockWorker.terminate).toHaveBeenCalledTimes(1)
  })
})
