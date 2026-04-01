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
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useNotifications } from '@/hooks/useNotifications'
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher'

/* ------------------------------------------------------------------ */
/*  Notification types & helpers                                       */
/* ------------------------------------------------------------------ */

import type { Notification as DBNotification } from '@/types/supabase'

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string }> = {
  booking: { icon: CalendarDays, bg: 'bg-primary/20 text-accent-muted' },
  payment: { icon: DollarSign, bg: 'bg-success/20 text-success' },
  gallery_viewed: { icon: Eye, bg: 'bg-primary/20 text-accent-muted' },
  client_accepted: { icon: UserCheck, bg: 'bg-primary/15 text-accent-muted' },
  upload_complete: { icon: Cloud, bg: 'bg-success/20 text-success' },
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
      className="absolute right-0 top-full mt-2 w-[min(380px,calc(100vw-2rem))] rounded-xl border border-outline-variant/60 bg-surface-container shadow-2xl shadow-black/40 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-headline font-bold text-sm text-on-surface">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-on-primary">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Mark all read
        </button>
      </div>

      {/* Notification list */}
      <div className="max-h-[380px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && onMarkRead(notification.id)}
              className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-highest/60 cursor-pointer ${
                !notification.read ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
              }`}
            >
              <NotificationIcon type={notification.type} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium leading-snug ${!notification.read ? 'text-on-surface' : 'text-on-surface/60'}`}>
                  {notification.title}
                </p>
                <p className="mt-0.5 text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                  {notification.body}
                </p>
                <p className="mt-1 text-[10px] text-on-surface-variant/60">{timeAgo(notification.created_at)}</p>
              </div>
              {!notification.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-outline-variant/40 px-4 py-3 text-center">
        <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
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
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

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
    <div className="flex min-h-screen app-shell text-on-surface">
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
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#0d0e18]/90 backdrop-blur-sm border-r border-white/[0.08] transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dim">
            <Camera size={18} className="text-on-primary" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="font-headline font-black text-2xl tracking-tighter leading-tight text-primary">
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
                        ? 'rounded-lg bg-surface-highest text-primary'
                        : 'text-on-surface/50 hover:bg-surface-highest/50 hover:text-on-surface'
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
                  ? 'rounded-lg bg-surface-highest text-primary'
                  : 'text-on-surface/50 hover:bg-surface-highest/50 hover:text-on-surface'
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
                            ? 'rounded-md bg-surface-highest text-primary'
                            : 'text-on-surface/40 hover:bg-surface-highest/50 hover:text-on-surface'
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
                <p className="text-sm font-medium text-on-surface truncate">
                  {profile?.display_name ?? user?.email ?? ''}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">
                  {profile?.tier ? `${profile.tier.charAt(0).toUpperCase()}${profile.tier.slice(1)} plan` : ''}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="shrink-0 rounded-md p-1.5 text-on-surface-variant hover:bg-surface-highest hover:text-on-surface transition-colors"
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
                ? 'rounded-lg bg-surface-highest text-primary'
                : 'text-on-surface/50 hover:bg-surface-highest/50 hover:text-on-surface'
            }`}
          >
            <Settings size={20} className="shrink-0" fill={isActive(pathname, '/dashboard/settings') ? 'currentColor' : 'none'} />
            <span>Settings</span>
          </Link>
          <Link
            href="/dashboard/project/new"
            className="flex items-center justify-center gap-2 w-full rounded-lg primary-gradient py-3 font-sans font-bold text-on-primary shadow-elev-1 hover:shadow-elev-2 hover:-translate-y-px transition-all"
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between glass-header px-4 md:px-6">

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
                    className="h-9 w-48 rounded-lg bg-white/[0.08] pl-10 pr-3 text-sm text-white/90 placeholder-white/30 outline-none focus:ring-1 focus:ring-white/30 border border-white/[0.12]"
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
                            ? 'border-b-2 border-primary text-primary'
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
                <button className="rounded-lg bg-gradient-to-br from-primary to-primary-dim px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
                  Publish
                </button>
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-on-primary">
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
                    className="h-9 w-48 rounded-lg bg-white/[0.08] pl-10 pr-3 text-sm text-white/90 placeholder-white/30 outline-none focus:ring-1 focus:ring-white/30 border border-white/[0.12]"
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
                            ? 'border-b-2 border-primary text-primary'
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
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-on-primary">
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
                  className="hidden md:block rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
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
                    className="h-9 w-56 rounded-lg bg-white/[0.08] pl-10 pr-3 text-sm text-white/90 placeholder-white/30 outline-none focus:ring-1 focus:ring-white/30 border border-white/[0.12]"
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
                {/* Theme switcher — 3 dots */}
                <ThemeSwitcher className="hidden md:flex" />

                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-container px-1 text-[9px] font-bold text-on-primary">
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
                  className="hidden md:block rounded-lg p-2 text-on-surface-variant/50 transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label="Settings"
                >
                  <Settings size={18} />
                </button>
                <button className="flex items-center gap-2 rounded-lg primary-gradient px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-on-primary shadow-elev-1 hover:shadow-elev-2 hover:-translate-y-px transition-all">
                  <Upload size={14} />
                  <span className="hidden sm:inline">Upload</span>
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
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
