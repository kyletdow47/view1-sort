'use client'

import { useRef, useEffect } from 'react'

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollFraction = Math.min(scrollY / maxScroll, 1)
      if (video.duration) {
        video.currentTime = scrollFraction * video.duration
      }
    }

    const onLoaded = () => {
      video.pause()
      onScroll()
    }

    video.addEventListener('loadedmetadata', onLoaded)
    window.addEventListener('scroll', onScroll, { passive: true })

    if (video.readyState >= 1) {
      video.pause()
      onScroll()
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      >
        <source src="/videos/river-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#0a1628]/75" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </div>
  )
}
