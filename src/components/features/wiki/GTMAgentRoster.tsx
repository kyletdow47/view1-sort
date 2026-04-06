import { Bot, Clock, ArrowRight, ThumbsUp, Hand } from 'lucide-react'

const AGENTS = [
  {
    name: 'content-drafter',
    role: 'Drafts 5 social posts from recent build activity',
    model: 'Sonnet',
    trigger: 'Weekly · Monday 9am',
    approval: 'Slack 👍 to each post',
    color: 'border-violet-500/25 bg-violet-500/10',
    badge: 'text-violet-300',
  },
  {
    name: 'reddit-monitor',
    role: 'Watches r/photography + r/weddingphotography for "culling", "Pixieset alternative", "workflow" — drafts reply',
    model: 'Haiku',
    trigger: 'Daily · 8am',
    approval: 'Slack 👍 to approve reply',
    color: 'border-orange-500/25 bg-orange-500/10',
    badge: 'text-orange-300',
  },
  {
    name: 'outreach-researcher',
    role: 'Pulls Apollo ICP leads (commercial photographers), enriches, drafts DM',
    model: 'Sonnet',
    trigger: 'Weekly',
    approval: 'Asana card: "Drafted" → "Send"',
    color: 'border-blue-500/25 bg-blue-500/10',
    badge: 'text-blue-300',
  },
  {
    name: 'waitlist-emailer',
    role: 'Sends weekly waitlist update email to all signups',
    model: 'Sonnet',
    trigger: 'Weekly · Friday 5pm',
    approval: 'Slack 👍 to send',
    color: 'border-emerald-500/25 bg-emerald-500/10',
    badge: 'text-emerald-300',
  },
  {
    name: 'qa-visual',
    role: 'Screenshots live Vercel URL on desktop + mobile, flags visual regressions',
    model: 'Haiku',
    trigger: 'After each deploy',
    approval: 'Auto — posts to Slack',
    color: 'border-pink-500/25 bg-pink-500/10',
    badge: 'text-pink-300',
  },
  {
    name: 'build-status',
    role: 'Morning briefing: waitlist count, Asana tasks completed, what\'s broken',
    model: 'Haiku',
    trigger: 'Daily · 8am',
    approval: 'Auto — no approval needed',
    color: 'border-cyan-500/25 bg-cyan-500/10',
    badge: 'text-cyan-300',
  },
  {
    name: 'content-scheduler',
    role: 'Takes approved content, posts to Twitter/Instagram/TikTok',
    model: 'Haiku',
    trigger: 'Triggered by 👍 approval',
    approval: 'Auto — fires 30min after approval',
    color: 'border-amber-500/25 bg-amber-500/10',
    badge: 'text-amber-300',
  },
]

export function GTMAgentRoster() {
  return (
    <div className="space-y-5">
      {/* Approval flow diagram */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
        <h3 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">
          Approval Flow
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: <Bot className="h-4 w-4 text-violet-400" />, label: 'Agent drafts content', bg: 'bg-violet-500/10 border-violet-500/20' },
            null,
            { icon: <span className="text-sm">💬</span>, label: 'Slack DM to Kyle', bg: 'bg-white/[0.06] border-white/[0.10]' },
            null,
            { icon: <ThumbsUp className="h-4 w-4 text-emerald-400" />, label: 'Kyle reacts 👍', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            null,
            { icon: <span className="text-sm">🚀</span>, label: 'content-scheduler fires', bg: 'bg-blue-500/10 border-blue-500/20' },
          ].map((item, i) =>
            item === null ? (
              <ArrowRight key={i} className="h-4 w-4 text-white/20 flex-shrink-0" />
            ) : (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${item.bg} text-xs text-white/60`}>
                {item.icon}
                <span>{item.label}</span>
              </div>
            )
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Hand className="h-4 w-4 text-red-400/60 flex-shrink-0" />
          <p className="text-xs text-white/30">If Kyle reacts ✋ → agent revises and re-sends · If no reaction in 4 hours → agent holds + reminds once</p>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {AGENTS.map((agent) => (
          <div key={agent.name} className={`rounded-xl border p-4 ${agent.color}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-white/50 flex-shrink-0" strokeWidth={1.75} />
                <code className={`text-xs font-mono font-semibold ${agent.badge}`}>{agent.name}</code>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.08] text-white/40 font-medium flex-shrink-0">
                {agent.model}
              </span>
            </div>
            <p className="text-xs text-white/55 leading-relaxed mb-3">{agent.role}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-white/25" />
                <span className="text-[11px] text-white/35">{agent.trigger}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-3 w-3 text-white/25" />
                <span className="text-[11px] text-white/35">{agent.approval}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Travel mode note */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">✈</span>
          <h3 className="text-xs font-semibold text-amber-300/80 uppercase tracking-wide">Travel Mode (Apr 11–18)</h3>
        </div>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 text-xs text-white/50">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>All agents run on normal schedule</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">✓</span>
            <span>Build status briefing at 8am local time</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">!</span>
            <span>CRITICAL issues (form down, Vercel down) → Slack @kyle immediately</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">→</span>
            <span>Content posting / emails / DMs still require Kyle's 👍</span>
          </div>
        </div>
      </div>
    </div>
  )
}
