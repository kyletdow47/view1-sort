'use client'

import { ArrowRight } from 'lucide-react'

interface WelcomeSectionProps {
  userName?: string
}

export function WelcomeSection({ userName = 'Kyle' }: WelcomeSectionProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4 py-2">
      <h1 className="text-center font-headline text-[37px] font-bold text-white">
        Welcome {userName},
      </h1>

      {/* AI Chat Input */}
      <div className="flex w-[480px] items-center gap-3 rounded-3xl border border-white/[0.19] bg-white/[0.09] py-0 pl-5 pr-1.5 backdrop-blur-[20px] shadow-[0_4px_16px_rgba(255,255,255,0.06)]">
        <span className="flex-1 py-5 font-headline text-sm text-white/50">
          Ask View1...&quot;Which clients haven&apos;t completed payment&quot; &#x2318;K
        </span>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-amber-600 transition-transform hover:scale-105">
          <ArrowRight className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  )
}
