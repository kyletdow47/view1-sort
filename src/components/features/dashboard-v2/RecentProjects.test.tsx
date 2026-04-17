import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentProjects } from './RecentProjects'
import type { Project } from '@/types/supabase'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function makeProject(partial: Partial<Project> & { id: string; name: string }): Project {
  return {
    workspace_id: 'ws-1',
    preset: null,
    status: 'active',
    cover_image_url: null,
    gallery_public: false,
    gallery_theme: 'dark',
    pricing_model: 'free',
    flat_fee_cents: null,
    per_photo_cents: null,
    currency: 'usd',
    created_at: '2026-04-01',
    updated_at: '2026-04-01',
    metadata: null,
    ...partial,
  } as Project
}

describe('RecentProjects', () => {
  it('shows the empty state when no projects are passed', () => {
    render(<RecentProjects projects={[]} />)
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create your first project/i })).toBeInTheDocument()
  })

  it('does not fall back to hardcoded mock projects when empty', () => {
    render(<RecentProjects projects={[]} />)
    // The old fallback rendered these mock names — they must never appear
    // unless a real project with those names is passed.
    expect(screen.queryByText('Wedding Shoot')).not.toBeInTheDocument()
    expect(screen.queryByText('Real Estate Tour')).not.toBeInTheDocument()
    expect(screen.queryByText('Travel Portfolio')).not.toBeInTheDocument()
  })

  it('renders real project rows with photo counts', () => {
    const projects = [
      makeProject({ id: 'p1', name: 'Smith Wedding', preset: 'wedding' }),
      makeProject({ id: 'p2', name: 'Acme Headshots', preset: 'commercial' }),
    ]
    const photoCounts = { p1: 247, p2: 32 }

    render(<RecentProjects projects={projects} photoCounts={photoCounts} />)

    expect(screen.getByText('Smith Wedding')).toBeInTheDocument()
    expect(screen.getByText('Acme Headshots')).toBeInTheDocument()
    expect(screen.getByText('247')).toBeInTheDocument()
    expect(screen.getByText('32')).toBeInTheDocument()
  })

  it('limits the list to the first 3 projects', () => {
    const projects = [
      makeProject({ id: 'p1', name: 'One' }),
      makeProject({ id: 'p2', name: 'Two' }),
      makeProject({ id: 'p3', name: 'Three' }),
      makeProject({ id: 'p4', name: 'Four' }),
    ]

    render(<RecentProjects projects={projects} />)

    expect(screen.getByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
    expect(screen.getByText('Three')).toBeInTheDocument()
    expect(screen.queryByText('Four')).not.toBeInTheDocument()
  })

  it('defaults photo count to 0 when the map has no entry for a project', () => {
    const projects = [makeProject({ id: 'p1', name: 'Solo' })]
    render(<RecentProjects projects={projects} photoCounts={{}} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
