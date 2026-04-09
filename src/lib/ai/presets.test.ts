import { describe, it, expect } from 'vitest'
import {
  BUILT_IN_PRESETS,
  getPreset,
  getAllLabels,
  getCategoryForLabel,
  getAllPresets,
} from './presets'

// ---------------------------------------------------------------------------
// BUILT_IN_PRESETS structure
// ---------------------------------------------------------------------------
describe('BUILT_IN_PRESETS', () => {
  it('contains 6 built-in presets', () => {
    expect(BUILT_IN_PRESETS).toHaveLength(6)
  })

  it('all presets have required fields', () => {
    for (const preset of BUILT_IN_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.name).toBeTruthy()
      expect(preset.niche).toBeTruthy()
      expect(preset.description).toBeTruthy()
      expect(preset.icon).toBeTruthy()
      expect(preset.builtIn).toBe(true)
      expect(preset.categories.length).toBeGreaterThan(0)
      expect(preset.rejectCriteria.length).toBeGreaterThan(0)
    }
  })

  it('every category has a name, labels array, and priority', () => {
    for (const preset of BUILT_IN_PRESETS) {
      for (const cat of preset.categories) {
        expect(cat.name.trim().length).toBeGreaterThan(0)
        expect(cat.labels.length).toBeGreaterThan(0)
        expect(typeof cat.priority).toBe('number')
      }
    }
  })

  it('preset IDs are unique', () => {
    const ids = BUILT_IN_PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ---------------------------------------------------------------------------
// getPreset
// ---------------------------------------------------------------------------
describe('getPreset', () => {
  it('returns the wedding preset by ID', () => {
    const preset = getPreset('wedding')
    expect(preset).toBeDefined()
    expect(preset?.name).toBe('Wedding')
  })

  it('returns the real-estate preset by ID', () => {
    const preset = getPreset('real-estate')
    expect(preset).toBeDefined()
    expect(preset?.name).toBe('Real Estate')
  })

  it('returns undefined for unknown ID', () => {
    expect(getPreset('nonexistent')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// getAllLabels
// ---------------------------------------------------------------------------
describe('getAllLabels', () => {
  it('returns all labels from a preset as a flat array', () => {
    const wedding = getPreset('wedding')!
    const labels = getAllLabels(wedding)
    expect(Array.isArray(labels)).toBe(true)
    expect(labels.length).toBeGreaterThan(0)
    // Every label should be a string
    labels.forEach((l) => expect(typeof l).toBe('string'))
  })

  it('combines labels from all categories', () => {
    const wedding = getPreset('wedding')!
    const labels = getAllLabels(wedding)
    const totalExpected = wedding.categories.reduce((sum, c) => sum + c.labels.length, 0)
    expect(labels).toHaveLength(totalExpected)
  })

  it('wedding preset includes ceremony-related labels', () => {
    const wedding = getPreset('wedding')!
    const labels = getAllLabels(wedding)
    expect(labels.some((l) => l.toLowerCase().includes('ceremony'))).toBe(true)
  })

  it('real-estate preset includes kitchen-related labels', () => {
    const realEstate = getPreset('real-estate')!
    const labels = getAllLabels(realEstate)
    expect(labels.some((l) => l.toLowerCase().includes('kitchen'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getCategoryForLabel (preset-scoped)
// ---------------------------------------------------------------------------
describe('getCategoryForLabel', () => {
  it('maps a wedding ceremony label to the Ceremony category', () => {
    const wedding = getPreset('wedding')!
    expect(getCategoryForLabel(wedding, 'wedding ceremony')).toBe('Ceremony')
  })

  it('maps a reception label to the Reception category', () => {
    const wedding = getPreset('wedding')!
    expect(getCategoryForLabel(wedding, 'first dance wedding')).toBe('Reception')
  })

  it('maps a real-estate kitchen label to Kitchen', () => {
    const realEstate = getPreset('real-estate')!
    expect(getCategoryForLabel(realEstate, 'kitchen interior')).toBe('Kitchen')
  })

  it('returns undefined for an unrecognized label', () => {
    const wedding = getPreset('wedding')!
    expect(getCategoryForLabel(wedding, 'random gibberish xyz')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// getAllPresets
// ---------------------------------------------------------------------------
describe('getAllPresets', () => {
  it('includes all built-in presets', () => {
    const all = getAllPresets()
    expect(all.length).toBeGreaterThanOrEqual(BUILT_IN_PRESETS.length)
    for (const builtIn of BUILT_IN_PRESETS) {
      expect(all.find((p) => p.id === builtIn.id)).toBeDefined()
    }
  })
})
