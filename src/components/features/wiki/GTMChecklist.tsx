'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Bot, User, Users, ChevronDown, ChevronRight } from 'lucide-react'

type Owner = 'AI' | 'Manual' | 'Both'

interface Task {
  id: string
  text: string
  owner: Owner
  detail?: string
  urgent?: boolean
}

interface Phase {
  id: string
  label: string
  dates: string
  tasks: Task[]
  color: string
  borderColor: string
  dotColor: string
}

const PHASES: Phase[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    dates: 'Apr 5–7',
    color: 'from-violet-500/15 to-indigo-500/5',
    borderColor: 'border-violet-500/25',
    dotColor: 'bg-violet-400',
    tasks: [
      { id: 'f1', text: 'Verify /images/dashboard-v2-preview.png loads on Vercel (no 404)', owner: 'Manual', urgent: true },
      { id: 'f2', text: 'Add #features, #pricing, #integrations anchor IDs to landing page', owner: 'AI' },
      { id: 'f3', text: 'Set OG image for Twitter/Discord link previews (1200×630)', owner: 'Both', detail: 'AI generates image, Kyle reviews' },
      { id: 'f4', text: 'Confirm favicon is visible in browser tab', owner: 'Manual' },
      { id: 'f5', text: 'Test waitlist form submission on mobile (tap → submit → success)', owner: 'Manual', urgent: true },
      { id: 'f6', text: 'Add Google Analytics / Plausible tracking on waitlist form', owner: 'AI' },
      { id: 'f7', text: 'Deploy to Vercel, verify on real iPhone', owner: 'Manual' },
      { id: 'f8', text: 'Set up Asana GTM board with 5 sections', owner: 'Both', detail: 'AI creates board structure, Kyle confirms' },
      { id: 'f9', text: 'Set up Slack channel #gtm-launch', owner: 'Manual' },
      { id: 'f10', text: 'Configure content-drafter agent (weekly Monday 9am)', owner: 'AI' },
      { id: 'f11', text: 'Configure build-status morning briefing agent (daily 8am)', owner: 'AI' },
      { id: 'f12', text: 'Write 5 seed content pieces (origin story, 2 product posts, 2 takes)', owner: 'Both', detail: 'AI drafts, Kyle edits to voice' },
    ],
  },
  {
    id: 'first-wave',
    label: 'First Wave',
    dates: 'Apr 8–10',
    color: 'from-amber-500/15 to-orange-500/5',
    borderColor: 'border-amber-500/25',
    dotColor: 'bg-amber-400',
    tasks: [
      { id: 'w1', text: 'Post origin story Twitter thread', owner: 'Both', detail: 'AI drafts thread, Kyle posts' },
      { id: 'w2', text: 'Post on Reddit r/photography (authentic, no pitch)', owner: 'Both', detail: 'AI drafts, Kyle reviews for authenticity' },
      { id: 'w3', text: 'Record + post first product demo Instagram Reel (847 photos in 12 min)', owner: 'Manual', urgent: true },
      { id: 'w4', text: 'Post same Reel to TikTok with shorter hook', owner: 'Manual' },
      { id: 'w5', text: 'Post founder story on LinkedIn', owner: 'Both', detail: 'AI drafts, Kyle personalizes' },
      { id: 'w6', text: 'Post build log on Twitter: mobile landing page shipped', owner: 'Both' },
      { id: 'w7', text: 'Post Reddit r/SideProject: building-in-public post', owner: 'Both' },
      { id: 'w8', text: 'Post Reddit r/freelance: 5-apps-to-1-workflow post', owner: 'Both' },
      { id: 'w9', text: 'Build personal outreach list (20 photographers you know)', owner: 'Manual', urgent: true, detail: 'Segment 1: commercial (5–10), Segment 2: wedding (10+/yr), Segment 3: communities' },
      { id: 'w10', text: 'Send first 10 personal outreach DMs', owner: 'Manual', urgent: true, detail: '"Hey [name] — I\'ve been building something I think you\'d find useful..."' },
      { id: 'w11', text: 'Send next 10 outreach DMs', owner: 'Manual' },
      { id: 'w12', text: 'Set up reddit-monitor agent with keyword list', owner: 'AI', detail: 'Keywords: culling, Pixieset alternative, photo workflow, sorting photos' },
      { id: 'w13', text: 'Configure Apollo outreach agent with ICP filters', owner: 'AI', detail: 'ICP: commercial photographers, wedding 10+/yr' },
    ],
  },
  {
    id: 'travel-prep',
    label: 'Travel Prep',
    dates: 'Apr 11 ✈',
    color: 'from-blue-500/15 to-cyan-500/5',
    borderColor: 'border-blue-500/25',
    dotColor: 'bg-blue-400',
    tasks: [
      { id: 'tp1', text: 'Verify all scheduled agents are green + running', owner: 'Manual', urgent: true },
      { id: 'tp2', text: 'Approve 7-day content queue in Slack before boarding', owner: 'Manual', urgent: true, detail: 'React 👍 to each post in Slack' },
      { id: 'tp3', text: 'Test waitlist form end-to-end one final time', owner: 'Manual', urgent: true },
      { id: 'tp4', text: 'Confirm build pipeline is running autonomously', owner: 'AI', detail: 'design-to-dev + visual-qa loops both green' },
      { id: 'tp5', text: 'Set emergency Slack alert thresholds (waitlist form down, Vercel down)', owner: 'AI' },
      { id: 'tp6', text: 'Confirm morning briefing schedule in Kyle\'s local timezone (Portugal → Italy)', owner: 'AI' },
    ],
  },
  {
    id: 'travel-mode',
    label: 'Travel Mode',
    dates: 'Apr 11–18',
    color: 'from-teal-500/15 to-emerald-500/5',
    borderColor: 'border-teal-500/25',
    dotColor: 'bg-teal-400',
    tasks: [
      { id: 'tm1', text: 'Automated daily Twitter/Instagram posting', owner: 'AI', detail: '1 Twitter/day, 1 Instagram post' },
      { id: 'tm2', text: 'Agent monitors Reddit, surfaces reply opportunities', owner: 'AI', detail: '2 replies/week drafted, sent to Slack for approval' },
      { id: 'tm3', text: 'Morning Slack briefings (waitlist count, tasks done, what\'s broken)', owner: 'AI' },
      { id: 'tm4', text: 'Review + react to content approval requests from phone', owner: 'Manual', detail: 'React 👍 or ✋ — agents handle posting' },
      { id: 'tm5', text: 'Move Asana cards: Reached Out → Responded → Signed Up', owner: 'Manual', detail: 'Monitor responses to your outreach DMs' },
      { id: 'tm6', text: 'Content scheduler auto-posts after approvals', owner: 'AI' },
      { id: 'tm7', text: 'Apollo agent researches + drafts 2nd wave outreach', owner: 'AI' },
    ],
  },
  {
    id: 'italy-arrival',
    label: 'Italy Arrival',
    dates: 'Apr 18–20',
    color: 'from-rose-500/15 to-pink-500/5',
    borderColor: 'border-rose-500/25',
    dotColor: 'bg-rose-400',
    tasks: [
      { id: 'ia1', text: 'Review 7-day agent activity log', owner: 'Manual' },
      { id: 'ia2', text: 'Confirm 20 pilot users hit (hard deadline Apr 20)', owner: 'Manual', urgent: true },
      { id: 'ia3', text: 'Adjust outreach if below 20 (push second DM to non-responders)', owner: 'Manual', detail: 'If behind: personal follow-up, not mass message' },
      { id: 'ia4', text: 'Record Italy-based "day after a shoot" content (travel angle)', owner: 'Manual', detail: 'Authentic, not staged. Real location adds credibility.' },
      { id: 'ia5', text: 'Post "state of the build" with real waitlist numbers', owner: 'Both' },
    ],
  },
  {
    id: 'launch-sprint',
    label: 'Launch Sprint',
    dates: 'Apr 20–30',
    color: 'from-violet-500/20 to-purple-500/10',
    borderColor: 'border-violet-500/30',
    dotColor: 'bg-violet-500',
    tasks: [
      { id: 'ls1', text: 'Publicly announce April 30 launch date', owner: 'Both', detail: '"View1 Sort goes live April 30. Waitlist closes the night before."' },
      { id: 'ls2', text: 'Final product demo video — full flow upload → gallery → payment', owner: 'Manual', urgent: true },
      { id: 'ls3', text: 'Final mobile verification pass (onboarding flow on iPhone)', owner: 'Manual', urgent: true },
      { id: 'ls4', text: 'Write 3-email waitlist drip sequence', owner: 'Both', detail: 'AI drafts, Kyle approves. Ship via waitlist-emailer agent.' },
      { id: 'ls5', text: 'Send "48 hours left" waitlist push', owner: 'Both' },
      { id: 'ls6', text: 'Send personal thank-you DM to first 50 signups', owner: 'Manual', detail: 'Personal, not templated' },
      { id: 'ls7', text: 'LAUNCH DAY: "We\'re live" post on all channels simultaneously', owner: 'Both', urgent: true },
      { id: 'ls8', text: 'LAUNCH DAY: Convert waitlist → founding member access', owner: 'AI' },
      { id: 'ls9', text: 'LAUNCH DAY: Personal DM to every pilot user', owner: 'Manual', urgent: true },
      { id: 'ls10', text: 'Reach 100+ waitlist signups before launch', owner: 'Both', detail: 'Target: 150 by Apr 30' },
    ],
  },
  {
    id: 'post-launch',
    label: 'Post-Launch',
    dates: 'May 1–15',
    color: 'from-emerald-500/15 to-teal-500/5',
    borderColor: 'border-emerald-500/25',
    dotColor: 'bg-emerald-400',
    tasks: [
      { id: 'pl1', text: 'Monitor onboarding funnel (where do users drop off?)', owner: 'Both', detail: 'AI surfaces drop-off data, Kyle decides action' },
      { id: 'pl2', text: 'Week 1 post-launch review: retention, usage, feedback', owner: 'Both' },
      { id: 'pl3', text: 'Collect 3 pilot user testimonials', owner: 'Manual', detail: 'Ask personally, not via survey' },
      { id: 'pl4', text: 'Weekly "View1 in the wild" social posts', owner: 'Both', detail: 'Screenshot real photographer usage' },
      { id: 'pl5', text: 'Target: 5 paid subscriptions by May 7', owner: 'Manual', urgent: true },
      { id: 'pl6', text: 'Write SEO blog post: "best photo delivery software for photographers"', owner: 'AI' },
      { id: 'pl7', text: 'Write SEO blog post: "Pixieset alternative"', owner: 'AI' },
      { id: 'pl8', text: 'Target: 15 paying subscribers by May 15', owner: 'Manual' },
      { id: 'pl9', text: 'Target: 50 active users by May 15', owner: 'Both' },
      { id: 'pl10', text: 'Prepare "Month 1 in public" recap post (Twitter + LinkedIn)', owner: 'Both' },
    ],
  },
]

