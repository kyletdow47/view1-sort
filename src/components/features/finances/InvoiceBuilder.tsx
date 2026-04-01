'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, X } from 'lucide-react'
import { InvoiceLineItem } from './InvoiceLineItem'
import { InvoicePreview } from './InvoicePreview'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface InvoiceBuilderProps {
  onClose: () => void
}

const defaultItems: LineItem[] = [
  { id: '1', description: 'Photography Session', quantity: 1, unitPrice: 50000 },
  { id: '2', description: 'Edited Photos (High-res)', quantity: 150, unitPrice: 500 },
]

export function InvoiceBuilder({ onClose }: InvoiceBuilderProps) {
  const [clientName, setClientName] = useState('Client Name')
  const [invoiceNumber, setInvoiceNumber] = useState('INV-005')
  const [dueDate, setDueDate] = useState('2026-04-30')
  const [taxRate, setTaxRate] = useState(10)
  const [depositDeduction, setDepositDeduction] = useState(0)
  const [items, setItems] = useState<LineItem[]>(defaultItems)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      setItems(arrayMove(items, oldIndex, newIndex))
    }
  }

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Item',
      quantity: 1,
      unitPrice: 0,
    }
    setItems([...items, newItem])
  }

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const tax = Math.round((subtotal * taxRate) / 100)
  const total = subtotal + tax - depositDeduction

  return (
    <div className="space-y-6">
      {/* Form and Preview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Invoice Builder Form */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h3 className="mb-4 text-sm font-semibold text-white">Invoice Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Line Items</h3>
              <button
                onClick={addLineItem}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Item
              </button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {items.map((item) => (
                    <InvoiceLineItem
                      key={item.id}
                      item={item}
                      onUpdate={(field, value) => updateItem(item.id, field, value)}
                      onDelete={() => deleteItem(item.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Totals & Options */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h3 className="mb-4 text-sm font-semibold text-white">Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60">Deposit Deduction ($)</label>
                <input
                  type="number"
                  min="0"
                  value={depositDeduction}
                  onChange={(e) => setDepositDeduction(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="sticky top-8">
          <InvoicePreview
            invoiceNumber={invoiceNumber}
            clientName={clientName}
            dueDate={dueDate}
            items={items}
            taxRate={taxRate}
            depositDeduction={depositDeduction}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Send Invoice
        </button>
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors">
          Save as Draft
        </button>
      </div>
    </div>
  )
}
