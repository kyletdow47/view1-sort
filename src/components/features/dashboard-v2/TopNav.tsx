'use client'

import {
  Aperture,
  Bell,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', active: true },
  { label: 'AI Sort', active: false },
  { label: 'Gallery', active: false },
  { label: 'Projects', active: false },
  { label: 'Clients', active: false },
  { label: 'Analytics', active: false },
]

export function TopNav() {
  return (
    <nav className="flex h-14 w-full items-center justify-between border-b border-white/[0.09] bg-white/[0.04] px-10">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-b from-indigo-400 to-indigo-600">
          <Aperture className="h-[18px] w-[18px] text-white" />
        </div>
        <span className="font-headline text-[15px] font-bold text-white">
          View1 Sort
        </span>
      </div>

      {/* Center: Nav links */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.07] p-1 backdrop-blur-[16px]">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`rounded-lg px-4 py-2 font-headline text-[13px] transition-colors ${
              item.active
                ? 'bg-white/[0.13] font-semibold text-white'
                : 'font-normal text-white/[0.67] hover:text-white/90'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right: Icons + Avatar */}
      <div className="flex items-center gap-3">
        <button className="text-white/[0.67] transition-colors hover:text-white">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button className="text-white/[0.67] transition-colors hover:text-white">
          <Settings className="h-[18px] w-[18px]" />
        </button>
        <div className="h-8 w-8 rounded-full bg-indigo-600 ring-2 ring-white/25" />
      </div>
    </nav>
  )
}
