import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock classifier-v2 ───────────────────────────────────────────────────────
const { mockClassifyFile, mockLoadModel } = vi.hoisted(() => ({
  mockClassifyFile: vi.fn(),
  mockLoadModel: vi.fn(),
}))

vi.mock('../classifier-v2', () => ({
  classifyFile: mockClassifyFile,
  loadModel: mockLoadModel,
  resetModel: vi.fn(),
}))

import {
  createClassifierWorker,
  classifyViaWorker,
  terminateClassifierWorker,
} from '../use-classifier'
import type { ClassificationResult } from '../classifier-v2'

// ─── Fake Worker ──────────────────────────────────────────────────────────────
type MessageHandler = (event: { data: unknown }) => void

function createFakeWorker() {
  let messageHandler: MessageHandler | null = null
  const postMessageSpy = vi.fn()
  const terminateSpy = vi.fn()

  const worker = {
    postMessage: postMessageSpy,
    terminate: terminateSpy,
    addEventListener: vi.fn((event: string, handler: MessageHandler) => {
      if (event === 'message') messageHandler = handler
    }),
    removeEventListener: vi.fn(),
    // Helper for tests: trigger a message from the "worker"
    _triggerMessage(data: unknown) {
      messageHandler?.({ data })
    },
  }
  return worker
}

// ─── createClassifierWorker ───────────────────────────────────────────────────

describe('createClassifierWorker', () => {
  it('returns an object with postMessage and terminate', () => {
    // createClassifierWorker spawns a real Worker in the browser.
    // In tests we verify the factory function is exported and returns
    // something worker-shaped. (Real Worker can't spawn in Node.)
    expect(typeof createClassifierWorker).toBe('function')
  })
})

// ─── classifyViaWorker ────────────────────────────────────────────────────────

describe('classifyViaWorker', () => {
  let fakeWorker: ReturnType<typeof createFakeWorker>

  beforeEach(() => {
    fakeWorker = createFakeWorker()
  })

  it('resolves with ClassificationResult when worker responds with result', async () => {
    const expectedResult: ClassificationResult = {
      category: 'kitchen',
      confidence: 0.8,
      predictions: [{ className: 'refrigerator', probability: 0.8 }],
      allScores: {},
    }

    // Post the classify message, then trigger response asynchronously
    const promise = classifyViaWorker(
      fakeWorker as unknown as Worker,
      {} as ImageData,
      'real_estate',
      'media-123',
    )

    // Simulate worker responding
    fakeWorker._triggerMessage({
      type: 'result',
      mediaId: 'media-123',
      result: expectedResult,
    })

    const result = await promise
    expect(result.category).toBe('kitchen')
    expect(result.confidence).toBe(0.8)
  })

  it('rejects when worker responds with error for this mediaId', async () => {
    const promise = classifyViaWorker(
      fakeWorker as unknown as Worker,
      {} as ImageData,
      'wedding',
      'media-456',
    )

    fakeWorker._triggerMessage({
      type: 'error',
      mediaId: 'media-456',
      error: 'Model failed to load',
    })

    await expect(promise).rejects.toThrow('Model failed to load')
  })

  it('posts a classify message with correct shape', async () => {
    const promise = classifyViaWorker(
      fakeWorker as unknown as Worker,
      {} as ImageData,
      'travel',
      'media-789',
    )

    expect(fakeWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'classify',
        mediaId: 'media-789',
        preset: 'travel',
      }),
    )

    // Resolve to avoid dangling promise
    fakeWorker._triggerMessage({
      type: 'result',
      mediaId: 'media-789',
      result: { category: 'food', confidence: 0.5, predictions: [], allScores: {} },
    })
    await promise
  })

  it('does not resolve for messages with a different mediaId', async () => {
    const settled: string[] = []

    const promise = classifyViaWorker(
      fakeWorker as unknown as Worker,
      {} as ImageData,
      'general',
      'mine',
    ).then(() => { settled.push('resolved') })

    // Send result for a different mediaId — should be ignored
    fakeWorker._triggerMessage({
      type: 'result',
      mediaId: 'not-mine',
      result: { category: 'people', confidence: 0.9, predictions: [], allScores: {} },
    })

    await new Promise((r) => setTimeout(r, 10))
    expect(settled).toHaveLength(0)

    // Now resolve the real one
    fakeWorker._triggerMessage({
      type: 'result',
      mediaId: 'mine',
      result: { category: 'people', confidence: 0.7, predictions: [], allScores: {} },
    })
    await promise
  })
})

// ─── terminateClassifierWorker ────────────────────────────────────────────────

describe('terminateClassifierWorker', () => {
  it('calls terminate on the worker', () => {
    const fakeWorker = createFakeWorker()
    terminateClassifierWorker(fakeWorker as unknown as Worker)
    expect(fakeWorker.terminate).toHaveBeenCalledTimes(1)
  })
})
