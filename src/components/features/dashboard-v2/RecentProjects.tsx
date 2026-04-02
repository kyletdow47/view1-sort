'use client'

import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GlassPanel } from './GlassPanel'
import type { Project } from '@/types/supabase'

const MOCK_PROJECTS = [
  { name: 'Wedding Shoot', client: 'Client', photos: 248, color: 'bg-teal-400/40', id: '' },
  { name: 'Real Estate Tour', client: 'Client', photos: 132, color: 'bg-orange-400/40', id: '' },
  { name: 'Travel Portfolio', client: 'Client', photos: 89, color: 'bg-yellow-300/40', id: '' },
]

const PRESET_COLORS = [
  'bg-teal-400/40',
  'bg-orange-400/40',
  'bg-yellow-300/40',
  'bg-violet-400/40',
  'bg-blue-400/40',
]

interface RecentProjectsProps {
  projects?: Project[]
  photoCounts?: Record<string, number>
}

export function RecentProjects({ projects = [], photoCounts = {} }: RecentProjectsProps) {
  const router = useRouter()

  const displayProjects = projects.length > 0
    ? projects.slice(0, 3).map((p, i) => ({
        id: p.id,
        name: p.name,
        client: p.preset ?? 'Project',
        photos: photoCounts[p.id] ?? 0,
        color: PRESET_COLORS[i % PRESET_COLORS.length],
      }))
    : MOCK_PROJECTS

  return (
    <GlassPanel className="flex h-full flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-headline text-[14px] font-semibold text-white">
          Recent Projects
        </span>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="text-white/[0.67] transition-colors hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Project Cards */}
      <div className="flex flex-1 flex-col gap-2">
        {displayProjects.map((project, i) => (
          <div
            key={project.id || i}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.12] px-3 py-2.5"
          >
            {/* Preset indicator */}
            <div className="flex flex-col items-center gap-0.5">
              <div className={`h-8 w-8 rounded-full ${project.color}`} />
              <span className="w-12 text-center text-[9px] text-white/[0.53]">
                {project.client}
              </span>
            </div>

            {/* Project Name */}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <span className="truncate text-[13px] font-bold text-white">
                {project.name}
              </span>
            </div>

            {/* Photo Count Badge */}
            <div className="rounded bg-white/[0.06] px-2.5 py-1">
              <span className="text-[13px] font-bold text-white/[0.87]">
                {project.photos}
              </span>
            </div>

            {/* Arrow Button */}
            <button
              onClick={() => project.id ? router.push(`/dashboard/project/${project.id}`) : undefined}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 transition-transform hover:scale-105"
            >
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
