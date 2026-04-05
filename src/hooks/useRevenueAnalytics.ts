'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DateRange, InvoiceRow, PayoutRow, KpiCard } from '@/types/analytics'

export interface RevenueByMonth {
  month: string
  revenue: number
  bookings: number
  gallery: number
}

export interface RevenueAnalytics {
  kpis: KpiCard[]
  revenueByMonth: RevenueByMonth[]
  invoices: InvoiceRow[]
  payouts: PayoutRow[]
}

interface UseRevenueAnalyticsReturn {
  data: RevenueAnalytics | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useRevenueAnalytics(dateRange: DateRange): UseRevenueAnalyticsReturn {
  const [data, setData] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to })
      const res = await fetch(`/api/analytics/revenue?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as RevenueAnalytics
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue analytics')
    } finally {
      setLoading(false)
    }
  }, [dateRange.from, dateRange.to])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
