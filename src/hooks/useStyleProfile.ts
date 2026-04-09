'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  loadStyleProfile,
  loadProfileFromSupabase,
  recordFeedback,
  syncFeedbackToSupabase,
  progressToUnlock,
  type StyleProfile,
} from '@/lib/ai/style-profile'

export function useStyleProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<StyleProfile | null>(null)

  useEffect(() => {
    if (!userId) return
    // Load from localStorage first (fast)
    setProfile(loadStyleProfile(userId))
    // Then merge with Supabase (async, Supabase wins)
    void loadProfileFromSupabase(userId).then((remote) => {
      if (remote) setProfile(remote)
    })
  }, [userId])

  const feedback = useCallback(
    (presetId: string, category: string, accepted: boolean) => {
      if (!userId) return
      // Optimistic: update localStorage + local state immediately
      const updated = recordFeedback(userId, presetId, category, accepted)
      setProfile(updated)
      // Background: sync to Supabase
      void syncFeedbackToSupabase(presetId, category, accepted)
    },
    [userId]
  )

  const progress = profile ? progressToUnlock(profile) : 0
  const unlocked = profile?.personalizedModeUnlocked ?? false

  return { profile, feedback, progress, unlocked }
}
