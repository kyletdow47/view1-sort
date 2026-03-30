'use client'

import { useState } from 'react'
import {
  LayoutTemplate,
  Plus,
  Pencil,
  Copy,
  Trash2,
  X,
  Check,
  Star,
  Link2,
  ChevronDown,
  Save,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type Category = 'Wedding' | 'Portrait' | 'Commercial' | 'Event' | 'Real Estate'

interface Offer {
  id: string
  name: string
  category: Category
  basePrice: number
  description: string
  inclusions: string[]
  popular: boolean
  linkedToForm: boolean
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const INITIAL_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    name: 'Wedding Full Day',
    category: 'Wedding',
    basePrice: 3200,
    description:
      'Complete coverage of your wedding day from preparation through reception. Delivered as a fully edited online gallery within 6 weeks.',
    inclusions: ['8 hours coverage', '2 photographers', '800+ edited photos', 'Online gallery', 'Print release'],
    popular: true,
    linkedToForm: true,
  },
  {
    id: 'offer-2',
    name: 'Portrait Session',
    category: 'Portrait',
    basePrice: 450,
    description:
      'A focused 90-minute portrait session with a curated selection of professionally edited images.',
    inclusions: ['90 min session', '30 edited photos', 'Online gallery', '1 location'],
    popular: false,
    linkedToForm: true,
  },
  {
    id: 'offer-3',
    name: 'Commercial Brand Shoot',
    category: 'Commercial',
    basePrice: 1800,
    description:
      'Half-day commercial shoot for brands needing product, lifestyle, or team photography for marketing use.',
    inclusions: ['4 hours on-site', '1 photographer + 1 assistant', '60 edited images', 'Commercial license', 'RAW files'],
    popular: false,
    linkedToForm: false,
  },
]

const CATEGORIES: Category[] = ['Wedding', 'Portrait', 'Commercial', 'Event', 'Real Estate']

