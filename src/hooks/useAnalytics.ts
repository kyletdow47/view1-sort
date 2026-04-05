'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DateRange, KpiCard, GalleryPerformanceRow, RevenueDataPoint, AIInsight } from '@/types/analytics'

export interface OverviewAnalytics {
  kpis: KpiCard[]
  revenueByWeek: RevenueDataPoint[]
  galleryPerformance: GalleryPerformanceRow[]
  aiInsights: AIInsight[]
}

interface UseAnalyticsReturn {
  data: OverviewAnalytics | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAnalytics(dateRange: DateRange): UseAnalyticsReturn {
  const [data, setData] = useState<OverviewAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to })
      const res = await fetch(`/api/analytics/overview?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as OverviewAnalytics
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
