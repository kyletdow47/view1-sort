'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DateRange, ConversionFunnelStep, KpiCard } from '@/types/analytics'

export interface LeadSourceRow {
  source: string
  leads: number
  conversions: number
  rate: number
}

export interface AvgStageDuration {
  stage: string
  days: number
}

export interface LeadFunnelData {
  kpis: KpiCard[]
  funnel: ConversionFunnelStep[]
  leadSources: LeadSourceRow[]
  avgStageDurations: AvgStageDuration[]
}

interface UseLeadFunnelReturn {
  data: LeadFunnelData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useLeadFunnel(dateRange: DateRange): UseLeadFunnelReturn {
  const [data, setData] = useState<LeadFunnelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to })
      const res = await fetch(`/api/analytics/leads?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as LeadFunnelData
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead funnel data')
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
