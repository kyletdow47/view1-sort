'use client'

import * as Dialog from '@radix-ui/react-dialog'
import {
  Search,
  FolderOpen,
  Users,
  Image,
  Zap,
  LayoutDashboard,
  Settings,
  FileText,
  DollarSign,
  BarChart2,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import { useCommandBar } from '@/hooks/useCommandBar'
import type { CommandCategory, CommandResult } from '@/types/command-bar'

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const RECENT_ITEMS_KEY = 'v1_cmd_recent'
const MAX_RECENT = 5

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  recent: 'Recent',
  projects: 'Projects',
  clients: 'Clients',
  galleries: 'Galleries',
  actions: 'Quick Actions',
  pages: 'Pages',
}

// Icon map — avoids passing React elements through types
const ICON_MAP: Record<string, React.ElementType> = {
  FolderOpen,
  Users,
  Image,
  Zap,
  LayoutDashboard,
  Settings,
  FileText,
  DollarSign,
  BarChart2,
  Clock,
  Search,
}

/* ------------------------------------------------------------------ */
/*  Built-in items (actions + pages)                                   */
/* ------------------------------------------------------------------ */

const STATIC_RESULTS: CommandResult[] = [
  // Quick Actions
  { id: 'action-new-project',    category: 'actions', label: 'New Project',     description: 'Start a new photo project',        iconName: 'FolderOpen', actionKey: 'new-project' },
  { id: 'action-send-gallery',   category: 'actions', label: 'Send Gallery',    description: 'Share a gallery with a client',    iconName: 'Image',      actionKey: 'send-gallery' },
  { id: 'action-create-invoice', category: 'actions', label: 'Create Invoice',  description: 'Draft a new invoice',              iconName: 'DollarSign', actionKey: 'create-invoice' },
  // Pages
  { id: 'page-dashboard',   category: 'pages', label: 'Dashboard',     description: '/dashboard',           iconName: 'LayoutDashboard', href: '/dashboard' },
  { id: 'page-projects',    category: 'pages', label: 'Projects',      description: '/dashboard/projects',  iconName: 'FolderOpen',      href: '/dashboard/projects' },
  { id: 'page-clients',     category: 'pages', label: 'Clients',       description: '/dashboard/clients',   iconName: 'Users',           href: '/dashboard/clients' },
  { id: 'page-finances',    category: 'pages', label: 'Finances',      description: '/dashboard/finances',  iconName: 'DollarSign',      href: '/dashboard/finances' },
  { id: 'page-analytics',   category: 'pages', label: 'Analytics',     description: '/dashboard/analytics', iconName: 'BarChart2',       href: '/dashboard/analytics' },
  { id: 'page-settings',    category: 'pages', label: 'Settings',      description: '/dashboard/settings',  iconName: 'Settings',        href: '/dashboard/settings' },
  { id: 'page-bookings',    category: 'pages', label: 'Bookings',      description: '/dashboard/bookings',  iconName: 'FileText',        href: '/dashboard/bookings' },
]

/* ------------------------------------------------------------------ */
/*  Local storage helpers                                               */
/* ------------------------------------------------------------------ */

function loadRecent(): CommandResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_ITEMS_KEY)
    return raw ? (JSON.parse(raw) as CommandResult[]) : []
  } catch {
    return []
  }
}

