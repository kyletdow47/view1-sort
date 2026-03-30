'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Tag,
  GripVertical,
  CheckCircle2,
  Copy,
  Loader2,
} from 'lucide-react'
import {
  BUILT_IN_PRESETS,
  getAllPresets,
  saveCustomPreset,
  getCustomPresets,
  type SortPreset,
  type SortCategory,
} from '@/lib/ai/presets'

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).substring(2, 11)
}

function emptyPreset(): SortPreset {
  return {
    id: uid(),
    name: '',
    niche: '',
    description: '',
    icon: '📸',
    builtIn: false,
    rejectCriteria: ['blurry', 'duplicate'],
    categories: [],
  }
}

const EMOJI_OPTIONS = ['📸', '🎭', '🌿', '🏆', '💼', '🎨', '🎶', '🏋️', '🌊', '🔥', '✨', '🦋']

/* ─── Category Editor ───────────────────────────────────────────────────── */

function CategoryEditor({
  category,
  onChange,
  onRemove,
}: {
  category: SortCategory
  onChange: (updated: SortCategory) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [labelInput, setLabelInput] = useState('')

  const addLabel = () => {
    const val = labelInput.trim()
    if (!val || category.labels.includes(val)) return
    onChange({ ...category, labels: [...category.labels, val] })
    setLabelInput('')
  }

  const removeLabel = (label: string) => {
    onChange({ ...category, labels: category.labels.filter((l) => l !== label) })
  }

  return (
    <div className="border border-outline-variant/20 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-container">
        <GripVertical className="w-4 h-4 text-on-surface-variant/30 cursor-grab" />
        <input
          value={category.name}
          onChange={(e) => onChange({ ...category, name: e.target.value })}
          placeholder="Category name"
          className="flex-1 bg-transparent text-sm font-headline font-bold text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none"
        />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-on-surface-variant/40">{category.labels.length} labels</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-surface-container-high rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant/50" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant/50" />}
          </button>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-on-surface-variant/30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-surface-container/50 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/40">
            Zero-shot labels — what should match this category?
          </p>

          {/* Labels */}
          <div className="flex flex-wrap gap-2">
            {category.labels.map((label) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg group"
              >
                {label}
                <button
                  onClick={() => removeLabel(label)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add label input */}
          <div className="flex gap-2">
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLabel()}
              placeholder='e.g. "bride walking down aisle"'
              className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={addLabel}
              className="px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-mono font-bold hover:bg-primary/20 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Description */}
          <input
            value={category.description}
            onChange={(e) => onChange({ ...category, description: e.target.value })}
            placeholder="Short description (optional)"
            className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none"
          />
        </div>
      )}
    </div>
  )
}

/* ─── Preset Card ───────────────────────────────────────────────────────── */

