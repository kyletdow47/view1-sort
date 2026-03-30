'use client'

import { useState } from 'react'
import {
  Layers,
  Archive,
  Trash2,
  Download,
  Palette,
  CheckSquare,
  Square,
  MoreVertical,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react'

interface Project {
  id: number
  name: string
  status: 'Published' | 'Draft' | 'Completed' | 'Archived'
  photos: number
  size: string
  date: string
  theme: string
}

const PROJECTS: Project[] = [
  { id: 1, name: 'Sterling Wedding', status: 'Published', photos: 852, size: '42.5 GB', date: 'Mar 24, 2024', theme: 'Editorial' },
  { id: 2, name: 'Vogue Editorial', status: 'Draft', photos: 124, size: '12.8 GB', date: 'Mar 22, 2024', theme: 'Dark' },
  { id: 3, name: "Harper's Bazaar", status: 'Published', photos: 312, size: '28.4 GB', date: 'Mar 18, 2024', theme: 'Minimal' },
  { id: 4, name: 'Urban Loft Series', status: 'Archived', photos: 45, size: '4.2 GB', date: 'Feb 12, 2024', theme: 'Light' },
  { id: 5, name: 'Coastal Retreat', status: 'Completed', photos: 189, size: '15.6 GB', date: 'Jan 28, 2024', theme: 'Editorial' },
  { id: 6, name: 'Mountain Elopement', status: 'Draft', photos: 76, size: '8.1 GB', date: 'Jan 15, 2024', theme: 'Moody' },
]

const FILTER_TABS = ['All', 'Draft', 'Published', 'Completed', 'Archived'] as const

function statusColor(status: Project['status']): string {
  switch (status) {
    case 'Published':
      return 'text-emerald-400'
    case 'Draft':
      return 'text-primary'
    case 'Archived':
      return 'text-on-surface-variant/60'
    case 'Completed':
      return 'text-primary'
  }
}

function StatusIcon({ status }: { status: Project['status'] }) {
  const cls = 'w-3 h-3'
  switch (status) {
    case 'Published':
      return <CheckCircle2 className={cls} />
    case 'Draft':
      return <Clock className={cls} />
    case 'Archived':
      return <Archive className={cls} />
    case 'Completed':
      return <CheckCircle2 className={cls} />
  }
}

export default function BulkManagementPage() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)))
    }
  }

  const filteredProjects = PROJECTS.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const hasSelection = selectedIds.size > 0

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface flex items-center gap-3">
            <Layers className="w-8 h-8 text-primary" />
            Bulk Project Management
          </h2>
          <p className="text-on-surface-variant mt-2">
            Perform batch operations across your entire project library and manage archival lifecycles.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-outline-variant/20">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={toggleAll}
              className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-all"
            >
              {selectedIds.size === filteredProjects.length && filteredProjects.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-primary" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {hasSelection ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary mr-2">
                  {selectedIds.size} Selected
                </span>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-highest/60 hover:bg-surface-highest text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface rounded-lg border border-outline-variant/20 transition-all">
                  <Archive className="w-3 h-3" /> Archive
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-highest/60 hover:bg-surface-highest text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface rounded-lg border border-outline-variant/20 transition-all">
                  <Palette className="w-3 h-3" /> Theme
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-highest/60 hover:bg-surface-highest text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface rounded-lg border border-outline-variant/20 transition-all">
                  <Download className="w-3 h-3" /> Export
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-[#e7765f]/10 hover:bg-[#e7765f]/20 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg border border-[#e7765f]/20 transition-all">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg border transition-all ${
                      activeFilter === tab
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-highest/60 text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/40'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Table */}
        <div className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container/50">
                <th className="w-12 px-6 py-4" />
                <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/80">
                  Project Name
                </th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/80">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/80">
                  Assets
                </th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/80">
                  Theme
                </th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/80">
                  Last Updated
                </th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant/80 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => toggleSelect(project.id)}
                  className={`hover:bg-surface-container/40 transition-colors group cursor-pointer ${
                    selectedIds.has(project.id) ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="text-on-surface-variant/30 group-hover:text-on-surface-variant/60 transition-colors">
                      {selectedIds.has(project.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{project.name}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                        {project.size}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest ${statusColor(project.status)}`}
                    >
                      <StatusIcon status={project.status} />
                      {project.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-on-surface">
                      {project.photos}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-surface-highest/60 text-[9px] font-mono font-bold uppercase tracking-widest rounded-md border border-outline-variant/20 text-on-surface-variant">
                      {project.theme}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-on-surface-variant/80">{project.date}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    No projects match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Archival Lifecycle Info */}
        <div className="bg-surface p-6 rounded-3xl border border-outline-variant/20 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-on-surface">Archival Lifecycle Automation</h4>
            <p className="text-xs text-on-surface-variant/80 leading-relaxed">
              Projects marked as &lsquo;Completed&rsquo; will automatically move to &lsquo;Archived&rsquo; after 30 days.
              Archived projects are read-only and will be permanently deleted after 6 months. You can
              restore archived projects at any time before deletion.
            </p>
          </div>
          <button className="ml-auto px-4 py-2 bg-surface-container hover:bg-surface-highest rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant transition-all whitespace-nowrap">
            Configure Rules
          </button>
        </div>
      </div>
    </div>
  )
}
