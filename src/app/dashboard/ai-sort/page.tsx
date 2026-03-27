'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import {
  UploadCloud,
  FileType,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { useClassifier } from '@/hooks/useClassifier'
import { createClient } from '@/lib/supabase/client'
import type { ClassificationResult } from '@/lib/ai/classifier'

/* ---------- types ---------- */

interface FileWithStatus {
  file: File
  id: string
  status: 'pending' | 'classifying' | 'completed' | 'error'
  topResult?: ClassificationResult
  allResults?: ClassificationResult[]
  errorMsg?: string
}

/* ---------- component ---------- */

export default function AISortPage() {
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [isSorting, setIsSorting] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [currentAction, setCurrentAction] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { status: classifierStatus, loadProgress, error: classifierError, classify } = useClassifier()

  const isModelLoading = classifierStatus === 'loading'
  const isModelReady = classifierStatus === 'ready'

  /* ---- handlers ---- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsDone(false)
      const newFiles: FileWithStatus[] = Array.from(e.target.files).map((f) => ({
        file: f,
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: 'pending' as const,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const startSorting = async () => {
    if (files.length === 0 || !isModelReady || isSorting) return

    setIsSorting(true)
    setIsDone(false)

    const pendingFiles = files.filter((f) => f.status === 'pending')

    for (const item of pendingFiles) {
      setCurrentAction(`Analyzing ${item.file.name}…`)

      // Mark as classifying
      setFiles((prev) =>
        prev.map((f) => f.id === item.id ? { ...f, status: 'classifying' as const } : f)
      )

      try {
        const results = await classify(item.file, item.id, 5)
        const topResult = results[0]
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'completed' as const, topResult, allResults: results }
              : f
          )
        )

        // Write ai_category + ai_confidence back to Supabase (best-effort, match by filename)
        if (topResult) {
          const supabase = createClient()
          void supabase
            .from('media')
            .update({ ai_category: topResult.category, ai_confidence: topResult.score })
            .eq('filename', item.file.name)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Classification failed'
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error' as const, errorMsg } : f
          )
        )
      }
    }

    setIsSorting(false)
    setIsDone(true)
    setCurrentAction('Sorting Complete')
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (isSorting) return
    setIsDone(false)
    const droppedFiles: FileWithStatus[] = Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith('image/') || /\.(cr2|nef|arw|raw|dng)$/i.test(f.name))
      .map((f) => ({
        file: f,
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: 'pending' as const,
      }))
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const completedFiles = files.filter((f) => f.status === 'completed')
  const uniqueCategories = new Set(completedFiles.map((f) => f.topResult?.category).filter(Boolean))

  /* ---- render ---- */

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface italic flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Neural Sort
        </h2>
        <p className="text-on-surface-variant font-body mt-2">
          Upload JPEG images to automatically categorize your shoot using computer vision.
        </p>
      </div>

      {/* Model status banner */}
      {isModelLoading && (
        <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">
              Loading AI model… {Math.round(loadProgress)}%
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-primary/10 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant/50 mt-1">
              Downloading ~50MB model on first use — cached for future sessions.
            </p>
          </div>
        </div>
      )}

      {classifierError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{classifierError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========== Left: Upload & Progress ========== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={[
              'relative border-2 border-dashed border-outline-variant/20 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group overflow-hidden',
              isSorting || isModelLoading
                ? 'pointer-events-none opacity-50'
                : 'hover:border-primary/40 hover:bg-primary/5',
            ].join(' ')}
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-headline font-bold text-on-surface">
                Drop JPEG/RAW files here
              </p>
              <p className="text-sm text-on-surface-variant/60">
                or click to browse your local storage
              </p>
            </div>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.cr2,.nef,.arw,.raw,.dng"
            />

            {/* Decorative SVG */}
            <div className="absolute inset-0 z-[-1] opacity-5 text-on-surface pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,0 50,50 T100,50 T150,50 T200,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,30 Q25,80 50,30 T100,30 T150,30 T200,30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M0,70 Q25,20 50,70 T100,70 T150,70 T200,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="75" cy="50" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="125" cy="35" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="175" cy="65" r="2" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
          </div>

          {/* Processing state */}
          {isSorting && (
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold mb-1">
                    Neural Processing
                  </p>
                  <h3 className="text-xl font-headline font-bold text-on-surface">
                    {currentAction || 'Initializing Sort…'}
                  </h3>
                </div>
                <p className="text-2xl font-mono font-bold text-primary">
                  {completedFiles.length}/{files.filter((f) => f.status !== 'error').length}
                </p>
              </div>

              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffb780] to-[#d48441] rounded-full transition-all duration-200"
                  style={{
                    width: `${files.length > 0 ? (completedFiles.length / files.length) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Running CLIP inference
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/60 uppercase tracking-widest">
                  <Layers className="w-3 h-3" />
                  Zero-shot classification
                </div>
              </div>
            </div>
          )}

          {/* Complete state */}
          <div
            className={[
              'bg-secondary/10 p-8 rounded-3xl border border-secondary/20 flex items-center justify-between transition-all duration-500',
              isDone
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none h-0 p-0 border-0 overflow-hidden',
            ].join(' ')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-secondary">
                  Categorization Complete
                </h3>
                <p className="text-sm text-secondary/60">
                  {completedFiles.length} assets sorted into {uniqueCategories.size} categories.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-secondary text-on-secondary rounded-xl font-headline font-bold uppercase tracking-tight shadow-lg hover:shadow-secondary/20 transition-all flex items-center gap-2"
            >
              Back to Dashboard
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Start sorting CTA */}
          {files.length > 0 && !isSorting && !isDone && (
            <div className="flex justify-end">
              <button
                onClick={startSorting}
                disabled={!isModelReady}
                className="px-8 py-3 bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary rounded-xl font-headline font-bold uppercase tracking-tight shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                {isModelReady ? 'Begin AI Categorization' : 'Model Loading…'}
              </button>
            </div>
          )}
        </div>

        {/* ========== Right: Processing Queue Sidebar ========== */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50 backdrop-blur-md sticky top-0 z-10">
              <h3 className="text-lg font-headline font-bold text-on-surface">Processing Queue</h3>
              <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">
                {files.length} Assets
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/40 gap-4">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-headline italic">No assets in queue</p>
                </div>
              ) : (
                files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/5 group transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        <FileType className="w-5 h-5 text-on-surface-variant/40" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-headline font-bold truncate text-on-surface">
                          {f.file.name}
                        </p>
                        <p className="text-[10px] font-mono text-on-surface-variant/40 uppercase tracking-widest">
                          {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {f.status === 'completed' && f.topResult ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="block px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-mono font-bold uppercase tracking-widest rounded-md">
                              {f.topResult.category}
                            </span>
                            <span className="text-[9px] text-on-surface-variant/40 font-mono">
                              {Math.round(f.topResult.score * 100)}%
                            </span>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-secondary" />
                        </div>
                      ) : f.status === 'classifying' ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : f.status === 'error' ? (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-400" aria-label={f.errorMsg} />
                        </div>
                      ) : (
                        <button
                          onClick={() => removeFile(f.id)}
                          className="p-1 hover:bg-tertiary/10 hover:text-tertiary rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
