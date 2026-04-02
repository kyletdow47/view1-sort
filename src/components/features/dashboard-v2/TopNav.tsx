'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { Aperture, Bell, Settings } from 'lucide-react'
import { TodoTrigger, TodoDropdown } from './TodoPanel'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'AI Sort', href: '/dashboard/ai-sort' },
  { label: 'Gallery', href: '/dashboard/gallery' },
  { label: 'Projects', href: '/dashboard/projects' },
  { label: 'Clients', href: '/dashboard/clients' },
  { label: 'Bookings', href: '/dashboard/bookings' },
  { label: 'Analytics', href: '/dashboard/analytics' },
  { label: 'Content', href: '/dashboard/content-hub' },
]

interface TopNavProps {
  userInitials?: string
  unreadCount?: number
  onBellClick?: () => void
}

export function TopNav({ userInitials = 'KD', unreadCount = 0, onBellClick }: TopNavProps) {
  const pathname = usePathname()
  const [todoOpen, setTodoOpen] = useState(false)
  const todoButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <nav className="relative z-20 flex h-14 w-full shrink-0 items-center justify-between border-b border-white/[0.09] bg-white/[0.04] px-10 backdrop-blur-sm">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-b from-indigo-400 to-indigo-600">
          <Aperture className="h-[18px] w-[18px] text-white" />
        </div>
        <span className="font-headline text-[15px] font-bold text-white">View1 Sort</span>
      </div>

      {/* Center: Nav links */}
      <div className="flex items-center gap-1 rounded-xl bg-white/[0.07] p-1 backdrop-blur-[16px]">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-lg px-4 py-2 font-headline text-[13px] transition-colors ${
                isActive
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
        <button
          onClick={onBellClick}
          className="relative text-white/[0.67] transition-colors hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-0.5 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <TodoTrigger
          open={todoOpen}
          onToggle={() => setTodoOpen((v) => !v)}
          buttonRef={todoButtonRef}
        />
        <Link href="/dashboard/settings" className="text-white/[0.67] transition-colors hover:text-white">
          <Settings className="h-[18px] w-[18px]" />
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white ring-2 ring-white/25">
          {userInitials}
        </div>

        {/* Todo dropdown */}
        <TodoDropdown
          open={todoOpen}
          onClose={() => setTodoOpen(false)}
          anchorRef={todoButtonRef}
        />
      </div>
    </nav>
  )
}
