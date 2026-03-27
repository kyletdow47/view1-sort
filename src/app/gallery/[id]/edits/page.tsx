'use client'

import { use, useState } from 'react'
import {
  Camera,
  Download,
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  GripVertical,
} from 'lucide-react'

interface EditsPageProps {
  params: Promise<{ id: string }>
}

const NAV_TABS = ['Overview', 'Sorting', 'Selection', 'Delivery']

interface EditRequest {
  id: string
  title: string
  status: 'delivered' | 'in-progress' | 'pending'
  originalLabel: string
  editedLabel: string
}

const MOCK_EDIT_REQUESTS: EditRequest[] = [
  {
    id: '1',
    title: 'Bridal Portrait Retouching',
    status: 'delivered',
    originalLabel: 'DSC_1001.JPG',
    editedLabel: 'DSC_1001_edited.JPG',
  },
  {
    id: '2',
    title: 'Ceremony Wide-Angle Color Grade',
    status: 'delivered',
    originalLabel: 'DSC_1008.JPG',
    editedLabel: 'DSC_1008_edited.JPG',
  },
  {
    id: '3',
    title: 'Reception Sparkler Exit Enhancement',
    status: 'delivered',
    originalLabel: 'DSC_1011.JPG',
    editedLabel: 'DSC_1011_edited.JPG',
  },
]

function StatusBadge({ status }: { status: EditRequest['status'] }) {
  if (status === 'delivered') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#95d1d1]/15 px-3 py-1 text-[11px] font-semibold text-[#95d1d1]">
        <CheckCircle2 size={12} />
        Delivered
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffb780]/15 px-3 py-1 text-[11px] font-semibold text-[#ffb780]">
      In Progress
    </span>
  )
}

export default function EditsPage({ params }: EditsPageProps) {
  const { id } = use(params)
  const [activeTab] = useState('Delivery')
  const hasEdits = MOCK_EDIT_REQUESTS.length > 0

  return (
    <div className="min-h-screen bg-[#151312]">
      {/* Top Nav */}
      <nav className="border-b border-[#534439]/30 bg-[#1d1b1a]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ffb780] to-[#d48441]">
              <Camera size={16} className="text-[#4e2600]" />
            </div>
            <span className="text-sm font-bold text-[#e7e1df]">PhotoSorter</span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                  tab === activeTab
                    ? 'bg-[#ffb780]/15 text-[#ffb780]'
                    : 'text-[#d9c2b4]/60 hover:text-[#d9c2b4]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-extrabold italic text-[#e7e1df]">
            Edited Photos
          </h1>
          <p className="mt-1 text-sm text-[#d9c2b4]/70">Johnson Wedding</p>
          <p className="mt-2 text-xs text-[#d9c2b4]/50">
            {MOCK_EDIT_REQUESTS.filter((r) => r.status === 'delivered').length} edit
            requests delivered
          </p>
        </div>

        {hasEdits ? (
          <>
            {/* Edit Request Cards */}
            <div className="space-y-6">
              {MOCK_EDIT_REQUESTS.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-[#534439]/30 bg-[#1d1b1a] p-6"
                >
                  {/* Card Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-[#e7e1df]">
                        {request.title}
                      </h3>
                      <StatusBadge status={request.status} />
                    </div>
                  </div>

                  {/* Before / After Comparison */}
                  <div className="flex items-stretch gap-0">
                    {/* Original */}
                    <div className="flex-1 rounded-l-xl border border-[#534439]/20 bg-[#211f1e] p-1">
                      <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg bg-[#2c2928]">
                        <ImageIcon size={32} className="text-[#a18d80]/40" />
                        <span className="mt-2 text-[11px] font-medium text-[#a18d80]/60">
                          Original
                        </span>
                        <span className="mt-0.5 text-[10px] text-[#a18d80]/40">
                          {request.originalLabel}
                        </span>
                      </div>
                    </div>

                    {/* Slider Divider */}
                    <div className="relative z-10 flex w-8 flex-col items-center justify-center">
                      <div className="h-full w-px bg-[#534439]/50" />
                      <div className="absolute flex h-8 w-8 items-center justify-center rounded-full border border-[#534439]/50 bg-[#2c2928]">
                        <GripVertical size={14} className="text-[#a18d80]/60" />
                      </div>
                    </div>

                    {/* Edited */}
                    <div className="flex-1 rounded-r-xl border border-[#534439]/20 bg-[#211f1e] p-1">
                      <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg bg-[#2c2928]">
                        <ImageIcon size={32} className="text-[#ffb780]/40" />
                        <span className="mt-2 text-[11px] font-medium text-[#ffb780]/60">
                          Edited
                        </span>
                        <span className="mt-0.5 text-[10px] text-[#ffb780]/40">
                          {request.editedLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="mt-4 flex justify-end">
                    <button className="flex items-center gap-2 rounded-lg border border-[#534439]/30 bg-[#2c2928] px-4 py-2 text-xs font-medium text-[#d9c2b4] transition-colors hover:border-[#ffb780]/30 hover:text-[#ffb780]">
                      <Download size={14} />
                      Download Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-10 flex flex-col items-center gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-8 py-3 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90">
                <Download size={16} />
                Download All Edits
              </button>
              <a
                href={`/gallery/${id}`}
                className="flex items-center gap-1.5 text-xs text-[#d9c2b4]/60 transition-colors hover:text-[#ffb780]"
              >
                <ArrowLeft size={14} />
                Back to Gallery
              </a>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#534439]/20 bg-[#1d1b1a] py-20">
            <ImageIcon size={48} className="text-[#a18d80]/30" />
            <p className="mt-4 text-sm font-medium text-[#d9c2b4]/50">
              No edited photos yet
            </p>
            <p className="mt-1 text-xs text-[#d9c2b4]/30">
              Edit requests will appear here once delivered
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
