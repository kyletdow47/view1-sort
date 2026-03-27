'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  Users,
  BarChart3,
  Wallet,
  Settings,
  Camera,
  Plus,
  Search,
  Bell,
  Upload,
  PenLine,
  CalendarDays,
  FileText,
  Layers,
  ChevronDown,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { label: 'AI Sort', href: '/dashboard/ai-sort', icon: Sparkles },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Finances', href: '/dashboard/billing', icon: Wallet },
]

const schedulingItems: NavItem[] = [
  { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
  { label: 'Booking Forms', href: '/dashboard/settings/booking-forms', icon: FileText },
  { label: 'Bulk Management', href: '/dashboard/bulk', icon: Layers },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  // Projects nav item matches both /dashboard/projects and /dashboard/project/*
  if (href === '/dashboard/projects') {
    return pathname === '/dashboard/projects' || pathname.startsWith('/dashboard/project/')
  }
  return pathname.startsWith(href)
}

function isInsideProject(pathname: string): boolean {
  return /^\/dashboard\/project\/[^/]+/.test(pathname)
}

function isSortingView(pathname: string): boolean {
  return /^\/dashboard\/project\/[^/]+\/sort/.test(pathname)
}

function getProjectName(pathname: string): string {
  const match = pathname.match(/^\/dashboard\/project\/([^/]+)/)
  if (match) {
    return decodeURIComponent(match[1])
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return 'Project'
}

function getProjectBasePath(pathname: string): string {
  const match = pathname.match(/^\/dashboard\/project\/[^/]+/)
  return match ? match[0] : '/dashboard/project'
}

function getCurrentProjectTab(pathname: string): string {
  if (pathname.match(/\/sort/)) return 'Sorting'
  if (pathname.match(/\/selection/)) return 'Selection'
  if (pathname.match(/\/delivery/)) return 'Delivery'
  return 'Overview'
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const inProject = isInsideProject(pathname)
  const inSorting = isSortingView(pathname)
  const isSchedulingActive = schedulingItems.some((item) => isActive(pathname, item.href))
  const [schedulingOpen, setSchedulingOpen] = useState(isSchedulingActive)

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* ============================================================ */}
      {/*  SIDEBAR — fixed 256px (w-64)                                */}
      {/* ============================================================ */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#1c1a19] shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)]"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Camera size={18} className="text-[#4e2600]" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-black text-2xl tracking-tighter leading-tight text-[#ffb780]">
              View1 Sort
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
              Editorial Studio
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`mx-2 flex items-center gap-3 px-4 py-3 font-body font-medium transition-colors duration-150 ${
                      active
                        ? 'rounded-lg bg-[#252322] text-[#ffb780]'
                        : 'text-[#e7e1df]/50 hover:bg-[#252322]/50 hover:text-[#e7e1df]'
                    }`}
                  >
                    <Icon
                      size={20}
                      className="shrink-0"
                      fill={active ? 'currentColor' : 'none'}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Collapsible Scheduling Tools */}
          <div className="mt-4 mx-2">
            <button
              onClick={() => setSchedulingOpen(!schedulingOpen)}
              className="flex w-full items-center justify-between px-4 py-2"
            >
              <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]">
                Scheduling Tools
              </span>
              <ChevronDown
                size={14}
                className={`text-[#a18d80] transition-transform duration-200 ${
                  schedulingOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                schedulingOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <ul className="space-y-1">
                {schedulingItems.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 font-body font-medium transition-colors duration-150 ${
                          active
                            ? 'rounded-lg bg-[#252322] text-[#ffb780]'
                            : 'text-[#e7e1df]/50 hover:bg-[#252322]/50 hover:text-[#e7e1df]'
                        }`}
                      >
                        <Icon
                          size={20}
                          className="shrink-0"
                          fill={active ? 'currentColor' : 'none'}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Bottom section: Settings + New Shoot */}
        <div className="px-2 pb-5 space-y-2">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-3 font-body font-medium transition-colors duration-150 ${
              isActive(pathname, '/dashboard/settings')
                ? 'rounded-lg bg-[#252322] text-[#ffb780]'
                : 'text-[#e7e1df]/50 hover:bg-[#252322]/50 hover:text-[#e7e1df]'
            }`}
          >
            <Settings size={20} className="shrink-0" fill={isActive(pathname, '/dashboard/settings') ? 'currentColor' : 'none'} />
            <span>Settings</span>
          </Link>
          <Link
            href="/dashboard/project/new"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] py-3 font-headline font-bold text-[#4e2600] transition-opacity hover:opacity-90"
          >
            <Plus size={18} className="shrink-0" />
            + New Shoot
          </Link>
        </div>
      </aside>

      {/* ============================================================ */}
      {/*  MAIN WRAPPER                                                */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col ml-64">
        {/* ---------------------------------------------------------- */}
        {/*  HEADER — fixed, contextual                                */}
        {/* ---------------------------------------------------------- */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant/30 bg-background/90 px-6 backdrop-blur-md">

          {inSorting ? (
            /* ====== SORTING VIEW HEADER ====== */
            <>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                  />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="h-9 w-48 rounded-lg bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>

                {/* Project name */}
                <span className="font-headline font-bold text-lg text-on-surface">
                  {getProjectName(pathname)}
                </span>

                {/* Tabs */}
                <nav className="flex items-center gap-1 ml-2">
                  {['Overview', 'Sorting', 'Selection', 'Delivery'].map((tab) => {
                    const isTabActive = getCurrentProjectTab(pathname) === tab
                    const tabSlug = tab === 'Overview' ? '' : `/${tab.toLowerCase()}`
                    return (
                      <Link
                        key={tab}
                        href={`${getProjectBasePath(pathname)}${tabSlug}`}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                          isTabActive
                            ? 'border-b-2 border-[#ffb780] text-[#ffb780]'
                            : 'text-on-surface-variant/50 hover:text-on-surface'
                        }`}
                      >
                        {tab}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-lg border border-outline-variant/30 px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container">
                  <PenLine size={14} />
                  Batch Rename
                </button>
                <button className="rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441] px-4 py-2 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
                  Publish Gallery
                </button>
                <button
                  className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  KD
                </div>
              </div>
            </>
          ) : inProject ? (
            /* ====== PROJECT PAGE HEADER ====== */
            <>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                  />
                  <input
                    type="text"
                    placeholder="Search selection..."
                    className="h-9 w-48 rounded-lg bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>

                {/* Project name + tabs */}
                <span className="font-headline font-bold text-lg text-on-surface">
                  {getProjectName(pathname)}
                </span>
                <nav className="flex items-center gap-1 ml-2">
                  {['Overview', 'Metadata', 'Export History'].map((tab) => {
                    const isTabActive =
                      (tab === 'Overview' && !pathname.match(/\/(metadata|export-history)$/)) ||
                      (tab === 'Metadata' && pathname.endsWith('/metadata')) ||
                      (tab === 'Export History' && pathname.endsWith('/export-history'))
                    return (
                      <span
                        key={tab}
                        className={`cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors ${
                          isTabActive
                            ? 'border-b-2 border-[#ffb780] text-[#ffb780]'
                            : 'text-on-surface-variant/50 hover:text-on-surface'
                        }`}
                      >
                        {tab}
                      </span>
                    )
                  })}
                </nav>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button
                  className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
                </button>
                <button
                  className="rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  KD
                </div>
              </div>
            </>
          ) : (
            /* ====== DEFAULT / DASHBOARD HEADER ====== */
            <>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50"
                  />
                  <input
                    type="text"
                    placeholder="Search projects or assets..."
                    className="h-9 w-56 rounded-lg bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface placeholder-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>

                {/* Page title */}
                <h1 className="font-headline font-bold text-xl text-on-surface">
                  {pathname === '/dashboard' && 'Dashboard'}
                  {pathname.startsWith('/dashboard/clients') && 'Clients'}
                  {pathname.startsWith('/dashboard/billing') && 'Finances'}
                  {pathname.startsWith('/dashboard/settings') && 'Settings'}
                  {pathname === '/dashboard/project' && 'Projects'}
                  {pathname.startsWith('/dashboard/ai-sort') && 'AI Sort'}
                  {pathname.startsWith('/dashboard/analytics') && 'Analytics'}
                  {pathname.startsWith('/dashboard/calendar') && 'Calendar'}
                  {pathname.startsWith('/dashboard/bulk') && 'Bulk Management'}
                </h1>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button
                  className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
                <button
                  className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
                </button>
                <button
                  className="rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441] px-4 py-2 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
                  <Upload size={14} />
                  Upload
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  KD
                </div>
              </div>
            </>
          )}
        </header>

        {/* ---------------------------------------------------------- */}
        {/*  CONTENT                                                   */}
        {/* ---------------------------------------------------------- */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
