'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Wallet,
  Settings,
  Aperture,
  Plus,
  Search,
  Bell,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/project', icon: FolderOpen },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Finances', href: '/dashboard/billing', icon: Wallet },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  return pathname.startsWith(href)
}

function isInsideProject(pathname: string): boolean {
  return /^\/dashboard\/project\/[^/]+/.test(pathname)
}

function getProjectName(pathname: string): string {
  const match = pathname.match(/^\/dashboard\/project\/([^/]+)/)
  if (match) {
    return decodeURIComponent(match[1]).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return 'Project'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const inProject = isInsideProject(pathname)

  return (
    <div className="flex min-h-screen bg-background text-white font-sans">
      {/* Sidebar — fixed 220px */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-view1-border bg-surface"
        style={{ width: 220 }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Aperture size={22} className="shrink-0 text-accent" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-accent leading-tight">
              View1 Sort
            </span>
            <span className="text-[10px] text-muted leading-tight">
              Editorial Workspace
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                      active
                        ? 'bg-[#D4915C26] text-accent'
                        : 'text-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 ${active ? 'text-accent' : 'text-muted'}`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* New Project button */}
        <div className="px-3 pb-4">
          <Link
            href="/dashboard/project/new"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            <Plus size={16} className="shrink-0" />
            New Project
          </Link>
        </div>
      </aside>

      {/* Main wrapper */}
      <div className="flex flex-1 flex-col" style={{ marginLeft: 220 }}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-view1-border bg-background/80 px-6 backdrop-blur-sm">
          {inProject ? (
            <>
              {/* Project header: search + tabs + actions */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    placeholder="Search selection..."
                    className="h-8 w-48 rounded-md bg-surface pl-8 pr-3 text-xs text-white placeholder-muted border border-view1-border outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              {/* Project tabs */}
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-muted">
                  {getProjectName(pathname)}
                </span>
                <nav className="flex items-center gap-5">
                  <span className="border-b-2 border-accent pb-0.5 text-xs font-medium text-accent">
                    Overview
                  </span>
                  <span className="text-xs font-medium text-muted hover:text-white cursor-pointer transition-colors">
                    Metadata
                  </span>
                  <span className="text-xs font-medium text-muted hover:text-white cursor-pointer transition-colors">
                    Export History
                  </span>
                </nav>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                <button
                  className="relative rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                </button>
                <button
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Settings"
                >
                  <Settings size={16} />
                </button>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent">
                  KD
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Default header: search + actions */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    placeholder="Search projects or assets..."
                    className="h-8 w-56 rounded-md bg-surface pl-8 pr-3 text-xs text-white placeholder-muted border border-view1-border outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-muted uppercase tracking-wide cursor-pointer hover:text-white transition-colors">
                  Notifications
                </span>
                <span className="text-xs font-medium text-muted uppercase tracking-wide cursor-pointer hover:text-white transition-colors">
                  Publish
                </span>
                <button className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-accent-hover">
                  Upload
                </button>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent">
                  KD
                </div>
              </div>
            </>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
