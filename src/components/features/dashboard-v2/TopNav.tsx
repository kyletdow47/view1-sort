'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  Aperture,
  Bell,
  Settings,
} from 'lucide-react'
import { TodoTrigger, TodoDropdown } from './TodoPanel'

const navItems = [
  { label: 'Dashboard', href: '/dashboard/v2' },
  { label: 'AI Sort', href: '/dashboard/ai-sort' },
  { label: 'Gallery', href: '/dashboard/gallery' },
  { label: 'Projects', href: '/dashboard/projects' },
  { label: 'Clients', href: '/dashboard/clients' },
  { label: 'Booking', href: '/dashboard/booking' },
  { label: 'Contracts', href: '/dashboard/contracts' },
  { label: 'Finances', href: '/dashboard/finances' },
  { label: 'Analytics', href: '/dashboard/analytics' },
  { label: 'Content Hub', href: '/dashboard/content' },
  { label: 'Settings', href: '/dashboard/settings' },
]

interface TopNavProps {
  activeNav?: string
}

export function TopNav({ activeNav }: TopNavProps) {
  const pathname = usePathname()
  const [todoOpen, setTodoOpen] = useState(false)
  const todoButtonRef = useRef<HTMLButtonElement>(null)

  function isActive(item: { label: string; href: string }) {
    if (activeNav) return item.label === activeNav
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <nav className="relative flex h-14 w-full items-center justify-between border-b border-white/[0.09] bg-white/[0.04] px-6 md:px-10 lg:px-[85px]">
      {/* Left: Brand */}
      <Link href="/dashboard/v2" className="flex items-center gap-2">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-b from-indigo-400 to-indigo-600">
          <Aperture className="h-[18px] w-[18px] text-white" />
        </div>
        <span className="font-headline text-[15px] font-bold text-white">
          View1 Sort
        </span>
      </Link>

      {/* Center: Nav links */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.07] p-1 backdrop-blur-[16px]">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-lg px-4 py-2 font-headline text-[13px] transition-colors ${
                active
                  ? 'bg-white/[0.13] font-semibold text-white'
                  : 'font-normal text-white/[0.67] hover:text-white/90'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Right: Icons + Avatar */}
      <div className="relative flex items-center gap-3">
        <button className="text-white/[0.67] transition-colors hover:text-white">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <TodoTrigger
          open={todoOpen}
          onToggle={() => setTodoOpen((v) => !v)}
          buttonRef={todoButtonRef}
        />
        <Link href="/dashboard/settings" className="text-white/[0.67] transition-colors hover:text-white">
          <Settings className="h-[18px] w-[18px]" />
        </Link>
        <div className="h-8 w-8 rounded-full bg-indigo-600 ring-2 ring-white/25" />

        {/* Todo dropdown — anchored to the right icons container */}
        <TodoDropdown
          open={todoOpen}
          onClose={() => setTodoOpen(false)}
          anchorRef={todoButtonRef}
        />
      </div>
    </nav>
  )
}