const CATEGORY_STYLES: Record<Category, string> = {
  Wedding: 'bg-primary/10 text-primary border-primary/20',
  Portrait: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Commercial: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
  Event: 'bg-violet-400/10 text-violet-400 border-violet-400/20',
  'Real Estate': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
}

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                   */
/* ------------------------------------------------------------------ */

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 ${className}`}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Offer form (inline builder)                                        */
/* ------------------------------------------------------------------ */

interface OfferFormProps {
  initial?: Offer
  onSave: (offer: Offer) => void
  onCancel: () => void
}

function OfferForm({ initial, onSave, onCancel }: OfferFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'Wedding')
  const [basePrice, setBasePrice] = useState(String(initial?.basePrice ?? ''))
  const [description, setDescription] = useState(initial?.description ?? '')
  const [inclusions, setInclusions] = useState<string[]>(initial?.inclusions ?? [])
  const [inclusionInput, setInclusionInput] = useState('')
  const [popular, setPopular] = useState(initial?.popular ?? false)
  const [linkedToForm] = useState(initial?.linkedToForm ?? false)

  function addInclusion() {
    const trimmed = inclusionInput.trim()
    if (trimmed && !inclusions.includes(trimmed)) {
      setInclusions([...inclusions, trimmed])
      setInclusionInput('')
    }
  }

  function removeInclusion(item: string) {
    setInclusions(inclusions.filter((i) => i !== item))
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id: initial?.id ?? `offer-${Date.now()}`,
      name: name.trim(),
      category,
      basePrice: parseFloat(basePrice) || 0,
      description: description.trim(),
      inclusions,
      popular,
      linkedToForm,
    })
  }

  return (
    <Card className="border-primary/30 !bg-surface-container">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-headline font-extrabold text-lg text-on-surface">
          {initial ? 'Edit Offer' : 'New Offer'}
        </h3>
        <button onClick={onCancel} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5 md:col-span-2">
          <SectionLabel>Offer Name</SectionLabel>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wedding Full Day"
            className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <SectionLabel>Category</SectionLabel>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full appearance-none rounded-xl bg-background px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          </div>
        </div>

        {/* Base Price */}
        <div className="space-y-1.5">
          <SectionLabel>Base Price (USD)</SectionLabel>
          <div className="flex items-center rounded-xl bg-background ring-1 ring-outline-variant/30 focus-within:ring-primary/50 overflow-hidden">
            <span className="px-4 py-2.5 text-sm text-on-surface-variant border-r border-outline-variant/20">$</span>
            <input
              type="number"
              min="0"
              step="50"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-on-surface outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-2">
          <SectionLabel>Description</SectionLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what clients get with this offer..."
            className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50 resize-none"
          />
        </div>

        {/* Inclusions */}
        <div className="space-y-2 md:col-span-2">
          <SectionLabel>Inclusions</SectionLabel>
          <div className="flex gap-2">
            <input
              type="text"
              value={inclusionInput}
              onChange={(e) => setInclusionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
              placeholder="Add an inclusion and press Enter"
              className="flex-1 rounded-xl bg-background px-4 py-2 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50"
            />
            <button
              onClick={addInclusion}
              className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              Add
            </button>
          </div>
          {inclusions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {inclusions.map((item) => (
                <span key={item} className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface">
                  {item}
                  <button onClick={() => removeInclusion(item)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Popular toggle */}
        <div className="md:col-span-2 flex items-center gap-3">
          <button
            onClick={() => setPopular(!popular)}
            className={`relative h-6 w-11 rounded-full transition-colors ${popular ? 'bg-primary' : 'bg-surface-container-highest'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${popular ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          <span className="text-sm text-on-surface">Mark as Popular</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onCancel} className="rounded-xl border border-outline-variant/30 px-5 py-2 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Check size={15} />
          {initial ? 'Save Changes' : 'Create Offer'}
        </button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Offer card                                                          */
/* ------------------------------------------------------------------ */

interface OfferCardProps {
  offer: Offer
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function OfferCard({ offer, onEdit, onDuplicate, onDelete }: OfferCardProps) {
  return (
    <Card className="relative">
      {offer.popular && (
        <div className="absolute -top-px left-6 flex items-center gap-1 rounded-b-lg bg-gradient-to-br from-primary to-primary-dim px-3 py-1">
          <Star size={10} className="text-on-primary fill-on-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary">Popular</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-headline font-extrabold text-on-surface text-lg leading-tight">{offer.name}</h3>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest ${CATEGORY_STYLES[offer.category]}`}>
              {offer.category}
            </span>
            {offer.linkedToForm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-400/10 border border-sky-400/20 px-2.5 py-0.5 text-[10px] font-medium text-sky-400 uppercase tracking-widest">
                <Link2 size={9} />
                Used in booking forms
              </span>
            )}
          </div>

          <p className="mt-1 text-2xl font-extrabold text-primary font-mono">
            ${offer.basePrice.toLocaleString()}
            <span className="text-sm font-normal text-on-surface-variant ml-1">starting</span>
          </p>

          <p className="mt-2 text-sm text-on-surface-variant leading-relaxed line-clamp-2">{offer.description}</p>

          {offer.inclusions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {offer.inclusions.map((item) => (
                <span key={item} className="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-0.5 text-xs text-on-surface-variant">
                  <Check size={9} className="text-primary shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-outline-variant/20 pt-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
        >
          <Pencil size={12} />
          Edit
        </button>
        <button
          onClick={onDuplicate}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
        >
          <Copy size={12} />
          Duplicate
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:border-red-400/40 hover:text-error transition-colors ml-auto"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function handleCreate(offer: Offer) {
    setOffers([offer, ...offers])
    setShowBuilder(false)
  }

  function handleUpdate(updated: Offer) {
    setOffers(offers.map((o) => (o.id === updated.id ? updated : o)))
    setEditingId(null)
  }

  function handleDuplicate(offer: Offer) {
    const copy: Offer = {
      ...offer,
      id: `offer-${Date.now()}`,
      name: `${offer.name} (Copy)`,
      popular: false,
      linkedToForm: false,
    }
    setOffers([...offers, copy])
  }

  function handleDelete(id: string) {
    setOffers(offers.filter((o) => o.id !== id))
    if (editingId === id) setEditingId(null)
  }

  function handleSaveAll() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <LayoutTemplate size={22} className="text-primary shrink-0" />
            <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">Service Offers</h1>
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            Configure the packages and offers displayed to new clients during onboarding and booking
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => { setShowBuilder(true); setEditingId(null) }}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Plus size={15} />
            Add Offer
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Inline builder */}
      {showBuilder && (
        <OfferForm
          onSave={handleCreate}
          onCancel={() => setShowBuilder(false)}
        />
      )}

      {/* Offer list */}
      <div className="space-y-4">
        {offers.length === 0 && (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <LayoutTemplate size={40} className="text-on-surface-variant/20 mb-3" />
            <p className="text-sm font-medium text-on-surface">No offers yet</p>
            <p className="text-xs text-on-surface-variant mt-1">Add your first service offer to get started</p>
          </Card>
        )}

        {offers.map((offer) =>
          editingId === offer.id ? (
            <OfferForm
              key={offer.id}
              initial={offer}
              onSave={handleUpdate}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <OfferCard
              key={offer.id}
              offer={offer}
              onEdit={() => { setEditingId(offer.id); setShowBuilder(false) }}
              onDuplicate={() => handleDuplicate(offer)}
              onDelete={() => handleDelete(offer.id)}
            />
          )
        )}
      </div>
    </div>
  )
}