const OWNER_STYLES: Record<Owner, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  AI: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-400/90',
    icon: <Bot className="h-3 w-3" />,
    label: 'AI',
  },
  Manual: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400/90',
    icon: <User className="h-3 w-3" />,
    label: 'Manual',
  },
  Both: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400/90',
    icon: <Users className="h-3 w-3" />,
    label: 'AI + You',
  },
}

const STORAGE_KEY = 'view1-gtm-checklist-v1'

export function GTMChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(PHASES.map((p) => [p.id, true]))
  )
  const [filterOwner, setFilterOwner] = useState<Owner | 'All'>('All')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setChecked(JSON.parse(saved))
    } catch {}
  }, [])

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const togglePhase = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const totalTasks = PHASES.flatMap((p) => p.tasks).length
  const completedTasks = PHASES.flatMap((p) => p.tasks).filter((t) => checked[t.id]).length
  const overallPct = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div>
      {/* Overall progress */}
      <div className="mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.07] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-white/70">Overall Progress</p>
            <p className="text-xs text-white/30 mt-0.5">{completedTasks} of {totalTasks} tasks complete</p>
          </div>
          <span className="text-3xl font-bold font-display bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {overallPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        {/* Phase mini progress */}
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {PHASES.map((phase) => {
            const done = phase.tasks.filter((t) => checked[t.id]).length
            const pct = Math.round((done / phase.tasks.length) * 100)
            return (
              <button
                key={phase.id}
                onClick={() => {
                  const el = document.getElementById(`phase-${phase.id}`)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setExpanded((prev) => ({ ...prev, [phase.id]: true }))
                }}
                className="text-center group"
              >
                <div className={`h-1 rounded-full mb-1.5 ${done === phase.tasks.length ? 'bg-emerald-500' : phase.dotColor} transition-all`}
                  style={{ opacity: pct > 0 ? 0.4 + (pct / 100) * 0.6 : 0.2 }}
                />
                <p className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors leading-tight">{phase.dates}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter by owner */}
      <div className="flex items-center gap-2 mb-5">
        <p className="text-xs text-white/30 mr-1">Show:</p>
        {(['All', 'Manual', 'AI', 'Both'] as const).map((o) => (
          <button
            key={o}
            onClick={() => setFilterOwner(o)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filterOwner === o
                ? 'bg-white/[0.10] text-white border border-white/[0.15]'
                : 'text-white/35 hover:text-white/60',
            ].join(' ')}
          >
            {o === 'AI' && <Bot className="h-3 w-3 text-violet-400" />}
            {o === 'Manual' && <User className="h-3 w-3 text-amber-400" />}
            {o === 'Both' && <Users className="h-3 w-3 text-blue-400" />}
            {o === 'All' ? 'All tasks' : o === 'Both' ? 'AI + You' : o}
          </button>
        ))}
      </div>

      {/* Phase sections */}
      <div className="space-y-3">
        {PHASES.map((phase) => {
          const filteredTasks = filterOwner === 'All'
            ? phase.tasks
            : phase.tasks.filter((t) => t.owner === filterOwner)

          if (filteredTasks.length === 0) return null

          const done = filteredTasks.filter((t) => checked[t.id]).length
          const pct = Math.round((done / filteredTasks.length) * 100)
          const isExpanded = expanded[phase.id]

          return (
            <div
              key={phase.id}
              id={`phase-${phase.id}`}
              className={`rounded-2xl border bg-gradient-to-br ${phase.color} ${phase.borderColor} overflow-hidden`}
            >
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
              >
                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${phase.dotColor} ${pct === 100 ? 'ring-2 ring-offset-1 ring-offset-transparent ring-emerald-400/50' : ''}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-white/80">{phase.label}</span>
                    <span className="text-xs text-white/30">{phase.dates}</span>
                  </div>
                  {/* Inline progress */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-white/[0.08] overflow-hidden max-w-[120px]">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-white/30'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-white/30">{done}/{filteredTasks.length}</span>
                  </div>
                </div>
                {isExpanded
                  ? <ChevronDown className="h-4 w-4 text-white/25 flex-shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-white/25 flex-shrink-0" />
                }
              </button>

              {/* Tasks */}
              {isExpanded && (
                <div className="border-t border-white/[0.06] divide-y divide-white/[0.04]">
                  {filteredTasks.map((task) => {
                    const isChecked = !!checked[task.id]
                    const ownerStyle = OWNER_STYLES[task.owner]
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${isChecked ? 'opacity-50' : 'hover:bg-white/[0.03]'} cursor-pointer`}
                        onClick={() => toggle(task.id)}
                      >
                        {/* Checkbox */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isChecked
                            ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" strokeWidth={2} />
                            : <Circle className={`h-4.5 w-4.5 ${task.urgent ? 'text-red-400/70' : 'text-white/20'}`} strokeWidth={1.5} />
                          }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm leading-snug ${isChecked ? 'line-through text-white/30' : task.urgent ? 'text-white/90 font-medium' : 'text-white/70'}`}>
                              {task.text}
                            </span>
                            {task.urgent && !isChecked && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400/80 uppercase tracking-wide">
                                Urgent
                              </span>
                            )}
                          </div>
                          {task.detail && !isChecked && (
                            <p className="text-xs text-white/30 mt-0.5 leading-relaxed">{task.detail}</p>
                          )}
                        </div>

                        {/* Owner badge */}
                        <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full ${ownerStyle.bg} ${ownerStyle.text} text-[11px] font-medium`}>
                          {ownerStyle.icon}
                          <span>{ownerStyle.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
