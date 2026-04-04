'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Palette,
  Users,
  Plug,
  Zap,
  CreditCard,
  Bell,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Profile', href: '/dashboard/settings/profile', icon: User },
  { label: 'Branding', href: '/dashboard/settings/branding', icon: Palette },
  { label: 'Team', href: '/dashboard/settings/team', icon: Users },
  { label: 'Integrations', href: '/dashboard/settings/integrations', icon: Plug },
  { label: 'AI Preferences', href: '/dashboard/settings/ai-profile', icon: Zap },
  { label: 'Billing', href: '/dashboard/settings/billing', icon: CreditCard },
  { label: 'Notifications', href: '/dashboard/settings/notifications', icon: Bell },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar — 240px fixed */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-zinc-800 bg-zinc-900/50">
        <div className="px-4 py-4 border-b border-zinc-800/60">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Settings
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-l-2 border-[var(--color-primary,#5749F4)] bg-zinc-800 pl-[10px] text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300',
                ].join(' ')}
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile — horizontal scrollable tab bar */}
      <div className="md:hidden border-b border-zinc-800 bg-zinc-900/50">
        <nav className="flex overflow-x-auto gap-0.5 px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'border-b-2 border-[var(--color-primary,#5749F4)] bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-300',
                ].join(' ')}
              >
                <Icon size={13} className="shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
