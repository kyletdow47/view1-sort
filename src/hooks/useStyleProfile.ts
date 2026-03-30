'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  loadStyleProfile,
  recordFeedback,
  progressToUnlock,
  type StyleProfile,
} from '@/lib/ai/style-profile'

export function useStyleProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<StyleProfile | null>(null)

  useEffect(() => {
    if (!userId) return
    setProfile(loadStyleProfile(userId))
  }, [userId])

  const feedback = useCallback(
    (presetId: string, category: string, accepted: boolean) => {
      if (!userId) return
      const updated = recordFeedback(userId, presetId, category, accepted)
      setProfile(updated)
    },
    [userId]
  )

  const progress = profile ? progressToUnlock(profile) : 0
  const unlocked = profile?.personalizedModeUnlocked ?? false

  return { profile, feedback, progress, unlocked }
}
