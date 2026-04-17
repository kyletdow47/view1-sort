import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientsKanbanView, MOCK_CLIENTS } from './ClientsKanbanView'

describe('ClientsKanbanView', () => {
  it('renders every column from the pipeline spec', () => {
    render(<ClientsKanbanView clients={[]} searchQuery="" onAddClient={vi.fn()} />)
    for (const label of ['Inquiry', 'Quoted', 'Booked', 'Shooting', 'Delivered', 'Paid']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('renders a horizontal scroll container with left inset and no right inset', () => {
    render(<ClientsKanbanView clients={[]} searchQuery="" onAddClient={vi.fn()} />)
    const scroller = screen.getByTestId('clients-kanban-scroll')
    expect(scroller.className).toContain('overflow-x-auto')
    expect(scroller.className).toContain('pl-6')
    // Right inset is supplied by a trailing spacer, not px-6, because WebKit/
    // Blink drop padding-right from the scrollable extent of flex overflow
    // containers and that was clipping the final "Paid" column count badge.
    expect(scroller.className).not.toMatch(/(?:^| )px-6/)
  })

  it('includes a trailing spacer to preserve right-edge breathing room during horizontal scroll', () => {
    render(<ClientsKanbanView clients={[]} searchQuery="" onAddClient={vi.fn()} />)
    const scroller = screen.getByTestId('clients-kanban-scroll')
    const spacer = screen.getByTestId('clients-kanban-trailing-spacer')
    expect(spacer).toHaveAttribute('aria-hidden', 'true')
    expect(spacer.className).toContain('w-6')
    expect(spacer.className).toContain('shrink-0')
    // Must be the final flex child so it sits after the "Paid" column.
    expect(scroller.lastElementChild).toBe(spacer)
  })

  it('renders the Paid column count badge with the correct tally from mock clients', () => {
    render(<ClientsKanbanView clients={MOCK_CLIENTS} searchQuery="" onAddClient={vi.fn()} />)
    const paidLabel = screen.getByText('Paid')
    // Header layout: [dot+label] ... [count badge] — badge is the last direct
    // child of the column header flex row (a sibling of the dot+label group).
    const paidHeader = paidLabel.closest('div')?.parentElement
    expect(paidHeader).not.toBeNull()
    const badge = paidHeader?.lastElementChild
    expect(badge).not.toBeNull()
    const paidCount = MOCK_CLIENTS.filter((c) => c.stage === 'paid').length
    expect(badge?.textContent).toBe(String(paidCount))
  })
})
