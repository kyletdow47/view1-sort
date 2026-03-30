'use client'

import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Camera,
  Heart,
  Home,
  Plane,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react'

const PROJECTS = [
  {
    id: 'demo-1',
    name: 'Johnson Wedding',
    type: 'Wedding',
    typeIcon: Heart,
    status: 'published',
    photos: 847,
    storage: '12.4 GB',
    date: 'Sep 14, 2023',
    hue: 25,
  },
  {
    id: 'demo-2',
    name: '123 Oak Street Listing',
    type: 'Real Estate',
    typeIcon: Home,
    status: 'draft',
    photos: 156,
    storage: '2.1 GB',
    date: 'Oct 02, 2023',
    hue: 200,
  },
  {
    id: 'demo-3',
    name: 'Portugal Travel Series',
    type: 'Travel',
    typeIcon: Plane,
    status: 'active',
    photos: 432,
    storage: '8.7 GB',
    date: 'Nov 18, 2023',
    hue: 40,
  },
  {
    id: 'demo-4',
    name: 'Corporate Headshots — Acme Inc',
    type: 'Commercial',
    typeIcon: Camera,
    status: 'completed',
    photos: 64,
    storage: '1.2 GB',
    date: 'Dec 05, 2023',
    hue: 280,
  },
  {
    id: 'demo-5',
    name: 'Alpine Solitude',
    type: 'Landscape',
    typeIcon: ImageIcon,
    status: 'published',
    photos: 3105,
    storage: '45.2 GB',
    date: 'Jan 10, 2024',
    hue: 180,
  },
  {
    id: 'demo-6',
    name: 'Noir & Silk Editorial',
    type: 'Fashion',
    typeIcon: Camera,
    status: 'completed',
    photos: 1890,
    storage: '28.6 GB',
    date: 'Feb 22, 2024',
    hue: 340,
  },
]

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  published: { label: 'Published', bg: 'bg-[#0c5252]/30', text: 'text-emerald-400', icon: CheckCircle },
  draft: { label: 'Draft', bg: 'bg-surface-highest', text: 'text-on-surface-variant', icon: Clock },
  active: { label: 'Active', bg: 'bg-primary/15', text: 'text-primary', icon: CheckCircle },
  completed: { label: 'Completed', bg: 'bg-[#e7765f]/15', text: 'text-rose-400', icon: Archive },
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-1">
            All Projects
          </h1>
          <p className="text-on-surface-variant text-sm">
            {PROJECTS.length} projects &middot; {PROJECTS.reduce((s, p) => s + p.photos, 0).toLocaleString()} total photos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-surface-low border-none rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface placeholder-on-surface-variant/30 focus:ring-1 focus:ring-primary/20 w-56"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg text-sm text-on-surface-variant hover:bg-surface-highest transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold text-sm rounded-lg">
            <Plus size={14} />
            New Project
          </button>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((project) => {
          const status = STATUS_CONFIG[project.status]
          const StatusIcon = status.icon
          const TypeIcon = project.typeIcon
          return (
            <Link
              key={project.id}
              href={`/dashboard/project/${project.id}`}
              className="group relative bg-surface rounded-xl overflow-hidden hover:bg-surface-container transition-all duration-300"
            >
              {/* Cover */}
              <div
                className="h-44 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(${project.hue}, 25%, 18%) 0%, hsl(${project.hue + 30}, 20%, 12%) 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1b1a] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`${status.bg} ${status.text} px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1`}>
                    <StatusIcon size={10} />
                    {status.label}
                  </span>
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-headline font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <TypeIcon size={12} className="text-on-surface-variant" />
                  <span className="text-xs text-on-surface-variant">{project.type}</span>
                  <span className="text-on-surface-variant">&middot;</span>
                  <span className="text-xs text-on-surface-variant">{project.date}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block">Photos</span>
                      <span className="font-label text-sm text-primary font-bold">{project.photos.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block">Size</span>
                      <span className="font-label text-sm text-on-surface">{project.storage}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {/* Create New */}
        <div className="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center py-16 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all cursor-pointer">
          <Plus size={32} className="mb-3" />
          <span className="font-headline font-bold text-sm">Create New Project</span>
        </div>
      </div>
    </div>
  )
}
