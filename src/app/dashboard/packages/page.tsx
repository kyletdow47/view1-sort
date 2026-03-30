'use client'

import { useState } from 'react'
import {
  Package,
  Plus,
  Star,
  Clock,
  ImageIcon,
  Printer,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  Camera,
  BookOpen,
  Gift,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type PackageCategory = 'Wedding' | 'Portrait' | 'Commercial' | 'Event' | 'Real Estate'

interface PhotoPackage {
  id: string
  name: string
  category: PackageCategory
  price: number
  hours: number
  editedPhotos: number
  printsIncluded: number
  turnaroundDays: number
  extras: string[]
  popular: boolean
}

interface PrintProduct {
  id: string
  name: string
  size: string
  basePrice: number
  quantities: number[]
  editing: boolean
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const INITIAL_PACKAGES: PhotoPackage[] = [
  {
    id: 'pkg-1',
    name: 'Essential Coverage',
    category: 'Wedding',
    price: 1800,
    hours: 4,
    editedPhotos: 300,
    printsIncluded: 0,
    turnaroundDays: 21,
    extras: ['Online gallery', 'Print release'],
    popular: false,
  },
  {
    id: 'pkg-2',
    name: 'Premier Wedding',
    category: 'Wedding',
    price: 3200,
    hours: 8,
    editedPhotos: 800,
    printsIncluded: 20,
    turnaroundDays: 42,
    extras: ['Online gallery', 'Print release', 'Engagement session', '12×12 album', 'Second photographer'],
    popular: true,
  },
  {
    id: 'pkg-3',
    name: 'Portrait Signature',
    category: 'Portrait',
    price: 650,
    hours: 2,
    editedPhotos: 50,
    printsIncluded: 5,
    turnaroundDays: 10,
    extras: ['Online gallery', 'Print release', '1 location'],
    popular: false,
  },
]

const INITIAL_PRINT_PRODUCTS: PrintProduct[] = [
  { id: 'pp-1', name: '4×6 Print',    size: '4" × 6"',    basePrice: 8,   quantities: [1, 5, 10, 25], editing: false },
  { id: 'pp-2', name: '8×10 Print',   size: '8" × 10"',   basePrice: 18,  quantities: [1, 5, 10],     editing: false },
  { id: 'pp-3', name: 'Canvas 16×20', size: '16" × 20"',  basePrice: 145, quantities: [1, 3],          editing: false },
  { id: 'pp-4', name: 'Canvas 24×36', size: '24" × 36"',  basePrice: 220, quantities: [1],             editing: false },
  { id: 'pp-5', name: 'Photo Book',   size: '10" × 10"',  basePrice: 189, quantities: [1, 2],          editing: false },
  { id: 'pp-6', name: 'Metal Print',  size: '11" × 14"',  basePrice: 95,  quantities: [1, 3],          editing: false },
]

const PACKAGE_CATEGORIES: PackageCategory[] = ['Wedding', 'Portrait', 'Commercial', 'Event', 'Real Estate']

const CATEGORY_STYLES: Record<PackageCategory, string> = {
  Wedding:      'bg-primary/10 text-primary border-primary/20',
  Portrait:     'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  Commercial:   'bg-sky-400/10 text-sky-400 border-sky-400/20',
  Event:        'bg-violet-400/10 text-violet-400 border-violet-400/20',
  'Real Estate':'bg-amber-400/10 text-amber-400 border-amber-400/20',
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
/*  Package form                                                        */
/* ------------------------------------------------------------------ */

interface PackageFormProps {
  initial?: PhotoPackage
  onSave: (pkg: PhotoPackage) => void
  onCancel: () => void
}

function PackageForm({ initial, onSave, onCancel }: PackageFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<PackageCategory>(initial?.category ?? 'Wedding')
  const [price, setPrice] = useState(String(initial?.price ?? ''))
  const [hours, setHours] = useState(String(initial?.hours ?? ''))
  const [editedPhotos, setEditedPhotos] = useState(String(initial?.editedPhotos ?? ''))
  const [printsIncluded, setPrintsIncluded] = useState(String(initial?.printsIncluded ?? '0'))
  const [turnaroundDays, setTurnaroundDays] = useState(String(initial?.turnaroundDays ?? ''))
  const [extraInput, setExtraInput] = useState('')
  const [extras, setExtras] = useState<string[]>(initial?.extras ?? [])
  const [popular, setPopular] = useState(initial?.popular ?? false)

  function addExtra() {
    const t = extraInput.trim()
    if (t && !extras.includes(t)) { setExtras([...extras, t]); setExtraInput('') }
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id: initial?.id ?? `pkg-${Date.now()}`,
      name: name.trim(), category,
      price: parseFloat(price) || 0,
      hours: parseInt(hours) || 0,
      editedPhotos: parseInt(editedPhotos) || 0,
      printsIncluded: parseInt(printsIncluded) || 0,
      turnaroundDays: parseInt(turnaroundDays) || 0,
      extras, popular,
    })
  }

  return (
    <Card className="border-primary/30 !bg-surface-container">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-headline font-extrabold text-lg text-on-surface">{initial ? 'Edit Package' : 'New Package'}</h3>
        <button onClick={onCancel} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <SectionLabel>Package Name</SectionLabel>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premier Wedding" className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50" />
        </div>
        <div className="space-y-1.5">
          <SectionLabel>Category</SectionLabel>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value as PackageCategory)} className="w-full appearance-none rounded-xl bg-background px-4 py-2.5 pr-10 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50">
              {PACKAGE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          </div>
        </div>

        {[
          { label: 'Base Price ($)', value: price, set: setPrice, placeholder: '0' },
          { label: 'Hours Coverage', value: hours, set: setHours, placeholder: '8' },
          { label: 'Edited Photos', value: editedPhotos, set: setEditedPhotos, placeholder: '500' },
          { label: 'Prints Included', value: printsIncluded, set: setPrintsIncluded, placeholder: '0' },
          { label: 'Turnaround (days)', value: turnaroundDays, set: setTurnaroundDays, placeholder: '30' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label} className="space-y-1.5">
            <SectionLabel>{label}</SectionLabel>
            <input type="number" min="0" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="w-full rounded-xl bg-background px-4 py-2.5 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50" />
          </div>
        ))}

        <div className="space-y-2 md:col-span-3">
          <SectionLabel>Extras / Add-ons</SectionLabel>
          <div className="flex gap-2">
            <input type="text" value={extraInput} onChange={(e) => setExtraInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExtra())} placeholder="e.g. Engagement session" className="flex-1 rounded-xl bg-background px-4 py-2 text-sm text-on-surface outline-none ring-1 ring-outline-variant/30 focus:ring-primary/50" />
            <button onClick={addExtra} className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">Add</button>
          </div>
          {extras.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {extras.map((e) => (
                <span key={e} className="flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface">
                  {e}
                  <button onClick={() => setExtras(extras.filter((x) => x !== e))} className="text-on-surface-variant hover:text-on-surface"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3 flex items-center gap-3">
          <button onClick={() => setPopular(!popular)} className={`relative h-6 w-11 rounded-full transition-colors ${popular ? 'bg-primary' : 'bg-surface-container-highest'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${popular ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          <span className="text-sm text-on-surface">Mark as Most Popular</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onCancel} className="rounded-xl border border-outline-variant/30 px-5 py-2 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={!name.trim()} className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-5 py-2 text-sm font-bold text-on-primary hover:opacity-90 disabled:opacity-40 transition-opacity">
          <Check size={14} />
          {initial ? 'Save Changes' : 'Create Package'}
        </button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Package card                                                        */
/* ------------------------------------------------------------------ */

function PackageCard({ pkg, onEdit, onDelete }: { pkg: PhotoPackage; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="relative flex flex-col">
      {pkg.popular && (
        <div className="absolute -top-px left-6 flex items-center gap-1 rounded-b-lg bg-gradient-to-br from-primary to-primary-dim px-3 py-1">
          <Star size={9} className="text-on-primary fill-on-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary">Most Popular</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <h3 className="font-headline font-extrabold text-on-surface text-lg leading-tight">{pkg.name}</h3>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest mt-1.5 ${CATEGORY_STYLES[pkg.category]}`}>
            {pkg.category}
          </span>
        </div>
        <p className="font-mono text-2xl font-extrabold text-primary shrink-0">${pkg.price.toLocaleString()}</p>
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {[
          { icon: Clock, text: `${pkg.hours} hours coverage` },
          { icon: ImageIcon, text: `${pkg.editedPhotos.toLocaleString()} edited photos` },
          { icon: Printer, text: pkg.printsIncluded > 0 ? `${pkg.printsIncluded} prints included` : 'No prints' },
          { icon: Camera, text: `${pkg.turnaroundDays}-day turnaround` },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2.5 text-sm text-on-surface-variant">
            <Icon size={13} className="text-primary shrink-0" />
            {text}
          </li>
        ))}
        {pkg.extras.map((extra) => (
          <li key={extra} className="flex items-center gap-2.5 text-sm text-on-surface-variant">
            <Gift size={13} className="text-primary shrink-0" />
            {extra}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex gap-2 border-t border-outline-variant/20 pt-4">
        <button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors">
          <Pencil size={12} />Edit
        </button>
        <button onClick={onDelete} className="flex items-center gap-1.5 rounded-lg border border-outline-variant/30 px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:border-error/30 hover:text-error transition-colors ml-auto">
          <Trash2 size={12} />Delete
        </button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Packages tab                                                        */
/* ------------------------------------------------------------------ */

function PackagesTab() {
  const [packages, setPackages] = useState<PhotoPackage[]>(INITIAL_PACKAGES)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleCreate(pkg: PhotoPackage) { setPackages([pkg, ...packages]); setShowForm(false) }
  function handleUpdate(pkg: PhotoPackage) { setPackages(packages.map((p) => (p.id === pkg.id ? pkg : p))); setEditingId(null) }
  function handleDelete(id: string) { setPackages(packages.filter((p) => p.id !== id)); if (editingId === id) setEditingId(null) }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setShowForm(true); setEditingId(null) }} className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity">
          <Plus size={15} />New Package
        </button>
      </div>

      {showForm && <PackageForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {packages.map((pkg) =>
          editingId === pkg.id ? (
            <div key={pkg.id} className="md:col-span-2 xl:col-span-3">
              <PackageForm initial={pkg} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
            </div>
          ) : (
            <PackageCard key={pkg.id} pkg={pkg} onEdit={() => { setEditingId(pkg.id); setShowForm(false) }} onDelete={() => handleDelete(pkg.id)} />
          )
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Print products tab                                                  */
/* ------------------------------------------------------------------ */

function PrintProductsTab() {
  const [products, setProducts] = useState<PrintProduct[]>(INITIAL_PRINT_PRODUCTS)

  function toggleEdit(id: string) {
    setProducts(products.map((p) => (p.id === id ? { ...p, editing: !p.editing } : p)))
  }

  function updateProduct(id: string, field: keyof PrintProduct, value: string | number) {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  function deleteProduct(id: string) {
    setProducts(products.filter((p) => p.id !== id))
  }

  function addProduct() {
    const newProduct: PrintProduct = {
      id: `pp-${Date.now()}`,
      name: 'New Print',
      size: '5" × 7"',
      basePrice: 12,
      quantities: [1, 5],
      editing: true,
    }
    setProducts([...products, newProduct])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={addProduct} className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-bold text-on-primary hover:opacity-90 transition-opacity">
          <Plus size={15} />Add Product
        </button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              {['Product Name', 'Size', 'Base Price', 'Quantity Options', 'Actions'].map((col) => (
                <th key={col} className="text-left px-5 py-3.5 text-[10px] uppercase tracking-widest font-medium text-on-surface-variant/60">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                <td className="px-5 py-3.5">
                  {product.editing ? (
                    <input type="text" value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} className="rounded-lg bg-background px-3 py-1.5 text-sm text-on-surface outline-none ring-1 ring-primary/40 w-full" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Printer size={14} className="text-primary shrink-0" />
                      <span className="text-sm font-medium text-on-surface">{product.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {product.editing ? (
                    <input type="text" value={product.size} onChange={(e) => updateProduct(product.id, 'size', e.target.value)} className="rounded-lg bg-background px-3 py-1.5 text-sm text-on-surface outline-none ring-1 ring-primary/40 w-32" />
                  ) : (
                    <span className="font-mono text-sm text-on-surface-variant">{product.size}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {product.editing ? (
                    <div className="flex items-center rounded-lg bg-background ring-1 ring-primary/40 overflow-hidden w-28">
                      <span className="px-3 py-1.5 text-sm text-on-surface-variant border-r border-outline-variant/20">$</span>
                      <input type="number" min="0" value={product.basePrice} onChange={(e) => updateProduct(product.id, 'basePrice', parseFloat(e.target.value) || 0)} className="flex-1 bg-transparent px-3 py-1.5 text-sm text-on-surface outline-none w-full" />
                    </div>
                  ) : (
                    <span className="font-mono text-sm font-semibold text-primary">${product.basePrice}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.quantities.map((q) => (
                      <span key={q} className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs text-on-surface-variant">×{q}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleEdit(product.id)} className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${product.editing ? 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:text-primary'}`}>
                      {product.editing ? <><Check size={10} />Done</> : <><Pencil size={10} />Edit</>}
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="flex items-center gap-1 rounded-lg border border-outline-variant/30 px-2.5 py-1 text-[11px] font-medium text-on-surface-variant hover:border-error/30 hover:text-error transition-colors">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

type Tab = 'Packages' | 'Print Products'

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Packages')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <Package size={22} className="text-primary shrink-0" />
          <h1 className="font-headline text-3xl italic font-extrabold text-on-surface">Packages & Products</h1>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          Define your service packages and print product catalog for client offerings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-low p-1 w-fit">
        {(['Packages', 'Print Products'] as Tab[]).map((tab) => {
          const Icon = tab === 'Packages' ? BookOpen : Printer
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-br from-primary to-primary-dim text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon size={14} />
              {tab}
            </button>
          )
        })}
      </div>

      {activeTab === 'Packages' ? <PackagesTab /> : <PrintProductsTab />}
    </div>
  )
}
