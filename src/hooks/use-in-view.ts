'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * IntersectionObserver hook that fires once when the element enters the viewport.
 * Returns a ref callback to attach to the target element and a boolean for visibility.
 */
export function useInView(
  options?: IntersectionObserverInit & { triggerOnce?: boolean }
): [React.RefCallback<HTMLElement>, boolean] {
  const { triggerOnce = true, ...observerOptions } = options ?? {}
  const [inView, setInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node) return

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            if (triggerOnce && observerRef.current) {
              observerRef.current.unobserve(entry.target)
            }
          } else if (!triggerOnce) {
            setInView(false)
          }
        },
        { threshold: 0.2, ...observerOptions }
      )

      observerRef.current.observe(node)
    },
    [triggerOnce, observerOptions.threshold, observerOptions.rootMargin]
  )

  return [ref, inView]
}
