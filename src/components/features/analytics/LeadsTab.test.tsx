import { render } from '@testing-library/react'
import { describe, expect, it, beforeAll } from 'vitest'
import { LeadsTab } from './LeadsTab'

const DATE_RANGE = { from: '2026-03-18', to: '2026-04-17' }

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    ;(globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver
  }
})

describe('LeadsTab', () => {
  it('renders the Conversion Funnel card with its summary line', () => {
    const { container } = render(<LeadsTab dateRange={DATE_RANGE} />)
    expect(container.textContent).toContain('Conversion Funnel')
    expect(container.textContent).toContain('72 inquiries → 24 paid')
    expect(container.textContent).toContain('33% end-to-end')
  })

  it('wraps the funnel chart container in a min-w-0 element so flex/grid parents cannot crush it', () => {
    const { container } = render(<LeadsTab dateRange={DATE_RANGE} />)
    const rc = container.querySelector('.recharts-responsive-container')
    expect(rc).not.toBeNull()
    expect(rc?.parentElement?.className).toMatch(/\bmin-w-0\b/)
  })

  it('gives the funnel container an explicit 240px height so ResponsiveContainer has a measurable parent', () => {
    const { container } = render(<LeadsTab dateRange={DATE_RANGE} />)
    const rc = container.querySelector('.recharts-responsive-container')
    const parent = rc?.parentElement as HTMLElement | null
    expect(parent).not.toBeNull()
    expect(parent?.style.height).toBe('240px')
  })

  it('renders all four summary stat labels', () => {
    const { container } = render(<LeadsTab dateRange={DATE_RANGE} />)
    for (const label of ['Total Inquiries', 'Booking Rate', 'End-to-End Conv.', 'Avg. Lead Value']) {
      expect(container.textContent).toContain(label)
    }
  })

  it('renders every lead source row', () => {
    const { container } = render(<LeadsTab dateRange={DATE_RANGE} />)
    for (const source of ['Instagram', 'Google', 'Referral', 'Website', 'Other']) {
      expect(container.textContent).toContain(source)
    }
  })

  it('renders the average stage duration card with all six stages', () => {
    const { container } = render(<LeadsTab dateRange={DATE_RANGE} />)
    for (const stage of [
      'Inquiry → Quote',
      'Quote → Booked',
      'Booked → Contracted',
      'Contracted → Shoot',
      'Shoot → Gallery',
      'Gallery → Paid',
    ]) {
      expect(container.textContent).toContain(stage)
    }
  })
})
