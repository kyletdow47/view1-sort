'use client'

import { use, useState } from 'react'
import {
  ArrowLeft,
  FileArchive,
  Files,
  Cloud,
  Folder,
  FileText,
  ToggleLeft,
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  HardDrive,
} from 'lucide-react'
import Link from 'next/link'

interface ExportPageProps {
  params: Promise<{ id: string }>
}

type ExportFormat = 'zip' | 'individual' | 'cloud'
type ImageQuality = 'full' | 'web' | 'both'

interface PastExport {
  id: string
  date: string
  size: string
  files: number
  status: 'completed' | 'expired'
}

const PAST_EXPORTS: PastExport[] = [
  { id: '1', date: 'Mar 22, 2026', size: '11.8 GB', files: 240, status: 'completed' },
  { id: '2', date: 'Mar 18, 2026', size: '4.2 GB', files: 112, status: 'completed' },
  { id: '3', date: 'Mar 10, 2026', size: '8.6 GB', files: 198, status: 'expired' },
]

interface FolderEntry {
  name: string
  files: number
  indent: number
  isFile?: boolean
}

const FOLDER_TREE: FolderEntry[] = [
  { name: 'JohnsonWedding_Export/', files: 0, indent: 0 },
  { name: 'Ceremony/', files: 84, indent: 1 },
  { name: 'Portraits/', files: 112, indent: 1 },
  { name: 'Reception/', files: 52, indent: 1 },
  { name: 'metadata.csv', files: 0, indent: 1, isFile: true },
]

