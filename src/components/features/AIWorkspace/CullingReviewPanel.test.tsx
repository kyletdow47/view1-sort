import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CullingReviewPanel } from './CullingReviewPanel'
import type { MediaItem } from '@/types/media'

const makeMedia = (overrides: Partial<MediaItem> = {}): MediaItem => ({
  id: 'photo-1',
  filename: 'IMG_0001.jpg',
  thumbnail_url: 'https://example.com/thumb.jpg',
  ...overrides,
})

const blurryPhoto = makeMedia({ id: 'blur-1', filename: 'blur.jpg', is_blurry: true, culling_confidence: 0.85 })
const duplicatePhoto = makeMedia({ id: 'dup-1', filename: 'dup.jpg', is_duplicate: true, culling_confidence: 0.9 })
const overexposedPhoto = makeMedia({ id: 'over-1', filename: 'over.jpg', is_overexposed: true, culling_confidence: 0.7 })
const underexposedPhoto = makeMedia({ id: 'under-1', filename: 'under.jpg', is_underexposed: true, culling_confidence: 0.6 })
const cleanPhoto = makeMedia({ id: 'clean-1', filename: 'clean.jpg' })

describe('CullingReviewPanel', () => {
  const defaultProps = {
    onKeep: vi.fn(),
    onReject: vi.fn(),
    onKeepAll: vi.fn(),
    onRejectAll: vi.fn(),
  }

  it('shows empty state when no flagged photos', () => {
    render(<CullingReviewPanel media={[cleanPhoto]} {...defaultProps} />)
    expect(screen.getByText('No flagged photos')).toBeInTheDocument()
  })

  it('groups flagged photos by issue type', () => {
    render(
      <CullingReviewPanel
        media={[blurryPhoto, duplicatePhoto, overexposedPhoto, underexposedPhoto, cleanPhoto]}
        {...defaultProps}
      />,
    )
    expect(screen.getByText('Blurry')).toBeInTheDocument()
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
    expect(screen.getByText('Overexposed')).toBeInTheDocument()
    expect(screen.getByText('Underexposed')).toBeInTheDocument()
  })

  it('shows correct flagged count badge', () => {
    render(
      <CullingReviewPanel
        media={[blurryPhoto, duplicatePhoto, cleanPhoto]}
        {...defaultProps}
      />,
    )
    expect(screen.getByText('2 flagged')).toBeInTheDocument()
  })

  it('shows confidence percentage for flagged photos', () => {
    render(
      <CullingReviewPanel
        media={[blurryPhoto]}
        {...defaultProps}
      />,
    )
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('calls onKeep when Keep button is clicked', async () => {
    const onKeep = vi.fn()
    render(
      <CullingReviewPanel
        media={[blurryPhoto]}
        {...defaultProps}
        onKeep={onKeep}
      />,
    )
    const keepButtons = screen.getAllByRole('button', { name: /keep/i })
    // Find the individual keep button (not "Keep All")
    const singleKeep = keepButtons.find((btn) => btn.textContent?.trim() === 'Keep')
    await userEvent.click(singleKeep!)
    expect(onKeep).toHaveBeenCalledWith('blur-1')
  })

  it('calls onReject when Reject button is clicked', async () => {
    const onReject = vi.fn()
    render(
      <CullingReviewPanel
        media={[blurryPhoto]}
        {...defaultProps}
        onReject={onReject}
      />,
    )
    const rejectButtons = screen.getAllByRole('button', { name: /reject/i })
    const singleReject = rejectButtons.find((btn) => btn.textContent?.trim() === 'Reject')
    await userEvent.click(singleReject!)
    expect(onReject).toHaveBeenCalledWith('blur-1')
  })

  it('calls onKeepAll with group IDs when Keep All is clicked', async () => {
    const onKeepAll = vi.fn()
    render(
      <CullingReviewPanel
        media={[blurryPhoto]}
        {...defaultProps}
        onKeepAll={onKeepAll}
      />,
    )
    await userEvent.click(screen.getByText('Keep All'))
    expect(onKeepAll).toHaveBeenCalledWith(['blur-1'])
  })

  it('calls onRejectAll with group IDs when Reject All is clicked', async () => {
    const onRejectAll = vi.fn()
    render(
      <CullingReviewPanel
        media={[blurryPhoto]}
        {...defaultProps}
        onRejectAll={onRejectAll}
      />,
    )
    await userEvent.click(screen.getByText('Reject All'))
    expect(onRejectAll).toHaveBeenCalledWith(['blur-1'])
  })

  it('calls onRejectAll with all flagged IDs when Accept AI Recommendations is clicked', async () => {
    const onRejectAll = vi.fn()
    render(
      <CullingReviewPanel
        media={[blurryPhoto, duplicatePhoto, cleanPhoto]}
        {...defaultProps}
        onRejectAll={onRejectAll}
      />,
    )
    await userEvent.click(screen.getByText('Accept AI Recommendations'))
    expect(onRejectAll).toHaveBeenCalledWith(expect.arrayContaining(['blur-1', 'dup-1']))
    expect(onRejectAll.mock.calls[0][0]).toHaveLength(2)
  })

  it('shows review_flag badges on photos with keep/reject status', () => {
    const keptPhoto = makeMedia({ id: 'kept-1', filename: 'kept.jpg', is_blurry: true, review_flag: 'keep' })
    const rejectedPhoto = makeMedia({ id: 'rej-1', filename: 'rej.jpg', is_blurry: true, review_flag: 'reject' })
    render(
      <CullingReviewPanel
        media={[keptPhoto, rejectedPhoto]}
        {...defaultProps}
      />,
    )
    // Both Keep All and individual Keep buttons + badge text should be present
    const keepElements = screen.getAllByText('Keep')
    expect(keepElements.length).toBeGreaterThanOrEqual(1)
    const rejectElements = screen.getAllByText('Reject')
    expect(rejectElements.length).toBeGreaterThanOrEqual(1)
  })
})
