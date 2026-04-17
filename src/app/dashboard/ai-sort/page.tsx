'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera,
  CheckCircle2,
  Loader2,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Copy,
  FolderOpen,
  ImageIcon,
  Zap,
  Upload,
  FolderPlus,
  Images,
} from 'lucide-react'
import { analyzeFile, type CullResult } from '@/lib/ai/culling'
import { BUILT_IN_PRESETS, getPreset, getAllLabels, getCategoryForLabel as getPresetCategoryForLabel } from '@/lib/ai/presets'
import type { WorkerResponse } from '@/lib/ai/worker'
import { saveSortToProject, type SaveSortFile } from '@/lib/local-media/save-sort'
import { useVibeChat } from '@/hooks/useVibeChat'

/* ─── Types ─────────────────────────────────────────────────────────────── */

type Phase = 'upload' | 'cull' | 'context' | 'sort' | 'results'

interface SortableFile {
  file: File
  id: string
  cullResult?: CullResult
  hash?: string
  category?: string
  score?: number
  keep: boolean
  /** True when Claude Vision (Brain 2) refined the CLIP classification. */
  escalated?: boolean
  /** Claude's one-sentence description when escalated. */
  description?: string
}

interface SortCategories {
  blurry: boolean
  shaky: boolean
  duplicates: boolean
  eyesClosed: boolean
  lensFlare: boolean
  group: boolean
  others: boolean
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).substring(2, 11)
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result as string)
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

