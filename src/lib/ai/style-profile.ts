/**
 * AI Style Profile — per-user sort preference learning.
 *
 * Stores accept/reject feedback on categorization results in localStorage
 * (and optionally syncs to Supabase for cross-device persistence).
 * After enough feedback is collected the user unlocks "Personalized Mode",
 * which re-ranks category label scores based on their historical preferences.
 */

export interface CategoryFeedback {
  presetId: string
  category: string
  accepted: boolean // true = kept in that category, false = moved elsewhere
  timestamp: number
}

export interface StyleProfile {
  userId: string
  feedbackCount: number
  personalizedModeUnlocked: boolean // true once feedbackCount >= UNLOCK_THRESHOLD
  categoryWeights: Record<string, number> // "presetId:category" → weight (0.5–2.0)
  lastUpdated: number
}

/** How many feedback events are needed to unlock Personalized Mode */
export const UNLOCK_THRESHOLD = 20

const STORAGE_KEY = 'v1-style-profile'

/* ─── Read / Write ──────────────────────────────────────────────────────── */

export function loadStyleProfile(userId: string): StyleProfile {
  if (typeof window === 'undefined') return emptyProfile(userId)
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`)
    if (!raw) return emptyProfile(userId)
    return JSON.parse(raw) as StyleProfile
  } catch {
    return emptyProfile(userId)
  }
}

function saveStyleProfile(profile: StyleProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_KEY}:${profile.userId}`, JSON.stringify(profile))
}

function emptyProfile(userId: string): StyleProfile {
  return {
    userId,
    feedbackCount: 0,
    personalizedModeUnlocked: false,
    categoryWeights: {},
    lastUpdated: Date.now(),
  }
}

/* ─── Record feedback ───────────────────────────────────────────────────── */

/**
 * Record whether the user accepted or rejected a category assignment.
 * Adjusts the per-category weight and increments the feedback counter.
 */
export function recordFeedback(
  userId: string,
  presetId: string,
  category: string,
  accepted: boolean
): StyleProfile {
  const profile = loadStyleProfile(userId)
  const key = `${presetId}:${category}`
  const current = profile.categoryWeights[key] ?? 1.0

  // Exponential moving average — nudge weight up or down by 10%
  const delta = accepted ? 0.1 : -0.1
  const next = Math.max(0.2, Math.min(2.0, current + delta))

  profile.categoryWeights[key] = next
  profile.feedbackCount++
  profile.personalizedModeUnlocked = profile.feedbackCount >= UNLOCK_THRESHOLD
  profile.lastUpdated = Date.now()

  saveStyleProfile(profile)
  return profile
}

/* ─── Apply personalization ─────────────────────────────────────────────── */

/**
 * Re-rank classification results using the user's learned category weights.
 * Only applied when personalizedModeUnlocked is true.
 *
 * @param results   Array of { category, score } from the classifier
 * @param profile   The user's style profile
 * @param presetId  Active preset id
 * @returns         Re-ranked results (same structure, scores scaled)
 */
export function applyPersonalization<T extends { category: string; score: number }>(
  results: T[],
  profile: StyleProfile,
  presetId: string
): T[] {
  if (!profile.personalizedModeUnlocked) return results

  return results
    .map((r) => {
      const key = `${presetId}:${r.category}`
      const weight = profile.categoryWeights[key] ?? 1.0
      return { ...r, score: r.score * weight }
    })
    .sort((a, b) => b.score - a.score)
}

/* ─── Progress helpers ──────────────────────────────────────────────────── */

export function progressToUnlock(profile: StyleProfile): number {
  return Math.min(100, Math.round((profile.feedbackCount / UNLOCK_THRESHOLD) * 100))
}

export function topCategories(profile: StyleProfile, presetId: string, limit = 5): string[] {
  return Object.entries(profile.categoryWeights)
    .filter(([key]) => key.startsWith(`${presetId}:`))
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([key]) => key.split(':')[1])
}
