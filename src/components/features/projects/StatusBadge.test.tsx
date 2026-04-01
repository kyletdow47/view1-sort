import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge, STATUS_CONFIG } from './StatusBadge'
import type { ProjectPipelineStatus } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the correct label for each 10-stage status', () => {
    const cases: Array<[ProjectPipelineStatus, string]> = [
      ['inquiry',      'Inquiry'],
      ['quoted',       'Quoted'],
      ['booked',       'Booked'],
      ['contracted',   'Contracted'],
      ['prepped',      'Prepped'],
      ['shooting',     'Shooting'],
      ['processing',   'Processing'],
      ['review',       'In Review'],
      ['gallery_live', 'Gallery Live'],
      ['delivered',    'Delivered'],
    ]

    for (const [status, expectedLabel] of cases) {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(expectedLabel)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders "Unknown" for an unrecognised status', () => {
    render(<StatusBadge status="not_a_real_status" />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('applies correct background class for booked', () => {
    const { container } = render(<StatusBadge status="booked" />)
    const badge = container.firstChild as HTMLElement
    expect(badge).toHaveClass('bg-blue-500/20')
  })

  it('applies correct text class for gallery_live', () => {
    const { container } = render(<StatusBadge status="gallery_live" />)
    const badge = container.firstChild as HTMLElement
    expect(badge).toHaveClass('text-emerald-400')
  })

  it('applies animate-pulse dot for processing status', () => {
    const { container } = render(<StatusBadge status="processing" />)
    const dot = container.querySelector('span > span') as HTMLElement
    expect(dot).toHaveClass('animate-pulse')
  })

  it('does not apply animate-pulse for non-processing statuses', () => {
    const { container } = render(<StatusBadge status="booked" />)
    const dot = container.querySelector('span > span') as HTMLElement
    expect(dot).not.toHaveClass('animate-pulse')
  })

  it('accepts an additional className', () => {
    const { container } = render(<StatusBadge status="inquiry" className="custom-class" />)
    const badge = container.firstChild as HTMLElement
    expect(badge).toHaveClass('custom-class')
  })

  it('STATUS_CONFIG covers all 10 pipeline stages', () => {
    const expectedStatuses: ProjectPipelineStatus[] = [
      'inquiry', 'quoted', 'booked', 'contracted', 'prepped',
      'shooting', 'processing', 'review', 'gallery_live', 'delivered',
    ]
    for (const status of expectedStatuses) {
      expect(STATUS_CONFIG[status]).toBeDefined()
      expect(STATUS_CONFIG[status].label).toBeTruthy()
    }
  })
})
