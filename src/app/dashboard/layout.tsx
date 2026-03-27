'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  Users,
  BarChart3,
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
  DollarSign,
  Eye,
  UserCheck,
  Cloud,
  Image as ImageIcon,
  Menu,
  X,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Notification types & mock data                                     */
/* ------------------------------------------------------------------ */

interface Notification {
  id: string
  type: 'booking' | 'payment' | 'gallery_viewed' | 'client_accepted' | 'upload_complete'
  title: string
  description: string
  timestamp: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    description: 'Sarah Johnson requested a wedding shoot for July 18.',
    timestamp: '5 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    description: '$2,400 deposited for the Martinez engagement session.',
    timestamp: '1 hr ago',
    read: false,
  },
  {
    id: '3',
    type: 'gallery_viewed',
    title: 'Gallery Viewed',
    description: 'Emily Chen viewed the "Lakeside Wedding" gallery.',
    timestamp: '3 hrs ago',
    read: false,
  },
  {
    id: '4',
    type: 'client_accepted',
    title: 'Client Accepted Invite',
    description: 'David Park accepted your invitation to review proofs.',
    timestamp: '6 hrs ago',
    read: true,
  },
  {
    id: '5',
    type: 'upload_complete',
    title: 'Upload Complete',
    description: '428 photos uploaded to "Johnson Wedding" project.',
    timestamp: '1 day ago',
    read: true,
  },
]

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const config: Record<Notification['type'], { icon: React.ElementType; bg: string }> = {
    booking: { icon: CalendarDays, bg: 'bg-[#ffb780]/20 text-[#ffb780]' },
    payment: { icon: DollarSign, bg: 'bg-[#95d1d1]/20 text-[#95d1d1]' },
    gallery_viewed: { icon: Eye, bg: 'bg-[#ffb4a5]/20 text-[#ffb4a5]' },
    client_accepted: { icon: UserCheck, bg: 'bg-[#d9c2b4]/20 text-[#d9c2b4]' },
    upload_complete: { icon: Cloud, bg: 'bg-[#95d1d1]/20 text-[#95d1d1]' },
  }
  const { icon: Icon, bg } = config[type]
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
      <Icon size={16} />
    </div>
  )
}

