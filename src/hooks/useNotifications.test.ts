import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotifications } from './useNotifications'
import type { Notification } from '@/types/supabase'

type MockSupabase = {
  auth: { getUser: ReturnType<typeof vi.fn> }
  from: ReturnType<typeof vi.fn>
}

const USER_ID = 'user-1'

function makeNotifs(): Notification[] {
  return [
    { id: 'n1', user_id: USER_ID, type: 'booking_new', title: 'A', body: '',  read: false, metadata: null, created_at: '2026-04-16T00:00:04Z' },
    { id: 'n2', user_id: USER_ID, type: 'payment',    title: 'B', body: '',  read: false, metadata: null, created_at: '2026-04-16T00:00:03Z' },
    { id: 'n3', user_id: USER_ID, type: 'ai_sort',    title: 'C', body: '',  read: false, metadata: null, created_at: '2026-04-16T00:00:02Z' },
    { id: 'n4', user_id: USER_ID, type: 'gallery',    title: 'D', body: '',  read: false, metadata: null, created_at: '2026-04-16T00:00:01Z' },
  ]
}

function buildMockSupabase(rows: Notification[]): MockSupabase {
  const selectBuilder = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
  }
  const updateBuilder = {
    in: vi.fn().mockResolvedValue({ data: null, error: null }),
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: USER_ID } }, error: null }),
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnValue(selectBuilder),
      update: vi.fn().mockReturnValue(updateBuilder),
    })),
  }
}

let mockClient: MockSupabase

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockClient,
}))

describe('useNotifications', () => {
  beforeEach(() => {
    mockClient = buildMockSupabase(makeNotifs())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads notifications and derives unreadCount from the same array', async () => {
    const { result } = renderHook(() => useNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.notifications).toHaveLength(4)
    // Invariant: bell count must equal what the panel would filter.
    expect(result.current.unreadCount).toBe(
      result.current.notifications.filter((n) => !n.read).length,
    )
    expect(result.current.unreadCount).toBe(4)
  })

  it('does not re-run the fetch effect on re-render (prevents bell/panel race)', async () => {
    const { result, rerender } = renderHook(() => useNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const callsAfterMount = mockClient.auth.getUser.mock.calls.length
    rerender()
    rerender()
    rerender()

    // Effect must only fire once. If `supabase` weren't memoized, getUser would
    // be called on every render and could race with an open panel — this is
    // the exact bug being prevented.
    expect(mockClient.auth.getUser.mock.calls.length).toBe(callsAfterMount)
  })

  it('keeps notifications and unreadCount in lockstep when marking a single read', async () => {
    const { result } = renderHook(() => useNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.unreadCount).toBe(4)

    await act(async () => {
      await result.current.markRead('n1')
    })

    expect(result.current.unreadCount).toBe(3)
    expect(result.current.unreadCount).toBe(
      result.current.notifications.filter((n) => !n.read).length,
    )
    // Total item count is preserved — panel must still render 4 items.
    expect(result.current.notifications).toHaveLength(4)
  })

  it('markAllRead zeroes unreadCount without emptying notifications', async () => {
    const { result } = renderHook(() => useNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markAllRead()
    })

    expect(result.current.unreadCount).toBe(0)
    // Regression: panel should still have items to show — only "read" flipped.
    expect(result.current.notifications).toHaveLength(4)
  })

  it('returns empty arrays when there is no authenticated user', async () => {
    mockClient.auth.getUser = vi
      .fn()
      .mockResolvedValue({ data: { user: null }, error: null })

    const { result } = renderHook(() => useNotifications())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.notifications).toEqual([])
    expect(result.current.unreadCount).toBe(0)
  })
})
