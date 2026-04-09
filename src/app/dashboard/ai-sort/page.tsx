'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { analyzeFile, type CullResult } from '@/lib/ai/culling'
import { BUILT_IN_PRESETS, getPreset, getAllLabels, getCategoryForLabel as getPresetCategoryForLabel } from '@/lib/ai/presets'
import type { WorkerResponse } from '@/lib/ai/worker'

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
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? 'bg-violet-500' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
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
}: {
  presetId: string
  setPresetId: (v: string) => void
  confidence: number
  setConfidence: (v: number) => void
  categories: SortCategories
  setCategories: (c: SortCategories) => void
  vibeKeywords: string
  setVibeKeywords: (v: string) => void
  onStartSorting: () => void
  disabled: boolean
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
      className="flex w-full md:w-[320px] shrink-0 flex-col gap-5 rounded-3xl p-5"
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
        <input
          type="text"
          value={vibeKeywords}
          onChange={(e) => setVibeKeywords(e.target.value)}
          placeholder="e.g. golden hour, moody, outdoor..."
          className="w-full rounded-xl bg-white/[0.08] px-3 py-2 text-[13px] text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-indigo-400/50 border border-white/10"
        />
      </div>

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
    </div>
  )
}

/* ─── Upload Zone ───────────────────────────────────────────────────────── */

