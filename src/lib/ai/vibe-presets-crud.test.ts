import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rowToVibePreset } from './presets'
import type { VibePresetRow } from '@/types/supabase'

describe('rowToVibePreset', () => {
  const mockRow: VibePresetRow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: 'user-1',
    project_id: null,
    name: 'Moody Editorial',
    description: 'Dark dramatic style',
    style_params: {
      mood: 'dramatic',
      lighting: 'low-key',
      composition: 'tight',
      colorTemp: 'cool',
      subjects: ['faces', 'details'],
      avoidPatterns: ['overexposed'],
    },
    is_active: true,
    source: 'ai_parsed',
    created_at: '2026-04-09T10:00:00Z',
    updated_at: '2026-04-09T10:00:00Z',
  }

  it('converts a DB row to VibePreset shape', () => {
    const preset = rowToVibePreset(mockRow)
    expect(preset.id).toBe(mockRow.id)
    expect(preset.name).toBe('Moody Editorial')
    expect(preset.description).toBe('Dark dramatic style')
    expect(preset.isActive).toBe(true)
    expect(preset.createdAt).toBe('2026-04-09T10:00:00Z')
  })

  it('extracts style params correctly', () => {
    const preset = rowToVibePreset(mockRow)
    expect(preset.styleParams.mood).toBe('dramatic')
    expect(preset.styleParams.lighting).toBe('low-key')
    expect(preset.styleParams.composition).toBe('tight')
    expect(preset.styleParams.colorTemp).toBe('cool')
    expect(preset.styleParams.subjects).toEqual(['faces', 'details'])
    expect(preset.styleParams.avoidPatterns).toEqual(['overexposed'])
  })

  it('handles null description', () => {
    const row = { ...mockRow, description: null }
    const preset = rowToVibePreset(row)
    expect(preset.description).toBe('')
  })

  it('handles missing style param fields with defaults', () => {
    const row: VibePresetRow = {
      ...mockRow,
      style_params: {} as Record<string, unknown>,
    }
    const preset = rowToVibePreset(row)
    expect(preset.styleParams.mood).toBe('')
    expect(preset.styleParams.lighting).toBe('')
    expect(preset.styleParams.composition).toBe('')
    expect(preset.styleParams.colorTemp).toBe('neutral')
    expect(preset.styleParams.subjects).toEqual([])
    expect(preset.styleParams.avoidPatterns).toEqual([])
  })
})

describe('fetchPresetsFromAPI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty array on API failure', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response('', { status: 401 })),
    )
    const { fetchPresetsFromAPI } = await import('./presets')
    const result = await fetchPresetsFromAPI()
    expect(result).toEqual([])
  })

  it('maps API response to VibePreset array', async () => {
    const mockRow: VibePresetRow = {
      id: 'abc',
      user_id: 'user-1',
      project_id: null,
      name: 'Test',
      description: 'Test desc',
      style_params: {
        mood: 'joyful',
        lighting: 'natural',
        composition: 'wide',
        colorTemp: 'warm',
        subjects: [],
        avoidPatterns: [],
      },
      is_active: false,
      source: 'custom',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ presets: [mockRow] }), { status: 200 })),
    )
    const { fetchPresetsFromAPI } = await import('./presets')
    const result = await fetchPresetsFromAPI()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Test')
    expect(result[0].styleParams.mood).toBe('joyful')
  })
})

describe('deletePresetFromAPI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true on successful delete', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 })),
    )
    const { deletePresetFromAPI } = await import('./presets')
    const result = await deletePresetFromAPI('abc')
    expect(result).toBe(true)
  })

  it('returns false on failure', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response('', { status: 500 })),
    )
    const { deletePresetFromAPI } = await import('./presets')
    const result = await deletePresetFromAPI('abc')
    expect(result).toBe(false)
  })
})
