// ─── Classification Pipeline ──────────────────────────────────────────────────
// Orchestrates sequential classification of media files using classifyFile.
// One item is classified at a time to avoid overwhelming the browser.
// Failures are isolated — one bad file does not stop the queue.

import { classifyFile } from './classifier-v2'
import type { ClassificationResult, SkippedResult } from './classifier-v2'
import type { PresetType } from './presets'

interface QueueItem {
  mediaId: string
  file: File
}

export class ClassificationPipeline {
  private queue: QueueItem[] = []
  private processing = false
  private stopped = false
  private preset: PresetType

  /** Called with (mediaId, result) when a file is successfully classified. */
  onResult: (mediaId: string, result: ClassificationResult | SkippedResult) => void = () => {}

  /** Called with (mediaId, errorMessage) when classification fails. */
  onError: (mediaId: string, error: string) => void = () => {}

  constructor(preset: PresetType) {
    this.preset = preset
  }

  /** Add a file to the classification queue. */
  enqueue(mediaId: string, file: File): void {
    this.queue.push({ mediaId, file })
  }

  /** Start processing the queue. Safe to call multiple times (idempotent). */
  start(): void {
    this.stopped = false
    if (!this.processing) {
      void this._processNext()
    }
  }

  /** Stop processing. Current item completes; queue is cleared. */
  stop(): void {
    this.stopped = true
    this.processing = false
    this.queue = []
  }

  /** Number of items still waiting in the queue. */
  getQueueLength(): number {
    return this.queue.length
  }

  /** True while an item is being actively classified. */
  isProcessing(): boolean {
    return this.processing
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async _processNext(): Promise<void> {
    if (this.stopped || this.queue.length === 0) {
      this.processing = false
      return
    }

    this.processing = true
    const item = this.queue.shift()!

    try {
      const result = await classifyFile(item.file, this.preset)
      if (!this.stopped) {
        this.onResult(item.mediaId, result)
      }
    } catch (err) {
      if (!this.stopped) {
        const message = err instanceof Error ? err.message : 'Classification failed'
        this.onError(item.mediaId, message)
      }
    }

    // Schedule next item asynchronously to yield to the browser
    if (!this.stopped) {
      await new Promise<void>((r) => setTimeout(r, 0))
      void this._processNext()
    } else {
      this.processing = false
    }
  }
}
