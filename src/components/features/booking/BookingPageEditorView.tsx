'use client'

import { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Globe,
  ExternalLink,
  ImageIcon,
  Type,
  Star,
  LayoutGrid,
  DollarSign,
  Check,
  Copy,
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Upload,
  Search,
  Phone,
  Mail,
  Calendar,
  AlignLeft,
  X,
  Monitor,
  Smartphone,
  Settings,
  Layers,
  FileText,
  AtSign,
  Eye,
} from 'lucide-react'
import type {
  BookingPackage,
  BookingTestimonial,
  PageSection,
  PageSectionKey,
  BookingPageSEO,
  BookingCustomDomain,
  ContactFormField,
} from '@/types/booking'

/* ------------------------------------------------------------------ */
/*  Default mock data                                                   */
/* ------------------------------------------------------------------ */

const DEFAULT_SECTIONS: PageSection[] = [
  { key: 'hero', label: 'Hero & Intro', icon: 'ImageIcon', enabled: true, sortOrder: 0 },
  { key: 'packages', label: 'Packages', icon: 'DollarSign', enabled: true, sortOrder: 1 },
  { key: 'portfolio', label: 'Portfolio Gallery', icon: 'LayoutGrid', enabled: true, sortOrder: 2 },
  { key: 'testimonials', label: 'Testimonials', icon: 'Star', enabled: true, sortOrder: 3 },
  { key: 'contact', label: 'Contact Form', icon: 'Mail', enabled: true, sortOrder: 4 },
]

const DEFAULT_TESTIMONIALS: BookingTestimonial[] = [
  {
    id: 't1',
    clientName: 'Sarah & Michael',
    clientHandle: '@sarahandmichael',
    quote: 'Absolutely stunning wedding photos. Every moment captured perfectly — we cried happy tears looking through the gallery!',
    rating: 5,
    shootType: 'Wedding',
    date: '2025-11',
  },
  {
    id: 't2',
    clientName: 'Emma Thompson',
    quote: 'The branding shoot transformed how I present my business. Professional, creative, and so easy to work with.',
    rating: 5,
    shootType: 'Branding',
    date: '2025-10',
  },
]

const DEFAULT_FORM_FIELDS: ContactFormField[] = [
  { id: 'name', label: 'Full Name', type: 'text', required: true, enabled: true },
  { id: 'email', label: 'Email Address', type: 'email', required: true, enabled: true },
  { id: 'phone', label: 'Phone Number', type: 'phone', required: false, enabled: true },
  { id: 'date', label: 'Preferred Date', type: 'date', required: false, enabled: true },
  { id: 'type', label: 'Shoot Type', type: 'select', required: true, enabled: true, options: ['Wedding', 'Portrait', 'Family', 'Commercial', 'Branding', 'Other'] },
  { id: 'message', label: 'Tell me about your vision', type: 'textarea', required: false, enabled: true },
]

const DEFAULT_SEO: BookingPageSEO = {
  title: '',
  description: '',
  ogImageUrl: '',
}

