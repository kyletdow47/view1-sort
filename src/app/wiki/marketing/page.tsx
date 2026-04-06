import { WikiTabs } from '@/components/features/wiki/WikiTabs'
import { MarkdownDoc } from '@/components/features/wiki/MarkdownDoc'
import { GTMChecklist } from '@/components/features/wiki/GTMChecklist'
import { GTMAgentRoster } from '@/components/features/wiki/GTMAgentRoster'
import { Megaphone } from 'lucide-react'

export const metadata = { title: 'Marketing & GTM — View1 Bible' }

function KPITable() {
  const rows = [
    { metric: 'Pilot users (active testers)', apr10: '10', apr20: '20 ✓', apr30: '30', may15: '50' },
    { metric: 'Waitlist signups', apr10: '30', apr20: '75', apr30: '150', may15: '300' },
    { metric: 'Twitter impressions/day', apr10: '—', apr20: '500', apr30: '1,000', may15: '—' },
    { metric: 'Reddit combined karma', apr10: '50', apr20: '200', apr30: '—', may15: '—' },
    { metric: 'Instagram Reel views', apr10: '—', apr20: '500', apr30: '2,000', may15: '5,000' },
    { metric: 'Paying subscribers', apr10: '0', apr20: '0', apr30: '5', may15: '15' },
  ]

  const cols = ['Apr 10', 'Apr 20', 'Apr 30', 'May 15']

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] border-b border-white/[0.08]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Metric</th>
              {cols.map((c) => (
                <th key={c} className="px-4 py-3 text-center text-xs font-semibold text-white/40 uppercase tracking-wider">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map((row) => (
              <tr key={row.metric} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-sm text-white/60">{row.metric}</td>
                {[row.apr10, row.apr20, row.apr30, row.may15].map((val, i) => (
                  <td key={i} className={`px-4 py-3 text-center text-sm font-medium ${val === '—' ? 'text-white/20' : val.includes('✓') ? 'text-emerald-400' : 'text-white/70'}`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Budget */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
        <h3 className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Budget</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { item: 'Vercel hosting', cost: '$0', note: 'Hobby tier' },
            { item: 'Claude API', cost: '~$5–15/mo', note: 'Budget-capped' },
            { item: 'Apollo leads', cost: '$0', note: 'Free tier, 50/mo' },
            { item: 'Paid ads', cost: '$0 initially', note: 'Organic first' },
          ].map(({ item, cost, note }) => (
            <div key={item} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
              <p className="text-xs text-white/50 mb-0.5">{item}</p>
              <p className="text-sm font-semibold text-emerald-400">{cost}</p>
              <p className="text-[11px] text-white/25 mt-0.5">{note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/30 mt-3 leading-relaxed">
          Paid ads only activate if organic fails to reach 100 waitlist signups by Week 3.
          Even then: $20/day on best-performing organic post, 3-day test only.
        </p>
      </div>
    </div>
  )
}

function ContentCalendar() {
  const days = [
    {
      day: 'Day 1', date: 'Apr 5–6', theme: 'Origin Story',
      posts: [
        { platform: 'Twitter', owner: 'Both', text: '"I\'m a commercial photographer. Three years ago I came home from a shoot with 2,400 photos, 3 client deadlines, and a broken workflow. So I built the thing that should have existed. 🧵"' },
        { platform: 'Reddit', owner: 'Both', text: 'r/photography: "I got frustrated sorting photos after every shoot so I built my own tool — honest feedback welcome"' },
      ],
    },
    {
      day: 'Day 2', date: 'Apr 7', theme: 'Product Demo',
      posts: [
        { platform: 'Instagram', owner: 'Manual', text: 'Reel: Screen recording of AI sort flow — "Watch 847 photos get sorted in under 12 minutes"' },
        { platform: 'TikTok', owner: 'Manual', text: 'Same video, shorter hook' },
      ],
    },
    {
      day: 'Day 3', date: 'Apr 8', theme: 'Take / Opinion',
      posts: [
        { platform: 'Twitter', owner: 'Both', text: '"Most AI photo tools are built by engineers who\'ve never shot a wedding. Here\'s what they get wrong 🧵"' },
        { platform: 'LinkedIn', owner: 'Both', text: 'Founder story: "I spent 6–12 hours sorting after every shoot. Then I fixed it."' },
      ],
    },
    {
      day: 'Day 4', date: 'Apr 9', theme: 'Build Log',
      posts: [
        { platform: 'Twitter', owner: 'AI', text: '"Shipped the mobile landing page today. Here\'s what view1sort.com looks like on an iPhone"' },
        { platform: 'Instagram', owner: 'Both', text: 'Screenshot carousel: "5 apps I used to use vs. the one thing I built instead"' },
      ],
    },
    {
      day: 'Day 5', date: 'Apr 10', theme: 'Reddit Push',
      posts: [
        { platform: 'Reddit', owner: 'Both', text: 'r/SideProject: "I\'m a photographer who built my own post-shoot workflow tool. Here\'s what I learned building in public"' },
        { platform: 'Reddit', owner: 'Both', text: 'r/freelance: "Solo photographer here — how I went from 5 apps to 1 workflow"' },
      ],
    },
  ]

  const platformColors: Record<string, string> = {
    Twitter: 'bg-sky-500/15 text-sky-400/80',
    Reddit: 'bg-orange-500/15 text-orange-400/80',
    Instagram: 'bg-pink-500/15 text-pink-400/80',
    TikTok: 'bg-teal-500/15 text-teal-400/80',
    LinkedIn: 'bg-blue-500/15 text-blue-400/80',
  }

  const ownerColors: Record<string, string> = {
    Manual: 'text-amber-400/70',
    AI: 'text-violet-400/70',
    Both: 'text-blue-400/70',
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-300/70">
        Phase 1 seed content (Apr 5–10). Phase 2 (Apr 11–18) is 7-day pre-approved queue — agents handle scheduling.
      </div>
      {days.map(({ day, date, theme, posts }) => (
        <div key={day} className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
            <span className="text-xs font-mono text-white/40">{day}</span>
            <span className="text-xs text-white/30">{date}</span>
            <span className="text-xs font-semibold text-white/60 ml-auto">{theme}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {posts.map((post, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <span className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${platformColors[post.platform] ?? 'bg-white/10 text-white/40'}`}>
                  {post.platform}
                </span>
                <p className="text-xs text-white/50 leading-relaxed flex-1">{post.text}</p>
                <span className={`flex-shrink-0 text-[11px] font-medium mt-0.5 ${ownerColors[post.owner]}`}>
                  {post.owner === 'AI' ? '🤖' : post.owner === 'Manual' ? '👤' : '🤝'} {post.owner}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MarketingPage() {
  const tabs = [
    {
      id: 'checklist',
      label: 'Launch Checklist',
      content: <GTMChecklist />,
    },
    {
      id: 'calendar',
      label: 'Content Calendar',
      content: <ContentCalendar />,
    },
    {
      id: 'agents',
      label: 'AI Agents',
      content: <GTMAgentRoster />,
    },
    {
      id: 'kpis',
      label: 'KPIs & Budget',
      content: <KPITable />,
    },
    {
      id: 'strategy',
      label: 'Strategy Doc',
      content: <MarkdownDoc filePath="docs/marketing/MARKETING-STRATEGY.md" />,
    },
  ]

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="h-4 w-4 text-amber-400" strokeWidth={1.75} />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-400/70">
            Marketing & GTM
          </p>
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">How We Launch</h1>
        <p className="text-white/40 text-sm">
          Interactive launch checklist with AI vs manual tasks, content calendar, agent roster, and KPIs.
        </p>
      </div>

      <WikiTabs tabs={tabs} defaultTab="checklist" />
    </div>
  )
}
