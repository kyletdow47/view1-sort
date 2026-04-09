import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AIAnalysisPanel } from './AIAnalysisPanel'

describe('AIAnalysisPanel', () => {
  const defaultProps = {
    totalPhotos: 100,
    qualityDistribution: { high: 60, medium: 30, low: 10 },
    duplicateCount: 5,
    blurryCount: 3,
    overexposedCount: 2,
    underexposedCount: 1,
    keepCount: 80,
    rejectCount: 8,
    onReviewFlags: vi.fn(),
  }

  it('renders the AI Analysis header', () => {
    render(<AIAnalysisPanel {...defaultProps} />)
    expect(screen.getByText('AI Analysis')).toBeInTheDocument()
  })

  it('shows quality distribution bars with counts', () => {
    render(<AIAnalysisPanel {...defaultProps} />)
    expect(screen.getByText('90+')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows blurry and duplicate counts', () => {
    render(<AIAnalysisPanel {...defaultProps} />)
    expect(screen.getByText('Blurry')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Duplicates')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows overexposed count when > 0', () => {
    render(<AIAnalysisPanel {...defaultProps} />)
    expect(screen.getByText('Overexposed')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('hides overexposed row when count is 0', () => {
    render(<AIAnalysisPanel {...defaultProps} overexposedCount={0} />)
    expect(screen.queryByText('Overexposed')).not.toBeInTheDocument()
  })

  it('shows underexposed count when > 0', () => {
    render(<AIAnalysisPanel {...defaultProps} />)
    expect(screen.getByText('Underexposed')).toBeInTheDocument()
    // The count '1' appears in the underexposed badge
  })

  it('hides underexposed row when count is 0', () => {
    render(<AIAnalysisPanel {...defaultProps} underexposedCount={0} />)
    expect(screen.queryByText('Underexposed')).not.toBeInTheDocument()
  })

  it('shows keep and reject review status', () => {
    render(<AIAnalysisPanel {...defaultProps} />)
    expect(screen.getByText('Kept')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders Review Flags button', () => {
    render(<AIAnalysisPanel {...defaultProps} />)
    expect(screen.getByText('Review Flags')).toBeInTheDocument()
  })

  it('calls onReviewFlags when Review Flags button is clicked', async () => {
    const onReviewFlags = vi.fn()
    const { getByText } = render(
      <AIAnalysisPanel {...defaultProps} onReviewFlags={onReviewFlags} />,
    )
    const button = getByText('Review Flags')
    button.click()
    expect(onReviewFlags).toHaveBeenCalledOnce()
  })
})
