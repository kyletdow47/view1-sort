'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderPlus, Lock } from 'lucide-react'
import { Button } from '@/components/common'
import { ProjectCard } from './ProjectCard'
import { NewProjectModal } from './NewProjectModal'
import type { Project, UserTier } from '@/types/supabase'

export interface DashboardShellProps {
  projects: Project[]
  photoCounts: Record<string, number>
  workspaceId: string
  activeProjectCount: number
  tier: UserTier
}

export function DashboardShell({
  projects,
  photoCounts,
  workspaceId,
  activeProjectCount,
  tier,
}: DashboardShellProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)

  const FREE_TIER_LIMIT = 3
  const isAtLimit = tier === 'free' && activeProjectCount >= FREE_TIER_LIMIT

  return (
    <main className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="border-b border-view1-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Projects</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              {tier === 'free' && (
                <span className="ml-2 text-white/30">
                  ({activeProjectCount}/{FREE_TIER_LIMIT} free)
                </span>
              )}
            </p>
          </div>
          {isAtLimit ? (
            <Button
              onClick={() => router.push('/dashboard/billing')}
              variant="secondary"
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              Upgrade to Pro for unlimited projects
            </Button>
          ) : (
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <FolderPlus className="w-4 h-4" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Projects grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FolderPlus className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-white/60 font-medium mb-2">No projects yet</h2>
            <p className="text-white/30 text-sm mb-6 max-w-xs">
              Create your first project to start sorting and delivering photos.
            </p>
            {isAtLimit ? (
              <Button
                onClick={() => router.push('/dashboard/billing')}
                variant="secondary"
                className="gap-2"
              >
                <Lock className="w-4 h-4" />
                Upgrade to Pro for unlimited projects
              </Button>
            ) : (
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <FolderPlus className="w-4 h-4" />
                New Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                photoCount={photoCounts[project.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        workspaceId={workspaceId}
        activeProjectCount={activeProjectCount}
        tier={tier}
      />
    </main>
  )
}
