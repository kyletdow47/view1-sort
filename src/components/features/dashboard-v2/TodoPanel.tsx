'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckSquare } from 'lucide-react'

const tasks = [
  { title: 'Complete Sorting', time: 'Sep 13, 08:30', iconBg: '#2DD4BF', statusColor: 'bg-white/[0.08]', active: true },
  { title: 'Confirm New Booking', time: 'Sep 13, 10:30', iconBg: '#60A5FA', statusColor: 'bg-white/[0.08]', active: true },
  { title: 'Send Project', time: 'Sep 13, 15:00', iconBg: '#A78BFA', statusColor: 'bg-white/[0.08]', active: true },
  { title: 'Complete Project', time: 'Sep 13, 14:45', iconBg: 'rgba(255,255,255,0.09)', statusColor: 'bg-white/[0.06]', active: false },
  { title: 'Review Payment', time: 'Sep 13, 16:30', iconBg: 'rgba(255,255,255,0.09)', statusColor: 'bg-white/[0.06]', active: false },
]

const COMPLETED = 2
const TOTAL = 8

interface TodoDropdownProps {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
}

export function TodoDropdown({ open, onClose, anchorRef }: TodoDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Animate in/out
  useEffect(() => {
    if (open) {
      // Trigger enter animation on next frame
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [open])

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
      className="absolute right-0 top-full mt-3 z-50 flex w-[322px] flex-col gap-4 rounded-2xl border border-white/15 p-5 pt-6 transition-all duration-200 ease-out"
      style={{
        background: 'linear-gradient(165deg, rgba(30, 40, 80, 0.97) 0%, rgba(20, 25, 60, 0.98) 100%)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 20px 60px -8px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      {/* Top highlight edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-inter)' }}>
          To-do List
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70" style={{ fontFamily: 'var(--font-inter)' }}>
          {COMPLETED}/{TOTAL}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-white/10" />

      {/* Task List */}
      <div className="flex flex-col gap-1.5">
        {tasks.map((task, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              task.title === 'Send Project'
                ? 'bg-white/10 ring-1 ring-white/10'
                : 'bg-white/[0.05] hover:bg-white/[0.08]'
            }`}
          >
            <div
              className="h-8 w-8 shrink-0 rounded-full"
              style={{
                background: task.iconBg,
                boxShadow: task.active ? `0 0 12px ${task.iconBg}40` : 'none',
              }}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={`text-[13px] font-semibold leading-tight ${task.active ? 'text-white' : 'text-white/50'}`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {task.title}
              </span>
              <span
                className={`text-[11px] leading-tight ${task.active ? 'text-white/40' : 'text-white/25'}`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {task.time}
              </span>
            </div>
            <div
              className={`h-6 w-6 shrink-0 rounded-full border ${
                task.active
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            />
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
  buttonRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      className={`relative text-white/[0.67] transition-colors hover:text-white ${open ? 'text-white' : ''}`}
      aria-label="Toggle to-do list"
    >
      <CheckSquare className="h-[18px] w-[18px]" />
      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
        {COMPLETED}
      </span>
    </button>
  )
}