export default function ExportPage({ params }: ExportPageProps) {
  const { id } = use(params)
  const [format, setFormat] = useState<ExportFormat>('zip')
  const [includeOriginals, setIncludeOriginals] = useState(true)
  const [includeEdited, setIncludeEdited] = useState(true)
  const [quality, setQuality] = useState<ImageQuality>('full')
  const [includeExif, setIncludeExif] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const projectName = 'Johnson Wedding'

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
          Export Gallery
        </h1>
        <p className="mt-1 text-sm text-[#d9c2b4]">
          {projectName} &mdash; Download or transfer your sorted photos
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Export Format */}
          <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
            <h2 className="font-headline font-bold text-lg text-[#e7e1df] mb-4">
              Export Format
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'zip' as ExportFormat, label: 'ZIP Archive', icon: <FileArchive size={20} />, desc: 'Single download' },
                { key: 'individual' as ExportFormat, label: 'Individual Files', icon: <Files size={20} />, desc: 'File by file' },
                { key: 'cloud' as ExportFormat, label: 'Cloud Transfer', icon: <Cloud size={20} />, desc: 'Google Drive / Dropbox' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFormat(opt.key)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all ${
                    format === opt.key
                      ? 'bg-gradient-to-br from-[#ffb780]/15 to-[#d48441]/10 ring-2 ring-[#ffb780]/50'
                      : 'bg-[#151312] ring-1 ring-[#534439]/40 hover:ring-[#ffb780]/20'
                  }`}
                >
                  <span className={format === opt.key ? 'text-[#ffb780]' : 'text-[#a18d80]'}>
                    {opt.icon}
                  </span>
                  <span className={`text-sm font-medium ${format === opt.key ? 'text-[#ffb780]' : 'text-[#d9c2b4]'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-[#a18d80]">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
            <h2 className="font-headline font-bold text-lg text-[#e7e1df] mb-5">
              Options
            </h2>
            <div className="space-y-4">
              {/* Toggle rows */}
              {[
                { label: 'Include originals (RAW)', value: includeOriginals, setter: setIncludeOriginals },
                { label: 'Include edited versions', value: includeEdited, setter: setIncludeEdited },
                { label: 'Include EXIF data', value: includeExif, setter: setIncludeExif },
                { label: 'Include metadata CSV', value: includeMetadata, setter: setIncludeMetadata },
              ].map((toggle) => (
                <div key={toggle.label} className="flex items-center justify-between">
                  <span className="text-sm text-[#e7e1df]">{toggle.label}</span>
                  <button
                    onClick={() => toggle.setter(!toggle.value)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      toggle.value ? 'bg-[#ffb780]' : 'bg-[#373433]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        toggle.value ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}

              {/* Image Quality */}
              <div className="pt-2 border-t border-[#534439]/20">
                <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]/60 block mb-2">
                  Image Quality
                </span>
                <div className="flex gap-2">
                  {([
                    { key: 'full' as ImageQuality, label: 'Full Resolution' },
                    { key: 'web' as ImageQuality, label: 'Web Optimized' },
                    { key: 'both' as ImageQuality, label: 'Both' },
                  ]).map((q) => (
                    <button
                      key={q.key}
                      onClick={() => setQuality(q.key)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        quality === q.key
                          ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                          : 'bg-[#151312] text-[#d9c2b4] ring-1 ring-[#534439]/40 hover:ring-[#ffb780]/30'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress / Start Export */}
          <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-[#95d1d1]" />
                <span className="text-sm text-[#e7e1df]">
                  Estimated download:{' '}
                  <span className="font-bold text-[#ffb780]">12.4 GB</span>{' '}
                  <span className="text-[#a18d80]">(248 files)</span>
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a18d80]">Ready to export</span>
                <span className="text-xs font-medium text-[#a18d80]">0%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#2c2928]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ffb780] to-[#d48441] transition-all"
                  style={{ width: '0%' }}
                />
              </div>
            </div>

            <button className="rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-8 py-3 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
              Start Export
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Folder Structure Preview */}
          <div className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6 sticky top-6">
            <h2 className="font-headline font-bold text-lg text-[#e7e1df] mb-1">
              Folder Structure
            </h2>
            <p className="text-xs text-[#a18d80] mb-5">
              Preview of your export file organization
            </p>

            <div className="rounded-xl bg-[#151312] border border-[#534439]/20 p-4 font-mono text-sm">
              {FOLDER_TREE.map((entry, idx) => {
                const prefix = entry.indent === 0 ? '' : idx === FOLDER_TREE.length - 1 ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 '
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-1"
                    style={{ paddingLeft: entry.indent === 0 ? 0 : 12 }}
                  >
                    {entry.indent > 0 && (
                      <span className="text-[#534439]">{prefix}</span>
                    )}
                    {entry.isFile ? (
                      <FileText size={14} className="text-[#a18d80] shrink-0" />
                    ) : (
                      <Folder size={14} className={entry.indent === 0 ? 'text-[#ffb780] shrink-0' : 'text-[#d48441] shrink-0'} />
                    )}
                    <span className={entry.indent === 0 ? 'text-[#ffb780] font-medium' : 'text-[#e7e1df]'}>
                      {entry.name}
                    </span>
                    {entry.files > 0 && (
                      <span className="text-[#a18d80] text-xs">({entry.files} files)</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Recent Exports */}
            <div className="mt-6 pt-5 border-t border-[#534439]/30">
              <h3 className="font-headline font-bold text-[#e7e1df] mb-3">
                Recent Exports
              </h3>
              <div className="space-y-3">
                {PAST_EXPORTS.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between rounded-xl bg-[#151312] border border-[#534439]/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        exp.status === 'completed' ? 'bg-[#95d1d1]/10' : 'bg-[#373433]/60'
                      }`}>
                        {exp.status === 'completed' ? (
                          <CheckCircle2 size={16} className="text-[#95d1d1]" />
                        ) : (
                          <Clock size={16} className="text-[#a18d80]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#e7e1df]">
                          {exp.files} files &bull; {exp.size}
                        </p>
                        <p className="text-[10px] text-[#a18d80]">{exp.date}</p>
                      </div>
                    </div>
                    {exp.status === 'completed' ? (
                      <button className="inline-flex items-center gap-1 rounded-lg bg-[#2c2928] px-2.5 py-1.5 text-[11px] font-medium text-[#d9c2b4] ring-1 ring-[#534439]/40 hover:ring-[#ffb780]/30 hover:text-[#ffb780] transition-colors">
                        <Download size={12} />
                        Re-download
                      </button>
                    ) : (
                      <span className="font-label text-[10px] uppercase tracking-widest text-[#a18d80]">
                        Expired
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