/* ─── Toggle Switch ─────────────────────────────────────────────────────── */

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
        on ? 'bg-indigo-500' : 'bg-white/15'
      }`}
    >
      <span
        className="absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200"
        style={{ left: on ? 'calc(100% - 22px)' : '2px' }}
      />
    </button>
  )
}

/* ─── Vibe Tag Input ────────────────────────────────────────────────────── */

function VibeTagInput({
  keywords,
  onChange,
  compact = false,
}: {
  keywords: string[]
  onChange: (v: string[]) => void
  compact?: boolean
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addKeyword = (raw: string) => {
    const trimmed = raw.replace(/,/g, '').trim()
    if (!trimmed || keywords.includes(trimmed)) return
    onChange([...keywords, trimmed])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword(input)
      setInput('')
    } else if (e.key === 'Backspace' && input === '' && keywords.length > 0) {
      onChange(keywords.slice(0, -1))
    }
  }

  const handleBlur = () => {
    if (input.trim()) {
      addKeyword(input)
      setInput('')
    }
  }

  return (
    <div
      className={`flex cursor-text flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 ${compact ? 'min-h-[38px]' : 'min-h-[80px] items-start'}`}
      onClick={() => inputRef.current?.focus()}
    >
      {keywords.map((kw) => (
        <span
          key={kw}
          className="flex items-center gap-1 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-medium text-indigo-200"
        >
          {kw}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(keywords.filter((k) => k !== kw)) }}
            className="leading-none text-indigo-300/60 transition-colors hover:text-indigo-200"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={keywords.length === 0 ? (compact ? 'Add keyword, press Enter…' : 'e.g. golden hour, moody, outdoor…') : ''}
        className="min-w-[140px] flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/30"
      />
    </div>
  )
}

/* ─── Sort Settings Panel ───────────────────────────────────────────────── */

function SortSettingsPanel({
  presetId,
  setPresetId,
  confidence,
  setConfidence,
  categories,
  setCategories,
  vibeKeywords,
  setVibeKeywords,
  onStartSorting,
  disabled,
  showStartButton = true,
}: {
  presetId: string
  setPresetId: (v: string) => void
  confidence: number
  setConfidence: (v: number) => void
  categories: SortCategories
  setCategories: (c: SortCategories) => void
  vibeKeywords: string[]
  setVibeKeywords: (v: string[]) => void
  onStartSorting: () => void
  disabled: boolean
  showStartButton?: boolean
}) {
  const catItems: { key: keyof SortCategories; label: string }[] = [
    { key: 'blurry', label: 'Blurry' },
    { key: 'shaky', label: 'Shaky' },
    { key: 'duplicates', label: 'Duplicates' },
    { key: 'eyesClosed', label: 'Eyes Closed' },
    { key: 'lensFlare', label: 'Lens Flare' },
    { key: 'group', label: 'Group' },
    { key: 'others', label: 'Others' },
  ]

  return (
    <div
      className="flex h-full w-full md:w-[320px] shrink-0 flex-col gap-5 overflow-y-auto rounded-3xl p-5"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-white">Sort Settings</span>
        <span className="text-[11px] font-medium text-white/40">{confidence}%</span>
      </div>

      <div className="h-px w-full bg-white/[0.12]" />

      {/* Preset Selector */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-white/80">Photography Type</span>
        <select
          value={presetId}
          onChange={(e) => setPresetId(e.target.value)}
          className="w-full rounded-xl bg-white/[0.08] border border-white/10 px-3 py-2 text-[13px] text-white outline-none focus:ring-1 focus:ring-indigo-400/50 appearance-none cursor-pointer"
        >
          {BUILT_IN_PRESETS.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#1a1a2e] text-white">
              {p.icon} {p.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-white/30">
          {BUILT_IN_PRESETS.find((p) => p.id === presetId)?.description ?? ''}
        </p>
      </div>

      <div className="h-px w-full bg-white/[0.12]" />

      {/* Confidence Threshold */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-white/80">Confidence Threshold</span>
          <span className="text-[12px] font-semibold text-white">{confidence}%</span>
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-white/20">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-indigo-400"
            style={{ width: `${confidence}%` }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow"
            style={{ left: `calc(${confidence}% - 7px)` }}
          />
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.12]" />

      {/* Sort Categories */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-medium text-white/80">Sort Categories</span>
        <div className="flex flex-col gap-2.5">
          {catItems.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[13px] text-white/70">{label}</span>
              <Toggle
                on={categories[key]}
                onChange={(v) => setCategories({ ...categories, [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-white/[0.12]" />

      {/* Vibe Keywords */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-white/80">Vibe Keywords</span>
        <VibeTagInput keywords={vibeKeywords} onChange={setVibeKeywords} compact />
      </div>

      {showStartButton && (
        <>
          {/* Spacer */}
          <div className="flex-1" />

          {/* Start Sorting */}
          <button
            onClick={onStartSorting}
            disabled={disabled}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}
          >
            <Zap className="h-4 w-4" />
            Start Sorting
          </button>
        </>
      )}
    </div>
  )
}

/* ─── Upload Zone ───────────────────────────────────────────────────────── */

// Matches standard image types AND all common RAW formats
const RAW_EXT = /\.(jpe?g|png|webp|gif|tiff?|raw|cr[23]|nef|nrw|arw|srf|sr2|dng|raf|orf|rw2|pef|ptx|srw|iiq|3fr|fff|mef|mrw|heic|heif)$/i
const FILE_ACCEPT = 'image/*,.raw,.cr2,.cr3,.nef,.nrw,.arw,.srf,.sr2,.dng,.raf,.orf,.rw2,.pef,.ptx,.srw,.iiq,.3fr,.fff,.mef,.mrw,.heic,.heif'

function UploadZone({
  files,
  onAddFiles,
  onRemoveFile,
}: {
  files: SortableFile[]
  onAddFiles: (files: File[]) => void
  onRemoveFile: (id: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileList = (fileList: FileList | null) => {
    if (!fileList) return
    const filtered = Array.from(fileList).filter(
      (f) => f.type.startsWith('image/') || RAW_EXT.test(f.name)
    )
    if (filtered.length > 0) onAddFiles(filtered)
  }

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = '' // reset so same files can be re-selected
      inputRef.current.click()
    }
  }

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept={FILE_ACCEPT}
      className="hidden"
      onChange={(e) => handleFileList(e.target.files)}
    />
  )

  /* ── Files selected: show thumbnail grid ── */
  if (files.length > 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        {/* Mini add-more bar */}
        <div
          onClick={openPicker}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileList(e.dataTransfer.files) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={`flex h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all ${
            dragging
              ? 'border-indigo-400/60 bg-indigo-400/10'
              : 'border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]'
          }`}
        >
          <Upload className="h-4 w-4 text-white/40" />
          <span className="text-[13px] text-white/50">
            {files.length} photo{files.length !== 1 ? 's' : ''} selected — drop or click to add more
          </span>
        </div>

        {/* Thumbnail grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {files.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-white/[0.06]"
              >
                <PhotoThumbnail
                  file={item.file}
                  alt={item.file.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-[8px] text-white/70">{item.file.name}</p>
                </div>
                <button
                  onClick={() => onRemoveFile(item.id)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[9px] text-white/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {hiddenInput}
      </div>
    )
  }

  /* ── Empty state: full drop zone ── */
  return (
    <div
      onClick={openPicker}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileList(e.dataTransfer.files) }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl transition-all"
      style={{
        background: dragging ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
        border: `2px ${dragging ? 'solid rgba(99,102,241,0.6)' : 'dashed rgba(255,255,255,0.2)'}`,
      }}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.08]">
        <Camera className={`h-9 w-9 transition-colors ${dragging ? 'text-indigo-300' : 'text-white/40'}`} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[17px] font-semibold text-white/90">Drop photos or folders here</p>
        <p className="text-[12px] text-white/40">
          JPEG, PNG, HEIC, TIFF, RAW (CR2, CR3, NEF, ARW, DNG, RAF…) — up to 500 photos
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); openPicker() }}
        className="flex items-center gap-2 rounded-xl px-7 py-3 text-[13px] font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
      >
        <Upload className="h-4 w-4" />
        Browse Files
      </button>

      <p className="text-[12px] text-white/30">or drag and drop from Finder</p>

      {hiddenInput}
    </div>
  )
}

/* ─── Progress Stepper ──────────────────────────────────────────────────── */

type StepperStage = 'idle' | 'uploading' | 'analyzing' | 'sorted'

function ProgressStepper({ stage }: { stage: StepperStage }) {
  const steps: { label: string; sub: string; id: StepperStage }[] = [
    { id: 'uploading', label: 'Uploading', sub: 'Receiving files' },
    { id: 'analyzing', label: 'Processing', sub: 'Running AI analysis' },
    { id: 'sorted', label: 'Sorted', sub: 'Ready to review' },
  ]

  const stageIndex = stage === 'idle' ? -1 : stage === 'uploading' ? 0 : stage === 'analyzing' ? 1 : 2

  return (
    <div
      className="flex h-[72px] shrink-0 items-center justify-center gap-0 px-10"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
              style={{
                background: i <= stageIndex ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${i <= stageIndex ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              {i < stageIndex ? (
                <CheckCircle2 className="h-4 w-4 text-indigo-300" />
              ) : i === stageIndex && stage !== 'sorted' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-300" />
              ) : i === stageIndex && stage === 'sorted' ? (
                <CheckCircle2 className="h-4 w-4 text-indigo-300" />
              ) : (
                <span className="text-[11px] font-bold text-white/30">{i + 1}</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-[13px] font-semibold ${i <= stageIndex ? 'text-white' : 'text-white/40'}`}>
                {step.label}
              </span>
              <span className={`text-[11px] ${i <= stageIndex ? 'text-white/50' : 'text-white/20'}`}>
                {step.sub}
              </span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-5 h-0.5 w-20 rounded-full bg-white/[0.12]" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ─── Cull Phase ────────────────────────────────────────────────────────── */

