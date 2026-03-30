'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Copy,
  ZoomIn,
  Tag,
  Settings2,
  FolderOpen,
  ImageIcon,
} from 'lucide-react'
import { analyzeFile, type CullResult } from '@/lib/ai/culling'
import { getAllPresets, type SortPreset } from '@/lib/ai/presets'
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

/* ─── Sub-components ────────────────────────────────────────────────────── */

function StepIndicator({ phase }: { phase: Phase }) {
  const steps: { id: Phase; label: string }[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'cull', label: 'Cull' },
    { id: 'context', label: 'Context' },
    { id: 'sort', label: 'Sort' },
    { id: 'results', label: 'Results' },
  ]
  const idx = steps.findIndex((s) => s.id === phase)

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all',
                i < idx
                  ? 'bg-primary text-on-primary'
                  : i === idx
                    ? 'bg-primary/20 text-primary ring-2 ring-primary/40'
                    : 'bg-surface-container text-on-surface-variant/40',
              ].join(' ')}
            >
              {i < idx ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={[
                'text-[10px] font-mono uppercase tracking-widest',
                i === idx ? 'text-primary font-bold' : 'text-on-surface-variant/40',
              ].join(' ')}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={['flex-1 h-px mx-2 mb-4 transition-colors', i < idx ? 'bg-primary/40' : 'bg-outline-variant/20'].join(' ')} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function CullFlagBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    blurry: { label: 'Blurry', color: 'bg-amber-500/20 text-amber-400' },
    duplicate: { label: 'Dupe', color: 'bg-violet-500/20 text-violet-400' },
    overexposed: { label: 'Over', color: 'bg-orange-500/20 text-orange-400' },
    underexposed: { label: 'Under', color: 'bg-sky-500/20 text-sky-400' },
  }
  const cfg = map[type] ?? { label: type, color: 'bg-surface-container text-on-surface-variant' }
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

/* ─── Phase: Upload ─────────────────────────────────────────────────────── */

