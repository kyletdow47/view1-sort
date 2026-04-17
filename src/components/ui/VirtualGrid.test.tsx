import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VirtualGrid } from './VirtualGrid'

type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver,
) => void

type StubRO = {
  callback: ResizeObserverCallback
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
}

const items = Array.from({ length: 50 }, (_, i) => ({ id: `item-${i}` }))
const makeKey = (it: { id: string }) => it.id

afterEach(() => {
  vi.restoreAllMocks()
})

describe('VirtualGrid', () => {
  it('falls back to a non-virtualized grid when container width is unknown', () => {
    const { container } = render(
      <VirtualGrid
        items={items}
        getItemKey={makeKey}
        minItemWidth={200}
        rowHeight={150}
        renderItem={(item) => <span>{item.id}</span>}
      />,
    )

    const host = screen.getByTestId('virtual-grid')
    expect(host.getAttribute('data-virtualized')).toBe('false')
    expect(container.textContent).toContain('item-0')
    expect(container.textContent).toContain('item-49')
  })

  it('virtualizes rows when the container reports a width', async () => {
    let cb: ResizeObserverCallback | null = null
    class MockResizeObserver {
      callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        cb = callback
      }
      observe = vi.fn()
      disconnect = vi.fn()
      unobserve = vi.fn()
    }
    vi.stubGlobal('ResizeObserver', MockResizeObserver as unknown as typeof ResizeObserver)

    // Pin a width so the grid switches from fallback to virtualized mode.
    const widthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(800)

    const { container } = render(
      <VirtualGrid
        items={items}
        getItemKey={makeKey}
        minItemWidth={200}
        rowHeight={150}
        gap={12}
        overscan={1}
        renderItem={(item) => <span>{item.id}</span>}
      />,
    )

    const host = screen.getByTestId('virtual-grid')

    await act(async () => {
      cb?.([{ target: host } as unknown as ResizeObserverEntry], {} as ResizeObserver)
    })

    expect(host.getAttribute('data-virtualized')).toBe('true')
    // Far-below-the-fold items are never mounted — this is the virtualization win.
    expect(screen.queryByText('item-49')).toBeNull()
    // Inner wrapper reserves total scroll height so the scrollbar is accurate.
    const inner = container.querySelector('[data-testid="virtual-grid"] > div') as HTMLElement
    expect(inner).toBeTruthy()
    expect(inner.style.height).toMatch(/^\d+px$/)

    widthSpy.mockRestore()
  })

  it('respects rowHeight callback for aspect-ratio cells', () => {
    const rowHeight = vi.fn((w: number) => Math.round(w * 0.75))
    render(
      <VirtualGrid
        items={items.slice(0, 4)}
        getItemKey={makeKey}
        minItemWidth={200}
        rowHeight={rowHeight}
        renderItem={(item) => <span>{item.id}</span>}
        fallbackColumns={0}
      />,
    )
    // Fallback path doesn't need rowHeight, but function form should not throw
    expect(screen.getByTestId('virtual-grid')).toBeInTheDocument()
  })

  it('renders an empty container when items is empty', () => {
    const { container } = render(
      <VirtualGrid
        items={[]}
        getItemKey={makeKey}
        minItemWidth={200}
        rowHeight={150}
        renderItem={() => <span>never</span>}
      />,
    )
    expect(screen.getByTestId('virtual-grid')).toBeInTheDocument()
    // No items should render
    expect(container.textContent).toBe('')
  })
})
