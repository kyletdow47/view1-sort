'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface InvoiceLineItemProps {
  item: LineItem
  onUpdate: (field: keyof LineItem, value: any) => void
  onDelete: () => void
}

export function InvoiceLineItem({ item, onUpdate, onDelete }: InvoiceLineItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const subtotal = item.quantity * item.unitPrice

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-white/40 hover:text-white cursor-grab active:cursor-grabbing flex items-center"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-2">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Item description"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white placeholder-white/40 focus:border-blue-500 focus:outline-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-white/40">Qty</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onUpdate('quantity', Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40">Unit Price</label>
            <input
              type="number"
              min="0"
              value={item.unitPrice}
              onChange={(e) => onUpdate('unitPrice', Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40">Subtotal</label>
            <p className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm font-mono text-white">
              ${(subtotal / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="text-white/40 hover:text-red-400 transition-colors flex items-center"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