function UploadPhase({
  onFiles,
}: {
  onFiles: (files: File[]) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    onFiles(Array.from(files).filter((f) => /\.(jpe?g|png|webp|raw|cr2|nef|arw|dng)$/i.test(f.name)))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Step 1 of 4</p>
        <h2 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic">
          Upload your shoot
        </h2>
        <p className="text-on-surface-variant/60 max-w-md">
          Drop your RAW or JPEG files. We&apos;ll analyse quality and sort everything automatically.
        </p>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={[
          'w-full max-w-2xl border-2 border-dashed rounded-3xl p-16 flex flex-col items-center gap-5 cursor-pointer transition-all',
          dragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5',
        ].join(' ')}
      >
        <div className={['w-20 h-20 rounded-3xl flex items-center justify-center transition-all', dragging ? 'bg-primary/20' : 'bg-surface-container-high'].join(' ')}>
          <UploadCloud className={['w-10 h-10 transition-colors', dragging ? 'text-primary' : 'text-on-surface-variant/40'].join(' ')} />
        </div>
        <div className="text-center">
          <p className="text-xl font-headline font-bold text-on-surface">
            {dragging ? 'Drop to upload' : 'Drop files or click to browse'}
          </p>
          <p className="text-sm text-on-surface-variant/50 mt-1">JPEG, PNG, RAW (CR2, NEF, ARW, DNG)</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.raw,.cr2,.nef,.arw,.dng"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  )
}

/* ─── Phase: Cull ───────────────────────────────────────────────────────── */

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
          updated[i] = {
            ...item,
            cullResult: result,
            hash,
            keep: result.flags.length === 0,
          }
        } catch {
          // keep as-is
        }
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

  const toggle = (id: string) => {
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, keep: !f.keep } : f)))
  }

  const rejectAll = () => {
    setItems((prev) =>
      prev.map((f) =>
        f.cullResult && f.cullResult.flags.length > 0 ? { ...f, keep: false } : f,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold mb-1">Step 2 of 4</p>
          <h2 className="text-3xl font-headline font-extrabold tracking-tighter text-on-surface italic">
            Smart Cull
          </h2>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            {analysing
              ? `Analysing quality… ${progress}%`
              : `${flagged.length} issues found across ${items.length} photos`}
          </p>
        </div>
        <div className="flex gap-3">
          {!analysing && flagged.length > 0 && (
            <button
              onClick={rejectAll}
              className="px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Reject All Flagged
            </button>
          )}
          <button
            onClick={() => onContinue(items)}
            disabled={analysing}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-headline font-bold flex items-center gap-2 disabled:opacity-40 transition-opacity"
          >
            Continue with {kept.length} photos
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar while analysing */}
      {analysing && (
        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Stats */}
      {!analysing && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: items.length, color: 'text-on-surface' },
            { label: 'Flagged', value: flagged.length, color: 'text-amber-400' },
            { label: 'Keeping', value: kept.length, color: 'text-emerald-400' },
            { label: 'Rejecting', value: items.length - kept.length, color: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container rounded-2xl p-4 text-center">
              <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const flags = item.cullResult?.flags ?? []
          const preview = item.cullResult?.preview

          return (
            <div
              key={item.id}
              className={[
                'relative rounded-2xl overflow-hidden border-2 transition-all group',
                item.keep
                  ? flags.length > 0
                    ? 'border-amber-500/40'
                    : 'border-emerald-500/20'
                  : 'border-red-500/40 opacity-50',
              ].join(' ')}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-surface-container-high flex items-center justify-center overflow-hidden">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={item.file.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-on-surface-variant/20" />
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1">
                <p className="text-[9px] font-mono text-white/70 truncate">{item.file.name}</p>
                <div className="flex flex-wrap gap-1">
                  {flags.map((f, i) => (
                    <CullFlagBadge key={i} type={f.type} />
                  ))}
                </div>
              </div>

              {/* Toggle keep/reject */}
              <button
                onClick={() => toggle(item.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all hover:scale-110"
                title={item.keep ? 'Click to reject' : 'Click to keep'}
              >
                {item.keep ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-red-400" />
                )}
              </button>

              {/* Flag icon */}
              {flags.length > 0 && item.keep && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-500/80 flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3 text-black" />
                </div>
              )}

              {/* Duplicate badge */}
              {flags.some((f) => f.type === 'duplicate') && (
                <div className="absolute bottom-2 left-2 w-5 h-5 rounded-full bg-violet-500/80 flex items-center justify-center">
                  <Copy className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Phase: Context ────────────────────────────────────────────────────── */

function ContextPhase({
  onContinue,
}: {
  onContinue: (presetId: string, description: string) => void
}) {
  const presets = getAllPresets()
  const [selectedPreset, setSelectedPreset] = useState(presets[0]?.id ?? 'wedding')
  const [description, setDescription] = useState('')

  const preset = presets.find((p) => p.id === selectedPreset)

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Step 3 of 4</p>
        <h2 className="text-3xl font-headline font-extrabold tracking-tighter text-on-surface italic">
          Shoot context
        </h2>
        <p className="text-on-surface-variant/60">
          Tell the AI what kind of shoot this is to improve accuracy.
        </p>
      </div>

      {/* Preset grid */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50 mb-3">Sort preset</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p.id)}
              className={[
                'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all',
                selectedPreset === p.id
                  ? 'border-primary bg-primary/10'
                  : 'border-outline-variant/20 hover:border-outline-variant/40',
              ].join(' ')}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories preview */}
      {preset && (
        <div className="bg-surface-container rounded-2xl p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
            Categories in this preset
          </p>
          <div className="flex flex-wrap gap-2">
            {preset.categories.map((c) => (
              <span
                key={c.name}
                className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-mono rounded-lg"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">
          Shoot description <span className="normal-case text-on-surface-variant/30">(optional but improves accuracy)</span>
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder={`e.g. "Sarah & Mike's outdoor ceremony at Malibu beach, golden hour portraits, reception at The Fig House"`}
          className="w-full bg-surface-container border border-outline-variant/20 rounded-2xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <p className="text-[10px] text-on-surface-variant/40 font-mono">
          Location, subjects, mood, and key moments help the AI sort more precisely.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onContinue(selectedPreset, description)}
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-headline font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Start AI Sort
        </button>
      </div>
    </div>
  )
}

/* ─── Phase: Sort ───────────────────────────────────────────────────────── */

function SortPhase({
  files,
  presetId,
  description,
  onDone,
}: {
  files: SortableFile[]
  presetId: string
  description: string
  onDone: (sorted: SortableFile[]) => void
}) {
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState('')
  const [modelProgress, setModelProgress] = useState(0)
  const [stage, setStage] = useState<'loading' | 'classifying' | 'done'>('loading')
  const workerRef = useRef<Worker | null>(null)
  const hasDoneRef = useRef(false)

  useEffect(() => {
    const kept = files.filter((f) => f.keep)
    if (kept.length === 0) {
      onDone(files)
      return
    }

    const results = new Map<string, string>()
    let classified = 0

    const worker = new Worker(new URL('@/lib/ai/worker.ts', import.meta.url))
    workerRef.current = worker

    worker.onmessage = async (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data

      if (msg.type === 'loadProgress') {
        setModelProgress(msg.progress)
        return
      }

      if (msg.type === 'modelLoaded') {
        setStage('classifying')
        // Start classifying all kept files
        for (const item of kept) {
          try {
            const dataUrl = await readAsDataURL(item.file)
            worker.postMessage({ type: 'classify', photoId: item.id, imageData: dataUrl, topK: 3 })
          } catch {
            classified++
          }
        }
        return
      }

      if (msg.type === 'result') {
        const top = msg.results[0]
        if (top) {
          // Map label to preset category
          const { getAllLabels, getCategoryForLabel: getPresetCat } = await import('@/lib/ai/presets')
          const { getPreset } = await import('@/lib/ai/presets')
          const preset = getPreset(presetId)
          let category = top.category as string
          if (preset) {
            const mapped = getPresetCat(preset, top.label)
            if (mapped) category = mapped
          }
          results.set(msg.photoId, category)
        }
        classified++
        setCurrentFile(msg.photoId)
        setProgress(Math.round((classified / kept.length) * 100))

        if (classified >= kept.length && !hasDoneRef.current) {
          hasDoneRef.current = true
          setStage('done')
          const updated = files.map((f) => ({
            ...f,
            category: results.get(f.id) ?? f.category,
          }))
          setTimeout(() => onDone(updated), 800)
        }
      }

      if (msg.type === 'error') {
        classified++
        setProgress(Math.round((classified / kept.length) * 100))
        if (classified >= kept.length && !hasDoneRef.current) {
          hasDoneRef.current = true
          setStage('done')
          const updated = files.map((f) => ({
            ...f,
            category: results.get(f.id) ?? 'Uncategorized',
          }))
          setTimeout(() => onDone(updated), 800)
        }
      }
    }

    worker.postMessage({ type: 'loadModel' })

    return () => {
      worker.terminate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayProgress = stage === 'loading' ? modelProgress : progress
  const statusText =
    stage === 'loading'
      ? `Loading AI model… ${modelProgress}%`
      : stage === 'classifying'
        ? `Classifying photos… ${progress}%`
        : 'Complete!'

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-10">
      <div className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Step 4 of 4</p>
        <h2 className="text-3xl font-headline font-extrabold tracking-tighter text-on-surface italic">
          AI Sorting
        </h2>
        <p className="text-on-surface-variant/60 text-sm">{statusText}</p>
      </div>

      {/* Animated orb */}
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          {stage === 'done' ? (
            <CheckCircle2 className="w-14 h-14 text-primary" />
          ) : (
            <Sparkles className="w-14 h-14 text-primary" />
          )}
        </div>
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r="72"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-outline-variant/20"
          />
          <circle
            cx="80" cy="80" r="72"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
            strokeDasharray={`${2 * Math.PI * 72}`}
            strokeDashoffset={`${2 * Math.PI * 72 * (1 - displayProgress / 100)}`}
          />
        </svg>
      </div>

      {/* Stage indicators */}
      <div className="flex gap-8">
        {[
          { label: 'Model loaded', done: stage !== 'loading' },
          { label: 'Classifying', done: stage === 'done' },
          { label: 'Complete', done: stage === 'done' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            {s.done ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : stage === 'loading' && i === 0 ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : stage === 'classifying' && i === 1 ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-outline-variant/30" />
            )}
            <span className={['text-xs font-mono', s.done ? 'text-on-surface' : 'text-on-surface-variant/40'].join(' ')}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono text-on-surface-variant/30 text-center max-w-xs">
        Running entirely in your browser — no photos leave your device.
      </p>
    </div>
  )
}

/* ─── Phase: Results ────────────────────────────────────────────────────── */

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
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold mb-1">Complete</p>
          <h2 className="text-3xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-primary" />
            Sort complete
          </h2>
          <p className="text-on-surface-variant/60 text-sm mt-1">
            {sorted.length} photos sorted into {categories.length} categories
            {rejected.length > 0 && `, ${rejected.length} rejected`}
          </p>
        </div>
        <Link
          href="/dashboard/gallery"
          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          View in Gallery
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const catFiles = byCategory[cat]
          const preview = catFiles[0]?.cullResult?.preview
          return (
            <div key={cat} className="bg-surface-container rounded-2xl overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all">
              <div className="aspect-video bg-surface-container-high flex items-center justify-center overflow-hidden relative">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <FolderOpen className="w-10 h-10 text-on-surface-variant/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                  <p className="text-white font-headline font-bold text-sm truncate">{cat}</p>
                  <span className="text-[10px] font-mono text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
                    {catFiles.length}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* All sorted files */}
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-on-surface-variant/50">All sorted files</p>
        <div className="bg-surface-container rounded-2xl overflow-hidden">
          {sorted.map((f, i) => (
            <div
              key={f.id}
              className={['flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface-container-high', i !== 0 ? 'border-t border-outline-variant/10' : ''].join(' ')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                  {f.cullResult?.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.cullResult.preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-4 h-4 m-2 text-on-surface-variant/30" />
                  )}
                </div>
                <p className="text-sm font-mono text-on-surface truncate max-w-[200px]">{f.file.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {f.cullResult && f.cullResult.flags.length > 0 && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-widest">
                  {f.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function AISortPage() {
  const [phase, setPhase] = useState<Phase>('upload')
  const [files, setFiles] = useState<SortableFile[]>([])
  const [presetId, setPresetId] = useState('wedding')
  const [description, setDescription] = useState('')

  const handleUpload = useCallback((raw: File[]) => {
    const sortable: SortableFile[] = raw.map((f) => ({
      file: f,
      id: uid(),
      keep: true,
    }))
    setFiles(sortable)
    setPhase('cull')
  }, [])

  const handleCullDone = useCallback((updated: SortableFile[]) => {
    setFiles(updated)
    setPhase('context')
  }, [])

  const handleContextDone = useCallback((pid: string, desc: string) => {
    setPresetId(pid)
    setDescription(desc)
    setPhase('sort')
  }, [])

  const handleSortDone = useCallback((sorted: SortableFile[]) => {
    setFiles(sorted)
    setPhase('results')
  }, [])

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Neural Sort
          </h1>
          <p className="text-on-surface-variant/60 font-body mt-1 text-sm">
            Automatically categorize your shoot using computer vision — entirely in your browser.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/presets"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Tag className="w-4 h-4" />
            Presets
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/20 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Step indicator */}
      {phase !== 'upload' && (
        <div className="max-w-md">
          <StepIndicator phase={phase} />
        </div>
      )}

      {/* Phase content */}
      {phase === 'upload' && <UploadPhase onFiles={handleUpload} />}
      {phase === 'cull' && <CullPhase files={files} onContinue={handleCullDone} />}
      {phase === 'context' && <ContextPhase onContinue={handleContextDone} />}
      {phase === 'sort' && (
        <SortPhase
          files={files}
          presetId={presetId}
          description={description}
          onDone={handleSortDone}
        />
      )}
      {phase === 'results' && <ResultsPhase files={files} />}
    </div>
  )
}
