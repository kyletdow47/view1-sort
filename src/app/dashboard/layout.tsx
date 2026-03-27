'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
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
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useNotifications } from '@/hooks/useNotifications'

/* ------------------------------------------------------------------ */
/*  Notification types & helpers                                       */
/* ------------------------------------------------------------------ */

import type { Notification as DBNotification } from '@/types/supabase'

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string }> = {
  booking: { icon: CalendarDays, bg: 'bg-[#ffb780]/20 text-[#ffb780]' },
  payment: { icon: DollarSign, bg: 'bg-[#95d1d1]/20 text-[#95d1d1]' },
  gallery_viewed: { icon: Eye, bg: 'bg-[#ffb4a5]/20 text-[#ffb4a5]' },
  client_accepted: { icon: UserCheck, bg: 'bg-[#d9c2b4]/20 text-[#d9c2b4]' },
  upload_complete: { icon: Cloud, bg: 'bg-[#95d1d1]/20 text-[#95d1d1]' },
}

function NotificationIcon({ type }: { type: string }) {
  const config = NOTIFICATION_TYPE_CONFIG[type] ?? NOTIFICATION_TYPE_CONFIG.booking
  const { icon: Icon, bg } = config
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
      <Icon size={16} />
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return `${Math.floor(days / 30)} mo ago`
}

function NotificationDropdown({
  open,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
}: {
  open: boolean
  onClose: () => void
  notifications: DBNotification[]
  unreadCount: number
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
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

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[380px] rounded-xl border border-[#534439]/60 bg-[#1d1b1a] shadow-2xl shadow-black/40 z-50"
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
        <button
          onClick={onMarkAllRead}
          className="text-[11px] font-medium text-[#ffb780] hover:text-[#ffb780]/80 transition-colors"
        >
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      <div className="max-h-[380px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#a18d80]">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && onMarkRead(notification.id)}
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
                  {notification.body}
                </p>
                <p className="mt-1 text-[10px] text-[#a18d80]/60">{timeAgo(notification.created_at)}</p>
              </div>
              {!notification.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ffb780]" />
              )}
            </div>
          ))
        )}
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
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()

  const inProject = isInsideProject(pathname)
  const inSorting = isSortingView(pathname)
  const isSchedulingActive = schedulingItems.some((item) => isActive(pathname, item.href))
  const [schedulingOpen, setSchedulingOpen] = useState(isSchedulingActive)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const userInitials = useMemo(() => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return '?'
  }, [profile, user])

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

        {/* Bottom section: User info + Settings + New Shoot */}
        <div className="px-2 pb-5 space-y-2">
          {/* User profile row */}
          {(profile || user) && (
            <div className="flex items-center gap-3 px-4 py-2 mb-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#e7e1df] truncate">
                  {profile?.display_name ?? user?.email ?? ''}
                </p>
                <p className="text-[10px] text-[#a18d80] truncate">
                  {profile?.tier ? `${profile.tier.charAt(0).toUpperCase()}${profile.tier.slice(1)} plan` : ''}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="shrink-0 rounded-md p-1.5 text-[#a18d80] hover:bg-[#252322] hover:text-[#e7e1df] transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
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
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d48441] px-1 text-[9px] font-bold text-[#4e2600]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    open={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAllRead={markAllRead}
                    onMarkRead={markRead}
                  />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  {userInitials}
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
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d48441] px-1 text-[9px] font-bold text-[#4e2600]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    open={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAllRead={markAllRead}
                    onMarkRead={markRead}
                  />
                </div>
                <button
                  className="rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  {userInitials}
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
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d48441] px-1 text-[9px] font-bold text-[#4e2600]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown
                    open={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAllRead={markAllRead}
                    onMarkRead={markRead}
                  />
                </div>
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
                  {userInitials}
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
