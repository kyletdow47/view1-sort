import { WikiTabs } from '@/components/features/wiki/WikiTabs'
import { MarkdownDoc } from '@/components/features/wiki/MarkdownDoc'
import { Bot, RefreshCw, ArrowRight } from 'lucide-react'

export const metadata = { title: 'Operations & Agents — View1 Bible' }

function AgentDiagram() {
  const agents = [
    {
      id: 'haiku',
      color: 'bg-sky-500/20 border-sky-500/30',
      badge: 'text-sky-300 bg-sky-500/20 border-sky-500/30',
      label: 'Haiku',
      roles: ['telegram-operator', 'design-extractor', 'task-sync', 'day-assistant', 'sec-scanner'],
    },
    {
      id: 'sonnet',
      color: 'bg-violet-500/20 border-violet-500/30',
      badge: 'text-violet-300 bg-violet-500/20 border-violet-500/30',
      label: 'Sonnet',
      roles: ['coordinator', 'ui-builder', 'logic-builder', 'db-agent', 'ai-builder', 'browser-tester'],
    },
    {
      id: 'opus',
      color: 'bg-amber-500/20 border-amber-500/30',
      badge: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
      label: 'Opus',
      roles: ['pencil-writer', 'sec-auditor'],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
        <h3 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">
          Model Discipline
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {agents.map(({ id, color, badge, label, roles }) => (
            <div key={id} className={`rounded-xl border p-4 ${color}`}>
              <div className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 border ${badge}`}>
                Claude {label}
              </div>
              <div className="space-y-1.5">
                {roles.map((role) => (
                  <div key={role} className="flex items-center gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-white/30" />
                    <span className="text-xs font-mono text-white/50">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-loop diagram */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
        <h3 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">
          Two-Loop Build System
        </h3>
        <div className="flex items-stretch gap-3">
          <div className="flex-1 rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-3.5 w-3.5 text-violet-400" strokeWidth={1.75} />
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wide">Loop 1 · 30 min</span>
            </div>
            <p className="text-xs font-semibold text-white/70 mb-2">Claude Code (Coding)</p>
            <div className="space-y-1 text-xs text-white/40">
              <p>1. Pick Asana task</p>
              <p>2. Read Pencil design</p>
              <p>3. Write code</p>
              <p>4. Create PR</p>
            </div>
          </div>

          <div className="flex items-center">
            <ArrowRight className="h-4 w-4 text-white/20" />
          </div>

          <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.75} />
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">Loop 2 · 60 min</span>
            </div>
            <p className="text-xs font-semibold text-white/70 mb-2">Cowork (QA Agent)</p>
            <div className="space-y-1 text-xs text-white/40">
              <p>1. Visual verify</p>
              <p>2. Browser testing</p>
              <p>3. Pass / Fail review</p>
              <p>4. P0 auto-prioritize</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit rules */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
        <h3 className="text-xs font-semibold text-white/40 mb-4 uppercase tracking-wider">
          Credit Rules
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { rule: '/compact', detail: 'After every 3 tasks' },
            { rule: '@file refs only', detail: 'Never paste file contents' },
            { rule: 'Max 10 files', detail: 'In context at once' },
            { rule: '2-min buffer', detail: 'Check before starting task' },
          ].map(({ rule, detail }) => (
            <div key={rule} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
              <p className="text-xs font-mono text-violet-300/80 font-semibold mb-1">{rule}</p>
              <p className="text-[11px] text-white/30">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OperationsPage() {
  const tabs = [
    { id: 'agents', label: 'Agent System', content: <AgentDiagram /> },
    { id: 'prompt', label: 'Agent Prompt', content: <MarkdownDoc filePath="AGENT-PROMPT.md" /> },
    { id: 'claude', label: 'CLAUDE.md', content: <MarkdownDoc filePath="CLAUDE.md" /> },
  ]

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-4 w-4 text-blue-400" strokeWidth={1.75} />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-400/70">
            Operations & Agents
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">How We Run</h1>
        <p className="text-white/40 text-sm">
          The autonomous agent system, build loops, model discipline, and operational playbook.
        </p>
      </div>

      <WikiTabs tabs={tabs} defaultTab="agents" />
    </div>
  )
}
