'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { NewBookingModal } from './NewBookingModal'

interface BookingsPageClientProps {
  workspaceId: string
  children: React.ReactNode
}

export function BookingsPageClient({ workspaceId, children }: BookingsPageClientProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {/* Inject the New Booking button */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#e7e1df] italic">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage your booking pipeline and schedule
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#ffb780] to-[#d48441] px-5 py-2.5 text-sm font-bold text-[#4e2600] transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {children}

      <NewBookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => router.refresh()}
        workspaceId={workspaceId}
      />
    </>
  )
}
