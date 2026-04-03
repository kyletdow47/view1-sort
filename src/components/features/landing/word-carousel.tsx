'use client'

interface WordCarouselProps {
  words: string[]
  /** Duration per word in seconds */
  interval?: number
  className?: string
}

export function WordCarousel({ words, interval = 2, className = '' }: WordCarouselProps) {
  const totalDuration = words.length * interval
  // Each word gets equal time: visible portion + transition
  const pct = 100 / words.length

  return (
    <span className={`inline-block h-[1.15em] overflow-hidden align-bottom ${className}`}>
      <span
        className="flex flex-col"
        style={{
          animation: `slideWords ${totalDuration}s ease-in-out infinite`,
        }}
      >
        {/* Duplicate first word at end for seamless loop */}
        {[...words, words[0]].map((word, i) => (
          <span key={`${word}-${i}`} className="h-[1.15em] leading-[1.15]">
            {word}
          </span>
        ))}
      </span>
      <style>{`
        @keyframes slideWords {
          ${words.map((_, i) => {
            const holdStart = (i / (words.length + 1)) * 100
            const holdEnd = holdStart + (0.7 / (words.length + 1)) * 100
            const moveEnd = ((i + 1) / (words.length + 1)) * 100
            return `${holdStart.toFixed(1)}%, ${holdEnd.toFixed(1)}% { transform: translateY(-${i * (100 / (words.length + 1))}%); }
            ${moveEnd.toFixed(1)}% { transform: translateY(-${(i + 1) * (100 / (words.length + 1))}%); }`
          }).join('\n          ')}
        }
      `}</style>
    </span>
  )
}
