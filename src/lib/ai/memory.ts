/**
 * AI Sort Memory System.
 *
 * Replaces the localStorage-only style-profile.ts with a Supabase-backed
 * memory system that persists across devices and sessions.
 *
 * The memory system tracks:
 * - Category weights (which categories the photographer prefers)
 * - Label weights (which specific labels they accept/reject)
 * - Preferred categories (their usual category structure)
 * - Sort session history (what the AI did, what the user changed)
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface SortProfile {
  id: string
  userId: string
  categoryWeights: Record<string, number>
  labelWeights: Record<string, number>
  preferredCategories: string[]
  feedbackCount: number
  lastSortAt: string | null
}

export interface SortSession {
  id: string
  projectId: string
  userId: string
  briefText: string | null
  batchSummary: Record<string, unknown> | null
  sortPlan: Record<string, unknown> | null
  categoriesUsed: string[] | null
  photoCount: number
  corrections: Correction[]
  createdAt: string
}

export interface Correction {
  photoId: string
  fromCategory: string
  toCategory: string
  timestamp: number
}

const EMA_ALPHA = 0.15
const WEIGHT_ACCEPT_TARGET = 1.5
const WEIGHT_REJECT_TARGET = 0.5
const WEIGHT_MIN = 0.2
const WEIGHT_MAX = 2.0

/* ── Load / Save ─────────────────────────────────────────────────────── */

export async function loadSortProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<SortProfile> {
  const { data, error } = await supabase
    .from('sort_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return emptyProfile(userId)
  }

  return {
    id: data.id,
    userId: data.user_id,
    categoryWeights: data.category_weights ?? {},
    labelWeights: data.label_weights ?? {},
    preferredCategories: data.preferred_categories ?? [],
    feedbackCount: data.feedback_count ?? 0,
    lastSortAt: data.last_sort_at,
  }
}

export async function saveSortProfile(
  supabase: SupabaseClient,
  profile: SortProfile
): Promise<void> {
  const { error } = await supabase
    .from('sort_profiles')
    .upsert({
      user_id: profile.userId,
      category_weights: profile.categoryWeights,
      label_weights: profile.labelWeights,
      preferred_categories: profile.preferredCategories,
      feedback_count: profile.feedbackCount,
      last_sort_at: profile.lastSortAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) {
    console.error('Failed to save sort profile:', error.message)
  }
}

function emptyProfile(userId: string): SortProfile {
  return {
    id: '',
    userId,
    categoryWeights: {},
    labelWeights: {},
    preferredCategories: [],
    feedbackCount: 0,
    lastSortAt: null,
  }
}

/* ── Record feedback ─────────────────────────────────────────────────── */

/**
 * Record a category correction (user moved a photo from one category to another).
 * Uses exponential moving average for weight updates.
 */
export function applyCorrection(
  profile: SortProfile,
  fromCategory: string,
  toCategory: string,
  label: string
): SortProfile {
  const updated = { ...profile }
  updated.categoryWeights = { ...profile.categoryWeights }
  updated.labelWeights = { ...profile.labelWeights }

  // Decrease weight for the wrong category
  const fromKey = fromCategory.toLowerCase()
  const fromCurrent = updated.categoryWeights[fromKey] ?? 1.0
  updated.categoryWeights[fromKey] = clampWeight(
    EMA_ALPHA * WEIGHT_REJECT_TARGET + (1 - EMA_ALPHA) * fromCurrent
  )

  // Increase weight for the correct category
  const toKey = toCategory.toLowerCase()
  const toCurrent = updated.categoryWeights[toKey] ?? 1.0
  updated.categoryWeights[toKey] = clampWeight(
    EMA_ALPHA * WEIGHT_ACCEPT_TARGET + (1 - EMA_ALPHA) * toCurrent
  )

  // Update label-level weights
  if (label) {
    const labelKey = `${toKey}:${label.slice(0, 60)}`
    const labelCurrent = updated.labelWeights[labelKey] ?? 1.0
    updated.labelWeights[labelKey] = clampWeight(
      EMA_ALPHA * WEIGHT_ACCEPT_TARGET + (1 - EMA_ALPHA) * labelCurrent
    )
  }

  updated.feedbackCount++
  return updated
}

/**
 * Record that the user accepted a category assignment (no correction needed).
 */
export function applyAcceptance(
  profile: SortProfile,
  category: string,
  label: string
): SortProfile {
  const updated = { ...profile }
  updated.categoryWeights = { ...profile.categoryWeights }

  const key = category.toLowerCase()
  const current = updated.categoryWeights[key] ?? 1.0
  updated.categoryWeights[key] = clampWeight(
    EMA_ALPHA * WEIGHT_ACCEPT_TARGET + (1 - EMA_ALPHA) * current
  )

  updated.feedbackCount++
  return updated
}

function clampWeight(w: number): number {
  return Math.max(WEIGHT_MIN, Math.min(WEIGHT_MAX, Math.round(w * 1000) / 1000))
}

/* ── Sort sessions ───────────────────────────────────────────────────── */

export async function saveSortSession(
  supabase: SupabaseClient,
  session: Omit<SortSession, 'id' | 'createdAt'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('sort_sessions')
    .insert({
      project_id: session.projectId,
      user_id: session.userId,
      brief_text: session.briefText,
      batch_summary: session.batchSummary,
      sort_plan: session.sortPlan,
      categories_used: session.categoriesUsed,
      photo_count: session.photoCount,
      corrections: session.corrections,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to save sort session:', error.message)
    return null
  }

  return data.id
}

export async function loadRecentSessions(
  supabase: SupabaseClient,
  userId: string,
  limit = 10
): Promise<SortSession[]> {
  const { data, error } = await supabase
    .from('sort_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    briefText: row.brief_text,
    batchSummary: row.batch_summary,
    sortPlan: row.sort_plan,
    categoriesUsed: row.categories_used,
    photoCount: row.photo_count,
    corrections: row.corrections ?? [],
    createdAt: row.created_at,
  }))
}

