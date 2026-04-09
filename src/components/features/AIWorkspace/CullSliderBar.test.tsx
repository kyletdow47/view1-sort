import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CullSliderBar } from './CullSliderBar'

describe('CullSliderBar', () => {
  const defaultProps = {
    keepCount: 85,
    totalCount: 100,
    aiRecommendation: 85,
    onKeepCountChange: vi.fn(),
  }

  it('displays the keep count and total', () => {
    render(<CullSliderBar {...defaultProps} />)
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('of 100')).toBeInTheDocument()
  })

  it('shows the AI recommendation badge', () => {
    render(<CullSliderBar {...defaultProps} />)
    expect(screen.getByText(/AI recommends 85/)).toBeInTheDocument()
  })

  it('calls onKeepCountChange when slider is moved', () => {
    const onChange = vi.fn()
    render(<CullSliderBar {...defaultProps} onKeepCountChange={onChange} />)
    const slider = screen.getByRole('slider', { name: /cull slider/i })
    fireEvent.change(slider, { target: { value: '50' } })
    expect(onChange).toHaveBeenCalledWith(50)
  })

  it('sets slider max to totalCount', () => {
    render(<CullSliderBar {...defaultProps} />)
    const slider = screen.getByRole('slider', { name: /cull slider/i })
    expect(slider).toHaveAttribute('max', '100')
  })

  it('renders progress bar at correct width', () => {
    const { container } = render(<CullSliderBar {...defaultProps} keepCount={50} totalCount={100} />)
    const progressBar = container.querySelector('[style*="width: 50%"]')
    expect(progressBar).not.toBeNull()
  })

  it('handles zero total gracefully', () => {
    const { container } = render(
      <CullSliderBar keepCount={0} totalCount={0} aiRecommendation={0} onKeepCountChange={vi.fn()} />,
    )
    const progressBar = container.querySelector('[style*="width: 0%"]')
    expect(progressBar).not.toBeNull()
  })
})
