'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Package,
  Clock,
  DollarSign,
  GripVertical,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { BookingPackage, BookingType } from '@/types/booking'

/* ------------------------------------------------------------------ */
/*  Shoot type options                                                   */
/* ------------------------------------------------------------------ */

const BOOKING_TYPES: BookingType[] = [
  'Wedding', 'Engagement', 'Portrait', 'Family', 'Newborn', 'Maternity',
  'Commercial', 'Branding', 'Corporate', 'Event', 'Mini Session', 'Elopement', 'Other',
]

/* ------------------------------------------------------------------ */
/*  Package templates                                                    */
/* ------------------------------------------------------------------ */

interface PackageTemplate {
  id: string
  name: string
  description: string
  priceCents: number
  price: string
  durationMinutes: number
  includes: string[]
  applicableTypes: BookingType[]
  category: string
}

const PACKAGE_TEMPLATES: PackageTemplate[] = [
  {
    id: 'tpl-wedding-full',
    name: 'Wedding Full Day',
    description: 'Complete coverage for your dream wedding day.',
    priceCents: 450000,
    price: '$4,500',
    durationMinutes: 720,
    includes: ['12 hours coverage', '2 photographers', '800+ edited photos', 'Online gallery', 'USB delivery', 'Engagement session'],
    applicableTypes: ['Wedding'],
    category: 'Wedding',
  },
  {
    id: 'tpl-wedding-essentials',
    name: 'Wedding Essentials',
    description: 'Perfect for intimate ceremonies and micro-weddings.',
    priceCents: 280000,
    price: '$2,800',
    durationMinutes: 480,
    includes: ['8 hours coverage', '1 photographer', '400+ edited photos', 'Online gallery'],
    applicableTypes: ['Wedding', 'Elopement'],
    category: 'Wedding',
  },
  {
    id: 'tpl-elopement',
    name: 'Elopement Adventure',
    description: 'Intimate and authentic for couples who elope.',
    priceCents: 150000,
    price: '$1,500',
    durationMinutes: 240,
    includes: ['4 hours coverage', '200+ edited photos', 'Online gallery', 'Travel within 50 miles'],
    applicableTypes: ['Elopement'],
    category: 'Wedding',
  },
  {
    id: 'tpl-engagement',
    name: 'Engagement Session',
    description: 'Capture your love story before the big day.',
    priceCents: 60000,
    price: '$600',
    durationMinutes: 120,
    includes: ['2 hours session', '60+ edited photos', 'Online gallery', '1 location'],
    applicableTypes: ['Engagement'],
    category: 'Portrait',
  },
  {
    id: 'tpl-portrait',
    name: 'Portrait Session',
    description: 'Timeless portraits for individuals and couples.',
    priceCents: 35000,
    price: '$350',
    durationMinutes: 60,
    includes: ['1 hour session', '30+ edited photos', 'Online gallery', '2 print-ready files'],
    applicableTypes: ['Portrait'],
    category: 'Portrait',
  },
  {
    id: 'tpl-family',
    name: 'Family Session',
    description: 'Capture the whole family together.',
    priceCents: 50000,
    price: '$500',
    durationMinutes: 90,
    includes: ['90 min session', '50+ edited photos', 'Online gallery', '5 print-ready files'],
    applicableTypes: ['Family', 'Newborn', 'Maternity'],
    category: 'Family',
  },
  {
    id: 'tpl-mini',
    name: 'Mini Session',
    description: 'Quick and affordable portraits for seasonal updates.',
    priceCents: 15000,
    price: '$150',
    durationMinutes: 30,
    includes: ['30 min session', '15+ edited photos', '1 digital file'],
    applicableTypes: ['Mini Session', 'Portrait', 'Family'],
    category: 'Family',
  },
  {
    id: 'tpl-commercial-half',
    name: 'Commercial Half-Day',
    description: 'Professional imagery for brands and businesses.',
    priceCents: 120000,
    price: '$1,200',
    durationMinutes: 240,
    includes: ['4 hours coverage', '80+ edited photos', 'Commercial license', 'Online delivery'],
    applicableTypes: ['Commercial', 'Branding', 'Corporate'],
    category: 'Commercial',
  },
  {
    id: 'tpl-commercial-full',
    name: 'Commercial Full Day',
    description: 'Maximum coverage for product launches and campaigns.',
    priceCents: 220000,
    price: '$2,200',
    durationMinutes: 480,
    includes: ['8 hours coverage', '150+ edited photos', 'Commercial license', 'Art direction support', 'Online delivery'],
    applicableTypes: ['Commercial', 'Branding'],
    category: 'Commercial',
  },
  {
    id: 'tpl-event',
    name: 'Event Coverage',
    description: 'Comprehensive coverage for corporate and social events.',
    priceCents: 180000,
    price: '$1,800',
    durationMinutes: 360,
    includes: ['6 hours coverage', '300+ edited photos', 'Online gallery', 'Fast turnaround (48h)'],
    applicableTypes: ['Event', 'Corporate'],
    category: 'Commercial',
  },
]

