'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, CheckSquare, Undo2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  time: string
  iconBg: string
  active: boolean
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Complete Sorting', time: 'Sep 13, 08:30', iconBg: '#2DD4BF', active: true },
  { id: 't2', title: 'Confirm New Booking', time: 'Sep 13, 10:30', iconBg: '#60A5FA', active: true },
  { id: 't3', title: 'Send Project', time: 'Sep 13, 15:00', iconBg: '#A78BFA', active: true },
  { id: 't4', title: 'Complete Project', time: 'Sep 13, 14:45', iconBg: 'rgba(255,255,255,0.09)', active: false },
  { id: 't5', title: 'Review Payment', time: 'Sep 13, 16:30', iconBg: 'rgba(255,255,255,0.09)', active: false },
]

const TOTAL = 8
const UNDO_DURATION = 10_000

interface TodoDropdownProps {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
  onCountChange?: (completed: number) => void
}

export function TodoDropdown({ open, onClose, anchorRef, onCountChange }: TodoDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [completing, setCompleting] = useState<string | null>(null)
  const [undoTask, setUndoTask] = useState<Task | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const completedCount = INITIAL_TASKS.length - tasks.filter((t) => t.active).length + 2 // 2 already done

  // Notify parent of count changes
  useEffect(() => {
    onCountChange?.(completedCount)
  }, [completedCount, onCountChange])

  // Animate in/out
  useEffect(() => {
    if (open) {
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

  // Clean up undo timer
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  const handleComplete = useCallback((task: Task) => {
    // Mark as completing (shows check + strikethrough)
    setCompleting(task.id)

    // After animation, remove the task and show undo
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      setCompleting(null)
      setUndoTask(task)

      // Clear previous undo timer
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)

      // Auto-dismiss undo after UNDO_DURATION
      undoTimerRef.current = setTimeout(() => {
        setUndoTask(null)
      }, UNDO_DURATION)
    }, 500)
  }, [])

  const handleUndo = useCallback(() => {
    if (!undoTask) return
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)

    // Re-insert the task in original position
    setTasks((prev) => {
      const allIds = INITIAL_TASKS.map((t) => t.id)
      const merged = [...prev, undoTask]
      merged.sort((a, b) => allIds.indexOf(a.id) - allIds.indexOf(b.id))
      return merged
    })
    setUndoTask(null)
  }, [undoTask])

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
          {completedCount}/{TOTAL}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-white/10" />

      {/* Task List */}
      <div className="flex flex-col gap-1.5">
        {tasks.map((task) => {
          const isCompleting = completing === task.id
          return (
            <div
              key={task.id}
              className="overflow-hidden transition-all duration-500 ease-out"
              style={{
                maxHeight: isCompleting ? 0 : 56,
                opacity: isCompleting ? 0 : 1,
                marginBottom: isCompleting ? -6 : 0,
                transform: isCompleting ? 'translateX(-20px)' : 'translateX(0)',
              }}
            >
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                  isCompleting
                    ? 'bg-emerald-500/10'
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
                    className={`text-[13px] font-semibold leading-tight transition-all duration-300 ${
                      isCompleting ? 'text-white/30 line-through' : task.active ? 'text-white' : 'text-white/50'
                    }`}
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
                <button
                  onClick={() => handleComplete(task)}
                  disabled={isCompleting}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                    isCompleting
                      ? 'border-emerald-400/50 bg-emerald-500/30'
                      : task.active
                        ? 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20 cursor-pointer'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/25 cursor-pointer'
                  }`}
                  aria-label={`Complete ${task.title}`}
                >
                  {isCompleting && <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={3} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && !undoTask && (
        <div className="py-4 text-center text-sm text-white/40">All tasks complete!</div>
      )}

      {/* Undo pill */}
      {undoTask && <UndoPill taskTitle={undoTask.title} onUndo={handleUndo} />}
    </div>
  )
}

function UndoPill({ taskTitle, onUndo }: { taskTitle: string; onUndo: () => void }) {
  const [progress, setProgress] = useState(100)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
      {/* Progress bar background */}
      <div
        className="absolute inset-0 rounded-full bg-white/[0.06] transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
      <button
        onClick={onUndo}
        className="relative flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white/80 transition-colors hover:text-white"
      >
        <Undo2 className="h-3 w-3" />
        <span>Undo &quot;{taskTitle}&quot;</span>
      </button>
    </div>
  )
}

export function TodoTrigger({
  open,
  onToggle,
  buttonRef,
  completedCount = 2,
}: {
  open: boolean
  onToggle: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
  completedCount?: number
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
        {completedCount}
      </span>
    </button>
  )
}