function UploadZone({
  onFiles,
  fileCount,
}: {
  onFiles: (files: File[]) => void
  fileCount: number
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    onFiles(Array.from(files).filter((f) => /\.(jpe?g|png|webp|tiff?|raw|cr2|nef|arw|dng|heic|heif)$/i.test(f.name)))
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl transition-all"
      style={{
        background: dragging ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
        border: `2px ${dragging ? 'solid rgba(99,102,241,0.6)' : 'dashed rgba(255,255,255,0.2)'}`,
      }}
    >
      {/* Camera icon wrap */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.08]">
        <Camera className={`h-9 w-9 transition-colors ${dragging ? 'text-indigo-300' : 'text-white/40'}`} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[17px] font-semibold text-white/90">
          {fileCount > 0 ? `${fileCount} photo${fileCount > 1 ? 's' : ''} selected` : 'Drop photos or folders here'}
        </p>
        <p className="text-[12px] text-white/40">
          Supports JPEG, PNG, HEIC, RAW, TIFF — up to 500 photos per batch
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        className="flex items-center gap-2 rounded-xl px-7 py-3 text-[13px] font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
      >
        <Upload className="h-4 w-4" />
        Browse Files
      </button>

      <p className="text-[12px] text-white/30">or drag and drop from Finder</p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.tif,.tiff,.raw,.cr2,.nef,.arw,.dng,.heic,.heif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
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

/* ─── Cull Phase (restyled) ─────────────────────────────────────────────── */

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
  const kept = items.filter((f) => f.keep)

  const toggle = (id: string) => setItems((prev) => prev.map((f) => f.id === id ? { ...f, keep: !f.keep } : f))
  const rejectAll = () => setItems((prev) => prev.map((f) => f.cullResult && f.cullResult.flags.length > 0 ? { ...f, keep: false } : f))

  return (
    <div className="flex-1 space-y-6 overflow-auto px-10 py-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Cull</h2>
          <p className="mt-1 text-sm text-white/60">
            {analysing ? `Analysing quality… ${progress}%` : `${flagged.length} issues found across ${items.length} photos`}
          </p>
        </div>
        <div className="flex gap-3">
          {!analysing && flagged.length > 0 && (
            <button onClick={rejectAll} className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-sm hover:bg-white/15 transition-colors">
              Reject All Flagged
            </button>
          )}
          <button
            onClick={() => onContinue(items)}
            disabled={analysing}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
          >
            Continue with {kept.length} photos
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {analysing && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {!analysing && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: items.length, color: 'text-white' },
            { label: 'Flagged', value: flagged.length, color: 'text-amber-300' },
            { label: 'Keeping', value: kept.length, color: 'text-emerald-300' },
            { label: 'Rejecting', value: items.length - kept.length, color: 'text-red-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => {
          const flags = item.cullResult?.flags ?? []
          const preview = item.cullResult?.preview

          return (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${item.keep ? flags.length > 0 ? 'border-amber-400/40' : 'border-emerald-400/20' : 'border-red-400/40 opacity-50'}`}
            >
              <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/[0.06]">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={item.file.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-white/20" />
                )}
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[9px] text-white/70">{item.file.name}</p>
              </div>
              <button
                onClick={() => toggle(item.id)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-transform hover:scale-110"
              >
                {item.keep ? <Eye className="h-3.5 w-3.5 text-emerald-300" /> : <EyeOff className="h-3.5 w-3.5 text-red-300" />}
              </button>
              {flags.length > 0 && item.keep && (
                <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/80">
                  <AlertTriangle className="h-3 w-3 text-black" />
                </div>
              )}
              {flags.some((f) => f.type === 'duplicate') && (
                <div className="absolute bottom-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-400/80">
                  <Copy className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Sort Phase (restyled) ─────────────────────────────────────────────── */

function SortPhase({
  files,
  presetId,
  onDone,
}: {
  files: SortableFile[]
  presetId: string
  onDone: (sorted: SortableFile[]) => void
}) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<'loading' | 'classifying' | 'done'>('loading')
  const [modelProgress, setModelProgress] = useState(0)
  const workerRef = useRef<Worker | null>(null)
  const hasDoneRef = useRef(false)

  useEffect(() => {
    const kept = files.filter((f) => f.keep)
    if (kept.length === 0) { onDone(files); return }

    const results = new Map<string, string>()
    let classified = 0

    const worker = new Worker(new URL('@/lib/ai/worker.ts', import.meta.url))
    workerRef.current = worker

    // Resolve preset labels once before classification starts so the CLIP model
    // scores against niche-specific vocabulary (travel, wedding, etc.) rather
    // than the hardcoded 25-label wedding-only fallback in labels.ts.
    const activePreset = getPreset(presetId)
    const presetLabels = activePreset ? getAllLabels(activePreset) : undefined

    worker.onmessage = async (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data
      if (msg.type === 'loadProgress') { setModelProgress(msg.progress); return }
      if (msg.type === 'modelLoaded') {
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
        if (top) {
          // top.label is now one of the preset's own label strings, so
          // getPresetCategoryForLabel will correctly map it to a category name.
          let category = top.category as string
          if (activePreset) {
            const mapped = getPresetCategoryForLabel(activePreset, top.label)
            if (mapped) category = mapped
          }
          results.set(msg.photoId, category)
        }
        classified++
        setProgress(Math.round((classified / kept.length) * 100))
        if (classified >= kept.length && !hasDoneRef.current) {
          hasDoneRef.current = true
          setStage('done')
          const updated = files.map((f) => ({ ...f, category: results.get(f.id) ?? f.category }))
          setTimeout(() => onDone(updated), 800)
        }
      }
      if (msg.type === 'error') {
        classified++
        setProgress(Math.round((classified / kept.length) * 100))
        if (classified >= kept.length && !hasDoneRef.current) {
          hasDoneRef.current = true
          setStage('done')
          setTimeout(() => onDone(files.map((f) => ({ ...f, category: results.get(f.id) ?? 'Uncategorized' }))), 800)
        }
      }
    }

    worker.postMessage({ type: 'loadModel' })
    return () => { worker.terminate() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayProgress = stage === 'loading' ? modelProgress : progress

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-10 py-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">AI Sorting</h2>
        <p className="mt-1 text-sm text-white/60">
          {stage === 'loading' ? `Loading AI model… ${modelProgress}%` : stage === 'classifying' ? `Classifying photos… ${progress}%` : 'Complete!'}
        </p>
      </div>

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
    </div>
  )
}

/* ─── Results Phase (restyled) ──────────────────────────────────────────── */

function ResultsPhase({ files }: { files: SortableFile[] }) {
  const sorted = files.filter((f) => f.keep && f.category)
  const byCategory = sorted.reduce<Record<string, SortableFile[]>>((acc, f) => {
    const cat = f.category ?? 'Uncategorized'
    acc[cat] = [...(acc[cat] ?? []), f]
    return acc
  }, {})
  const categories = Object.keys(byCategory).sort()
  const rejected = files.filter((f) => !f.keep)

  return (
    <div className="flex-1 space-y-6 overflow-auto px-10 py-6">
      <div className="flex items-end justify-between">
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
        <Link
          href="/dashboard/gallery"
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)' }}
        >
          View in Gallery
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const catFiles = byCategory[cat]
          const preview = catFiles[0]?.cullResult?.preview
          return (
            <div key={cat} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] transition-all hover:border-white/20">
              <div className="relative aspect-video overflow-hidden bg-white/[0.04]">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={cat} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                  <p className="truncate text-sm font-semibold text-white">{cat}</p>
                  <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white/70">{catFiles.length}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
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
  vibeKeywords: string
  setVibeKeywords: (v: string) => void
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
            Describe the mood or style of this session to refine AI categorization.
          </p>
          <textarea
            value={vibeKeywords}
            onChange={(e) => setVibeKeywords(e.target.value)}
            placeholder="e.g. golden hour, moody, outdoor ceremony, candid moments, film-inspired…"
            rows={3}
            className="w-full rounded-xl bg-white/[0.08] px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-indigo-400/50 border border-white/10 resize-none"
          />
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
  const [vibeKeywords, setVibeKeywords] = useState('')

  const handleFiles = useCallback((raw: File[]) => {
    const sortable: SortableFile[] = raw.map((f) => ({ file: f, id: uid(), keep: true }))
    setFiles(sortable)
  }, [])

  const handleStartSorting = useCallback(() => {
    if (files.length === 0) return
    setActiveTab('upload')
    setPhase('cull')
  }, [files.length])

  const handleCullDone = useCallback((updated: SortableFile[]) => {
    setFiles(updated)
    setPhase('sort')
  }, [])

  const handleSortDone = useCallback((sorted: SortableFile[]) => {
    setFiles(sorted)
    setPhase('results')
    setActiveTab('workspace') // Auto-switch to Workspace when sort is done
  }, [])

  const stepperStage: StepperStage =
    phase === 'upload' ? 'idle'
    : phase === 'cull' ? 'uploading'
    : phase === 'sort' ? 'analyzing'
    : 'sorted'

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'vibePresets', label: 'Vibe Presets' },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Page Header */}
      <div className="flex flex-col gap-4 px-10 pb-0 pt-6">
        <h1 className="text-[28px] font-bold text-white">AI Sort</h1>

        {/* Sub-tab bar */}
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
      </div>

      {/* ── Upload tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'upload' && phase === 'upload' && (
        <div className="flex flex-col md:flex-row flex-1 gap-6 overflow-hidden px-10 py-6">
          <UploadZone onFiles={handleFiles} fileCount={files.length} />
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
          />
        </div>
      )}

      {activeTab === 'upload' && phase === 'cull' && (
        <CullPhase files={files} onContinue={handleCullDone} />
      )}

      {activeTab === 'upload' && phase === 'sort' && (
        <SortPhase files={files} presetId={presetId} onDone={handleSortDone} />
      )}

      {/* If sort finishes and user is still on upload tab, show a nudge */}
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
          ? <ResultsPhase files={files} />
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

      {/* Bottom stepper — only show during active sort phases */}
      {(activeTab === 'upload' || phase !== 'upload') && (
        <ProgressStepper stage={stepperStage} />
      )}
    </div>
  )
}