/* ------------------------------------------------------------------ */
/*  Glass panel helper                                                  */
/* ------------------------------------------------------------------ */

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl p-5 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  label,
  action,
}: {
  icon: React.ElementType
  label: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-amber-400" />
        <h3 className="text-[13px] font-bold text-white">{label}</h3>
      </div>
      {action}
    </div>
  )
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
}) {
  const sharedClass =
    'w-full rounded-xl px-3 py-2 text-[13px] text-white/90 outline-none focus:border-amber-400/50 transition-colors'
  const sharedStyle = { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.10)' }
  return (
    <div>
      <label className="block text-[11px] text-white/40 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`${sharedClass} resize-none`}
          style={sharedStyle}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={sharedClass}
          style={sharedStyle}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Toggle switch                                                       */
/* ------------------------------------------------------------------ */

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full shrink-0 transition-colors ${value ? 'bg-amber-500' : 'bg-white/20'}`}
      aria-checked={value}
      role="switch"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          value ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Sortable section row (for the Sections tab)                        */
/* ------------------------------------------------------------------ */

const SECTION_ICONS: Record<PageSectionKey, React.ElementType> = {
  hero: ImageIcon,
  packages: DollarSign,
  portfolio: LayoutGrid,
  testimonials: Star,
  contact: Mail,
}

interface SortableSectionRowProps {
  section: PageSection
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleEnabled: (enabled: boolean) => void
  children?: React.ReactNode
}

function SortableSectionRow({
  section,
  isExpanded,
  onToggleExpand,
  onToggleEnabled,
  children,
}: SortableSectionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const SectionIcon = SECTION_ICONS[section.key]

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <div
        className="flex items-center gap-3 rounded-2xl px-3 py-3 group cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Drag handle */}
        <button
          className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors touch-none shrink-0"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${section.label}`}
        >
          <GripVertical size={14} />
        </button>

        {/* Icon + label — expand toggle */}
        <button
          className="flex flex-1 items-center gap-2 min-w-0 text-left"
          onClick={onToggleExpand}
        >
          <SectionIcon size={13} className={`shrink-0 ${section.enabled ? 'text-amber-400' : 'text-white/25'}`} />
          <span className={`flex-1 text-[13px] font-medium truncate ${section.enabled ? 'text-white/85' : 'text-white/35'}`}>
            {section.label}
          </span>
          {children && (
            <span className="text-white/30 shrink-0">
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          )}
        </button>

        {/* Enable toggle */}
        <Toggle value={section.enabled} onChange={onToggleEnabled} />
      </div>

      {/* Expanded content */}
      {isExpanded && children && (
        <div
          className="mt-1 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Testimonial editor row                                             */
/* ------------------------------------------------------------------ */

interface TestimonialRowProps {
  testimonial: BookingTestimonial
  onUpdate: (t: BookingTestimonial) => void
  onDelete: () => void
}

function TestimonialRow({ testimonial, onUpdate, onDelete }: TestimonialRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-2xl p-3 space-y-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-white/80 truncate">{testimonial.clientName || 'New testimonial'}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={9}
                  className={s <= testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-white/15'}
                />
              ))}
            </div>
          </div>
          {!expanded && (
            <p className="text-[11px] text-white/40 truncate mt-0.5">{testimonial.quote}</p>
          )}
        </button>
        <button
          onClick={onDelete}
          className="shrink-0 p-1 rounded-lg text-white/20 hover:text-red-400 transition-colors"
          aria-label="Delete testimonial"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="space-y-2 pt-1">
          <FieldInput
            label="Client name"
            value={testimonial.clientName}
            onChange={(v) => onUpdate({ ...testimonial, clientName: v })}
            placeholder="Sarah & Michael"
          />
          <FieldInput
            label="Quote"
            value={testimonial.quote}
            onChange={(v) => onUpdate({ ...testimonial, quote: v })}
            placeholder="Absolutely stunning work..."
            multiline
            rows={2}
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] text-white/40 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdate({ ...testimonial, rating: s })}
                    className="p-0.5"
                    aria-label={`${s} stars`}
                  >
                    <Star
                      size={14}
                      className={s <= testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20 hover:text-amber-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <FieldInput
              label="Handle (optional)"
              value={testimonial.clientHandle ?? ''}
              onChange={(v) => onUpdate({ ...testimonial, clientHandle: v })}
              placeholder="@handle"
            />
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Contact form field row                                             */
/* ------------------------------------------------------------------ */

const FIELD_TYPE_ICONS: Record<ContactFormField['type'], React.ElementType> = {
  text: Type,
  email: Mail,
  phone: Phone,
  date: Calendar,
  select: ChevronDown,
  textarea: AlignLeft,
}

function ContactFieldRow({
  field,
  onToggle,
  onToggleRequired,
}: {
  field: ContactFormField
  onToggle: (enabled: boolean) => void
  onToggleRequired: (required: boolean) => void
}) {
  const Icon = FIELD_TYPE_ICONS[field.type]
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <Icon size={12} className="text-white/30 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className={`text-[12px] font-medium ${field.enabled ? 'text-white/80' : 'text-white/30'}`}>
          {field.label}
        </span>
      </div>
      <button
        onClick={() => onToggleRequired(!field.required)}
        className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-colors ${
          field.required
            ? 'bg-amber-400/15 text-amber-400'
            : 'bg-white/5 text-white/25 hover:bg-white/10'
        }`}
        title="Toggle required"
      >
        {field.required ? 'req' : 'opt'}
      </button>
      <Toggle value={field.enabled} onChange={onToggle} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero image upload zone                                             */
/* ------------------------------------------------------------------ */

function HeroUploadZone({
  imageUrl,
  onImageChange,
}: {
  imageUrl: string | null
  onImageChange: (url: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const url = URL.createObjectURL(file)
    onImageChange(url)
    // TODO: upload to Cloudflare Images and replace with CDN URL
  }

  return (
    <div>
      <label className="block text-[11px] text-white/40 mb-2">Hero Image</label>
      {imageUrl ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Hero" className="w-full h-full object-cover" />
          <button
            onClick={() => onImageChange(null)}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white/70 hover:text-white transition-colors"
            aria-label="Remove hero image"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-8 transition-colors hover:border-amber-400/40"
          style={{ background: 'rgba(0,0,0,0.20)', border: '1.5px dashed rgba(255,255,255,0.15)' }}
          aria-label="Upload hero image"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/05">
            <Upload size={16} className="text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-[12px] font-medium text-white/50">Click to upload hero image</p>
            <p className="text-[11px] text-white/25">JPG, PNG, WEBP — 16:7 aspect ratio recommended</p>
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Portfolio image grid (mini)                                        */
/* ------------------------------------------------------------------ */

function PortfolioManager({
  imageUrls,
  onAdd,
  onRemove,
}: {
  imageUrls: string[]
  onAdd: (url: string) => void
  onRemove: (idx: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {imageUrls.map((url, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white/70 hover:text-white"
              aria-label="Remove photo"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-xl gap-1 transition-colors hover:border-amber-400/40"
          style={{ aspectRatio: '1', background: 'rgba(0,0,0,0.20)', border: '1.5px dashed rgba(255,255,255,0.12)' }}
          aria-label="Add portfolio photo"
        >
          <Plus size={14} className="text-white/30" />
          <span className="text-[10px] text-white/25">Add</span>
        </button>
      </div>
      {imageUrls.length === 0 && (
        <p className="text-[11px] text-white/30">No portfolio photos yet. Add some to showcase your work.</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          files.forEach((f) => {
            const url = URL.createObjectURL(f)
            onAdd(url)
            // TODO: upload to Cloudflare Images
          })
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Live preview                                                       */
/* ------------------------------------------------------------------ */

interface PreviewProps {
  studioName: string
  headline: string
  bio: string
  ctaText: string
  heroImageUrl: string | null
  portfolioUrls: string[]
  packages: BookingPackage[]
  testimonials: BookingTestimonial[]
  sections: PageSection[]
  photographerSlug: string
  isMobile: boolean
}

function LivePreview({
  studioName,
  headline,
  bio,
  ctaText,
  heroImageUrl,
  portfolioUrls,
  packages,
  testimonials,
  sections,
  photographerSlug,
  isMobile,
}: PreviewProps) {
  const orderedEnabled = [...sections].sort((a, b) => a.sortOrder - b.sortOrder).filter((s) => s.enabled)
  const activePackages = packages.filter((p) => p.active).slice(0, 3)
  const initials = studioName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${isMobile ? 'mx-auto' : ''}`}
      style={{
        width: isMobile ? 375 : '100%',
        background: '#050508',
        border: '1px solid rgba(255,255,255,0.12)',
        minHeight: 500,
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex gap-1.5">
          {['bg-red-400/60', 'bg-yellow-400/60', 'bg-green-400/60'].map((c) => (
            <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <div
          className="flex-1 flex items-center gap-1 rounded-lg px-2 py-1 mx-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Search size={9} className="text-white/20" />
          <span className="text-[10px] text-white/25 font-mono">
            view1.studio/book/{photographerSlug}
          </span>
        </div>
      </div>

      {/* Page content */}
      <div className="overflow-y-auto" style={{ maxHeight: 560 }}>
        {orderedEnabled.map((sec) => {
          switch (sec.key) {
            case 'hero':
              return (
                <div key="hero">
                  {/* Hero image */}
                  {heroImageUrl ? (
                    <div className="relative" style={{ aspectRatio: '16/7' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #050508 100%)' }} />
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(59,130,246,0.15) 50%, rgba(168,85,247,0.15) 100%)', aspectRatio: '16/7' }}
                    >
                      <ImageIcon size={24} className="text-white/15" />
                    </div>
                  )}
                  {/* Profile */}
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-[16px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #3b82f6 50%, #a855f7 100%)' }}
                    >
                      {initials}
                    </div>
                    <div>
                      <h1 className="text-[17px] font-bold text-white">{studioName || 'Your Studio'}</h1>
                      <p className="text-[12px] text-white/45">{headline || 'Professional photographer'}</p>
                    </div>
                  </div>
                  {bio && (
                    <p className="px-6 pb-5 text-[12px] text-white/55 leading-relaxed">{bio}</p>
                  )}
                </div>
              )

            case 'packages':
              return activePackages.length > 0 ? (
                <div key="packages" className="px-6 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Services</p>
                  <div className="space-y-2">
                    {activePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between rounded-2xl px-4 py-3"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-white/90">{pkg.name}</p>
                          <p className="text-[10px] text-white/35">
                            {pkg.durationMinutes >= 60
                              ? `${Math.floor(pkg.durationMinutes / 60)}h`
                              : `${pkg.durationMinutes}m`}
                          </p>
                        </div>
                        <span className="font-mono text-[13px] font-bold text-white/80">{pkg.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null

            case 'portfolio':
              return portfolioUrls.length > 0 ? (
                <div key="portfolio" className="px-6 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Portfolio</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {portfolioUrls.slice(0, 6).map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null

            case 'testimonials':
              return testimonials.length > 0 ? (
                <div key="testimonials" className="px-6 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Client Stories</p>
                  <div className="space-y-3">
                    {testimonials.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="rounded-2xl p-4"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              className={s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-white/10'}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-white/70 leading-relaxed italic mb-2">&ldquo;{t.quote}&rdquo;</p>
                        <p className="text-[10px] font-semibold text-white/50">{t.clientName}</p>
                        {t.shootType && (
                          <p className="text-[10px] text-white/25">{t.shootType}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null

            case 'contact':
              return (
                <div key="contact" className="px-6 pb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Get in Touch</p>
                  <button
                    className="w-full rounded-2xl py-3 text-[14px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #3b82f6 50%, #a855f7 100%)' }}
                  >
                    {ctaText || 'Book a Session'}
                  </button>
                </div>
              )

            default:
              return null
          }
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

interface BookingPageEditorViewProps {
  photographerSlug: string
  packages: BookingPackage[]
}

export function BookingPageEditorView({ photographerSlug, packages }: BookingPageEditorViewProps) {
  /* --- Editor tab --- */
  type EditorTab = 'content' | 'sections' | 'settings'
  const [activeTab, setActiveTab] = useState<EditorTab>('content')

  /* --- Content state --- */
  const [studioName, setStudioName] = useState('View1 Photography')
  const [headline, setHeadline] = useState('Capturing Your Most Precious Moments')
  const [bio, setBio] = useState(
    'Award-winning photographer specializing in weddings, portraits, and branding. 8+ years crafting stories through light and emotion.',
  )
  const [ctaText, setCtaText] = useState('Book a Session')
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([])

  /* --- Section state (drag-to-reorder) --- */
  const [sections, setSections] = useState<PageSection[]>(DEFAULT_SECTIONS)
  const [expandedSection, setExpandedSection] = useState<PageSectionKey | null>(null)

  /* --- Testimonials --- */
  const [testimonials, setTestimonials] = useState<BookingTestimonial[]>(DEFAULT_TESTIMONIALS)

  /* --- Contact form fields --- */
  const [formFields, setFormFields] = useState<ContactFormField[]>(DEFAULT_FORM_FIELDS)

  /* --- Settings state --- */
  const [seo, setSeo] = useState<BookingPageSEO>(DEFAULT_SEO)
  const [customDomain, setCustomDomain] = useState<BookingCustomDomain>({
    domain: '',
    status: 'unverified',
  })

  /* --- Preview state --- */
  const [isMobile, setIsMobile] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  /* --- dnd-kit sensors --- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /* --- Drag end handler --- */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.key === active.id)
      const newIndex = prev.findIndex((s) => s.key === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((s, i) => ({ ...s, sortOrder: i }))
    })
  }, [])

  /* --- Section toggle --- */
  function toggleSection(key: PageSectionKey, enabled: boolean) {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, enabled } : s)))
  }

  /* --- Testimonial helpers --- */
  function addTestimonial() {
    const newT: BookingTestimonial = {
      id: `t${Date.now()}`,
      clientName: '',
      quote: '',
      rating: 5,
    }
    setTestimonials((prev) => [...prev, newT])
  }

  function updateTestimonial(updated: BookingTestimonial) {
    setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  function deleteTestimonial(id: string) {
    setTestimonials((prev) => prev.filter((t) => t.id !== id))
  }

  /* --- Form field helpers --- */
  function toggleFormField(id: string, enabled: boolean) {
    setFormFields((prev) => prev.map((f) => (f.id === id ? { ...f, enabled } : f)))
  }

  function toggleFormFieldRequired(id: string, required: boolean) {
    setFormFields((prev) => prev.map((f) => (f.id === id ? { ...f, required } : f)))
  }

  /* --- Save handler --- */
  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    // TODO(db-migration): persist BookingPageConfig to Supabase booking_page_configs table
  }

  /* --- Copy URL --- */
  function handleCopy() {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    // TODO: navigator.clipboard.writeText(`https://view1.studio/book/${photographerSlug}`)
  }

  const publicUrl = `view1.studio/book/${photographerSlug}`

  /* --- Tab pill styles --- */
  function tabCls(t: EditorTab) {
    return `flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all ${
      activeTab === t
        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        : 'text-white/40 hover:text-white/70 hover:bg-white/05'
    }`
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 px-6 py-5 xl:flex-row xl:gap-6">
      {/* ============================================================ */}
      {/* LEFT — Editor panel                                          */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-4 w-full xl:w-[400px] shrink-0">

        {/* Tab selector */}
        <div
          className="flex gap-1 rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button className={tabCls('content')} onClick={() => setActiveTab('content')}>
            <FileText size={12} />
            Content
          </button>
          <button className={tabCls('sections')} onClick={() => setActiveTab('sections')}>
            <Layers size={12} />
            Sections
          </button>
          <button className={tabCls('settings')} onClick={() => setActiveTab('settings')}>
            <Settings size={12} />
            Settings
          </button>
        </div>

        {/* Public URL bar (always visible) */}
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Globe size={13} className="text-white/30 shrink-0" />
          <span className="flex-1 text-[12px] font-mono text-white/60 truncate">{publicUrl}</span>
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
              copied ? 'text-emerald-400' : 'text-white/35 hover:text-white/65'
            }`}
          >
            {copied ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
          </button>
          <a
            href={`/book/${photographerSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg p-1 text-white/25 hover:text-amber-400 transition-colors"
            aria-label="Open booking page"
          >
            <ExternalLink size={12} />
          </a>
        </div>

        {/* ── CONTENT TAB ───────────────────────────────────────────── */}
        {activeTab === 'content' && (
          <div className="flex flex-col gap-4">
            {/* Hero image */}
            <GlassCard>
              <SectionHeader icon={ImageIcon} label="Hero Image" />
              <HeroUploadZone imageUrl={heroImageUrl} onImageChange={setHeroImageUrl} />
            </GlassCard>

            {/* Studio identity */}
            <GlassCard>
              <SectionHeader icon={Type} label="Studio Identity" />
              <div className="space-y-3">
                <FieldInput label="Studio Name" value={studioName} onChange={setStudioName} placeholder="Your Photography Studio" />
                <FieldInput label="Tagline / Headline" value={headline} onChange={setHeadline} placeholder="Capturing life's precious moments" />
                <FieldInput label="Bio" value={bio} onChange={setBio} placeholder="Tell visitors about your style and experience..." multiline rows={3} />
                <FieldInput label="CTA Button Text" value={ctaText} onChange={setCtaText} placeholder="Book a Session" />
              </div>
            </GlassCard>

            {/* Packages on page */}
            <GlassCard>
              <SectionHeader
                icon={DollarSign}
                label="Packages on Page"
                action={
                  <span className="text-[10px] text-white/30">{packages.filter((p) => p.active).length} active</span>
                }
              />
              {packages.filter((p) => p.active).length === 0 ? (
                <p className="text-[12px] text-white/30">No active packages. Go to the Packages tab to create some.</p>
              ) : (
                <div className="space-y-1.5">
                  {packages.filter((p) => p.active).map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div>
                        <span className="text-[12px] text-white/80">{pkg.name}</span>
                        <span className="ml-2 text-[10px] text-white/30">
                          {pkg.durationMinutes >= 60 ? `${Math.floor(pkg.durationMinutes / 60)}h` : `${pkg.durationMinutes}m`}
                        </span>
                      </div>
                      <span className="font-mono text-[12px] font-bold text-amber-300">{pkg.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ── SECTIONS TAB ──────────────────────────────────────────── */}
        {activeTab === 'sections' && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-white/35 px-1">
              Drag to reorder sections. Toggle to show or hide. Expand to edit content.
            </p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={sections.map((s) => s.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {[...sections].sort((a, b) => a.sortOrder - b.sortOrder).map((section) => (
                    <SortableSectionRow
                      key={section.key}
                      section={section}
                      isExpanded={expandedSection === section.key}
                      onToggleExpand={() =>
                        setExpandedSection(expandedSection === section.key ? null : section.key)
                      }
                      onToggleEnabled={(enabled) => toggleSection(section.key, enabled)}
                    >
                      {/* Expandable content per section type */}
                      {section.key === 'portfolio' && (
                        <PortfolioManager
                          imageUrls={portfolioUrls}
                          onAdd={(url) => setPortfolioUrls((prev) => [...prev, url])}
                          onRemove={(idx) => setPortfolioUrls((prev) => prev.filter((_, i) => i !== idx))}
                        />
                      )}

                      {section.key === 'testimonials' && (
                        <div className="space-y-2">
                          {testimonials.map((t) => (
                            <TestimonialRow
                              key={t.id}
                              testimonial={t}
                              onUpdate={updateTestimonial}
                              onDelete={() => deleteTestimonial(t.id)}
                            />
                          ))}
                          <button
                            onClick={addTestimonial}
                            className="w-full flex items-center justify-center gap-1.5 rounded-2xl py-2 text-[12px] text-white/40 hover:text-white/70 transition-colors"
                            style={{ border: '1.5px dashed rgba(255,255,255,0.10)' }}
                          >
                            <Plus size={12} />
                            Add testimonial
                          </button>
                        </div>
                      )}

                      {section.key === 'contact' && (
                        <div className="space-y-1.5">
                          {formFields.map((field) => (
                            <ContactFieldRow
                              key={field.id}
                              field={field}
                              onToggle={(enabled) => toggleFormField(field.id, enabled)}
                              onToggleRequired={(required) => toggleFormFieldRequired(field.id, required)}
                            />
                          ))}
                        </div>
                      )}

                      {section.key === 'hero' && (
                        <div className="space-y-2">
                          <HeroUploadZone imageUrl={heroImageUrl} onImageChange={setHeroImageUrl} />
                        </div>
                      )}

                      {section.key === 'packages' && (
                        <p className="text-[11px] text-white/35">
                          Packages are managed in the Packages tab. Active packages display here automatically.
                        </p>
                      )}
                    </SortableSectionRow>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* ── SETTINGS TAB ──────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4">
            {/* Custom domain */}
            <GlassCard>
              <SectionHeader icon={Globe} label="Custom Domain" />
              <div className="space-y-3">
                <FieldInput
                  label="Domain"
                  value={customDomain.domain}
                  onChange={(v) => setCustomDomain((prev) => ({ ...prev, domain: v, status: 'unverified' }))}
                  placeholder="photos.yourstudio.com"
                />
                {customDomain.domain && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        customDomain.status === 'verified'
                          ? 'bg-emerald-400/15 text-emerald-400'
                          : customDomain.status === 'error'
                          ? 'bg-red-400/15 text-red-400'
                          : 'bg-white/08 text-white/40'
                      }`}
                    >
                      {customDomain.status === 'verified'
                        ? '✓ Verified'
                        : customDomain.status === 'error'
                        ? '✗ DNS error'
                        : '⏳ Unverified'}
                    </span>
                    <button
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
                      onClick={() => setCustomDomain((prev) => ({ ...prev, status: 'verifying' }))}
                    >
                      {/* TODO: trigger DNS verification API call */}
                      Verify DNS
                    </button>
                  </div>
                )}
                {customDomain.domain && customDomain.status === 'unverified' && (
                  <div
                    className="rounded-xl p-3 space-y-1"
                    style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-[11px] font-medium text-white/50">Add this CNAME record to your DNS:</p>
                    <code className="text-[10px] font-mono text-amber-300">CNAME → pages.view1.studio</code>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* SEO metadata */}
            <GlassCard>
              <SectionHeader icon={Search} label="SEO & Social" />
              <div className="space-y-3">
                <FieldInput
                  label="Page title"
                  value={seo.title}
                  onChange={(v) => setSeo((prev) => ({ ...prev, title: v }))}
                  placeholder={`${studioName} — Book a Session`}
                />
                <FieldInput
                  label="Meta description"
                  value={seo.description}
                  onChange={(v) => setSeo((prev) => ({ ...prev, description: v }))}
                  placeholder="Describe your photography style and services..."
                  multiline
                  rows={2}
                />
                <FieldInput
                  label="Social share image URL"
                  value={seo.ogImageUrl ?? ''}
                  onChange={(v) => setSeo((prev) => ({ ...prev, ogImageUrl: v }))}
                  placeholder="https://..."
                />
                {seo.description && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.20)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] text-white/30 mb-1">Preview</p>
                    <p className="text-[12px] text-blue-300 underline">{seo.title || `${studioName} — Book a Session`}</p>
                    <p className="text-[11px] text-white/45 mt-0.5 leading-relaxed">{seo.description}</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Social links */}
            <GlassCard>
              <SectionHeader icon={AtSign} label="Social Links" />
              <div className="space-y-2">
                {[
                  { label: 'Instagram', placeholder: '@yourstudio' },
                  { label: 'Facebook', placeholder: 'facebook.com/yourstudio' },
                  { label: 'Website', placeholder: 'https://yourstudio.com' },
                ].map(({ label, placeholder }) => (
                  <FieldInput
                    key={label}
                    label={label}
                    value=""
                    onChange={() => {
                      /* TODO: wire social link state */
                    }}
                    placeholder={placeholder}
                  />
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Save & Publish button */}
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: saved
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #f59e0b 0%, #3b82f6 50%, #a855f7 100%)',
          }}
        >
          {saved ? <><Check size={14} />Saved!</> : <><Eye size={14} />Save & Publish</>}
        </button>
      </div>

      {/* ============================================================ */}
      {/* RIGHT — Live preview                                         */}
      {/* ============================================================ */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Preview toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-white/40">Live preview</span>
            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              {publicUrl}
            </span>
          </div>
          {/* Desktop / mobile toggle */}
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={() => setIsMobile(false)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                !isMobile ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <Monitor size={11} />
              Desktop
            </button>
            <button
              onClick={() => setIsMobile(true)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                isMobile ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
              }`}
            >
              <Smartphone size={11} />
              Mobile
            </button>
          </div>
        </div>

        {/* Preview frame */}
        <div className={`flex ${isMobile ? 'justify-center' : ''}`}>
          <LivePreview
            studioName={studioName}
            headline={headline}
            bio={bio}
            ctaText={ctaText}
            heroImageUrl={heroImageUrl}
            portfolioUrls={portfolioUrls}
            packages={packages}
            testimonials={testimonials}
            sections={sections}
            photographerSlug={photographerSlug}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  )
}
