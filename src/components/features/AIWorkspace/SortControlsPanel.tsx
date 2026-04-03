'use client'

import { useCallback, useState } from 'react'
import {
  SlidersHorizontal,
  RefreshCw,
  Copy,
  Eye,
  ArrowUpDown,
  Loader2,
  GripVertical,
  Plus,
  X,
} from 'lucide-react'

import type {
  AISortSettings,
  SortAlgorithm,
  CategoryMapping,
} from '@/types/ai-sort-workspace'
import { SORT_ALGORITHMS } from '@/types/ai-sort-workspace'

interface SortControlsPanelProps {
  settings: AISortSettings
  onSettingsChange: (settings: AISortSettings) => void
  onBatchReclassify: () => void
  isReclassifying: boolean
  totalPhotos: number
  needsReviewCount: number
}

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`
        relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
        ${enabled ? 'bg-indigo-500' : 'bg-white/15'}
      `}
    >
      <span
        className={`
          inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200
          ${enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}
        `}
      />
    </button>
  )
}

export function SortControlsPanel({
  settings,
  onSettingsChange,
  onBatchReclassify,
  isReclassifying,
  totalPhotos,
  needsReviewCount,
}: SortControlsPanelProps) {
  const [newCategoryName, setNewCategoryName] = useState('')

  const updateSetting = useCallback(
    <K extends keyof AISortSettings>(key: K, value: AISortSettings[K]) => {
      onSettingsChange({ ...settings, [key]: value })
    },
    [settings, onSettingsChange],
  )

  const handleThresholdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSetting('confidenceThreshold', Number(e.target.value))
    },
    [updateSetting],
  )

  const handleAlgorithmChange = useCallback(
    (algo: SortAlgorithm) => {
      updateSetting('sortAlgorithm', algo)
    },
    [updateSetting],
  )

  const handleToggleCategory = useCallback(
    (id: string) => {
      const updated = settings.categoryMappings.map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m,
      )
      updateSetting('categoryMappings', updated)
    },
    [settings.categoryMappings, updateSetting],
  )

  const handleRemoveCategory = useCallback(
    (id: string) => {
      const updated = settings.categoryMappings.filter((m) => m.id !== id)
      updateSetting('categoryMappings', updated)
    },
    [settings.categoryMappings, updateSetting],
  )

  const handleAddCategory = useCallback(() => {
    if (!newCategoryName.trim()) return
    const newMapping: CategoryMapping = {
      id: `custom-${Date.now()}`,
      aiLabel: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      displayCategory: newCategoryName.trim(),
      enabled: true,
    }
    updateSetting('categoryMappings', [...settings.categoryMappings, newMapping])
    setNewCategoryName('')
  }, [newCategoryName, settings.categoryMappings, updateSetting])

  const thresholdPercent = settings.confidenceThreshold

  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-3xl w-[280px] shrink-0 overflow-y-auto
        backdrop-blur-[40px]
        border border-white/[0.15]"
      style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span className="text-white font-sans text-[15px] font-bold">Sort Controls</span>
        </div>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Confidence Threshold */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-white/80 font-mono text-xs font-semibold uppercase tracking-wider">
            AI Confidence
          </span>
          <span className="text-white font-mono text-sm font-semibold">
            {thresholdPercent}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={thresholdPercent}
          onChange={handleThresholdChange}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-white/10 accent-indigo-500
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-indigo-400
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-indigo-300
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-indigo-500/30"
        />
        <p className="text-white/40 text-[11px] leading-relaxed">
          Photos below {thresholdPercent}% go to &quot;Needs Review&quot; ({needsReviewCount} photos)
        </p>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Sort Algorithm */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-white/50" />
          <span className="text-white/80 font-mono text-xs font-semibold uppercase tracking-wider">
            Sort Order
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {SORT_ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              onClick={() => handleAlgorithmChange(algo.id)}
              className={`
                flex flex-col gap-0.5 px-3 py-2 rounded-lg text-left transition-all
                ${settings.sortAlgorithm === algo.id
                  ? 'bg-indigo-500/20 border border-indigo-400/40'
                  : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]'
                }
              `}
            >
              <span
                className={`text-xs font-semibold ${
                  settings.sortAlgorithm === algo.id ? 'text-indigo-300' : 'text-white/70'
                }`}
              >
                {algo.label}
              </span>
              <span className="text-white/30 text-[10px] leading-snug">
                {algo.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Detection Toggles */}
      <div className="flex flex-col gap-3">
        <span className="text-white/80 font-mono text-xs font-semibold uppercase tracking-wider">
          Detection
        </span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-amber-400/70" />
            <span className="text-white/70 text-xs">Duplicates</span>
          </div>
          <ToggleSwitch
            enabled={settings.duplicateDetection}
            onToggle={() => updateSetting('duplicateDetection', !settings.duplicateDetection)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-red-400/70" />
            <span className="text-white/70 text-xs">Blur</span>
          </div>
          <ToggleSwitch
            enabled={settings.blurDetection}
            onToggle={() => updateSetting('blurDetection', !settings.blurDetection)}
          />
        </div>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Category Mapping */}
      <div className="flex flex-col gap-2.5">
        <span className="text-white/80 font-mono text-xs font-semibold uppercase tracking-wider">
          Categories
        </span>
        <div className="flex flex-col gap-1.5">
          {settings.categoryMappings.map((mapping) => (
            <div
              key={mapping.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
            >
              <GripVertical className="w-3 h-3 text-white/20 shrink-0" />
              <span
                className={`text-xs flex-1 ${mapping.enabled ? 'text-white/80' : 'text-white/30 line-through'}`}
              >
                {mapping.displayCategory}
              </span>
              <ToggleSwitch
                enabled={mapping.enabled}
                onToggle={() => handleToggleCategory(mapping.id)}
              />
              {mapping.id.startsWith('custom-') && (
                <button
                  onClick={() => handleRemoveCategory(mapping.id)}
                  className="text-white/30 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom Category */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="Add category..."
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]
              text-xs text-white/70 placeholder-white/25 outline-none
              focus:border-indigo-400/40 focus:bg-white/[0.06] transition-all"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim()}
            className="p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10]
              text-white/40 hover:text-indigo-400 hover:border-indigo-400/40
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* Batch Re-Classify Button */}
      <button
        onClick={onBatchReclassify}
        disabled={isReclassifying}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
          text-sm font-semibold
          bg-indigo-500/20 border border-indigo-400/30
          text-indigo-300 hover:bg-indigo-500/30
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all"
      >
        {isReclassifying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Re-classifying {totalPhotos} photos...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Re-Classify All ({totalPhotos})
          </>
        )}
      </button>
    </div>
  )
}
