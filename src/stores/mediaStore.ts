'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { deleteMedia, getCategories, getMedia, updateMedia } from '@/lib/queries/media'
import type { Category, Media, MediaUpdate } from '@/types/supabase'
import type { ViewMode } from '@/components/features/PhotoGrid'
import type { ClassificationResult } from '@/lib/ai/classifier-v2'

// ─── Classification State Types ───────────────────────────────────────────────
export type ClassificationStatus = 'pending' | 'classifying' | 'classified' | 'failed'

export interface ClassificationProgress {
  total: number
  classified: number
  pending: number
  failed: number
}

interface MediaFilters {
  category: string | null
  search: string
}

interface MediaState {
  media: Media[]
  categories: Category[]
  selectedIds: Set<string>
  filters: MediaFilters
  sortOrder: 'asc' | 'desc'
  viewMode: ViewMode
  loading: boolean
  error: string | null

  // ── Classification state ──────────────────────────────────────────────────
  classificationStatus: Record<string, ClassificationStatus>
  classificationResults: Record<string, ClassificationResult>
  classificationErrors: Record<string, string>

  fetchMedia: (projectId: string) => Promise<void>
  fetchCategories: (projectId: string) => Promise<void>
  setMedia: (media: Media[]) => void
  editMedia: (id: string, update: MediaUpdate) => Promise<void>
  removeMedia: (ids: string[]) => Promise<void>
  setFilter: (filters: Partial<MediaFilters>) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setViewMode: (mode: ViewMode) => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  filteredMedia: () => Media[]
  groupedByCategory: () => Record<string, Media[]>

  // ── Classification actions ────────────────────────────────────────────────
  setClassificationPending: (mediaId: string) => void
  setClassifying: (mediaId: string) => void
  setClassified: (mediaId: string, result: ClassificationResult) => void
  setClassificationFailed: (mediaId: string, error: string) => void
  getClassificationProgress: () => ClassificationProgress
  retryFailedClassifications: () => string[]
}

export const useMediaStore = create<MediaState>((set, get) => ({
  media: [],
  categories: [],
  selectedIds: new Set(),
  filters: { category: null, search: '' },
  sortOrder: 'asc',
  viewMode: 'grid',
  loading: false,
  error: null,

  // ── Classification initial state ─────────────────────────────────────────
  classificationStatus: {},
  classificationResults: {},
  classificationErrors: {},

  async fetchMedia(projectId: string) {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const media = await getMedia(supabase, projectId)
      set({ media, loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch media'
      console.error('fetchMedia error:', error)
      set({ error: message, loading: false })
    }
  },

  async fetchCategories(projectId: string) {
    try {
      const supabase = createClient()
      const categories = await getCategories(supabase, projectId)
      set({ categories })
    } catch (error) {
      console.error('fetchCategories error:', error)
    }
  },

  setMedia(media: Media[]) {
    set({ media })
  },

  async editMedia(id: string, update: MediaUpdate) {
    const supabase = createClient()
    const updated = await updateMedia(supabase, id, update)
    set((state) => ({
      media: state.media.map((m) => (m.id === id ? updated : m)),
    }))
  },

  async removeMedia(ids: string[]) {
    const supabase = createClient()
    await deleteMedia(supabase, ids)
    const idSet = new Set(ids)
    set((state) => ({
      media: state.media.filter((m) => !idSet.has(m.id)),
      selectedIds: new Set(Array.from(state.selectedIds).filter((id) => !idSet.has(id))),
    }))
  },

  setFilter(filters: Partial<MediaFilters>) {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  setSortOrder(order: 'asc' | 'desc') {
    set({ sortOrder: order })
  },

  setViewMode(mode: ViewMode) {
    set({ viewMode: mode })
  },

  toggleSelect(id: string) {
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return { selectedIds: next }
    })
  },

  selectAll() {
    const items = get().filteredMedia()
    set({ selectedIds: new Set(items.map((m) => m.id)) })
  },

  deselectAll() {
    set({ selectedIds: new Set() })
  },

  filteredMedia(): Media[] {
    const { media, filters, sortOrder } = get()
    let result = media

    if (filters.category) {
      result = result.filter((m) => m.ai_category === filters.category)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          (m.ai_category?.toLowerCase().includes(q) ?? false),
      )
    }

    result = [...result].sort((a, b) => {
      const cmp =
        a.sort_order - b.sort_order ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  },

  groupedByCategory(): Record<string, Media[]> {
    const items = get().filteredMedia()
    const groups: Record<string, Media[]> = {}

    for (const item of items) {
      const cat = item.ai_category ?? 'Uncategorized'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }

    return groups
  },

  // ── Classification actions ─────────────────────────────────────────────────

  setClassificationPending(mediaId: string) {
    set((state) => ({
      classificationStatus: { ...state.classificationStatus, [mediaId]: 'pending' },
    }))
  },

  setClassifying(mediaId: string) {
    set((state) => ({
      classificationStatus: { ...state.classificationStatus, [mediaId]: 'classifying' },
    }))
  },

  setClassified(mediaId: string, result: ClassificationResult) {
    set((state) => ({
      classificationStatus: { ...state.classificationStatus, [mediaId]: 'classified' },
      classificationResults: { ...state.classificationResults, [mediaId]: result },
      // Optimistically update the media item's ai_category + ai_confidence
      media: state.media.map((m) =>
        m.id === mediaId
          ? { ...m, ai_category: result.category, ai_confidence: result.confidence }
          : m,
      ),
    }))
  },

  setClassificationFailed(mediaId: string, error: string) {
    set((state) => ({
      classificationStatus: { ...state.classificationStatus, [mediaId]: 'failed' },
      classificationErrors: { ...state.classificationErrors, [mediaId]: error },
    }))
  },

  getClassificationProgress(): ClassificationProgress {
    const { classificationStatus } = get()
    const entries = Object.values(classificationStatus)
    return {
      total: entries.length,
      classified: entries.filter((s) => s === 'classified').length,
      pending: entries.filter((s) => s === 'pending').length,
      failed: entries.filter((s) => s === 'failed').length,
    }
  },

  retryFailedClassifications(): string[] {
    const { classificationStatus } = get()
    const failedIds = Object.entries(classificationStatus)
      .filter(([, status]) => status === 'failed')
      .map(([id]) => id)

    if (failedIds.length === 0) return []

    set((state) => {
      const updated = { ...state.classificationStatus }
      for (const id of failedIds) {
        updated[id] = 'pending'
      }
      return { classificationStatus: updated }
    })

    return failedIds
  },
}))
