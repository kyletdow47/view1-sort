'use client'

import { useEffect, useRef } from 'react'
import { CheckSquare } from 'lucide-react'

const tasks = [
  { title: 'Complete Sorting', time: 'Sep 13, 08:30', iconColor: 'bg-white', active: true },
  { title: 'Confirm New Booking', time: 'Sep 13, 10:30', iconColor: 'bg-white', active: true },
  { title: 'Send Project', time: 'Sep 13, 15:00', iconColor: 'bg-white', active: true },
  { title: 'Complete Project', time: 'Sep 13, 14:45', iconColor: 'bg-white/[0.09]', active: false },
  { title: 'Review Payment', time: 'Sep 13, 16:30', iconColor: 'bg-white/[0.09]', active: false },
]

const COMPLETED = 2
const TOTAL = 8

interface TodoDropdownProps {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement>
}

export function TodoDropdown({ open, onClose, anchorRef }: TodoDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose, anchorRef])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 flex w-[322px] flex-col gap-5 rounded-3xl border border-white/10 p-6 pt-8 backdrop-blur-[40px] bg-gradient-to-b from-white/[0.12] to-white/[0.04] shadow-[0_16px_48px_-4px_rgba(0,0,0,0.35),0_2px_8px_rgba(255,255,255,0.03),0_1px_0_rgba(255,255,255,0.13)]"
    >
      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white/[0.93]" style={{ fontFamily: 'var(--font-inter)' }}>
          To-do List:
        </span>
        <span className="text-[28px] font-bold text-white/[0.38]" style={{ fontFamily: 'var(--font-inter)' }}>
          {COMPLETED}/{TOTAL}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-white/[0.08]" />

      {/* Task List */}
      <div className="flex flex-col gap-1">
        {tasks.map((task, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
              task.title === 'Send Project' ? 'bg-white/[0.08]' : 'bg-white/[0.04]'
            }`}
          >
            <div className={`h-9 w-9 shrink-0 rounded-full ${task.iconColor}`} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={`text-sm font-semibold ${task.active ? 'text-white/[0.93]' : 'text-white/[0.56]'}`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {task.title}
              </span>
              <span
                className={`text-[11px] ${task.active ? 'text-white/[0.38]' : 'text-white/25'}`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {task.time}
              </span>
            </div>
            <div className={`h-7 w-7 shrink-0 rounded-full ${task.active ? 'bg-white/[0.08]' : 'bg-white/[0.06]'}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TodoTrigger({
  open,
  onToggle,
  buttonRef,
}: {
  open: boolean
  onToggle: () => void
  buttonRef: React.RefObject<HTMLButtonElement>
}) {
  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      className={`relative text-white/[0.67] transition-colors hover:text-white ${open ? 'text-white' : ''}`}
      aria-label="Toggle to-do list"
    >
      <CheckSquare className="h-[18px] w-[18px]" />
      {/* Badge */}
      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
        {COMPLETED}
      </span>
    </button>
  )
}
