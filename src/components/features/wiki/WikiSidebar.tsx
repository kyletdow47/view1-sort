'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Cpu,
  Megaphone,
  BarChart3,
  Bot,
  BookOpen,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/wiki', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/wiki/product', label: 'Product & Tech', icon: Cpu },
  { href: '/wiki/marketing', label: 'Marketing & GTM', icon: Megaphone },
  { href: '/wiki/kpis', label: 'KPIs & Milestones', icon: BarChart3 },
  { href: '/wiki/operations', label: 'Operations & Agents', icon: Bot },
  { href: '/wiki/sops', label: 'SOPs & Guides', icon: BookOpen },
]

export function WikiSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
          <span className="text-xs font-bold text-white">V1</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">View1 Bible</p>
          <p className="text-[10px] text-white/40 tracking-wide uppercase">Studio HQ</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-violet-500/20 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]'
                  : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80',
              ].join(' ')}
            >
              <Icon
                className={['h-4 w-4 flex-shrink-0', isActive ? 'text-violet-400' : 'text-white/30'].join(' ')}
                strokeWidth={1.75}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-all hover:bg-white/[0.06] hover:text-white/70"
          >
            <LogOut className="h-4 w-4 text-white/25" strokeWidth={1.75} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
