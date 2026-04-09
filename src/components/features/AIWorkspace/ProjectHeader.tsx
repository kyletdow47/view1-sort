'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Sparkles,
  Globe,
} from 'lucide-react'
import type { ProjectStatus } from '@/types/ai-workspace'
import { STATUS_CONFIG } from '@/types/ai-workspace'

interface ProjectHeaderProps {
  projectName: string
  status: ProjectStatus
  clientName?: string
  photoCount: number
  onRunAI: () => void
  onPublish: () => void
  isAIRunning?: boolean
  runAILabel?: string
}

export function ProjectHeader({
  projectName,
  status,
  photoCount,
  onRunAI,
  onPublish,
  isAIRunning = false,
  runAILabel,
}: ProjectHeaderProps) {
  const router = useRouter()
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.processing

  return (
    <div className="flex items-center justify-between px-10 h-14 border-b border-white/[0.06] bg-white/[0.03]">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="text-white/50 hover:text-white/80 transition-colors"
          aria-label="Back to projects"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-white/50 font-sans text-sm">Projects</span>
        <span className="text-white/25 font-sans text-sm">/</span>
        <span className="text-white/[0.93] font-sans text-sm font-semibold">
          {projectName}
        </span>
      </div>

      {/* Center: Status Badge */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: `${statusConfig.color}18`,
            color: statusConfig.color,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusConfig.color }}
          />
          {statusConfig.label}
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRunAI}
          disabled={isAIRunning}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-semibold text-white
            bg-gradient-to-b from-amber-500 to-amber-600
            shadow-[0_2px_8px_rgba(245,158,11,0.25)]
            hover:from-amber-400 hover:to-amber-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {runAILabel ?? (isAIRunning ? 'Running...' : 'Run AI Sort')}
        </button>
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-medium text-white/80
            bg-white/[0.04] border border-white/[0.19]
            hover:bg-white/[0.08] hover:text-white
            transition-all"
        >
          <Globe className="w-4 h-4" />
          Publish Gallery
        </button>
      </div>
    </div>
  )
}