function PresetCard({
  preset,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  preset: SortPreset
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
}) {
  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant/10 overflow-hidden hover:border-outline-variant/30 transition-all group">
      <div className="p-4 flex items-start gap-3">
        <span className="text-3xl mt-0.5">{preset.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-on-surface truncate">{preset.name}</h3>
            {preset.builtIn && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-mono font-bold uppercase tracking-widest rounded">
                Built-in
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-0.5 line-clamp-2">{preset.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {preset.categories.slice(0, 4).map((c) => (
              <span
                key={c.name}
                className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[9px] font-mono rounded-md"
              >
                {c.name}
              </span>
            ))}
            {preset.categories.length > 4 && (
              <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant/50 text-[9px] font-mono rounded-md">
                +{preset.categories.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-2 border-t border-outline-variant/10 pt-3">
        <span className="text-[10px] font-mono text-on-surface-variant/40">
          {preset.categories.length} categories · {preset.categories.reduce((n, c) => n + c.labels.length, 0)} labels
        </span>
        <div className="flex-1" />
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant/40 hover:text-on-surface-variant"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
        {onEdit && !preset.builtIn && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant/40 hover:text-on-surface-variant"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && !preset.builtIn && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-on-surface-variant/40 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Preset Builder ────────────────────────────────────────────────────── */

function PresetBuilder({
  initial,
  onSave,
  onCancel,
}: {
  initial: SortPreset
  onSave: (preset: SortPreset) => void
  onCancel: () => void
}) {
  const [preset, setPreset] = useState<SortPreset>(initial)
  const [saved, setSaved] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [rejectInput, setRejectInput] = useState('')

  const updateCategory = (idx: number, updated: SortCategory) => {
    setPreset((p) => {
      const cats = [...p.categories]
      cats[idx] = updated
      return { ...p, categories: cats }
    })
  }

  const removeCategory = (idx: number) => {
    setPreset((p) => ({
      ...p,
      categories: p.categories.filter((_, i) => i !== idx),
    }))
  }

  const addCategory = () => {
    setPreset((p) => ({
      ...p,
      categories: [
        ...p.categories,
        { name: '', description: '', labels: [], priority: p.categories.length + 1 },
      ],
    }))
  }

  const addReject = () => {
    const val = rejectInput.trim()
    if (!val || preset.rejectCriteria.includes(val)) return
    setPreset((p) => ({ ...p, rejectCriteria: [...p.rejectCriteria, val] }))
    setRejectInput('')
  }

  const save = () => {
    if (!preset.name.trim() || preset.categories.length === 0) return
    saveCustomPreset(preset)
    setSaved(true)
    setTimeout(() => {
      onSave(preset)
    }, 600)
  }

  const isValid = preset.name.trim().length > 0 && preset.categories.length > 0

  return (
    <div className="bg-surface-container-low rounded-3xl border border-outline-variant/20 overflow-hidden">
      {/* Builder header */}
      <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-3xl hover:scale-110 transition-transform"
            >
              {preset.icon}
            </button>
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 z-10 bg-surface-container border border-outline-variant/20 rounded-2xl p-3 grid grid-cols-6 gap-2 shadow-xl">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { setPreset((p) => ({ ...p, icon: e })); setShowEmojiPicker(false) }}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <input
              value={preset.name}
              onChange={(e) => setPreset((p) => ({ ...p, name: e.target.value }))}
              placeholder="Preset name"
              className="bg-transparent text-xl font-headline font-bold text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none border-b-2 border-transparent focus:border-primary/40 transition-colors w-64"
            />
            <input
              value={preset.description}
              onChange={(e) => setPreset((p) => ({ ...p, description: e.target.value }))}
              placeholder="Short description"
              className="block bg-transparent text-sm text-on-surface-variant/60 placeholder:text-on-surface-variant/30 focus:outline-none mt-1 w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!isValid}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-headline font-bold flex items-center gap-2 disabled:opacity-40 transition-opacity"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save preset'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
              Categories <span className="text-on-surface-variant/30">({preset.categories.length})</span>
            </p>
            <button
              onClick={addCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-mono font-bold hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add category
            </button>
          </div>

          {preset.categories.length === 0 ? (
            <div className="border-2 border-dashed border-outline-variant/20 rounded-2xl p-8 text-center">
              <Tag className="w-8 h-8 text-on-surface-variant/20 mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant/40 font-mono">
                No categories yet. Add one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {preset.categories.map((cat, idx) => (
                <CategoryEditor
                  key={idx}
                  category={cat}
                  onChange={(updated) => updateCategory(idx, updated)}
                  onRemove={() => removeCategory(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reject criteria */}
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
            Auto-reject criteria
          </p>
          <div className="flex flex-wrap gap-2">
            {preset.rejectCriteria.map((rc) => (
              <span
                key={rc}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-mono rounded-lg group"
              >
                {rc}
                <button
                  onClick={() => setPreset((p) => ({ ...p, rejectCriteria: p.rejectCriteria.filter((r) => r !== rc) }))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={rejectInput}
              onChange={(e) => setRejectInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addReject()}
              placeholder='e.g. "blurry" or "closed eyes"'
              className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={addReject}
              className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-mono font-bold hover:bg-red-500/20 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── AI Suggest ─────────────────────────────────────────────────────────── */

function AISuggestPanel({
  onApply,
}: {
  onApply: (preset: SortPreset) => void
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggested, setSuggested] = useState<SortPreset | null>(null)

  // Keyword → preset mapping (simulated AI suggestion without LLM API call)
  const suggest = () => {
    if (!input.trim()) return
    setLoading(true)
    setSuggested(null)

    setTimeout(() => {
      const lower = input.toLowerCase()
      let base = BUILT_IN_PRESETS[0]

      if (lower.includes('real estate') || lower.includes('property') || lower.includes('home'))
        base = BUILT_IN_PRESETS.find((p) => p.id === 'real-estate') ?? base
      else if (lower.includes('fashion') || lower.includes('portrait') || lower.includes('beauty'))
        base = BUILT_IN_PRESETS.find((p) => p.id === 'fashion') ?? base
      else if (lower.includes('travel') || lower.includes('lifestyle') || lower.includes('adventure'))
        base = BUILT_IN_PRESETS.find((p) => p.id === 'travel') ?? base
      else if (lower.includes('event') || lower.includes('conference') || lower.includes('concert'))
        base = BUILT_IN_PRESETS.find((p) => p.id === 'event') ?? base
      else if (lower.includes('commercial') || lower.includes('product') || lower.includes('brand'))
        base = BUILT_IN_PRESETS.find((p) => p.id === 'commercial') ?? base

      const newPreset: SortPreset = {
        ...base,
        id: uid(),
        name: `${input.trim()} (AI Generated)`,
        builtIn: false,
      }
      setSuggested(newPreset)
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="bg-surface-container-low rounded-3xl border border-outline-variant/20 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-on-surface">Vibe Preset Builder</h3>
          <p className="text-xs text-on-surface-variant/60">Describe your photography style and we&apos;ll suggest a preset.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && suggest()}
          placeholder='e.g. "boudoir portraits", "skateboard photography", "food & restaurant"'
          className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={suggest}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm flex items-center gap-2 disabled:opacity-40 transition-opacity min-w-[100px] justify-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Suggest</>}
        </button>
      </div>

      {suggested && (
        <div className="border border-primary/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{suggested.icon}</span>
              <div>
                <p className="font-headline font-bold text-on-surface text-sm">{suggested.name}</p>
                <p className="text-xs text-on-surface-variant/60">{suggested.categories.length} categories suggested</p>
              </div>
            </div>
            <button
              onClick={() => onApply(suggested)}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-headline font-bold hover:bg-primary/90 transition-colors"
            >
              Use this preset
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggested.categories.map((c) => (
              <span key={c.name} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded-lg">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function PresetsPage() {
  const [customPresets, setCustomPresets] = useState<SortPreset[]>([])
  const [editing, setEditing] = useState<SortPreset | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)

  useEffect(() => {
    setCustomPresets(getCustomPresets())
  }, [])

  const handleSave = (preset: SortPreset) => {
    setCustomPresets(getCustomPresets())
    setEditing(null)
    setShowBuilder(false)
  }

  const handleDelete = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id)
    localStorage.setItem('v1-presets', JSON.stringify(updated))
    setCustomPresets(updated)
  }

  const handleDuplicate = (preset: SortPreset) => {
    const duped: SortPreset = {
      ...preset,
      id: uid(),
      name: `${preset.name} (copy)`,
      builtIn: false,
    }
    setEditing(duped)
    setShowBuilder(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApplySuggested = (preset: SortPreset) => {
    setEditing(preset)
    setShowBuilder(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <Tag className="w-8 h-8 text-primary" />
            Sort Presets
          </h1>
          <p className="text-on-surface-variant/60 font-body mt-1 text-sm">
            Manage your built-in and custom sort presets. Each preset defines categories and zero-shot labels for the AI classifier.
          </p>
        </div>

        {!showBuilder && (
          <button
            onClick={() => { setEditing(emptyPreset()); setShowBuilder(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New preset
          </button>
        )}
      </div>

      {/* Builder panel */}
      {showBuilder && editing && (
        <PresetBuilder
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowBuilder(false); setEditing(null) }}
        />
      )}

      {/* AI Suggest */}
      {!showBuilder && (
        <AISuggestPanel onApply={handleApplySuggested} />
      )}

      {/* Custom presets */}
      {customPresets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-on-surface-variant/50">
            Your presets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customPresets.map((p) => (
              <PresetCard
                key={p.id}
                preset={p}
                onEdit={() => { setEditing(p); setShowBuilder(true) }}
                onDelete={() => handleDelete(p.id)}
                onDuplicate={() => handleDuplicate(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Built-in presets */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-widest text-on-surface-variant/50">
          Built-in presets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILT_IN_PRESETS.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              onDuplicate={() => handleDuplicate(p)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
