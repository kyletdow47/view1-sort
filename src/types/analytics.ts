// Analytics types for View1 Sort

export type DateRange = {
  from: string // ISO date YYYY-MM-DD
  to: string   // ISO date YYYY-MM-DD
}

export type AnalyticsTab = 'Overview' | 'Gallery' | 'Revenue' | 'Leads' | 'AI Insights'

export type KpiCard = {
  label: string
  value: string
  change: string
  positive: boolean
  color?: string
}

export type GalleryPerformanceRow = {
  name: string
  views: number
  selections: number
  status: 'Delivered' | 'In Review' | 'Active' | 'Processing'
}

export type ConversionFunnelStep = {
  label: string
  value: number
  color: string
}

export type RevenueDataPoint = {
  month: string
  revenue: number
  bookings?: number
}

export type InvoiceRow = {
  id: string
  client: string
  project: string
  amount: number
  oldAmount: number | null
  status: 'Paid' | 'Pending' | 'Overdue'
  date: string
}

export type PayoutRow = {
  date: string
  amount: string
  status: 'Completed' | 'Pending' | 'Failed'
  transferId?: string
}

export type AIInsight = {
  id: number
  title: string
  body: string
  cta: string
  color: string
}
