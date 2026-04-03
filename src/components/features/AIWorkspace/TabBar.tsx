'use client'

import {
  Sparkles,
  Eye,
  ListChecks,
  Image,
  User,
  FileText,
} from 'lucide-react'
import type { WorkspaceTab } from '@/types/ai-workspace'
import { WORKSPACE_TABS } from '@/types/ai-workspace'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  eye: Eye,
  'list-checks': ListChecks,
  image: Image,
  user: User,
  'file-text': FileText,
}

interface TabBarProps {
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
  photoCount: number
}

export function TabBar({ activeTab, onTabChange, photoCount }: TabBarProps) {
  return (
    <div className="flex items-center justify-between px-10 py-3 w-full">
      <div
        className="flex items-center gap-1 p-1 rounded-[20px]
          bg-white/[0.08] border border-white/20
          backdrop-blur-md"
      >
        {WORKSPACE_TABS.map((tab) => {
          const Icon = ICON_MAP[tab.icon]
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-white/[0.13] text-white'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/[0.05]'
                }
              `}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </button>
          )
        })}
      </div>
      <span className="text-white/50 text-sm font-medium font-mono">
        {photoCount.toLocaleString()} photos
      </span>
    </div>
  )
}