function NotificationDropdown({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-2rem))] rounded-xl border border-[#534439]/60 bg-[#1d1b1a] shadow-2xl shadow-black/40 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#534439]/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-headline font-bold text-sm text-[#e7e1df]">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d48441] px-1.5 text-[10px] font-bold text-[#4e2600]">
              {unreadCount}
            </span>
          )}
        </div>
        <button className="text-[11px] font-medium text-[#ffb780] hover:text-[#ffb780]/80 transition-colors">
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      <div className="max-h-[380px] overflow-y-auto">
        {MOCK_NOTIFICATIONS.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#252322]/60 cursor-pointer ${
              !notification.read ? 'border-l-2 border-l-[#ffb780]' : 'border-l-2 border-l-transparent'
            }`}
          >
            <NotificationIcon type={notification.type} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium leading-snug ${!notification.read ? 'text-[#e7e1df]' : 'text-[#e7e1df]/60'}`}>
                {notification.title}
              </p>
              <p className="mt-0.5 text-xs text-[#a18d80] leading-relaxed line-clamp-2">
                {notification.description}
              </p>
              <p className="mt-1 text-[10px] text-[#a18d80]/60">{notification.timestamp}</p>
            </div>
            {!notification.read && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ffb780]" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#534439]/40 px-4 py-3 text-center">
        <button className="text-xs font-medium text-[#ffb780] hover:text-[#ffb780]/80 transition-colors">
          View All Notifications
        </button>
      </div>
    </div>
  )
}

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
  { label: 'AI Sort', href: '/dashboard/ai-sort', icon: Sparkles },
  { label: 'Gallery', href: '/dashboard/gallery', icon: ImageIcon },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Analytics & Finances', href: '/dashboard/billing', icon: BarChart3 },
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
  // Analytics & Finances matches both /dashboard/billing and /dashboard/analytics
  if (href === '/dashboard/billing') {
    return pathname.startsWith('/dashboard/billing') || pathname.startsWith('/dashboard/analytics')
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/*  SIDEBAR — fixed 256px (w-64), slides in on mobile           */}
      {/* ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#1c1a19] shadow-[4px_0_24px_-4px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
            <Camera size={18} className="text-[#4e2600]" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-headline font-black text-2xl tracking-tighter leading-tight text-[#ffb780]">
              View1 Sort
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
              Editorial Studio
            </span>
          </div>
          {/* Close button (mobile only) */}
          <button
            className="md:hidden rounded-lg p-1 text-on-surface-variant/50 hover:bg-surface-container"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
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

          {/* Scheduling Tools — collapsible nav item */}
          <div className="mt-1 mx-2">
            <button
              onClick={() => setSchedulingOpen(!schedulingOpen)}
              className={`flex w-full items-center gap-3 px-4 py-3 font-body font-medium transition-colors duration-150 ${
                isSchedulingActive
                  ? 'rounded-lg bg-[#252322] text-[#ffb780]'
                  : 'text-[#e7e1df]/50 hover:bg-[#252322]/50 hover:text-[#e7e1df]'
              }`}
            >
              <CalendarDays size={20} className="shrink-0" fill={isSchedulingActive ? 'currentColor' : 'none'} />
              <span className="flex-1 text-left">Scheduling</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  schedulingOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                schedulingOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <ul className="space-y-0.5 pl-4">
                {schedulingItems.map((item) => {
                  const active = isActive(pathname, item.href)
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-body font-medium transition-colors duration-150 ${
                          active
                            ? 'rounded-md bg-[#252322] text-[#ffb780]'
                            : 'text-[#e7e1df]/40 hover:bg-[#252322]/50 hover:text-[#e7e1df]'
                        }`}
                      >
                        <Icon
                          size={16}
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
      <div className="flex flex-1 flex-col md:ml-64">
        {/* ---------------------------------------------------------- */}
        {/*  HEADER — fixed, contextual                                */}
        {/* ---------------------------------------------------------- */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant/30 bg-background/90 px-4 md:px-6 backdrop-blur-md">

          {inSorting ? (
            /* ====== SORTING VIEW HEADER ====== */
            <>
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                {/* Hamburger (mobile only) */}
                <button
                  className="md:hidden rounded-lg p-1.5 text-on-surface-variant/60 hover:bg-surface-container"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>

                {/* Search (desktop only) */}
                <div className="relative hidden md:block">
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
                <span className="font-headline font-bold text-base md:text-lg text-on-surface truncate">
                  {getProjectName(pathname)}
                </span>

                {/* Tabs (desktop only) */}
                <nav className="hidden md:flex items-center gap-1 ml-2">
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
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <button className="hidden md:flex items-center gap-2 rounded-lg border border-outline-variant/30 px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container">
                  <PenLine size={14} />
                  Batch Rename
                </button>
                <button className="rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441] px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
                  Publish
                </button>
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d48441] px-1 text-[9px] font-bold text-[#4e2600]">
                      3
                    </span>
                  </button>
                  <NotificationDropdown
                    open={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                  />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  KD
                </div>
              </div>
            </>
          ) : inProject ? (
            /* ====== PROJECT PAGE HEADER ====== */
            <>
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                {/* Hamburger (mobile only) */}
                <button
                  className="md:hidden rounded-lg p-1.5 text-on-surface-variant/60 hover:bg-surface-container"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>

                {/* Search (desktop only) */}
                <div className="relative hidden md:block">
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

                {/* Project name + tabs (desktop only) */}
                <span className="font-headline font-bold text-base md:text-lg text-on-surface truncate">
                  {getProjectName(pathname)}
                </span>
                <nav className="hidden md:flex items-center gap-1 ml-2">
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
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d48441] px-1 text-[9px] font-bold text-[#4e2600]">
                      3
                    </span>
                  </button>
                  <NotificationDropdown
                    open={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                  />
                </div>
                <button
                  className="hidden md:block rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
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
              <div className="flex items-center gap-2 md:gap-4 min-w-0">
                {/* Hamburger (mobile only) */}
                <button
                  className="md:hidden rounded-lg p-1.5 text-on-surface-variant/60 hover:bg-surface-container"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>

                {/* Search (desktop only) */}
                <div className="relative hidden md:block">
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
                <h1 className="font-headline font-bold text-lg md:text-xl text-on-surface truncate">
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
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d48441] px-1 text-[9px] font-bold text-[#4e2600]">
                      3
                    </span>
                  </button>
                  <NotificationDropdown
                    open={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                  />
                </div>
                <button
                  className="hidden md:block rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441] px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
                  <Upload size={14} />
                  <span className="hidden sm:inline">Upload</span>
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
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