/* ── Memory context for Brain 2 ──────────────────────────────────────── */

/**
 * Build a natural-language memory summary for Brain 2 (Claude).
 * This gets injected into the conversation engine's system prompt
 * so it knows how this photographer likes their photos sorted.
 */
export async function buildMemoryContext(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const profile = await loadSortProfile(supabase, userId)
  const sessions = await loadRecentSessions(supabase, userId, 5)

  if (profile.feedbackCount === 0 && sessions.length === 0) {
    return 'New photographer. No sorting history available.'
  }

  const parts: string[] = []

  // Sort history overview
  if (sessions.length > 0) {
    parts.push(`This photographer has completed ${sessions.length} sort sessions.`)

    // Common categories
    const catCounts = new Map<string, number>()
    for (const s of sessions) {
      const cats = s.categoriesUsed ?? []
      for (const cat of cats) {
        catCounts.set(cat as string, (catCounts.get(cat as string) ?? 0) + 1)
      }
    }
    if (catCounts.size > 0) {
      const topCats = Array.from(catCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([cat]) => cat)
      parts.push(`Commonly used categories: ${topCats.join(', ')}.`)
    }

    // Average photo count
    const avgPhotos = Math.round(sessions.reduce((sum, s) => sum + s.photoCount, 0) / sessions.length)
    parts.push(`Average upload size: ${avgPhotos} photos.`)

    // Correction rate
    const totalCorrections = sessions.reduce((sum, s) => sum + s.corrections.length, 0)
    const totalPhotos = sessions.reduce((sum, s) => sum + s.photoCount, 0)
    if (totalPhotos > 0) {
      const correctionRate = Math.round((totalCorrections / totalPhotos) * 100)
      parts.push(`Correction rate: ${correctionRate}% of photos were re-categorized after sorting.`)
    }
  }

  // Strong preferences
  const strongPrefs = Object.entries(profile.categoryWeights)
    .filter(([, w]) => w > 1.3 || w < 0.7)
    .sort(([, a], [, b]) => b - a)
  if (strongPrefs.length > 0) {
    const prefs = strongPrefs.map(([cat, w]) => {
      return w > 1.3 ? `prefers "${cat}"` : `avoids "${cat}"`
    })
    parts.push(`Strong preferences: ${prefs.join(', ')}.`)
  }

  return parts.join(' ')
}
