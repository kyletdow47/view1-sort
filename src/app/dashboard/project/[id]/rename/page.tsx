'use client'

import { use, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  ArrowLeft,
  Type,
  Hash,
  Calendar,
  Camera,
  FolderOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { computeRenames } from '@/lib/utils/rename'
import type { CaseOption, RenameInput } from '@/lib/utils/rename'
import type { Project } from '@/types/supabase'

interface RenamePageProps {
  params: Promise<{ id: string }>
}

interface Token {
  label: string
  value: string
  icon: React.ReactNode
}

const TOKENS: Token[] = [
  { label: 'Project', value: '{project}', icon: <FolderOpen size={12} /> },
  { label: 'Category', value: '{category}', icon: <Type size={12} /> },
  { label: 'Date', value: '{date}', icon: <Calendar size={12} /> },
  { label: 'Number', value: '{n}', icon: <Hash size={12} /> },
  { label: 'Photographer', value: '{photographer}', icon: <Camera size={12} /> },
  { label: 'Original', value: '{original}', icon: <FileText size={12} /> },
]

export default function BatchRenamePage({ params }: RenamePageProps) {
  const { id } = use(params)
  const supabase = createClient()

  // Data state
  const [project, setProject] = useState<Project | null>(null)
  const [media, setMedia] = useState<RenameInput[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // Rename options state
  const [template, setTemplate] = useState('{project}_{category}_{n}')
  const [startNumber, setStartNumber] = useState(1)
  const [padding, setPadding] = useState(3)
  const [caseOption, setCaseOption] = useState<CaseOption>('Original')
  const [includeExtension, setIncludeExtension] = useState(true)

  // Apply state
  const [applying, setApplying] = useState(false)
  const [applyStatus, setApplyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [applyError, setApplyError] = useState<string | null>(null)
  const [appliedCount, setAppliedCount] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  // Load project + media
  useEffect(() => {
    const load = async () => {
      try {
        const [projectRes, mediaRes] = await Promise.all([
          supabase.from('projects').select('*').eq('id', id).single(),
          supabase
            .from('media')
            .select('id,filename,ai_category,created_at')
            .eq('project_id', id)
            .order('sort_order', { ascending: true }),
        ])

        if (projectRes.error) throw new Error(projectRes.error.message)
        if (mediaRes.error) throw new Error(mediaRes.error.message)

        setProject(projectRes.data as Project)
        setMedia((mediaRes.data ?? []) as RenameInput[])

        // Default template uses the project name
        if (projectRes.data?.name) {
          setTemplate(`${projectRes.data.name}_{category}_{n}`)
        }
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Failed to load project data')
      } finally {
        setDataLoading(false)
      }
    }

    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute live preview (memoised so it only recalculates when inputs change)
  const previews = useMemo(
    () =>
      computeRenames(media, project?.name ?? '', {
        template,
        startNumber,
        padding,
        caseOption,
        includeExtension,
      }),
    [media, project, template, startNumber, padding, caseOption, includeExtension],
  )

  // Category breakdown from real media
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of media) {
      const cat = item.ai_category ?? 'Uncategorized'
      counts[cat] = (counts[cat] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [media])

  const insertToken = useCallback(
    (tokenValue: string) => {
      if (inputRef.current) {
        const start = inputRef.current.selectionStart ?? template.length
        const end = inputRef.current.selectionEnd ?? template.length
        const newTemplate = template.slice(0, start) + tokenValue + template.slice(end)
        setTemplate(newTemplate)
        setTimeout(() => {
          if (inputRef.current) {
            const pos = start + tokenValue.length
            inputRef.current.setSelectionRange(pos, pos)
            inputRef.current.focus()
          }
        }, 0)
      } else {
        setTemplate((prev) => prev + tokenValue)
      }
    },
    [template],
  )

  const handleApply = useCallback(async () => {
    if (previews.length === 0) return
    setApplying(true)
    setApplyStatus('idle')
    setApplyError(null)

    try {
      // Batch update in chunks of 50 to avoid request size limits
      const CHUNK = 50
      let done = 0

      for (let i = 0; i < previews.length; i += CHUNK) {
        const chunk = previews.slice(i, i + CHUNK)

        // Sequential updates within chunk (Supabase doesn't support bulk upsert with different values per row without RPC)
        await Promise.all(
          chunk.map(({ id: mediaId, after }) =>
            supabase
              .from('media')
              .update({ display_name: after })
              .eq('id', mediaId)
              .then(({ error }) => {
                if (error) throw new Error(error.message)
              }),
          ),
        )

        done += chunk.length
        setAppliedCount(done)
      }

      setApplyStatus('success')
      setTimeout(() => setApplyStatus('idle'), 4000)
    } catch (err) {
      setApplyStatus('error')
      setApplyError(err instanceof Error ? err.message : 'Rename failed')
    } finally {
      setApplying(false)
    }
  }, [previews, supabase])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/project/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#a18d80] hover:text-[#ffb780] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to project</span>
        </Link>
        <h1 className="font-headline text-3xl italic font-extrabold text-[#e7e1df]">
          Batch Rename
        </h1>
        <p className="mt-1 text-sm text-[#d9c2b4]">
          Build a naming template and preview how your files will be renamed
        </p>
      </div>

      {/* Error loading data */}
      {dataError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle size={16} className="text-error shrink-0" />
          <p className="text-sm text-error">{dataError}</p>
        </div>
      )}

      {dataLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#ffb780]/50" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Left column: Template builder + Options */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Template Builder */}
            <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Type size={18} className="text-[#ffb780]" />
                <h2 className="font-headline font-bold text-lg text-[#e7e1df]">
                  Template Builder
                </h2>
              </div>

              {/* Token pills */}
              <div className="mb-4">
                <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60 block mb-2">
                  Available Tokens
                </span>
                <div className="flex flex-wrap gap-2">
                  {TOKENS.map((token) => (
                    <button
                      key={token.value}
                      onClick={() => insertToken(token.value)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2c2928] px-3 py-1.5 text-xs font-medium text-[#ffb780] ring-1 ring-[#534439]/40 transition-all hover:bg-[#373433] hover:ring-[#ffb780]/30 active:scale-95"
                    >
                      {token.icon}
                      <span>{token.label}</span>
                      <span className="text-[#a18d80] font-mono text-[10px]">{token.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template input */}
              <div className="space-y-1.5">
                <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                  Naming Pattern
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full rounded-xl bg-[#151312] px-5 py-4 text-lg font-mono text-[#e7e1df] outline-none ring-1 ring-[#534439]/40 focus:ring-[#ffb780]/50 transition-shadow"
                  placeholder="Enter naming pattern..."
                />
                <p className="text-[11px] text-[#a18d80]">
                  Use tokens above or type directly. Example: ProjectName_{'{category}'}_{'{n}'}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
              <h2 className="font-headline font-bold text-lg text-[#e7e1df] mb-5">
                Options
              </h2>

              <div className="grid grid-cols-2 gap-5">
                {/* Start number */}
                <div className="space-y-1.5">
                  <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                    Start Number
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={startNumber}
                      onChange={(e) => setStartNumber(Number(e.target.value))}
                      min={0}
                      className="w-full rounded-lg bg-[#151312] px-4 py-2.5 text-sm text-[#e7e1df] outline-none ring-1 ring-[#534439]/40 focus:ring-[#ffb780]/50"
                    />
                    <div className="flex flex-col">
                      <button
                        onClick={() => setStartNumber((n) => n + 1)}
                        className="text-[#a18d80] hover:text-[#ffb780] transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => setStartNumber((n) => Math.max(0, n - 1))}
                        className="text-[#a18d80] hover:text-[#ffb780] transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Padding */}
                <div className="space-y-1.5">
                  <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                    Number Padding
                  </span>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPadding(p)}
                        className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          padding === p
                            ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                            : 'bg-[#151312] text-[#d9c2b4] ring-1 ring-[#534439]/40 hover:ring-[#ffb780]/30'
                        }`}
                      >
                        {p} digits
                      </button>
                    ))}
                  </div>
                </div>

                {/* Case option */}
                <div className="space-y-1.5">
                  <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                    Case
                  </span>
                  <div className="flex gap-2">
                    {(['Original', 'Upper', 'Lower'] as CaseOption[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCaseOption(opt)}
                        className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          caseOption === opt
                            ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                            : 'bg-[#151312] text-[#d9c2b4] ring-1 ring-[#534439]/40 hover:ring-[#ffb780]/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include extension toggle */}
                <div className="space-y-1.5">
                  <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                    Include Extension
                  </span>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => setIncludeExtension(!includeExtension)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        includeExtension ? 'bg-[#ffb780]' : 'bg-[#373433]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          includeExtension ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-[#d9c2b4]">
                      {includeExtension ? 'Appending extension' : 'No extension'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats + Actions */}
            <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <RotateCcw size={16} className="text-[#95d1d1]" />
                  <span className="text-sm text-[#e7e1df]">
                    Renaming{' '}
                    <span className="font-bold text-[#ffb780]">{media.length}</span>{' '}
                    files across{' '}
                    <span className="font-bold text-[#ffb780]">
                      {categoryBreakdown.length}
                    </span>{' '}
                    categories
                  </span>
                </div>
              </div>

              {/* Status messages */}
              {applyStatus === 'success' && (
                <div className="flex items-center gap-2 mb-4 text-sm text-green-400">
                  <Check size={14} />
                  {appliedCount} files renamed successfully
                </div>
              )}
              {applyStatus === 'error' && (
                <div className="flex items-center gap-2 mb-4 text-sm text-error">
                  <AlertCircle size={14} />
                  {applyError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleApply}
                  disabled={applying || media.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-8 py-3 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {applying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Applying… {appliedCount}/{media.length}
                    </>
                  ) : (
                    'Apply Rename'
                  )}
                </button>
                <Link
                  href={`/dashboard/project/${id}`}
                  className="rounded-xl border border-[#534439]/40 px-8 py-3 text-sm font-medium text-[#d9c2b4] transition-colors hover:border-[#ffb780]/30 hover:text-[#ffb780]"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>

          {/* Right column: Live Preview */}
          <div className="col-span-12 lg:col-span-5">
            <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6 sticky top-6">
              <h2 className="font-headline font-bold text-lg text-[#e7e1df] mb-1">
                Live Preview
              </h2>
              <p className="text-xs text-[#a18d80] mb-5">
                Showing how your files will be renamed
              </p>

              {previews.length === 0 ? (
                <p className="text-sm text-[#a18d80] py-4 text-center">
                  No media in this project yet
                </p>
              ) : (
                <div className="space-y-0">
                  {/* Column headers */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                      Before
                    </span>
                    <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60">
                      After
                    </span>
                  </div>

                  {/* File rows — show first 12 */}
                  {previews.slice(0, 12).map((file, idx) => (
                    <div
                      key={file.id}
                      className={`grid grid-cols-2 gap-3 py-2.5 ${
                        idx !== Math.min(previews.length, 12) - 1
                          ? 'border-b border-[#534439]/20'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#a18d80]/40 shrink-0" />
                        <span className="text-xs font-mono text-[#a18d80] truncate">
                          {file.before}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#95d1d1] shrink-0" />
                        <span className="text-xs font-mono text-[#e7e1df] truncate">
                          {file.after}
                        </span>
                      </div>
                    </div>
                  ))}

                  {previews.length > 12 && (
                    <p className="pt-3 text-[11px] text-[#a18d80]/60 text-center">
                      + {previews.length - 12} more files
                    </p>
                  )}
                </div>
              )}

              {/* Category breakdown */}
              {categoryBreakdown.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#534439]/30">
                  <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60 block mb-3">
                    Category Breakdown
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {categoryBreakdown.map(([name, count]) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#2c2928] px-2.5 py-1 text-[11px]"
                      >
                        <span className="text-[#d9c2b4]">{name}</span>
                        <span className="text-[#a18d80]">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
