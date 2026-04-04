'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { Aperture, Bell, Search, Settings } from 'lucide-react'
import { TodoTrigger, TodoDropdown } from './TodoPanel'
import { useCommandBar } from '@/hooks/useCommandBar'

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
  const [completedCount, setCompletedCount] = useState(2)
  const todoButtonRef = useRef<HTMLButtonElement>(null)
  const { openCommandBar } = useCommandBar()

  return (
    <nav className="relative z-20 flex h-14 w-full shrink-0 items-center justify-between border-b border-white/[0.09] bg-white/[0.04] px-6 backdrop-blur-sm md:px-10">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
        >
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
        {/* Search / Command Bar trigger */}
        <button
          onClick={openCommandBar}
          className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/40 transition-colors hover:border-white/20 hover:text-white/70 sm:flex"
          aria-label="Open command bar"
        >
          <Search size={13} />
          <span className="text-xs">Search</span>
          <kbd className="rounded border border-white/10 bg-white/5 px-1 py-px text-[9px]">⌘K</kbd>
        </button>
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
          completedCount={completedCount}
        />
        <Link href="/dashboard/settings" className="text-white/[0.67] transition-colors hover:text-white">
          <Settings className="h-[18px] w-[18px]" />
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-white/20" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 60%, #a855f7 100%)' }}>
          {userInitials}
        </div>

        {/* Todo dropdown */}
        <TodoDropdown
          open={todoOpen}
          onClose={() => setTodoOpen(false)}
          anchorRef={todoButtonRef}
          onCountChange={setCompletedCount}
        />
      </div>
    </nav>
  )
}
