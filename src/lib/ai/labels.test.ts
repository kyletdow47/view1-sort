import { describe, it, expect } from 'vitest'
import {
  PHOTOGRAPHY_LABELS,
  LABEL_STRINGS,
  BROAD_CATEGORY_PROMPTS,
  getCategoryForLabel,
  getLabelsForPreset,
} from './labels'
import type { PhotoCategory } from './labels'

const ALL_CATEGORIES: PhotoCategory[] = [
  'portrait', 'landscape', 'event', 'detail', 'group', 'candid',
  'architecture', 'food', 'product', 'action', 'other',
]

describe('PHOTOGRAPHY_LABELS', () => {
  it('contains at least 45 labels', () => {
    expect(PHOTOGRAPHY_LABELS.length).toBeGreaterThanOrEqual(45)
  })

  it('every label has a non-empty label string and a valid category', () => {
    const validCategories = new Set(ALL_CATEGORIES)

    PHOTOGRAPHY_LABELS.forEach(({ label, category }) => {
      expect(label.trim().length).toBeGreaterThan(0)
      expect(validCategories.has(category)).toBe(true)
    })
  })

  it('labels are SigLIP-optimized sentence fragments starting with "a " or "an "', () => {
    PHOTOGRAPHY_LABELS.forEach(({ label }) => {
      expect(label.startsWith('a ') || label.startsWith('an ')).toBe(true)
    })
  })

  it('covers all non-other categories', () => {
    const covered = new Set(PHOTOGRAPHY_LABELS.map((l) => l.category))
    const required = ALL_CATEGORIES.filter((c) => c !== 'other')
    required.forEach((c) => expect(covered.has(c)).toBe(true))
  })

  it('has no duplicate labels', () => {
    const unique = new Set(LABEL_STRINGS)
    expect(unique.size).toBe(LABEL_STRINGS.length)
  })
})

describe('LABEL_STRINGS', () => {
  it('is a flat array of strings matching PHOTOGRAPHY_LABELS in length', () => {
    expect(Array.isArray(LABEL_STRINGS)).toBe(true)
    expect(LABEL_STRINGS.length).toBe(PHOTOGRAPHY_LABELS.length)
    LABEL_STRINGS.forEach((s) => expect(typeof s).toBe('string'))
  })
})

describe('BROAD_CATEGORY_PROMPTS', () => {
  it('has a prompt for every PhotoCategory', () => {
    ALL_CATEGORIES.forEach((cat) => {
      expect(BROAD_CATEGORY_PROMPTS[cat]).toBeDefined()
      expect(typeof BROAD_CATEGORY_PROMPTS[cat]).toBe('string')
      expect(BROAD_CATEGORY_PROMPTS[cat].length).toBeGreaterThan(0)
    })
  })
})

describe('getCategoryForLabel', () => {
  it('returns the correct category for known labels', () => {
    const portraitLabel = PHOTOGRAPHY_LABELS.find((l) => l.category === 'portrait')!
    expect(getCategoryForLabel(portraitLabel.label)).toBe('portrait')

    const foodLabel = PHOTOGRAPHY_LABELS.find((l) => l.category === 'food')!
    expect(getCategoryForLabel(foodLabel.label)).toBe('food')

    const archLabel = PHOTOGRAPHY_LABELS.find((l) => l.category === 'architecture')!
    expect(getCategoryForLabel(archLabel.label)).toBe('architecture')
  })

  it('returns "other" for unknown labels', () => {
    expect(getCategoryForLabel('unknown label xyz')).toBe('other')
    expect(getCategoryForLabel('')).toBe('other')
  })
})

describe('getLabelsForPreset', () => {
  it('returns base LABEL_STRINGS when presetId is null', async () => {
    expect(await getLabelsForPreset(null)).toBe(LABEL_STRINGS)
  })

  it('returns base LABEL_STRINGS for unknown preset id', async () => {
    expect(await getLabelsForPreset('nonexistent-preset')).toBe(LABEL_STRINGS)
  })

  it('returns preset-specific labels for a known preset', async () => {
    const labels = await getLabelsForPreset('wedding')
    expect(labels.length).toBeGreaterThan(0)
    expect(labels).not.toBe(LABEL_STRINGS)
    // Wedding preset labels should be sentence fragments
    labels.forEach((l: string) => expect(l.startsWith('a ')).toBe(true))
  })
})
