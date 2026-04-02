'use client'

const tasks = [
  { title: 'Complete Sorting', time: 'Sep 13, 08:30', iconBg: '#2DD4BF', statusColor: 'bg-white/[0.08]', active: true },
  { title: 'Confirm New Booking', time: 'Sep 13, 10:30', iconBg: '#60A5FA', statusColor: 'bg-white/[0.08]', active: true },
  { title: 'Send Project', time: 'Sep 13, 15:00', iconBg: '#A78BFA', statusColor: 'bg-white/[0.08]', active: true },
  { title: 'Complete Project', time: 'Sep 13, 14:45', iconBg: 'rgba(255,255,255,0.09)', statusColor: 'bg-white/[0.06]', active: false },
  { title: 'Review Payment', time: 'Sep 13, 16:30', iconBg: 'rgba(255,255,255,0.09)', statusColor: 'bg-white/[0.06]', active: false },
]

export function TodoPanel() {
  return (
    <div className="absolute right-0 top-[230px] flex h-[529px] w-[322px] flex-col gap-5 rounded-3xl border border-white/10 p-6 pt-8 backdrop-blur-[40px] bg-gradient-to-b from-white/[0.12] to-white/[0.04] shadow-[0_16px_48px_-4px_rgba(0,0,0,0.25),0_2px_8px_rgba(255,255,255,0.03),0_1px_0_rgba(255,255,255,0.13)]">
      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white/[0.93]" style={{ fontFamily: 'var(--font-inter)' }}>
          To-do List:
        </span>
        <span className="text-[28px] font-bold text-white/[0.38]" style={{ fontFamily: 'var(--font-inter)' }}>
          2/8
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-white/[0.08]" />

      {/* Task List */}
      <div className="flex flex-1 flex-col gap-1">
        {tasks.map((task, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
              task.title === 'Send Project' ? 'bg-white/[0.08]' : 'bg-white/[0.04]'
            }`}
          >
            <div className="h-9 w-9 shrink-0 rounded-full" style={{ background: task.iconBg }} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={`text-sm font-semibold ${
                  task.active ? 'text-white/[0.93]' : 'text-white/[0.56]'
                }`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {task.title}
              </span>
              <span
                className={`text-[11px] ${
                  task.active ? 'text-white/[0.38]' : 'text-white/25'
                }`}
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {task.time}
              </span>
            </div>
            <div className={`h-7 w-7 shrink-0 rounded-full ${task.statusColor}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
