'use client'

import { use, useState, useRef } from 'react'
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
} from 'lucide-react'
import Link from 'next/link'

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

interface MockFile {
  before: string
  after: string
  category: string
}

const MOCK_FILES: MockFile[] = [
  { before: 'DSC_0842.ARW', after: 'JohnsonWedding_Ceremony_001.jpg', category: 'Ceremony' },
  { before: 'DSC_0843.ARW', after: 'JohnsonWedding_Ceremony_002.jpg', category: 'Ceremony' },
  { before: 'DSC_0901.ARW', after: 'JohnsonWedding_Portraits_003.jpg', category: 'Portraits' },
  { before: 'DSC_0902.ARW', after: 'JohnsonWedding_Portraits_004.jpg', category: 'Portraits' },
  { before: 'DSC_1044.ARW', after: 'JohnsonWedding_Reception_005.jpg', category: 'Reception' },
  { before: 'DSC_1045.ARW', after: 'JohnsonWedding_Reception_006.jpg', category: 'Reception' },
  { before: 'DSC_1120.ARW', after: 'JohnsonWedding_Details_007.jpg', category: 'Details' },
  { before: 'DSC_1121.ARW', after: 'JohnsonWedding_Details_008.jpg', category: 'Details' },
]

type CaseOption = 'Original' | 'Upper' | 'Lower'

export default function BatchRenamePage({ params }: RenamePageProps) {
  const { id } = use(params)
  const [template, setTemplate] = useState('JohnsonWedding_{category}_{n}')
  const [startNumber, setStartNumber] = useState(1)
  const [padding, setPadding] = useState(3)
  const [caseOption, setCaseOption] = useState<CaseOption>('Original')
  const [includeExtension, setIncludeExtension] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const insertToken = (tokenValue: string) => {
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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/project/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to project</span>
        </Link>
        <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">
          Batch Rename
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Build a naming template and preview how your files will be renamed
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column: Template builder + Options */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Template Builder */}
          <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6">
            <div className="flex items-center gap-2 mb-5">
              <Type size={18} className="text-primary" />
              <h2 className="font-headline font-bold text-lg text-on-surface">
                Template Builder
              </h2>
            </div>

            {/* Token pills */}
            <div className="mb-4">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 block mb-2">
                Available Tokens
              </span>
              <div className="flex flex-wrap gap-2">
                {TOKENS.map((token) => (
                  <button
                    key={token.value}
                    onClick={() => insertToken(token.value)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-[#534439]/40 transition-all hover:bg-surface-highest hover:ring-[#ffb780]/30 active:scale-95"
                  >
                    {token.icon}
                    <span>{token.label}</span>
                    <span className="text-on-surface-variant font-mono text-[10px]">{token.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template input */}
            <div className="space-y-1.5">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                Naming Pattern
              </span>
              <input
                ref={inputRef}
                type="text"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full rounded-xl bg-background px-5 py-4 text-lg font-mono text-on-surface outline-none ring-1 ring-[#534439]/40 focus:ring-[#ffb780]/50 transition-shadow"
                placeholder="Enter naming pattern..."
              />
              <p className="text-[11px] text-on-surface-variant">
                Use tokens above or type directly. Example: ProjectName_{'{category}'}_{'{n}'}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6">
            <h2 className="font-headline font-bold text-lg text-on-surface mb-5">
              Options
            </h2>

            <div className="grid grid-cols-2 gap-5">
              {/* Start number */}
              <div className="space-y-1.5">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                  Start Number
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-lg bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-[#534439]/40 focus:ring-[#ffb780]/50"
                  />
                  <div className="flex flex-col">
                    <button
                      onClick={() => setStartNumber((n) => n + 1)}
                      className="text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => setStartNumber((n) => Math.max(0, n - 1))}
                      className="text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Padding */}
              <div className="space-y-1.5">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                  Number Padding
                </span>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPadding(p)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        padding === p
                          ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary'
                          : 'bg-background text-on-surface-variant ring-1 ring-[#534439]/40 hover:ring-[#ffb780]/30'
                      }`}
                    >
                      {p} digits
                    </button>
                  ))}
                </div>
              </div>

              {/* Case option */}
              <div className="space-y-1.5">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                  Case
                </span>
                <div className="flex gap-2">
                  {(['Original', 'Upper', 'Lower'] as CaseOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setCaseOption(opt)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        caseOption === opt
                          ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-on-primary'
                          : 'bg-background text-on-surface-variant ring-1 ring-[#534439]/40 hover:ring-[#ffb780]/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include extension toggle */}
              <div className="space-y-1.5">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                  Include Extension
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setIncludeExtension(!includeExtension)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      includeExtension ? 'bg-primary' : 'bg-surface-highest'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        includeExtension ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-on-surface-variant">
                    {includeExtension ? 'Appending .jpg' : 'No extension'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats + Actions */}
          <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <RotateCcw size={16} className="text-emerald-400" />
                <span className="text-sm text-on-surface">
                  Renaming <span className="font-bold text-primary">248</span> files across{' '}
                  <span className="font-bold text-primary">6</span> categories
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-8 py-3 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
                Apply Rename
              </button>
              <Link
                href={`/dashboard/project/${id}`}
                className="rounded-xl border border-outline-variant/40 px-8 py-3 text-sm font-medium text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

        {/* Right column: Live Preview */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 sticky top-6">
            <h2 className="font-headline font-bold text-lg text-on-surface mb-1">
              Live Preview
            </h2>
            <p className="text-xs text-on-surface-variant mb-5">
              Showing how your files will be renamed
            </p>

            <div className="space-y-0">
              {/* Column headers */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                  Before
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                  After
                </span>
              </div>

              {/* File rows */}
              {MOCK_FILES.map((file, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-2 gap-3 py-2.5 ${
                    idx !== MOCK_FILES.length - 1 ? 'border-b border-outline-variant/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#a18d80]/40 shrink-0" />
                    <span className="text-xs font-mono text-on-surface-variant truncate">
                      {file.before}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-xs font-mono text-on-surface truncate">
                      {file.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            <div className="mt-5 pt-4 border-t border-outline-variant/30">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 block mb-3">
                Category Breakdown
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Ceremony', count: 84 },
                  { name: 'Portraits', count: 62 },
                  { name: 'Reception', count: 52 },
                  { name: 'Details', count: 28 },
                  { name: 'Prep', count: 14 },
                  { name: 'Family', count: 8 },
                ].map((cat) => (
                  <span
                    key={cat.name}
                    className="inline-flex items-center gap-1.5 rounded-md bg-surface-container px-2.5 py-1 text-[11px]"
                  >
                    <span className="text-on-surface-variant">{cat.name}</span>
                    <span className="text-on-surface-variant">{cat.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
