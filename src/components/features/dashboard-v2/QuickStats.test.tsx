import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QuickStats } from './QuickStats'

describe('QuickStats', () => {
  it('renders all zeros when no stats are provided (no legacy hardcoded fallbacks)', () => {
    render(<QuickStats />)

    // All four metric values should be explicit zero / $0 — never 12, 4, 3, or $3.2k.
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(3) // Pending Actions, Active Projects, Upcoming Shoots
    expect(screen.getByText('$0')).toBeInTheDocument()

    expect(screen.queryByText('12')).not.toBeInTheDocument()
    expect(screen.queryByText('4')).not.toBeInTheDocument()
    expect(screen.queryByText('3')).not.toBeInTheDocument()
    expect(screen.queryByText('$3.2k')).not.toBeInTheDocument()

    // Labels still render.
    expect(screen.getByText('Pending Actions')).toBeInTheDocument()
    expect(screen.getByText('Active Projects')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Shoots')).toBeInTheDocument()
    expect(screen.getByText('Revenue this Month')).toBeInTheDocument()
  })

  it('renders real counts when props are supplied', () => {
    render(
      <QuickStats
        activeProjectCount={7}
        upcomingShoots={2}
        pendingActions={9}
        revenueThisMonth={450000}
      />,
    )

    expect(screen.getByText('9')).toBeInTheDocument() // pending actions
    expect(screen.getByText('7')).toBeInTheDocument() // active projects
    expect(screen.getByText('2')).toBeInTheDocument() // upcoming shoots
    expect(screen.getByText('$4,500')).toBeInTheDocument() // 450000 cents → $4,500
  })

  it('formats revenue with locale thousand separators', () => {
    render(<QuickStats revenueThisMonth={1234500} />)
    // 1,234,500 cents = $12,345
    expect(screen.getByText('$12,345')).toBeInTheDocument()
  })
})
