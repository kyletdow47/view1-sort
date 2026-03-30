'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserQuota, type QuotaInfo } from '@/lib/storage-quota'

export function useStorageQuota(userId?: string, tier?: string) {
  const [quota, setQuota] = useState<QuotaInfo | null>(null)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    getUserQuota(supabase, userId, tier ?? 'free')
      .then(setQuota)
      .catch(() => setQuota(null))
  }, [userId, tier])

  return quota
}
