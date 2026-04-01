'use client'

const FRAMES = [
  '/images/river/frame_01.jpg',
  '/images/river/frame_02.jpg',
  '/images/river/frame_03.jpg',
  '/images/river/frame_04.jpg',
  '/images/river/frame_05.jpg',
  '/images/river/frame_06.jpg',
]

export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Scrolling image strip — duplicated for seamless loop */}
      <div
        className="flex h-full animate-scroll-bg"
        style={{ width: `${FRAMES.length * 2 * 100}vw` }}
      >
        {[...FRAMES, ...FRAMES].map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="h-full flex-shrink-0 object-cover"
            style={{ width: '100vw' }}
          />
        ))}
      </div>
      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-[#0a1628]/70" />
      {/* Subtle blur for glass effect */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  )
}
