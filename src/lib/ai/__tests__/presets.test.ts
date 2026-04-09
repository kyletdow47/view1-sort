import { describe, it, expect } from 'vitest'
import {
  PRESETS,
  getPresetCategories,
  matchPredictionToCategory,
} from '../presets'
import type { PresetType } from '../presets'

const ALL_PRESET_TYPES: PresetType[] = ['real_estate', 'wedding', 'travel', 'general']

// ─── PRESETS record ───────────────────────────────────────────────────────────

describe('PRESETS record', () => {
  it.each(ALL_PRESET_TYPES)('%s preset is defined with a name and categories array', (preset) => {
    expect(PRESETS[preset]).toBeDefined()
    expect(PRESETS[preset].name).toBeTruthy()
    expect(Array.isArray(PRESETS[preset].categories)).toBe(true)
  })

  it('real_estate has exactly 10 categories', () => {
    expect(PRESETS.real_estate.categories).toHaveLength(10)
  })

  it('wedding has exactly 10 categories', () => {
    expect(PRESETS.wedding.categories).toHaveLength(10)
  })

  it('travel has exactly 10 categories', () => {
    expect(PRESETS.travel.categories).toHaveLength(10)
  })

  it('general has exactly 9 categories', () => {
    expect(PRESETS.general.categories).toHaveLength(9)
  })

  it.each(ALL_PRESET_TYPES)('%s last two categories are video then other', (preset) => {
    const ids = PRESETS[preset].categories.map((c) => c.id)
    expect(ids.at(-2)).toBe('video')
    expect(ids.at(-1)).toBe('other')
  })

  it.each(ALL_PRESET_TYPES)('every keyword in %s is a non-empty lowercase string', (preset) => {
    for (const cat of PRESETS[preset].categories) {
      for (const kw of cat.keywords) {
        expect(typeof kw).toBe('string')
        expect(kw.trim().length).toBeGreaterThan(0)
        expect(kw).toBe(kw.toLowerCase())
      }
    }
  })

  it.each(ALL_PRESET_TYPES)('%s has no duplicate keywords within any single category', (preset) => {
    for (const cat of PRESETS[preset].categories) {
      const unique = new Set(cat.keywords)
      expect(unique.size).toBe(cat.keywords.length)
    }
  })

  it.each(ALL_PRESET_TYPES)('every category in %s has an id, label, icon, and keywords array', (preset) => {
    for (const cat of PRESETS[preset].categories) {
      expect(typeof cat.id).toBe('string')
      expect(cat.id.length).toBeGreaterThan(0)
      expect(typeof cat.label).toBe('string')
      expect(typeof cat.icon).toBe('string')
      expect(Array.isArray(cat.keywords)).toBe(true)
    }
  })
})

// ─── getPresetCategories ──────────────────────────────────────────────────────

describe('getPresetCategories', () => {
  it('real_estate starts with exterior', () => {
    expect(getPresetCategories('real_estate')[0]).toBe('exterior')
  })

  it('wedding starts with ceremony', () => {
    expect(getPresetCategories('wedding')[0]).toBe('ceremony')
  })

  it('travel starts with landmarks', () => {
    expect(getPresetCategories('travel')[0]).toBe('landmarks')
  })

  it('general starts with people', () => {
    expect(getPresetCategories('general')[0]).toBe('people')
  })

  it.each(ALL_PRESET_TYPES)('%s ends with video, other', (preset) => {
    const cats = getPresetCategories(preset)
    expect(cats.at(-2)).toBe('video')
    expect(cats.at(-1)).toBe('other')
  })

  it('returns an array of strings equal in length to the preset categories', () => {
    for (const preset of ALL_PRESET_TYPES) {
      const cats = getPresetCategories(preset)
      expect(cats).toHaveLength(PRESETS[preset].categories.length)
    }
  })
})

// ─── matchPredictionToCategory ────────────────────────────────────────────────

describe('matchPredictionToCategory', () => {
  it('maps refrigerator/dishwasher to kitchen in real_estate', () => {
    const result = matchPredictionToCategory(
      [
        { className: 'refrigerator', probability: 0.6 },
        { className: 'dishwasher', probability: 0.25 },
      ],
      'real_estate',
    )
    expect(result.category).toBe('kitchen')
    expect(result.confidence).toBeGreaterThanOrEqual(0.1)
  })

  it('maps church/altar to ceremony in wedding', () => {
    const result = matchPredictionToCategory(
      [
        { className: 'church', probability: 0.55 },
        { className: 'altar', probability: 0.2 },
      ],
      'wedding',
    )
    expect(result.category).toBe('ceremony')
  })

  it('maps pizza/restaurant to food in travel', () => {
    const result = matchPredictionToCategory(
      [
        { className: 'pizza', probability: 0.5 },
        { className: 'restaurant', probability: 0.2 },
      ],
      'travel',
    )
    expect(result.category).toBe('food')
  })

  it('maps person/human labels to people in general', () => {
    const result = matchPredictionToCategory(
      [{ className: 'suit', probability: 0.7 }],
      'general',
    )
    expect(result.category).toBe('people')
  })

  it('returns other when all scores are below default threshold (0.1)', () => {
    const result = matchPredictionToCategory(
      [
        { className: 'xyzunknown_abc123', probability: 0.04 },
        { className: 'completelyrandom_qqq', probability: 0.02 },
      ],
      'real_estate',
    )
    expect(result.category).toBe('other')
  })

  it('handles empty predictions array and returns other with confidence 0', () => {
    const result = matchPredictionToCategory([], 'real_estate')
    expect(result.category).toBe('other')
    expect(result.confidence).toBe(0)
    expect(result.allScores).toEqual({})
  })

  it('allScores contains an entry for every category in the preset', () => {
    const result = matchPredictionToCategory(
      [{ className: 'refrigerator', probability: 0.9 }],
      'real_estate',
    )
    const cats = getPresetCategories('real_estate')
    for (const cat of cats) {
      expect(result.allScores).toHaveProperty(cat)
    }
  })

  it('respects custom threshold — weak match wins when threshold is lowered', () => {
    const predictions = [{ className: 'refrigerator', probability: 0.05 }]
    // Default threshold 0.1 → score 0.05 < 0.1 → other
    const r1 = matchPredictionToCategory(predictions, 'real_estate')
    expect(r1.category).toBe('other')
    // Custom threshold 0.01 → score 0.05 > 0.01 → kitchen wins
    const r2 = matchPredictionToCategory(predictions, 'real_estate', 0.01)
    expect(r2.category).toBe('kitchen')
  })

  it('sums probabilities across multiple matching keywords in same category', () => {
    const predictions = [
      { className: 'refrigerator', probability: 0.3 },
      { className: 'microwave', probability: 0.3 },
      { className: 'toaster', probability: 0.3 },
    ]
    const result = matchPredictionToCategory(predictions, 'real_estate')
    // All three are kitchen keywords — combined score 0.9 should dominate
    expect(result.category).toBe('kitchen')
    expect(result.confidence).toBeCloseTo(0.9, 5)
  })
})
