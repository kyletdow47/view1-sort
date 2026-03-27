'use client'

import { useState } from 'react'
import {
  Pencil,
  ArrowLeft,
  Clock,
  CheckCircle2,
  DollarSign,
  Eye,
  Truck,
  FileText,
  ImageIcon,
  MoreHorizontal,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                   */
/* ------------------------------------------------------------------ */

type EditStatus = 'requested' | 'reviewed' | 'priced' | 'paid' | 'in_progress' | 'delivered'

interface EditRequest {
  id: string
  clientName: string
  clientInitials: string
  photos: string[]
  status: EditStatus
  quotedPrice: number | null
  requestedDate: string
  dueDate: string | null
  notes: string
}

const statusSteps: { key: EditStatus; label: string; icon: React.ElementType }[] = [
  { key: 'requested', label: 'Requested', icon: FileText },
  { key: 'reviewed', label: 'Reviewed', icon: Eye },
  { key: 'priced', label: 'Priced', icon: DollarSign },
  { key: 'paid', label: 'Paid', icon: CheckCircle2 },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'delivered', label: 'Delivered', icon: Truck },
]

const statusColors: Record<EditStatus, string> = {
  requested: 'bg-[#ffb4a5]/15 text-[#ffb4a5]',
  reviewed: 'bg-[#95d1d1]/15 text-[#95d1d1]',
  priced: 'bg-[#ffb780]/15 text-[#ffb780]',
  paid: 'bg-emerald-500/15 text-emerald-400',
  in_progress: 'bg-[#d48441]/15 text-[#d48441]',
  delivered: 'bg-emerald-500/15 text-emerald-400',
}

const mockRequests: EditRequest[] = [
  {
    id: 'er-001',
    clientName: 'Sarah Mitchell',
    clientInitials: 'SM',
    photos: ['IMG_4201', 'IMG_4215', 'IMG_4220', 'IMG_4233', 'IMG_4240'],
    status: 'in_progress',
    quotedPrice: 120,
    requestedDate: '2026-03-18',
    dueDate: '2026-03-28',
    notes: 'Skin retouching, color grade to warm tones, remove background distractions',
  },
  {
    id: 'er-002',
    clientName: 'James Rivera',
    clientInitials: 'JR',
    photos: ['DSC_0891', 'DSC_0902', 'DSC_0910'],
    status: 'priced',
    quotedPrice: 75,
    requestedDate: '2026-03-22',
    dueDate: null,
    notes: 'Black and white conversion, high contrast editorial look',
  },
  {
    id: 'er-003',
    clientName: 'Elena Vasquez',
    clientInitials: 'EV',
    photos: ['PHOTO_0012', 'PHOTO_0015', 'PHOTO_0018', 'PHOTO_0021', 'PHOTO_0024', 'PHOTO_0030', 'PHOTO_0035'],
    status: 'delivered',
    quotedPrice: 195,
    requestedDate: '2026-03-10',
    dueDate: '2026-03-20',
    notes: 'Full retouch, composite sky replacement on two shots, color harmonization',
  },
]

const filterTabs = ['All', 'Requested', 'In Progress', 'Delivered'] as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

function getStatusIndex(status: EditStatus): number {
  return statusSteps.findIndex((s) => s.key === status)
}

function StatusPipeline({ status }: { status: EditStatus }) {
  const activeIdx = getStatusIndex(status)
  return (
    <div className="flex items-center gap-1">
      {statusSteps.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = idx <= activeIdx
        const isCurrent = idx === activeIdx
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                isCurrent
                  ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                  : isCompleted
                  ? 'bg-[#ffb780]/20 text-[#ffb780]'
                  : 'bg-surface-container-highest text-on-surface-variant/30'
              }`}
              title={step.label}
            >
              <Icon size={12} />
            </div>
            {idx < statusSteps.length - 1 && (
              <div
                className={`h-0.5 w-3 rounded-full ${
                  idx < activeIdx ? 'bg-[#ffb780]/40' : 'bg-outline-variant/20'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EditsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [activeTab, setActiveTab] = useState<(typeof filterTabs)[number]>('All')

  const filteredRequests = mockRequests.filter((r) => {
    if (activeTab === 'All') return true
    if (activeTab === 'Requested') return r.status === 'requested' || r.status === 'reviewed' || r.status === 'priced'
    if (activeTab === 'In Progress') return r.status === 'paid' || r.status === 'in_progress'
    if (activeTab === 'Delivered') return r.status === 'delivered'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/dashboard/project/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Project
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl italic font-extrabold text-on-surface flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441]">
              <Pencil size={20} className="text-[#4e2600]" />
            </div>
            Edit Requests
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage photo edit requests from your clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#ffb780]/15 px-3 py-1 text-xs font-medium text-[#ffb780]">
            {mockRequests.length} total
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-surface-container-low p-1 border border-outline-variant/20 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-br from-[#ffb780] to-[#d48441] text-[#4e2600]'
                : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Edit Request Cards */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 space-y-4 hover:border-outline-variant/50 transition-colors"
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {req.clientInitials}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">{req.clientName}</h3>
                    <span className="text-xs text-on-surface-variant/60">
                      Requested {new Date(req.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[req.status]}`}>
                    {statusSteps[getStatusIndex(req.status)].label}
                  </span>
                  <button className="rounded-lg p-1.5 text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Photo thumbnails */}
              <div>
                <SectionLabel>Selected Photos ({req.photos.length})</SectionLabel>
                <div className="flex items-center gap-2 mt-2">
                  {req.photos.slice(0, 5).map((photo, idx) => (
                    <div
                      key={photo}
                      className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container border border-outline-variant/20"
                    >
                      <ImageIcon size={16} className="text-on-surface-variant/30" />
                    </div>
                  ))}
                  {req.photos.length > 5 && (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-container-highest border border-outline-variant/20">
                      <span className="text-xs font-medium text-on-surface-variant">
                        +{req.photos.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status pipeline */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15">
                <StatusPipeline status={req.status} />
                <div className="flex items-center gap-4">
                  {req.quotedPrice !== null && (
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-on-surface-variant/50" />
                      <span className="text-sm font-bold text-on-surface">${req.quotedPrice}</span>
                    </div>
                  )}
                  {req.dueDate && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-on-surface-variant/50" />
                      <span className="text-xs text-on-surface-variant">
                        Due {new Date(req.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-lg bg-surface-container px-4 py-3">
                <p className="text-xs text-on-surface-variant">{req.notes}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-16 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-highest">
            <Pencil size={28} className="text-on-surface-variant/20" />
          </div>
          <div className="text-center">
            <p className="font-headline font-bold text-on-surface">No edit requests</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Client edit requests will appear here once the gallery is published
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
