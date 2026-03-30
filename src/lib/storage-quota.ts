import type { SupabaseClient } from '@supabase/supabase-js'

export const PLAN_QUOTAS: Record<string, number> = {
  free:     5  * 1024 * 1024 * 1024,   //   5 GB
  pro:      50 * 1024 * 1024 * 1024,   //  50 GB
  business: 500 * 1024 * 1024 * 1024,  // 500 GB
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024)                    return `${bytes} B`
  if (bytes < 1024 * 1024)             return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export interface QuotaInfo {
  used: number
  total: number
  percent: number
  usedFormatted: string
  totalFormatted: string
  exceeded: boolean
}

export async function getUserQuota(
  supabase: SupabaseClient,
  userId: string,
  tier: string = 'free'
): Promise<QuotaInfo> {
  const { data } = await supabase
    .from('media')
    .select('file_size')
    .eq('user_id', userId)

  const used = (data ?? []).reduce((sum, row) => sum + (row.file_size ?? 0), 0)
  const total = PLAN_QUOTAS[tier] ?? PLAN_QUOTAS.free
  const percent = Math.min(100, Math.round((used / total) * 100))

  return {
    used,
    total,
    percent,
    usedFormatted:  formatBytes(used),
    totalFormatted: formatBytes(total),
    exceeded:       used >= total,
  }
}
