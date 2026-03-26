'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  CreditCard,
  Banknote,
  Palette,
  FileText,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bell,
  FolderOpen,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  phase2?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Projects',
    items: [
      { label: 'All Projects', href: '/dashboard/project', icon: FolderOpen },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Account', href: '/dashboard/settings', icon: User },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Stripe Connect', href: '/dashboard/settings/connect', icon: Banknote },
      { label: 'Gallery Themes', href: '/dashboard/settings/themes', icon: Palette },
      { label: 'Booking Forms', href: '/dashboard/settings/booking-forms', icon: FileText, phase2: true },
    ],
  },
  {
    title: '',
    items: [
      { label: 'Clients', href: '/dashboard/clients', icon: Users, phase2: true },
      { label: 'Bookings', href: '/dashboard/bookings', icon: Calendar, phase2: true },
    ],
  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  return pathname.startsWith(href)
}

function getPageTitle(pathname: string): string {
  for (const section of navSections) {
    for (const item of section.items) {
      if (isActive(pathname, item.href)) {
        return item.label
      }
    }
  }
  if (pathname.startsWith('/dashboard/project/')) {
    return 'Project'
  }
  return 'Dashboard'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const sidebarWidth = collapsed ? 'w-16' : 'w-60'

  return (
    <div className="flex min-h-screen bg-background text-white font-sans">
      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} fixed inset-y-0 left-0 z-30 flex flex-col border-r border-view1-border bg-surface transition-all duration-200 ease-in-out`}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex h-14 items-center gap-2 border-b border-view1-border px-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-background font-bold text-sm">
            V1
          </span>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden">
              View1 Sort
            </span>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && !collapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {section.title}
                </p>
              )}
              {section.title && collapsed && (
                <div className="mx-auto mb-1 h-px w-8 bg-view1-border" />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                          active
                            ? 'bg-accent/10 text-accent'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon
                          size={18}
                          className={`shrink-0 ${active ? 'text-accent' : 'text-gray-500 group-hover:text-white'}`}
                        />
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!collapsed && item.phase2 && (
                          <span className="ml-auto rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
                            Phase 2
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-12 items-center justify-center border-t border-view1-border text-gray-500 transition-colors hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main wrapper */}
      <div
        className={`flex flex-1 flex-col transition-all duration-200 ease-in-out ${
          collapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-view1-border bg-background/80 px-6 backdrop-blur-sm">
          {/* Left: page title */}
          <h1 className="text-sm font-semibold tracking-tight">
            {getPageTitle(pathname)}
          </h1>

          {/* Right: actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </button>

            {/* User avatar */}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-view1-border text-xs font-semibold text-gray-400 transition-colors hover:text-white"
              aria-label="User menu"
            >
              U
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
