'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface WikiTabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function WikiTabs({ tabs, defaultTab }: WikiTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)
  const current = tabs.find((t) => t.id === active)

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 rounded-xl bg-white/[0.04] border border-white/[0.06] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={[
              'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
              active === tab.id
                ? 'bg-violet-500/20 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]'
                : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content — rendered server-side, client only switches which is visible */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 min-h-[400px]">
        {current?.content}
      </div>
    </div>
  )
}
