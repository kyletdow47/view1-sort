import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContentHubPage from './page'

describe('ContentHubPage — Create Post CTA footer', () => {
  it('renders Schedule and Post buttons inside the sticky CTA footer', () => {
    render(<ContentHubPage />)

    const footer = screen.getByTestId('create-post-cta')
    expect(footer).toBeInTheDocument()

    // Both CTAs must live inside the sticky footer so they stay visible
    // even when the Create Post panel overflows its column.
    expect(footer).toHaveTextContent(/Schedule/)
    expect(footer).toHaveTextContent(/Post/)
  })

  it('pins the CTA footer as a shrink-0 flex child so it does not scroll away', () => {
    render(<ContentHubPage />)

    const footer = screen.getByTestId('create-post-cta')
    // `shrink-0` keeps the footer at its natural height even when the scroll
    // region above grows. If this class is removed, the footer can collapse
    // or drift out of view on short viewports — that was the original bug.
    expect(footer.className).toMatch(/\bshrink-0\b/)
  })
})