function saveRecent(item: CommandResult) {
  if (typeof window === 'undefined') return
  try {
    const existing = loadRecent().filter((r) => r.id !== item.id)
    const next = [{ ...item, category: 'recent' as CommandCategory }, ...existing].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Fuzzy match                                                         */
/* ------------------------------------------------------------------ */

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true
  const haystack = text.toLowerCase()
  const needle = query.toLowerCase()
  // simple word-by-word containment check
  return needle.split(/\s+/).every((word) => haystack.includes(word))
}

/* ------------------------------------------------------------------ */
/*  Result row                                                          */
/* ------------------------------------------------------------------ */

function ResultRow({
  result,
  active,
  onSelect,
  onHover,
  innerRef,
}: {
  result: CommandResult
  active: boolean
  onSelect: (r: CommandResult) => void
  onHover: () => void
  innerRef: (el: HTMLButtonElement | null) => void
}) {
  const Icon = ICON_MAP[result.iconName] ?? Search
  const isAction = result.category === 'actions'

  return (
    <button
      ref={innerRef}
      role="option"
      aria-selected={active}
      onClick={() => onSelect(result)}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
        <Icon size={15} className="text-white/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{result.label}</p>
        {result.description && (
          <p className="truncate text-xs text-white/40">{result.description}</p>
        )}
      </div>
      {isAction ? (
        <Zap size={13} className="shrink-0 text-[#5749F4]" />
      ) : (
        <ArrowUpRight size={13} className="shrink-0 text-white/20" />
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Category header                                                     */
/* ------------------------------------------------------------------ */

function CategoryHeader({ label }: { label: string }) {
  return (
    <div className="mb-1 mt-3 flex items-center gap-2 px-3 first:mt-0">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main CommandBar dialog                                              */
/* ------------------------------------------------------------------ */

export function CommandBar() {
  const { open, closeCommandBar } = useCommandBar()
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentItems, setRecentItems] = useState<CommandResult[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Load recent items when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setRecentItems(loadRecent())
      // Autofocus handled by Dialog.Content autoFocus
    }
  }, [open])

  // TODO: replace mock data with Supabase queries when DB tables exist
  const mockProjects: CommandResult[] = useMemo(() => [
    { id: 'proj-1', category: 'projects', label: 'Smith Wedding 2026', description: '847 photos · In Review',    iconName: 'FolderOpen' },
    { id: 'proj-2', category: 'projects', label: 'Chen Family Portraits', description: '234 photos · Delivered', iconName: 'FolderOpen' },
    { id: 'proj-3', category: 'projects', label: 'Riviera Corporate Event', description: '1,204 photos · Sorting', iconName: 'FolderOpen' },
  ], [])

  const mockClients: CommandResult[] = useMemo(() => [
    { id: 'client-1', category: 'clients', label: 'Jordan Smith',   description: 'jordan.smith@email.com', iconName: 'Users', href: '/dashboard/clients/1' },
    { id: 'client-2', category: 'clients', label: 'Emily Chen',     description: 'emily.chen@email.com',  iconName: 'Users', href: '/dashboard/clients/2' },
    { id: 'client-3', category: 'clients', label: 'Riviera Events', description: 'info@riviera.com',      iconName: 'Users', href: '/dashboard/clients/3' },
  ], [])

  const mockGalleries: CommandResult[] = useMemo(() => [
    { id: 'gal-1', category: 'galleries', label: 'Smith Wedding — Final Gallery', description: 'Published · 312 photos', iconName: 'Image', href: '/gallery/smith-wedding-final' },
    { id: 'gal-2', category: 'galleries', label: 'Chen Portraits — Draft',        description: 'Draft · 89 photos',      iconName: 'Image', href: '/gallery/chen-portraits-draft' },
  ], [])

  // Build filtered results
  const results = useMemo<CommandResult[]>(() => {
    const q = query.trim()

    if (!q) {
      // Empty state: show recent + all actions + top pages
      return [
        ...recentItems,
        ...STATIC_RESULTS.filter((r) => r.category === 'actions'),
        ...STATIC_RESULTS.filter((r) => r.category === 'pages').slice(0, 4),
      ]
    }

    const pool: CommandResult[] = [
      ...mockProjects,
      ...mockClients,
      ...mockGalleries,
      ...STATIC_RESULTS,
    ]

    return pool.filter((r) => fuzzyMatch(r.label + ' ' + (r.description ?? ''), q))
  }, [query, recentItems, mockProjects, mockClients, mockGalleries])

  // Group results by category, preserving order
  const grouped = useMemo(() => {
    const map = new Map<CommandCategory, CommandResult[]>()
    for (const r of results) {
      const arr = map.get(r.category) ?? []
      arr.push(r)
      map.set(r.category, arr)
    }
    return map
  }, [results])

  // Flat ordered list for keyboard nav
  const flatResults = useMemo(() => results, [results])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const selectResult = useCallback((result: CommandResult) => {
    saveRecent(result)
    closeCommandBar()

    if (result.actionKey === 'new-project') {
      router.push('/dashboard/projects?new=1')
    } else if (result.actionKey === 'send-gallery') {
      router.push('/dashboard/projects')
    } else if (result.actionKey === 'create-invoice') {
      router.push('/dashboard/finances?new-invoice=1')
    } else if (result.href) {
      router.push(result.href)
    }
  }, [closeCommandBar, router])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = flatResults[activeIndex]
      if (selected) selectResult(selected)
    }
  }, [flatResults, activeIndex, selectResult])

  // Scroll active item into view
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  let flatIndex = 0

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) closeCommandBar() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl focus:outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            inputRef.current?.focus()
          }}
        >
          <Dialog.Title className="sr-only">Command Bar</Dialog.Title>
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
            <Search size={18} className="shrink-0 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, clients, galleries..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-white/30 hover:text-white/60"
              >
                Clear
              </button>
            )}
            <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30 sm:inline">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            role="listbox"
            className="max-h-[360px] overflow-y-auto p-2 pb-3"
          >
            {flatResults.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-white/30">No results for &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              Array.from(grouped.entries()).map(([category, items]) => (
                <div key={category}>
                  <CategoryHeader label={CATEGORY_LABELS[category]} />
                  {items.map((result) => {
                    const index = flatIndex++
                    return (
                      <ResultRow
                        key={result.id}
                        result={result}
                        active={activeIndex === index}
                        onSelect={selectResult}
                        onHover={() => setActiveIndex(index)}
                        innerRef={(el) => { itemRefs.current[index] = el }}
                      />
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5">
            <div className="flex items-center gap-3 text-[10px] text-white/25">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-px">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-px">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-px">ESC</kbd>
                close
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/20">
              <ChevronRight size={10} />
              <span>{flatResults.length} result{flatResults.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