const TEMPLATE_CATEGORIES = ['All', 'Wedding', 'Portrait', 'Family', 'Commercial'] as const
type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]

/* ------------------------------------------------------------------ */
/*  PackageCard (non-sortable, used in DragOverlay)                     */
/* ------------------------------------------------------------------ */

interface PackageCardProps {
  pkg: BookingPackage
  onToggleActive: (id: string) => void
  onEdit: (pkg: BookingPackage) => void
  onDelete: (id: string) => void
  onDuplicate: (pkg: BookingPackage) => void
  isDragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  style?: React.CSSProperties
}

function PackageCard({
  pkg,
  onToggleActive,
  onEdit,
  onDelete,
  onDuplicate,
  isDragging = false,
  dragHandleProps,
  style,
}: PackageCardProps) {
  const hours = Math.floor(pkg.durationMinutes / 60)
  const mins = pkg.durationMinutes % 60
  const durationLabel = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`

  return (
    <div
      style={{
        background: isDragging
          ? 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.07) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
        backdropFilter: 'blur(20px)',
        border: pkg.active
          ? '1px solid rgba(245,158,11,0.25)'
          : '1px solid rgba(255,255,255,0.10)',
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? '0 20px 60px rgba(0,0,0,0.5)' : undefined,
        ...style,
      }}
      className={`relative rounded-3xl p-5 transition-all ${!pkg.active ? 'opacity-60' : ''}`}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </div>

      <div className="ml-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-bold text-white/90 font-sans">{pkg.name}</h3>
              {!pkg.active && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-white/40">
                  Inactive
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-white/45 line-clamp-2">{pkg.description}</p>
          </div>

          {/* Price */}
          <div className="shrink-0 text-right">
            <p className="font-mono text-[18px] font-bold text-white">{pkg.price}</p>
            <div className="flex items-center justify-end gap-1 mt-0.5 text-[11px] text-white/40">
              <Clock size={10} />
              <span className="font-mono">{durationLabel}</span>
            </div>
          </div>
        </div>

        {/* Includes */}
        <ul className="mt-3 space-y-1">
          {pkg.includes.map((item) => (
            <li key={item} className="flex items-center gap-2 text-[12px] text-white/60">
              <Check size={10} className="text-amber-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* Applicable types */}
        {pkg.applicableTypes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pkg.applicableTypes.map((type) => (
              <span
                key={type}
                className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300/80"
              >
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onToggleActive(pkg.id)}
              className="shrink-0"
              title={pkg.active ? 'Deactivate' : 'Activate'}
            >
              {pkg.active
                ? <ToggleRight size={20} className="text-amber-400" />
                : <ToggleLeft size={20} className="text-white/30" />}
            </button>
            <span className="text-[11px] text-white/40">
              {pkg.active ? 'Active on booking page' : 'Hidden from booking page'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onDuplicate(pkg)}
              title="Duplicate package"
              className="flex items-center gap-1 rounded-xl border border-white/15 px-3 py-1.5 text-[11px] font-medium text-white/50 hover:border-white/30 hover:text-white/70 transition-colors"
            >
              <Copy size={10} />
              Duplicate
            </button>
            <button
              onClick={() => onEdit(pkg)}
              className="flex items-center gap-1 rounded-xl border border-white/15 px-3 py-1.5 text-[11px] font-medium text-white/50 hover:border-amber-400/30 hover:text-amber-300 transition-colors"
            >
              <Pencil size={10} />
              Edit
            </button>
            <button
              onClick={() => onDelete(pkg.id)}
              className="flex items-center gap-1 rounded-xl border border-white/15 px-3 py-1.5 text-[11px] font-medium text-white/50 hover:border-red-400/30 hover:text-red-400 transition-colors"
            >
              <Trash2 size={10} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SortablePackageCard (wraps PackageCard with dnd-kit sortable)       */
/* ------------------------------------------------------------------ */

interface SortablePackageCardProps {
  pkg: BookingPackage
  onToggleActive: (id: string) => void
  onEdit: (pkg: BookingPackage) => void
  onDelete: (id: string) => void
  onDuplicate: (pkg: BookingPackage) => void
}

function SortablePackageCard({
  pkg,
  onToggleActive,
  onEdit,
  onDelete,
  onDuplicate,
}: SortablePackageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <PackageCard
        pkg={pkg}
        onToggleActive={onToggleActive}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PackageFormModal                                                     */
/* ------------------------------------------------------------------ */

interface PackageFormModalProps {
  initial?: BookingPackage
  onSave: (pkg: BookingPackage) => void
  onClose: () => void
  nextSortOrder: number
}

function PackageFormModal({ initial, onSave, onClose, nextSortOrder }: PackageFormModalProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priceStr, setPriceStr] = useState(initial ? String(initial.priceCents / 100) : '')
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 60)
  const [includesStr, setIncludesStr] = useState(initial?.includes.join('\n') ?? '')
  const [selectedTypes, setSelectedTypes] = useState<BookingType[]>(initial?.applicableTypes ?? [])

  function toggleType(type: BookingType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  function handleSave() {
    if (!name.trim()) return
    const priceCents = Math.round(parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0') * 100)
    const includes = includesStr
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    onSave({
      id: initial?.id ?? `pkg-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      priceCents,
      price: priceCents > 0 ? `$${(priceCents / 100).toLocaleString('en-US')}` : 'Free',
      durationMinutes,
      includes,
      applicableTypes: selectedTypes,
      active: initial?.active ?? true,
      sortOrder: initial?.sortOrder ?? nextSortOrder,
    })
    onClose()
  }

  const isValid = name.trim().length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 my-4"
        style={{
          background: 'linear-gradient(180deg, rgba(40,40,60,0.98) 0%, rgba(20,20,35,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.60)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-white font-sans">
            {initial ? 'Edit Package' : 'New Package'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] text-white/40 mb-1">Package Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wedding Essentials"
              className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Perfect for intimate ceremonies…"
              className="w-full rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-white/40 mb-1">Price (USD)</label>
              <div className="relative">
                <DollarSign
                  size={12}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  placeholder="2500"
                  className="w-full rounded-xl pl-7 pr-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-white/40 mb-1">Duration (min)</label>
              <div className="relative">
                <Clock
                  size={12}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl pl-7 pr-3 py-2.5 text-[13px] text-white/90 outline-none"
                  style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-1">
              What&apos;s Included (one per line)
            </label>
            <textarea
              value={includesStr}
              onChange={(e) => setIncludesStr(e.target.value)}
              placeholder={'8 hours coverage\n400+ edited photos\nOnline gallery'}
              rows={4}
              className="w-full resize-none rounded-xl px-3 py-2.5 text-[13px] text-white/90 placeholder:text-white/25 outline-none font-mono"
              style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          <div>
            <label className="block text-[11px] text-white/40 mb-2">Applicable Shoot Types</label>
            <div className="flex flex-wrap gap-2">
              {BOOKING_TYPES.map((type) => {
                const selected = selectedTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                      selected
                        ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                        : 'bg-transparent border-white/15 text-white/40 hover:border-white/30 hover:text-white/60'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/15 px-5 py-2 text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #A855F7 100%)',
            }}
          >
            <Check size={13} />
            {initial ? 'Save Changes' : 'Create Package'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TemplateCard                                                         */
/* ------------------------------------------------------------------ */

interface TemplateCardProps {
  template: PackageTemplate
  onUse: (template: PackageTemplate) => void
  alreadyAdded: boolean
}

function TemplateCard({ template, onUse, alreadyAdded }: TemplateCardProps) {
  const hours = Math.floor(template.durationMinutes / 60)
  const mins = template.durationMinutes % 60
  const durationLabel = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`

  return (
    <div
      className="relative rounded-2xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-white/85 font-sans truncate">{template.name}</p>
            {alreadyAdded && (
              <span className="shrink-0 rounded-full bg-green-400/15 px-1.5 py-0.5 text-[9px] font-medium text-green-400">
                Added
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{template.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-mono text-[13px] font-bold text-white/80">{template.price}</span>
            <span className="flex items-center gap-1 text-[11px] text-white/35">
              <Clock size={9} />
              <span className="font-mono">{durationLabel}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {template.applicableTypes.slice(0, 3).map((type) => (
              <span
                key={type}
                className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-white/40"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => onUse(template)}
          disabled={alreadyAdded}
          className="shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: alreadyAdded ? 'transparent' : 'rgba(245,158,11,0.10)',
            border: alreadyAdded ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(245,158,11,0.30)',
            color: alreadyAdded ? 'rgba(255,255,255,0.30)' : '#F59E0B',
          }}
        >
          {alreadyAdded ? 'Added' : 'Use'}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BookingPackagesView                                                  */
/* ------------------------------------------------------------------ */

interface BookingPackagesViewProps {
  packages: BookingPackage[]
  onUpdatePackage: (pkg: BookingPackage) => void
  onDeletePackage: (id: string) => void
  onAddPackage: (pkg: BookingPackage) => void
  onReorderPackages: (packages: BookingPackage[]) => void
}

export function BookingPackagesView({
  packages,
  onUpdatePackage,
  onDeletePackage,
  onAddPackage,
  onReorderPackages,
}: BookingPackagesViewProps) {
  const [editingPackage, setEditingPackage] = useState<BookingPackage | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('All')

  // dnd-kit sensors — pointer with 8px activation, touch with 200ms delay
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const sortedPackages = [...packages].sort((a, b) => a.sortOrder - b.sortOrder)
  const packageIds = sortedPackages.map((p) => p.id)
  const activeDragPackage = activeDragId ? packages.find((p) => p.id === activeDragId) : null
  const nextSortOrder = packages.length > 0 ? Math.max(...packages.map((p) => p.sortOrder)) + 1 : 1

  // Set of existing package names (for template "already added" detection)
  const existingNames = new Set(packages.map((p) => p.name.toLowerCase()))

  // Filtered templates
  const filteredTemplates =
    templateCategory === 'All'
      ? PACKAGE_TEMPLATES
      : PACKAGE_TEMPLATES.filter((t) => t.category === templateCategory)

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDragId(null)

    if (!over || active.id === over.id) return

    const oldIndex = sortedPackages.findIndex((p) => p.id === active.id)
    const newIndex = sortedPackages.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(sortedPackages, oldIndex, newIndex).map((pkg, i) => ({
      ...pkg,
      sortOrder: i + 1,
    }))
    onReorderPackages(reordered)
  }

  function handleToggleActive(id: string) {
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) return
    onUpdatePackage({ ...pkg, active: !pkg.active })
  }

  const handleDuplicate = useCallback(
    (pkg: BookingPackage) => {
      const duplicate: BookingPackage = {
        ...pkg,
        id: `pkg-${Date.now()}`,
        name: `${pkg.name} (Copy)`,
        active: false,
        sortOrder: nextSortOrder,
      }
      onAddPackage(duplicate)
    },
    [nextSortOrder, onAddPackage],
  )

  function handleUseTemplate(template: PackageTemplate) {
    const pkg: BookingPackage = {
      id: `pkg-${Date.now()}`,
      name: template.name,
      description: template.description,
      priceCents: template.priceCents,
      price: template.price,
      durationMinutes: template.durationMinutes,
      includes: template.includes,
      applicableTypes: template.applicableTypes,
      active: true,
      sortOrder: nextSortOrder,
    }
    onAddPackage(pkg)
  }

  return (
    <div className="px-6 py-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-white font-sans">Packages Manager</h2>
          <p className="text-[12px] text-white/40 mt-0.5">
            {packages.filter((p) => p.active).length} of {packages.length} active
            {packages.length > 1 && (
              <span className="ml-2 text-white/25">· Drag cards to reorder</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Templates toggle */}
          <button
            onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-[13px] font-medium text-white/50 hover:border-amber-400/30 hover:text-amber-300 transition-all"
          >
            <Sparkles size={14} />
            Templates
            {showTemplates
              ? <ChevronUp size={12} className="opacity-60" />
              : <ChevronDown size={12} className="opacity-60" />}
          </button>

          {/* New Package */}
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #A855F7 100%)',
            }}
          >
            <Plus size={14} />
            New Package
          </button>
        </div>
      </div>

      {/* Templates panel */}
      {showTemplates && (
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)',
            border: '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles size={15} className="text-amber-400" />
              <h3 className="text-[14px] font-bold text-white/85">Package Templates</h3>
              <span className="text-[12px] text-white/35">
                — start from a proven structure
              </span>
            </div>
            <button
              onClick={() => setShowTemplates(false)}
              className="rounded-lg p-1 text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setTemplateCategory(cat)}
                className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
                  templateCategory === cat
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                    : 'bg-transparent border-white/12 text-white/40 hover:border-white/25 hover:text-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                alreadyAdded={existingNames.has(template.name.toLowerCase())}
              />
            ))}
          </div>
        </div>
      )}

      {/* Package list (with drag-to-reorder) */}
      {packages.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-3xl py-16"
          style={{ border: '1px dashed rgba(255,255,255,0.15)' }}
        >
          <Package size={32} className="text-white/20 mb-3" />
          <p className="text-[14px] font-medium text-white/50">No packages yet</p>
          <p className="text-[12px] text-white/30 mt-1 mb-5">
            Create your first package or start from a template
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-[12px] font-medium text-white/50 hover:border-amber-400/30 hover:text-amber-300 transition-colors"
            >
              <Sparkles size={13} />
              Browse Templates
            </button>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[12px] font-bold text-white hover:opacity-90 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #A855F7 100%)',
              }}
            >
              <Plus size={13} />
              New Package
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={packageIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedPackages.map((pkg) => (
                <SortablePackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onToggleActive={handleToggleActive}
                  onEdit={setEditingPackage}
                  onDelete={onDeletePackage}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag overlay — ghost card while dragging */}
          <DragOverlay>
            {activeDragPackage ? (
              <div className="rotate-1 scale-[1.02]">
                <PackageCard
                  pkg={activeDragPackage}
                  onToggleActive={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Edit modal */}
      {editingPackage && (
        <PackageFormModal
          initial={editingPackage}
          onSave={onUpdatePackage}
          onClose={() => setEditingPackage(null)}
          nextSortOrder={nextSortOrder}
        />
      )}

      {/* New package modal */}
      {showNewForm && (
        <PackageFormModal
          onSave={onAddPackage}
          onClose={() => setShowNewForm(false)}
          nextSortOrder={nextSortOrder}
        />
      )}
    </div>
  )
}
