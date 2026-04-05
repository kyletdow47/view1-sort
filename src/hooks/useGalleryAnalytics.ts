'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DateRange, GalleryPerformanceRow, KpiCard } from '@/types/analytics'

export interface DailyViewPoint {
  date: string
  views: number
  downloads: number
}

export interface GalleryAnalytics {
  kpis: KpiCard[]
  dailyViews: DailyViewPoint[]
  topGalleries: GalleryPerformanceRow[]
}

interface UseGalleryAnalyticsReturn {
  data: GalleryAnalytics | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useGalleryAnalytics(dateRange: DateRange): UseGalleryAnalyticsReturn {
  const [data, setData] = useState<GalleryAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to })
      const res = await fetch(`/api/analytics/gallery?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as GalleryAnalytics
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery analytics')
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
