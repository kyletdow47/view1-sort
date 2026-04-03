'use client'

import { useEffect, useRef } from 'react'

interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  /** Max pixel translation on mouse move */
  range?: number
  /** Max rotation in degrees */
  tilt?: number
  /** Initial Y-axis rotation bias in degrees (positive = face right) */
  rotationBias?: number
}

/**
 * 3D floating card that follows the mouse cursor with smooth parallax.
 * Adapted from the FloatingWindow pattern — perspective + translate + rotate.
 */
export function FloatingCard({
  children,
  className = '',
  range = 15,
  tilt = 8,
  rotationBias = 0,
}: FloatingCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const rotateX = useRef(0)
  const rotateY = useRef(0)
  const rafId = useRef(0)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mouseX.current = (e.clientX - cx) / cx
      mouseY.current = (e.clientY - cy) / cy
    }

    function animate() {
      if (ref.current) {
        currentX.current += (mouseX.current * range - currentX.current) * 0.05
        currentY.current += (mouseY.current * range - currentY.current) * 0.05
        rotateX.current += (-mouseY.current * tilt - rotateX.current) * 0.05
        rotateY.current += (mouseX.current * tilt + rotationBias - rotateY.current) * 0.05

        ref.current.style.transform = `
          perspective(1200px)
          translateX(${currentX.current}px)
          translateY(${currentY.current}px)
          rotateX(${rotateX.current}deg)
          rotateY(${rotateY.current}deg)
        `
      }
      rafId.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [range, tilt])

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
