/**
 * Onboarding Trainer — Phase 3 of Brain #2.
 *
 * Seeds a user's StyleProfile by having them quick-sort 20 stock photos
 * from the preset's category set on first preset selection.
 */

export interface StockEntry {
  preset: string
  category: string
  url: string
  pexelsId: number
  credit: string
  creditUrl: string
}

export interface StockManifest {
  generatedAt: string
  perCategory: number
  entries: StockEntry[]
}

export interface TrainerPhoto {
  id: string
  url: string
  category: string
  credit: string
  creditUrl: string
}

export type TrainerVerdict = 'keep' | 'reject'

export interface TrainerDecision {
  photoId: string
  category: string
  verdict: TrainerVerdict
  at: number
}

export interface TrainerSession {
  userId: string
  presetId: string
  photos: TrainerPhoto[]
  decisions: TrainerDecision[]
  startedAt: number
  completedAt: number | null
}

export const TRAINER_PHOTO_COUNT = 20
