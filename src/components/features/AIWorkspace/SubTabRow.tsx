'use client'

import { CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import type { AISortSubTab } from '@/types/ai-workspace'
import { AI_SORT_SUB_TABS } from '@/types/ai-workspace'

interface SubTabRowProps {
  activeSubTab: AISortSubTab
  onSubTabChange: (tab: AISortSubTab) => void
  onApproveAll: () => void
  onReSort: () => void
}

export function SubTabRow({
  activeSubTab,
  onSubTabChange,
  onApproveAll,
  onReSort,
}: SubTabRowProps) {
  return (
    <div className="flex items-center justify-between w-full gap-3">
      {/* Back to Upload — shown when not already on upload tab */}
      {activeSubTab !== 'upload' && (
        <button
          type="button"
          onClick={() => onSubTabChange('upload')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium
            text-white/40 hover:text-white/80 hover:bg-white/[0.06]
            transition-all duration-150 flex-shrink-0"
          title="Back to upload"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Upload
        </button>
      )}

      {/* Sub-Tab Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.07]">
        {AI_SORT_SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onSubTabChange(tab.id)}
              className={`
                px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200
                ${isActive
                  ? 'bg-white/[0.13] text-white'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/[0.05]'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onApproveAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-medium
            text-white/80 bg-white/[0.08] border border-white/[0.19]
            hover:bg-white/[0.12] hover:text-white transition-all"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve All
        </button>
        <button
          onClick={onReSort}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-medium
            text-white/80 bg-white/[0.04] border border-white/[0.19]
            hover:bg-white/[0.10] hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-Sort
        </button>
      </div>
    </div>
  )
}
