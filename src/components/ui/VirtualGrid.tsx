'use client'

import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { clsx } from 'clsx'

type RowHeight = number | ((columnWidth: number) => number)

export interface VirtualGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  getItemKey: (item: T, index: number) => string
  /** Minimum cell width in pixels — drives the responsive column count. */
  minItemWidth: number
  /**
   * Row height in pixels, or a function that receives the computed column
   * width and returns the desired row height. Use the function form when the
   * cells have a fixed aspect ratio so rows scale with the viewport.
   */
  rowHeight: RowHeight
  /** Gap between cells in pixels. */
  gap?: number
  /** Rows rendered above/below the viewport for smoother scrolling. */
  overscan?: number
  /** Class applied to the scroll container. */
  className?: string
  /**
   * Column count to use before the container reports a width (e.g. SSR or
   * jsdom). When 0, the grid falls back to rendering every item in a simple
   * CSS grid without virtualization — handy for snapshot tests.
   */
  fallbackColumns?: number
}

export function VirtualGrid<T>({
  items,
  renderItem,
  getItemKey,
  minItemWidth,
  rowHeight,
  gap = 12,
  overscan = 3,
  className,
  fallbackColumns = 0,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    const update = () => setContainerWidth(el.clientWidth)
    update()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const columns = containerWidth > 0
    ? Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)))
    : fallbackColumns

  const columnWidth = columns > 0 && containerWidth > 0
    ? Math.floor((containerWidth - gap * (columns - 1)) / columns)
    : minItemWidth

  const resolvedRowHeight = typeof rowHeight === 'function'
    ? Math.max(1, rowHeight(columnWidth))
    : rowHeight

  const rowCount = columns > 0 ? Math.ceil(items.length / columns) : 0

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => resolvedRowHeight + gap,
    overscan,
  })

  if (columns === 0) {
    return (
      <div
        ref={parentRef}
        className={clsx('overflow-y-auto', className)}
        data-testid="virtual-grid"
        data-virtualized="false"
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
            gap: `${gap}px`,
          }}
        >
          {items.map((item, idx) => (
            <div key={getItemKey(item, idx)}>{renderItem(item, idx)}</div>
          ))}
        </div>
      </div>
    )
  }

  const totalSize = virtualizer.getTotalSize()
  const virtualRows = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className={clsx('overflow-y-auto', className)}
      data-testid="virtual-grid"
      data-virtualized="true"
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const rowStart = virtualRow.index * columns
          const rowItems = items.slice(rowStart, rowStart + columns)
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${resolvedRowHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: `${gap}px`,
              }}
            >
              {rowItems.map((item, i) => (
                <div key={getItemKey(item, rowStart + i)}>
                  {renderItem(item, rowStart + i)}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
