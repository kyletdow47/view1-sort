import { describe, it, expect } from 'vitest'

// ─── Integration: runAILabel computation ──────────────────────────────────────
// Mirrors the logic in AIWorkspaceView.tsx — tested as pure functions.

function computeRunAILabel(opts: {
  classifierStatus: string
  loadProgress: number
  isAIRunning: boolean
  runProgress: number
  totalPhotos: number
}): string {
  const { classifierStatus, loadProgress, isAIRunning, runProgress, totalPhotos } = opts
  if (classifierStatus === 'loading') return `Loading model (${loadProgress}%)…`
  if (isAIRunning) {
    const done = Math.round((runProgress / 100) * totalPhotos)
    return `Sorting… ${runProgress}% (${done}/${totalPhotos} photos)`
  }
  return 'Run AI Sort'
}

describe('runAILabel computation', () => {
  it('shows "Run AI Sort" when ready and not running', () => {
    expect(computeRunAILabel({
      classifierStatus: 'ready',
      loadProgress: 100,
      isAIRunning: false,
      runProgress: 0,
      totalPhotos: 350,
    })).toBe('Run AI Sort')
  })

  it('shows model download progress when loading', () => {
    expect(computeRunAILabel({
      classifierStatus: 'loading',
      loadProgress: 42,
      isAIRunning: false,
      runProgress: 0,
      totalPhotos: 0,
    })).toBe('Loading model (42%)…')
  })

  it('shows photo count progress when running', () => {
    expect(computeRunAILabel({
      classifierStatus: 'ready',
      loadProgress: 100,
      isAIRunning: true,
      runProgress: 50,
      totalPhotos: 350,
    })).toBe('Sorting… 50% (175/350 photos)')
  })

  it('shows 0/N at start of run', () => {
    expect(computeRunAILabel({
      classifierStatus: 'ready',
      loadProgress: 100,
      isAIRunning: true,
      runProgress: 0,
      totalPhotos: 100,
    })).toBe('Sorting… 0% (0/100 photos)')
  })

  it('shows all photos done at 100%', () => {
    expect(computeRunAILabel({
      classifierStatus: 'ready',
      loadProgress: 100,
      isAIRunning: true,
      runProgress: 100,
      totalPhotos: 200,
    })).toBe('Sorting… 100% (200/200 photos)')
  })
})

// ─── Integration: empty state guard logic ────────────────────────────────────

function shouldShowEmptyState(
  mediaCount: number,
  allUncategorized: boolean,
): boolean {
  return mediaCount > 0 && allUncategorized
}

describe('workspace empty state guard', () => {
  it('shows empty state when all photos are uncategorized', () => {
    expect(shouldShowEmptyState(10, true)).toBe(true)
  })

  it('does not show empty state when photos are categorized', () => {
    expect(shouldShowEmptyState(10, false)).toBe(false)
  })

  it('does not show empty state when there are no photos', () => {
    expect(shouldShowEmptyState(0, true)).toBe(false)
  })
})

// ─── Integration: handleApproveAll logic ─────────────────────────────────────

function getUnflaggedIds(
  media: Array<{ id: string; review_flag?: string | null }>,
): string[] {
  return media.filter((m) => m.review_flag == null).map((m) => m.id)
}

describe('handleApproveAll logic', () => {
  it('returns all photo ids when none are flagged', () => {
    const media = [
      { id: 'm1', review_flag: null },
      { id: 'm2', review_flag: null },
    ]
    expect(getUnflaggedIds(media)).toEqual(['m1', 'm2'])
  })

  it('excludes already-flagged photos', () => {
    const media = [
      { id: 'm1', review_flag: null },
      { id: 'm2', review_flag: 'keep' },
      { id: 'm3', review_flag: 'reject' },
    ]
    expect(getUnflaggedIds(media)).toEqual(['m1'])
  })

  it('returns empty when all photos are already flagged', () => {
    const media = [
      { id: 'm1', review_flag: 'keep' },
      { id: 'm2', review_flag: 'reject' },
    ]
    expect(getUnflaggedIds(media)).toEqual([])
  })
})

// ─── Integration: classification progress display ─────────────────────────────

function classificationProgressText(
  classified: number,
  total: number,
  failed: number,
): string {
  if (total === 0) return ''
  if (failed > 0) return `Classifying ${classified}/${total} (${failed} failed)`
  return `Classifying ${classified}/${total}`
}

describe('classification progress text', () => {
  it('returns empty string when no items', () => {
    expect(classificationProgressText(0, 0, 0)).toBe('')
  })

  it('shows progress without failures', () => {
    expect(classificationProgressText(12, 50, 0)).toBe('Classifying 12/50')
  })

  it('shows failure count when present', () => {
    expect(classificationProgressText(10, 50, 3)).toBe('Classifying 10/50 (3 failed)')
  })
})
