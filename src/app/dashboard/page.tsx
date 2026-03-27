'use client'

import Link from 'next/link'
import { Plus, FolderOpen, Camera, Image, MoreVertical } from 'lucide-react'

const MOCK_PROJECTS = [
  {
    id: 'demo-1',
    name: 'Johnson Wedding',
    preset: 'wedding',
    status: 'published',
    photoCount: 847,
    coverGradient: 'from-pink-500/20 to-purple-500/20',
  },
  {
    id: 'demo-2',
    name: '123 Oak Street Listing',
    preset: 'real_estate',
    status: 'draft',
    photoCount: 156,
    coverGradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'demo-3',
    name: 'Portugal Travel Series',
    preset: 'travel',
    status: 'draft',
    photoCount: 432,
    coverGradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'demo-4',
    name: 'Corporate Headshots — Acme Inc',
    preset: 'general',
    status: 'completed',
    photoCount: 64,
    coverGradient: 'from-gray-500/20 to-slate-500/20',
  },
]

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-500/20 text-yellow-400',
  published: 'bg-accent/20 text-accent',
  completed: 'bg-blue-500/20 text-blue-400',
  archived: 'bg-muted/20 text-muted',
}

const PRESET_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  real_estate: 'Real Estate',
  travel: 'Travel',
  general: 'General',
}

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-muted text-sm mt-1">4 projects &middot; 2 active</p>
        </div>
        <button className="flex items-center gap-2 bg-accent text-black font-semibold text-sm rounded-lg px-4 py-2.5 hover:bg-accent-hover transition-colors">
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PROJECTS.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/project/${project.id}`}
            className="group bg-surface border border-view1-border rounded-xl overflow-hidden hover:border-accent/40 transition-colors"
          >
            {/* Cover */}
            <div className={`h-32 bg-gradient-to-br ${project.coverGradient} flex items-center justify-center`}>
              <Camera className="text-white/20" size={48} />
            </div>
            {/* Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status]}`}>
                      {project.status}
                    </span>
                    <span className="text-xs text-muted">
                      {PRESET_LABELS[project.preset]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="text-muted hover:text-white p-1"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-muted text-xs">
                <Image size={12} />
                <span>{project.photoCount} photos</span>
              </div>
            </div>
          </Link>
        ))}

        {/* New Project Card */}
        <button className="bg-surface/50 border border-dashed border-view1-border rounded-xl h-full min-h-[220px] flex flex-col items-center justify-center gap-3 text-muted hover:text-accent hover:border-accent/40 transition-colors">
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
            <Plus size={24} />
          </div>
          <span className="text-sm font-medium">Create Project</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Photos', value: '1,499', icon: Image },
          { label: 'Active Projects', value: '2', icon: FolderOpen },
          { label: 'Storage Used', value: '2.3 GB', icon: FolderOpen },
          { label: 'Gallery Views', value: '127', icon: Camera },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-view1-border rounded-xl p-4">
            <p className="text-muted text-xs">{stat.label}</p>
            <p className="text-white text-xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
