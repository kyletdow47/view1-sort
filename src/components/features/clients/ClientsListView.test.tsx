import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ClientsListView } from './ClientsListView'
import type { ClientRecord } from '@/types/clients'

vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <a {...(props as object)}>{children}</a>
  ),
}))

const SAMPLE_CLIENTS: ClientRecord[] = Array.from({ length: 12 }, (_, i) => ({
  id: `client-${i}`,
  email: `client${i}@example.com`,
  displayName: `Client ${i}`,
  shootType: 'Wedding',
  price: '$1,000',
  stage: 'inquiry',
  projectCount: 1,
  lastActive: '2026-04-01T00:00:00Z',
  totalRevenueCents: 100000,
}))

describe('ClientsListView', () => {
  it('renders all provided client rows', () => {
    const { container } = render(<ClientsListView clients={SAMPLE_CLIENTS} searchQuery="" />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(SAMPLE_CLIENTS.length)
  })

  it('root container has min-h-0 + flex-1 + overflow-y-auto so the table scrolls within the dashboard shell', () => {
    const { container } = render(<ClientsListView clients={SAMPLE_CLIENTS} searchQuery="" />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('flex-1')
    expect(root).toHaveClass('min-h-0')
    expect(root).toHaveClass('overflow-y-auto')
  })

  it('renders empty state when no clients match search', () => {
    const { getByText } = render(
      <ClientsListView clients={SAMPLE_CLIENTS} searchQuery="nomatch-xyz" />,
    )
    expect(getByText(/No clients matching/i)).toBeInTheDocument()
  })

  it('shows row count footer', () => {
    const { getByText } = render(<ClientsListView clients={SAMPLE_CLIENTS} searchQuery="" />)
    expect(getByText('12 clients')).toBeInTheDocument()
  })
})
