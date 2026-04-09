'use client'

import { useState, useEffect, useCallback } from 'react'
import type { VibePreset, VibeStyleParams } from '@/types/vibe-presets'
import { MOCK_PRESETS } from '@/types/vibe-presets'
import {
  fetchPresetsFromAPI,
  savePresetToAPI,
  updatePresetInAPI,
  deletePresetFromAPI,
} from '@/lib/ai/presets'

/**
 * Hook that manages vibe presets with Supabase persistence.
 * Falls back to local mock data if the user is not authenticated.
 */
export function useVibePresets(projectId?: string) {
  const [presets, setPresets] = useState<VibePreset[]>(MOCK_PRESETS)
  const [activePresetId, setActivePresetId] = useState<string | null>(
    MOCK_PRESETS.find((p) => p.isActive)?.id ?? null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load presets from API on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const apiPresets = await fetchPresetsFromAPI()
        if (cancelled) return
        if (apiPresets.length > 0 || isAuthenticated) {
          setPresets(apiPresets)
          setActivePresetId(apiPresets.find((p) => p.isActive)?.id ?? null)
          setIsAuthenticated(true)
        }
      } catch {
        // Fall back to mock data
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [isAuthenticated])

  const savePreset = useCallback(
    async (preset: {
      name: string
      description: string
      styleParams: VibeStyleParams
      source?: 'custom' | 'ai_parsed'
    }): Promise<VibePreset | null> => {
      // Try Supabase first
      const saved = await savePresetToAPI({ ...preset, projectId })
      if (saved) {
        setPresets((prev) => [saved, ...prev])
        return saved
      }
      // Fallback: local-only preset
      const local: VibePreset = {
        id: `preset-${Date.now()}`,
        name: preset.name,
        description: preset.description,
        styleParams: preset.styleParams,
        createdAt: new Date().toISOString(),
      }
      setPresets((prev) => [local, ...prev])
      return local
    },
    [projectId],
  )

  const updatePreset = useCallback(
    async (update: {
      id: string
      name?: string
      description?: string
      styleParams?: VibeStyleParams
      isActive?: boolean
    }): Promise<void> => {
      const updated = await updatePresetInAPI(update)
      if (updated) {
        setPresets((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : update.isActive ? { ...p, isActive: false } : p)),
        )
        if (update.isActive) setActivePresetId(update.id)
      }
    },
    [],
  )

  const deletePreset = useCallback(
    async (id: string): Promise<void> => {
      const ok = await deletePresetFromAPI(id)
      if (ok) {
        setPresets((prev) => prev.filter((p) => p.id !== id))
        if (activePresetId === id) setActivePresetId(null)
      } else {
        // Fallback: remove locally
        setPresets((prev) => prev.filter((p) => p.id !== id))
        if (activePresetId === id) setActivePresetId(null)
      }
    },
    [activePresetId],
  )

  const applyPreset = useCallback(
    async (id: string): Promise<void> => {
      await updatePresetInAPI({ id, isActive: true })
      setPresets((prev) =>
        prev.map((p) => ({ ...p, isActive: p.id === id })),
      )
      setActivePresetId(id)
    },
    [],
  )

  return {
    presets,
    activePresetId,
    isLoading,
    savePreset,
    updatePreset,
    deletePreset,
    applyPreset,
  }
}
