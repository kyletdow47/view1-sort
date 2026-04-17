import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { DateRange } from '@/types/analytics'

type BarProps = {
  dataKey: string
  stackId?: string
  radius?: readonly [number, number, number, number] | [number, number, number, number]
  isAnimationActive?: boolean
  fill?: string
  name?: string
}

const barCalls: BarProps[] = []

vi.mock('recharts', () => {
  const Passthrough = ({ children }: { children?: ReactNode }) => <>{children}</>
  const Stub = () => null
  return {
    ResponsiveContainer: Passthrough,
    BarChart: Passthrough,
    Bar: (props: BarProps) => {
      barCalls.push(props)
      return null
    },
    XAxis: Stub,
    YAxis: Stub,
    CartesianGrid: Stub,
    Tooltip: Stub,
    Legend: Stub,
    AreaChart: Passthrough,
    Area: Stub,
  }
})

import { RevenueTab } from './RevenueTab'

const dateRange: DateRange = { from: '2026-03-18', to: '2026-04-17' }

describe('RevenueTab — Revenue by Source chart', () => {
  it('renders the chart section heading', () => {
    barCalls.length = 0
    render(<RevenueTab dateRange={dateRange} />)
    expect(screen.getByText('Revenue by Source')).toBeInTheDocument()
    expect(screen.getByText('Last 6 months')).toBeInTheDocument()
  })

  it('renders exactly two stacked Bar components (bookings + gallery)', () => {
    barCalls.length = 0
    render(<RevenueTab dateRange={dateRange} />)
    const stacked = barCalls.filter((b) => b.stackId === 'a')
    expect(stacked).toHaveLength(2)
    expect(stacked.map((b) => b.dataKey).sort()).toEqual(['bookings', 'gallery'])
  })

  it('applies radius only to the top bar of the stack (gallery), not the bottom (bookings)', () => {
    barCalls.length = 0
    render(<RevenueTab dateRange={dateRange} />)
    const bookings = barCalls.find((b) => b.dataKey === 'bookings')
    const gallery = barCalls.find((b) => b.dataKey === 'gallery')
    expect(bookings?.radius).toBeUndefined()
    expect(gallery?.radius).toEqual([4, 4, 0, 0])
  })

  it('disables Bar animation so initial render is not blocked by 0-width container', () => {
    barCalls.length = 0
    render(<RevenueTab dateRange={dateRange} />)
    for (const bar of barCalls) {
      expect(bar.isAnimationActive).toBe(false)
    }
  })

  it('uses distinct fill colors for bookings vs gallery', () => {
    barCalls.length = 0
    render(<RevenueTab dateRange={dateRange} />)
    const bookings = barCalls.find((b) => b.dataKey === 'bookings')
    const gallery = barCalls.find((b) => b.dataKey === 'gallery')
    expect(bookings?.fill).toBe('#6366F1')
    expect(gallery?.fill).toBe('#34D399')
    expect(bookings?.fill).not.toBe(gallery?.fill)
  })
})