function CullPhase({
  files,
  onContinue,
}: {
  files: SortableFile[]
  onContinue: (updated: SortableFile[]) => void
}) {
  const [items, setItems] = useState<SortableFile[]>(files)
  const [analysing, setAnalysing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [lightboxItem, setLightboxItem] = useState<SortableFile | null>(null)
  const initialCount = useRef(files.length)

  useEffect(() => {
    let cancelled = false
    const hashMap = new Map<string, string>()

    async function run() {
      const updated = [...items]
      for (let i = 0; i < updated.length; i++) {
        if (cancelled) return
        const item = updated[i]
        try {
          const { result, hash } = await analyzeFile(item.file, item.id, hashMap)
          if (hash) hashMap.set(item.id, hash)
          updated[i] = { ...item, cullResult: result, hash, keep: result.flags.length === 0 }
        } catch { /* keep as-is */ }
        setProgress(Math.round(((i + 1) / updated.length) * 100))
        setItems([...updated])
      }
      if (!cancelled) setAnalysing(false)
    }

    void run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flagged = items.filter((f) => f.cullResult && f.cullResult.flags.length > 0)
  const removed = initialCount.current - items.length

  // X button: permanently removes photo from the batch
  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((f) => f.id !== id))

  // Remove all AI-flagged photos at once
  const removeAllFlagged = () =>
    setItems((prev) => prev.filter((f) => !f.cullResult || f.cullResult.flags.length === 0))

  return (
    <div className="flex-1 space-y-6 overflow-auto px-10 py-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Cull</h2>
          <p className="mt-1 text-sm text-white/60">
            {analysing
              ? `Analysing quality… ${progress}%`
              : `${flagged.length} issues found across ${items.length} photos`}
          </p>
        </div>
        <div className="flex gap-3">
          {!analysing && flagged.length > 0 && (
            <button
              onClick={removeAllFlagged}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              Remove All Flagged
            </button>
          )}
          <button
            onClick={() => onContinue(items.map((f) => ({ ...f, keep: true })))}
            disabled={analysing}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
          >
            Continue with {items.length} photos
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {analysing && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Stats */}
      {!analysing && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: initialCount.current, color: 'text-white' },
            { label: 'Flagged', value: flagged.length, color: 'text-amber-300' },
            { label: 'Keeping', value: items.length, color: 'text-emerald-300' },
            { label: 'Removed', value: removed, color: 'text-red-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => {
          const flags = item.cullResult?.flags ?? []
          const preview = item.cullResult?.preview

          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
                flags.length > 0 ? 'border-amber-400/40' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Thumbnail */}
              <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/[0.06]">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={item.file.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-white/20" />
                )}
              </div>

              {/* Hover overlay with filename */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[9px] text-white/70">{item.file.name}</p>
              </div>

              {/* Eye button → lightbox */}
              <button
                onClick={() => setLightboxItem(item)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110"
              >
                <Eye className="h-3.5 w-3.5 text-white/80" />
              </button>

              {/* X button → remove from batch */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute right-2 bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white/60 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-500/80 hover:text-white hover:scale-110"
              >
                ✕
              </button>

              {/* Quality flag badge */}
              {flags.length > 0 && (
                <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/80">
                  <AlertTriangle className="h-3 w-3 text-black" />
                </div>
              )}

              {/* Duplicate badge */}
              {flags.some((f) => f.type === 'duplicate') && (
                <div className="absolute bottom-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-400/80">
                  <Copy className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setLightboxItem(null)}
        >
          <div className="relative max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <PhotoThumbnail
              file={lightboxItem.file}
              alt={lightboxItem.file.name}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {/* Flag info */}
            {(lightboxItem.cullResult?.flags ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {lightboxItem.cullResult!.flags.map((f) => (
                  <span
                    key={f.type}
                    className="rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-0.5 text-[11px] font-medium text-amber-200"
                  >
                    {f.type}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-1.5 text-center text-[12px] text-white/50">{lightboxItem.file.name}</div>
            {/* Close + remove buttons */}
            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={() => setLightboxItem(null)}
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-[13px] font-semibold text-white/80 hover:bg-white/15 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { removeItem(lightboxItem.id); setLightboxItem(null) }}
                className="rounded-xl border border-red-400/30 bg-red-500/20 px-5 py-2 text-[13px] font-semibold text-red-200 hover:bg-red-500/30 transition-colors"
              >
                Remove Photo
              </button>
            </div>
            <button
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              onClick={() => setLightboxItem(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Context Phase ─────────────────────────────────────────────────────── */

function ContextPhase({
  fileCount,
  onContinue,
  onSkip,
}: {
  fileCount: number
  onContinue: (hints: string[]) => void
  onSkip: () => void
}) {
  const { messages, isThinking, send, draft } = useVibeChat({
    greeting: `You've got ${fileCount} photos ready to sort. Any vibe keywords, client notes, or things to watch for?`,
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length, isThinking])

  const userHints = messages.filter((m) => m.role === 'user').map((m) => m.text)

  const handleSend = () => {
    if (!input.trim() || isThinking) return
    void send(input)
    setInput('')
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-10 py-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Shoot context</h2>
        <p className="mt-1 text-sm text-white/60">
          Give the AI a sentence or two so it knows what matters for this
          shoot. Skip if you want a straight-up sort.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  m.role === 'user'
                    ? 'bg-violet-500/20 text-white'
                    : 'bg-white/[0.06] text-white/90'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.draft && (
                  <p className="mt-1 text-[11px] text-violet-200">
                    Style: {m.draft.styleParams.mood} · {m.draft.styleParams.lighting} · {m.draft.styleParams.colorTemp}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading context…
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              rows={2}
              placeholder="e.g. Outdoor wedding, golden-hour portraits, emphasize the bride's bouquet."
              className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
              disabled={isThinking}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3">
        <button
          onClick={onSkip}
          className="text-sm text-white/60 underline-offset-4 hover:text-white/90 hover:underline"
        >
          Skip — sort without context
        </button>
        <button
          onClick={() => onContinue(userHints)}
          disabled={userHints.length === 0 && !draft}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          style={{
            background:
              'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
          }}
        >
          <Zap className="h-4 w-4" />
          Start sorting with context
        </button>
      </div>
    </div>
  )
}

/* ─── Sort Phase (restyled) ─────────────────────────────────────────────── */

function SortPhase({
  files,
  presetId,
  onDone,
  escalateBelow = 0.22,
  userHints = [],
}: {
  files: SortableFile[]
  presetId: string
  onDone: (sorted: SortableFile[]) => void
  /** CLIP confidence below this triggers Claude Vision (Brain 2) escalation. */
  escalateBelow?: number
  /** Free-form photographer notes from the context phase — used as a hint
   *  on Brain-2 vision escalation prompts. */
  userHints?: string[]
}) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<'loading' | 'classifying' | 'done' | 'error'>('loading')
  const [modelProgress, setModelProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [escalationCount, setEscalationCount] = useState(0)
  const workerRef = useRef<Worker | null>(null)
  const hasDoneRef = useRef(false)

  const handleRetry = useCallback(() => {
    // Terminate any hanging worker before restarting
    workerRef.current?.terminate()
    workerRef.current = null
    hasDoneRef.current = false
    setStage('loading')
    setModelProgress(0)
    setProgress(0)
    setErrorMsg(null)
    setRetryCount((n) => n + 1)
  }, [])

  useEffect(() => {
    const kept = files.filter((f) => f.keep)
    if (kept.length === 0) { onDone(files); return }

    hasDoneRef.current = false
    const results = new Map<string, string>()
    const escalated = new Map<string, { category: string; description?: string }>()
    let classified = 0

    const escalateToVision = async (
      item: SortableFile,
      clipCategory: string,
    ): Promise<void> => {
      try {
        const dataUrl = await readAsDataURL(item.file)
        const categoriesList = activePreset?.categories.map((c) => c.name) ?? []
        const res = await fetch('/api/ai/vision-classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoUrl: dataUrl,
            preset: presetId,
            categories: categoriesList,
            userHints: userHints.length > 0 ? userHints : undefined,
          }),
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          category: string
          confidence: number
          description?: string
          source: string
        }
        if (data.source === 'degraded' || !data.category) return
        results.set(item.id, data.category)
        escalated.set(item.id, {
          category: data.category,
          description: data.description,
        })
        setEscalationCount((n) => n + 1)
      } catch {
        // Silent failure — keep the CLIP category
        void clipCategory
      }
    }

    let worker: Worker
    try {
      // Use the static public worker — bypasses Turbopack/Webpack entirely.
      // It imports @xenova/transformers from CDN as an ES module, which also
      // resolves WASM binaries from an absolute CDN URL (no blob-URL path issue).
      worker = new Worker('/ai-worker.js', { type: 'module' })
    } catch (err) {
      setStage('error')
      setErrorMsg(`Could not start AI worker: ${err instanceof Error ? err.message : String(err)}`)
      return
    }
    workerRef.current = worker

    // Surface uncaught worker errors (script load failure, CORS issues, etc.)
    worker.onerror = (e) => {
      clearTimeout(modelLoadTimeout)
      setStage('error')
      const raw = e.message ?? ''
      setErrorMsg(
        raw.includes('Failed to fetch') || raw.includes('NetworkError')
          ? 'Could not download the AI model. Check your internet connection and try again.'
          : raw || 'Worker failed — open browser console for details'
      )
    }

    // Safety timeout: if no loadProgress fires within 90 s the worker silently
    // crashed before it could start the model download.
    const modelLoadTimeout = setTimeout(() => {
      if (!hasDoneRef.current) {
        setStage('error')
        setErrorMsg(
          'AI model is taking too long to start. Make sure you have a stable internet connection — the model downloads once (~330 MB) and is cached after that. Chrome works best.'
        )
        worker.terminate()
      }
    }, 90_000)

    // Resolve preset labels once before classification starts so the CLIP model
    // scores against niche-specific vocabulary (travel, wedding, etc.) rather
    // than the hardcoded 25-label wedding-only fallback in labels.ts.
    const activePreset = getPreset(presetId)
    const presetLabels = activePreset ? getAllLabels(activePreset) : undefined

    worker.onmessage = async (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data
      if (msg.type === 'loadProgress') { clearTimeout(modelLoadTimeout); setModelProgress(msg.progress); return }
      if (msg.type === 'error' && !msg.photoId) {
        // Global worker error (e.g. model load failed)
        setStage('error')
        setErrorMsg(msg.message)
        return
      }
      if (msg.type === 'modelLoaded') {
        clearTimeout(modelLoadTimeout)
        setStage('classifying')
        for (const item of kept) {
          try {
            const dataUrl = await readAsDataURL(item.file)
            // Pass preset labels so the worker uses the right vocabulary
            worker.postMessage({ type: 'classify', photoId: item.id, imageData: dataUrl, labels: presetLabels, topK: 3 })
          } catch { classified++ }
        }
        return
      }
      if (msg.type === 'result') {
        const top = msg.results[0]
        let needsEscalation = false
        let clipCategory = ''
        if (top) {
          // top.label is now one of the preset's own label strings, so
          // getPresetCategoryForLabel will correctly map it to a category name.
          let category = top.category as string
          if (activePreset) {
            const mapped = getPresetCategoryForLabel(activePreset, top.label)
            if (mapped) category = mapped
          }
          results.set(msg.photoId, category)
          clipCategory = category
          if (escalateBelow > 0 && top.score < escalateBelow) {
            needsEscalation = true
          }
        }

        const item = kept.find((f) => f.id === msg.photoId)
        if (needsEscalation && item) {
          void escalateToVision(item, clipCategory).finally(() => {
            classified++
            setProgress(Math.round((classified / kept.length) * 100))
            maybeFinish()
          })
        } else {
          classified++
          setProgress(Math.round((classified / kept.length) * 100))
          maybeFinish()
        }
      }
      if (msg.type === 'error') {
        classified++
        setProgress(Math.round((classified / kept.length) * 100))
        maybeFinish()
      }
    }

    function maybeFinish() {
      if (classified >= kept.length && !hasDoneRef.current) {
        hasDoneRef.current = true
        setStage('done')
        const updated = files.map((f) => {
          const next: SortableFile = {
            ...f,
            category: results.get(f.id) ?? f.category ?? 'Uncategorized',
          }
          const esc = escalated.get(f.id)
          if (esc) {
            next.escalated = true
            next.description = esc.description
          }
          return next
        })
        setTimeout(() => onDone(updated), 800)
      }
    }

    worker.postMessage({ type: 'loadModel' })
    return () => { clearTimeout(modelLoadTimeout); worker.terminate() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount])

  const displayProgress = stage === 'loading' ? modelProgress : progress

  // ── Error state ──────────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">AI Sort failed</h2>
          <p className="mt-2 max-w-sm text-[13px] text-white/60">{errorMsg ?? 'An unexpected error occurred.'}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
          >
            <Zap className="h-4 w-4" />
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-white/80 hover:bg-white/15 transition-colors"
          >
            Reload page
          </button>
        </div>
        <p className="max-w-xs text-center text-[11px] text-white/25">
          First-time setup downloads the AI model (~330 MB). Requires a stable connection and a modern browser — Chrome works best.
        </p>
      </div>
    )
  }

  // ── Normal sort progress ─────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-10 py-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">AI Sorting</h2>
        <p className="mt-1 text-sm text-white/60">
          {stage === 'loading'
            ? modelProgress === 0
              ? 'Starting AI model…'
              : `Downloading AI model… ${modelProgress}%`
            : stage === 'classifying'
              ? `Classifying photos… ${progress}% (${Math.round(progress * files.filter(f => f.keep).length / 100)} / ${files.filter(f => f.keep).length})`
              : 'Complete!'}
        </p>
      </div>

      {/* First-run notice — shown only while model is downloading */}
      {stage === 'loading' && (
        <div
          className="flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 text-[12px] text-amber-200/80"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong className="font-semibold">First-time setup:</strong> The AI model (~330 MB) is downloading to your browser cache. This only happens once and takes 1–3 minutes on a fast connection.
          </span>
        </div>
      )}

      <div className="relative h-40 w-40">
        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/10" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-4 animate-pulse rounded-full bg-indigo-400/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          {stage === 'done' ? <CheckCircle2 className="h-14 w-14 text-indigo-300" /> : <Sparkles className="h-14 w-14 text-indigo-300" />}
        </div>
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle
            cx="80" cy="80" r="72" fill="none" stroke="#818CF8" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 72}`}
            strokeDashoffset={`${2 * Math.PI * 72 * (1 - displayProgress / 100)}`}
            className="transition-all duration-300"
          />
        </svg>
      </div>

      <p className="max-w-xs text-center text-[10px] text-white/30">
        Running entirely in your browser — no photos leave your device.
      </p>

      {escalationCount > 0 && (
        <p className="flex items-center gap-1.5 text-[11px] text-violet-300/80">
          <Sparkles className="h-3 w-3" />
          {escalationCount} {escalationCount === 1 ? 'photo' : 'photos'} refined with Claude Vision
        </p>
      )}
    </div>
  )
}

/* ─── Photo Thumbnail (object-URL based, cleans up on unmount) ───────────── */

function PhotoThumbnail({
  file,
  alt,
  className,
  onClick,
}: {
  file: File
  alt: string
  className?: string
  onClick?: () => void
}) {
  const [src, setSrc] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    setImgError(false)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // RAW files (and any format the browser can't decode) fall back to a labeled tile
  if (!src || imgError) {
    const ext = file.name.split('.').pop()?.toUpperCase() ?? '?'
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-white/[0.06] ${className ?? ''}`}
        onClick={onClick}
      >
        <ImageIcon className="h-5 w-5 text-white/25" />
        <span className="text-[8px] font-semibold tracking-wide text-white/30">{ext}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setImgError(true)}
    />
  )
}

/* ─── Results Phase ─────────────────────────────────────────────────────── */

type SaveMode = 'project' | 'gallery'

function ResultsPhase({ files, onReSort }: { files: SortableFile[]; onReSort: () => void }) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<SortableFile | null>(null)
  const [saveMode, setSaveMode] = useState<SaveMode | null>(null)
  const [projectName, setProjectName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const router = useRouter()

  const sorted = files.filter((f) => f.keep && f.category)
  const byCategory = sorted.reduce<Record<string, SortableFile[]>>((acc, f) => {
    const cat = f.category ?? 'Uncategorized'
    acc[cat] = [...(acc[cat] ?? []), f]
    return acc
  }, {})
  const categories = Object.keys(byCategory).sort()
  const rejected = files.filter((f) => !f.keep)

  const downloadCategory = (cat: string) => {
    const catFiles = byCategory[cat]
    catFiles.forEach((item) => {
      const url = URL.createObjectURL(item.file)
      const a = document.createElement('a')
      a.href = url
      a.download = item.file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
  }

  const openSaveModal = (mode: SaveMode) => {
    setSaveMode(mode)
    setProjectName('')
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!saveMode) return
    if (!projectName.trim()) {
      setSaveError('Give this project a name')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const saveFiles: SaveSortFile[] = sorted.map((f) => ({
        file: f.file,
        category: f.category ?? null,
        score: f.score,
      }))
      const { project } = await saveSortToProject(projectName, saveFiles)
      const destination =
        saveMode === 'gallery'
          ? `/dashboard/project/${project.id}/gallery-builder`
          : `/dashboard/project/${project.id}`
      router.push(destination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save sort'
      setSaveError(message)
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 overflow-auto px-10 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <CheckCircle2 className="h-7 w-7 text-emerald-300" />
            Sort complete
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {sorted.length} photos sorted into {categories.length} categories
            {rejected.length > 0 && `, ${rejected.length} rejected`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openSaveModal('project')}
            disabled={sorted.length === 0}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FolderPlus className="h-4 w-4" />
            Save to New Project
          </button>
          <button
            onClick={() => openSaveModal('gallery')}
            disabled={sorted.length === 0}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                sorted.length === 0
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
            }}
          >
            <Images className="h-4 w-4" />
            Create Gallery
          </button>
          <button
            onClick={onReSort}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
          >
            Re-sort
          </button>
        </div>
      </div>

      {/* Category grid */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catFiles = byCategory[cat]
          const isExpanded = expandedCat === cat

          return (
            <div
              key={cat}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
              style={{ transition: 'all 0.2s ease' }}
            >
              {/* Category header row */}
              <div
                className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
                onClick={() => setExpandedCat(isExpanded ? null : cat)}
              >
                <div className="flex items-center gap-3">
                  {/* Preview strip — first 3 photos */}
                  <div className="flex -space-x-2">
                    {catFiles.slice(0, 3).map((item) => (
                      <div key={item.id} className="h-9 w-9 overflow-hidden rounded-lg border-2 border-white/10">
                        <PhotoThumbnail file={item.file} alt={item.file.name} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{cat}</p>
                    <p className="text-[11px] text-white/40">{catFiles.length} photo{catFiles.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadCategory(cat) }}
                    className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/10 transition-colors"
                  >
                    Download
                  </button>
                  <ChevronRight
                    className={`h-4 w-4 text-white/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {/* Expanded photo grid */}
              {isExpanded && (
                <div className="grid grid-cols-4 gap-2 border-t border-white/[0.06] px-4 pb-4 pt-3 sm:grid-cols-6 lg:grid-cols-8">
                  {catFiles.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-white/[0.06]"
                      onClick={() => setLightbox(item)}
                    >
                      <PhotoThumbnail
                        file={item.file}
                        alt={item.file.name}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      {item.escalated && (
                        <div
                          title="Refined with Claude Vision"
                          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/90 text-white shadow-md"
                        >
                          <Sparkles className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate text-[8px] text-white/70">{item.file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <PhotoThumbnail
              file={lightbox.file}
              alt={lightbox.file.name}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-2 text-center text-[12px] text-white/50">{lightbox.file.name} · {lightbox.category}</div>
            <button
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Save-to-project modal */}
      {saveMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => !saving && setSaveMode(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold text-white">
              {saveMode === 'gallery' ? 'Create Gallery' : 'Save to New Project'}
            </h3>
            <p className="mb-4 text-sm text-white/60">
              {sorted.length} photos will be saved to your device (no cloud storage used yet).
            </p>
            <label className="mb-2 block text-[12px] font-medium uppercase tracking-wide text-white/50">
              Project name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !saving) handleSave()
              }}
              autoFocus
              disabled={saving}
              placeholder="Johnson Wedding"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
            />
            {saveError && (
              <p className="mt-2 text-[12px] text-rose-300">{saveError}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSaveMode(null)}
                disabled={saving}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/70 hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                style={{
                  background:
                    'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : saveMode === 'gallery' ? (
                  'Create Gallery'
                ) : (
                  'Save Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Workspace Empty State ─────────────────────────────────────────────── */

function WorkspaceEmptyState({ onGoToUpload }: { onGoToUpload: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-6">
      <div
        className="flex flex-col items-center gap-5 rounded-3xl px-12 py-12 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.06]">
          <Sparkles className="h-9 w-9 text-white/30" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-white">No sort results yet</h3>
          <p className="max-w-sm text-[13px] text-white/50">
            Upload photos and run AI Sort to see your photos organized into categories here.
          </p>
        </div>
        <button
          onClick={onGoToUpload}
          className="flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
        >
          <Upload className="h-4 w-4" />
          Go to Upload
        </button>
      </div>
    </div>
  )
}

/* ─── Preferences Tab ────────────────────────────────────────────────────── */

function PreferencesTab({
  presetId,
  setPresetId,
  confidence,
  setConfidence,
  categories,
  setCategories,
  vibeKeywords,
  setVibeKeywords,
}: {
  presetId: string
  setPresetId: (v: string) => void
  confidence: number
  setConfidence: (v: number) => void
  categories: SortCategories
  setCategories: (c: SortCategories) => void
  vibeKeywords: string[]
  setVibeKeywords: (v: string[]) => void
}) {
  const catItems: { key: keyof SortCategories; label: string; desc: string }[] = [
    { key: 'blurry', label: 'Blurry / Out of focus', desc: 'Flag photos that fail sharpness analysis' },
    { key: 'shaky', label: 'Shaky / Motion blur', desc: 'Flag photos with camera shake artifacts' },
    { key: 'duplicates', label: 'Near-duplicates', desc: 'Flag photos that are too similar to another' },
    { key: 'eyesClosed', label: 'Eyes closed', desc: 'Flag photos where subjects have closed eyes' },
    { key: 'lensFlare', label: 'Lens flare', desc: 'Flag photos with distracting lens flare' },
    { key: 'group', label: 'Group shots', desc: 'Separate group photos into their own category' },
    { key: 'others', label: 'Other issues', desc: 'Flag photos with unexpected technical problems' },
  ]

  return (
    <div className="flex-1 overflow-auto px-10 py-6">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Photography Type */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <h3 className="mb-4 text-[15px] font-semibold text-white">Photography Type</h3>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="w-full rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3 text-[14px] text-white outline-none focus:ring-1 focus:ring-indigo-400/50 appearance-none cursor-pointer"
          >
            {BUILT_IN_PRESETS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#1a1a2e] text-white">
                {p.icon} {p.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[12px] text-white/40">
            {BUILT_IN_PRESETS.find((p) => p.id === presetId)?.description ?? ''}
          </p>
        </div>

        {/* Confidence Threshold */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-white">Confidence Threshold</h3>
            <span className="text-[20px] font-bold text-indigo-300">{confidence}%</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-white/20">
            <div className="absolute left-0 top-0 h-full rounded-full bg-indigo-400" style={{ width: `${confidence}%` }} />
            <input
              type="range"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `calc(${confidence}% - 8px)` }} />
          </div>
          <p className="mt-3 text-[12px] text-white/40">
            Photos classified below this confidence will be moved to the Needs Review column.
          </p>
        </div>

        {/* Smart Cull Flags */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <h3 className="mb-4 text-[15px] font-semibold text-white">Smart Cull — Quality Flags</h3>
          <div className="space-y-3">
            {catItems.map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-white/90">{label}</span>
                  <span className="text-[11px] text-white/40">{desc}</span>
                </div>
                <Toggle on={categories[key]} onChange={(v) => setCategories({ ...categories, [key]: v })} />
              </div>
            ))}
          </div>
        </div>

        {/* Vibe Keywords */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <h3 className="mb-1 text-[15px] font-semibold text-white">Vibe Keywords</h3>
          <p className="mb-4 text-[12px] text-white/40">
            Type a keyword and press <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px]">Enter</kbd> to add it. These refine how the AI categorizes your photos.
          </p>
          <VibeTagInput keywords={vibeKeywords} onChange={setVibeKeywords} />
        </div>

      </div>
    </div>
  )
}

/* ─── Vibe Presets Tab ───────────────────────────────────────────────────── */

function VibePresetsTab({
  presetId,
  setPresetId,
}: {
  presetId: string
  setPresetId: (v: string) => void
}) {
  return (
    <div className="flex-1 overflow-auto px-10 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Photography Presets</h2>
        <p className="mt-1 text-[13px] text-white/50">
          Each preset uses a tailored vocabulary so the AI recognises the categories that matter most for your niche.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BUILT_IN_PRESETS.map((preset) => {
          const isActive = preset.id === presetId
          return (
            <button
              key={preset.id}
              onClick={() => setPresetId(preset.id)}
              className="flex flex-col gap-3 rounded-2xl p-5 text-left transition-all"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.15) 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: isActive ? '0 0 0 1px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{preset.icon}</span>
                {isActive && (
                  <span className="flex items-center gap-1 rounded-full bg-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </span>
                )}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">{preset.name}</p>
                <p className="mt-0.5 text-[12px] text-white/50">{preset.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preset.categories.slice(0, 4).map((cat) => (
                  <span
                    key={cat.name}
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white/70"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    {cat.name}
                  </span>
                ))}
                {preset.categories.length > 4 && (
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] text-white/30" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    +{preset.categories.length - 4} more
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

type ActiveTab = 'upload' | 'workspace' | 'preferences' | 'vibePresets'

export default function AISortPage() {
  const [phase, setPhase] = useState<Phase>('upload')
  const [files, setFiles] = useState<SortableFile[]>([])
  const [presetId, setPresetId] = useState('wedding')
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload')
  const [confidence, setConfidence] = useState(70)
  const [categories, setCategories] = useState<SortCategories>({
    blurry: true, shaky: false, duplicates: true, eyesClosed: true, lensFlare: false, group: false, others: true,
  })
  const [vibeKeywords, setVibeKeywords] = useState<string[]>([])
  const [contextHints, setContextHints] = useState<string[]>([])

  const handleAddFiles = useCallback((raw: File[]) => {
    const sortable: SortableFile[] = raw.map((f) => ({ file: f, id: uid(), keep: true }))
    setFiles((prev) => [...prev, ...sortable])
  }, [])

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleStartSorting = useCallback(() => {
    if (files.length === 0) return
    setActiveTab('upload')
    setPhase('cull')
  }, [files.length])



  const handleCullDone = useCallback((updated: SortableFile[]) => {
    setFiles(updated)
    setPhase('context')
  }, [])

  const handleContextDone = useCallback((hints: string[]) => {
    setContextHints(hints)
    setPhase('sort')
  }, [])

  const handleContextSkip = useCallback(() => {
    setContextHints([])
    setPhase('sort')
  }, [])

  const handleSortDone = useCallback((sorted: SortableFile[]) => {
    setFiles(sorted)
    setPhase('results')
    setActiveTab('workspace') // Auto-switch to Workspace when sort is done
  }, [])

  const handleReSort = useCallback(() => {
    // Keep files but go back to upload phase so user can re-run
    setPhase('upload')
    setActiveTab('upload')
  }, [])

  const stepperStage: StepperStage =
    phase === 'upload' ? 'idle'
    : phase === 'cull' ? 'uploading'
    : phase === 'context' ? 'uploading'
    : phase === 'sort' ? 'analyzing'
    : 'sorted'

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'vibePresets', label: 'Vibe Presets' },
  ]

  const tabBar = (
    <div
      className="flex w-fit items-center gap-1 rounded-2xl p-1"
      style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors ${activeTab === tab.id ? 'bg-white/[0.15] font-semibold text-white' : 'text-white/60 hover:text-white/80'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  const isUploadPhase = activeTab === 'upload' && phase === 'upload'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {isUploadPhase ? (
        /* Upload phase: right panel spans full height alongside header + content */
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left column: header + upload area + start button + stepper */}
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <div className="flex flex-col gap-4 px-10 pb-0 pt-6">
              <h1 className="text-[28px] font-bold text-white">AI Sort</h1>
              {tabBar}
            </div>
            <div className="flex flex-1 min-h-0 overflow-hidden px-10 py-6">
              <UploadZone files={files} onAddFiles={handleAddFiles} onRemoveFile={handleRemoveFile} />
            </div>

            {/* Start Sorting button */}
            <div className="shrink-0 px-10 pb-2 pt-2">
              <button
                onClick={handleStartSorting}
                disabled={files.length === 0}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                }}
              >
                <Zap className="h-4 w-4" />
                Start Sorting
              </button>
            </div>

            <ProgressStepper stage={stepperStage} />
          </div>

          {/* Right column: Sort Settings Panel — full height from top */}
          <div className="shrink-0 overflow-y-auto py-6 pr-10">
            <SortSettingsPanel
              presetId={presetId}
              setPresetId={setPresetId}
              confidence={confidence}
              setConfidence={setConfidence}
              categories={categories}
              setCategories={setCategories}
              vibeKeywords={vibeKeywords}
              setVibeKeywords={setVibeKeywords}
              onStartSorting={handleStartSorting}
              disabled={files.length === 0}
              showStartButton={false}
            />
          </div>
        </div>
      ) : (
        /* Non-upload tabs: standard header */
        <div className="flex flex-col gap-4 px-10 pb-0 pt-6">
          <h1 className="text-[28px] font-bold text-white">AI Sort</h1>
          {tabBar}
        </div>
      )}

      {/* ── Upload tab (non-upload phases) ─────────────────────────────────── */}
      {activeTab === 'upload' && phase === 'cull' && (
        <CullPhase files={files} onContinue={handleCullDone} />
      )}

      {activeTab === 'upload' && phase === 'context' && (
        <ContextPhase
          fileCount={files.filter((f) => f.keep).length}
          onContinue={handleContextDone}
          onSkip={handleContextSkip}
        />
      )}

      {activeTab === 'upload' && phase === 'sort' && (
        <SortPhase
          files={files}
          presetId={presetId}
          userHints={contextHints}
          onDone={handleSortDone}
        />
      )}

      {activeTab === 'upload' && phase === 'results' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 py-6">
          <CheckCircle2 className="h-12 w-12 text-emerald-300" />
          <p className="text-lg font-semibold text-white">Sort complete!</p>
          <button
            onClick={() => setActiveTab('workspace')}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
          >
            View Results in Workspace
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Workspace tab ──────────────────────────────────────────────────── */}
      {activeTab === 'workspace' && (
        phase === 'results'
          ? <ResultsPhase files={files} onReSort={handleReSort} />
          : <WorkspaceEmptyState onGoToUpload={() => setActiveTab('upload')} />
      )}

      {/* ── Preferences tab ────────────────────────────────────────────────── */}
      {activeTab === 'preferences' && (
        <PreferencesTab
          presetId={presetId}
          setPresetId={setPresetId}
          confidence={confidence}
          setConfidence={setConfidence}
          categories={categories}
          setCategories={setCategories}
          vibeKeywords={vibeKeywords}
          setVibeKeywords={setVibeKeywords}
        />
      )}

      {/* ── Vibe Presets tab ───────────────────────────────────────────────── */}
      {activeTab === 'vibePresets' && (
        <VibePresetsTab presetId={presetId} setPresetId={setPresetId} />
      )}

      {/* Bottom stepper — only show during non-upload active sort phases (upload phase has it inline) */}
      {!isUploadPhase && (activeTab === 'upload' || phase !== 'upload') && (
        <ProgressStepper stage={stepperStage} />
      )}
    </div>
  )
}
