'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  isTrainerDone,
  loadStockManifest,
  markTrainerDone,
  sampleTrainerPhotos,
  verdictAccepted,
} from '@/lib/ai/onboarding-trainer'
import { recordFeedback, syncFeedbackToSupabase } from '@/lib/ai/style-profile'
import type {
  TrainerDecision,
  TrainerPhoto,
  TrainerVerdict,
} from '@/types/onboarding-trainer'
import { TRAINER_PHOTO_COUNT } from '@/types/onboarding-trainer'

export interface UseOnboardingTrainerResult {
  shouldRun: boolean
  photos: TrainerPhoto[]
  index: number
  decisions: TrainerDecision[]
  total: number
  completed: boolean
  loading: boolean
  error: string | null
  decide: (verdict: TrainerVerdict) => void
  skip: () => void
  reset: () => void
}

interface Options {
  userId: string | undefined
  presetId: string | undefined
  enabled?: boolean
}

/**
 * Drives the onboarding trainer flow. When a user picks a preset for the
 * first time, this hook loads 20 stock photos across the preset's categories,
 * records each keep/reject as StyleProfile feedback, and marks the trainer
 * done so it doesn't run again for that preset.
 */
export function useOnboardingTrainer({
  userId,
  presetId,
  enabled = true,
}: Options): UseOnboardingTrainerResult {
  const [photos, setPhotos] = useState<TrainerPhoto[]>([])
  const [decisions, setDecisions] = useState<TrainerDecision[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldRun, setShouldRun] = useState(false)

  // Decide whether to run the trainer for this (user, preset) pair.
  useEffect(() => {
    if (!enabled || !userId || !presetId) {
      setShouldRun(false)
      return
    }
    setShouldRun(!isTrainerDone(userId, presetId))
  }, [enabled, userId, presetId])

  // Load the sample photos when the trainer should run.
  useEffect(() => {
    if (!shouldRun || !presetId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setDecisions([])
    loadStockManifest()
      .then((manifest) => {
        if (cancelled) return
        const sampled = sampleTrainerPhotos(manifest, presetId, TRAINER_PHOTO_COUNT)
        if (sampled.length === 0) {
          setError('No training photos are available for this preset yet.')
          setPhotos([])
          return
        }
        setPhotos(sampled)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load trainer')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [shouldRun, presetId])

  const index = decisions.length
  const total = photos.length
  const completed = total > 0 && index >= total

  // When the user finishes the set, record done + stop running.
  useEffect(() => {
    if (!completed || !userId || !presetId) return
    markTrainerDone(userId, presetId)
    setShouldRun(false)
  }, [completed, userId, presetId])

  const decide = useCallback(
    (verdict: TrainerVerdict) => {
      if (!userId || !presetId) return
      const current = photos[index]
      if (!current) return

      const decision: TrainerDecision = {
        photoId: current.id,
        category: current.category,
        verdict,
        at: Date.now(),
      }
      setDecisions((prev) => [...prev, decision])

      // Seed the style profile immediately (localStorage) and sync to Supabase.
      recordFeedback(userId, presetId, current.category, verdictAccepted(verdict))
      void syncFeedbackToSupabase(presetId, current.category, verdictAccepted(verdict))
    },
    [userId, presetId, photos, index],
  )

  const skip = useCallback(() => {
    if (!userId || !presetId) return
    markTrainerDone(userId, presetId)
    setShouldRun(false)
  }, [userId, presetId])

  const reset = useCallback(() => {
    setDecisions([])
  }, [])

  return useMemo(
    () => ({
      shouldRun: shouldRun && !completed,
      photos,
      index,
      decisions,
      total,
      completed,
      loading,
      error,
      decide,
      skip,
      reset,
    }),
    [shouldRun, completed, photos, index, decisions, total, loading, error, decide, skip, reset],
  )
}
