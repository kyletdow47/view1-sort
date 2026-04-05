# View1 Sort — GTM Launch Plan
> April 5 – May 15, 2026 · Founder: Kyle · Goal: 20 pilot users by April 20 · Live launch by April 30

---

## Quick Context

Kyle is traveling **Portugal → Italy, departing April 11, arriving April 18**. All systems must be designed to run autonomously during transit. Approvals happen via Slack reactions or Asana task moves — nothing more.

---

## Mission-Critical Dates

| Date | Milestone |
|------|-----------|
| **April 7** | Landing page mobile-optimized & deployed |
| **April 8** | First round of content live (Twitter origin thread, Reddit r/photography, Instagram Reel) |
| **April 10** | 10 pilot user conversations started (DMs, personal network) |
| **April 11** | ✈ Depart Portugal — all autonomous systems must be green |
| **April 14** | 20 pilot user target hit (mid-transit stretch goal) |
| **April 18** | ✈ Arrive Italy — review agent activity logs, adjust if needed |
| **April 20** | Hard deadline: 20 pilot users confirmed |
| **April 25** | Waitlist at 100+ signups |
| **April 30** | **App goes live** — waitlist converts to founding members |
| **May 7** | Week 1 post-launch review: retention, usage, feedback |
| **May 15** | 50+ active users, first revenue, public "we're live" post |

---

## Priority 1 — Landing Page (Due: April 7)

### Completed fixes (April 5)
- [x] Mobile hamburger nav menu added
- [x] CTA section border fixed for mobile stacking
- [x] "Capabilities" → "Features" in nav
- [x] Copy: "lifetime discount" → "founding member pricing locked in forever" (all instances)
- [x] Copy: "AI sorts your entire shoot" → "AI sorts a 500-photo shoot in under 12 minutes"
- [x] Copy: "Runs in the browser..." → "AI sorting runs entirely in your browser — no upload needed to cull"
- [x] AI Moment heading responsive sizing fixed (`text-3xl sm:text-[40px]`)
- [x] Mobile hero tagline updated to brand-correct copy

### Still needed before launch
- [ ] Confirm `/images/dashboard-v2-preview.png` exists and loads on Vercel (404 = broken hero on mobile)
- [ ] Add `#features`, `#pricing`, `#integrations` anchor IDs to landing sections
- [ ] OG image set for Twitter/Discord link previews (1200×630)
- [ ] Favicon confirmed visible
- [ ] Test waitlist form submission on mobile (tap → submit → success state)
- [ ] Google Analytics / Plausible tracking on waitlist form submissions

---

## Priority 2 — 20 Pilot Users by April 20

### Strategy
Don't wait for inbound. Go outbound first. The 20 pilots will come from direct personal contact before any content campaign.

### Outreach list (build before April 8)
Target photographers Kyle knows personally or has worked near:
- Segment 1: Commercial photographers in your network (5–10 people)
- Segment 2: Wedding photographers who shoot 10+ weddings/year
- Segment 3: Photography communities where Kyle is already a member

### Outreach message template (DM/text, not email)
> "Hey [name] — I've been building something for the past few months and I think you'd genuinely find it useful. It's called View1 Sort — AI sorting, gallery delivery, and invoicing all in one place. I'm looking for 20 photographers to test it before I go live next month. Would you be down to be one of them? Takes 20 mins to test, you'd get founding member access free forever."

### Tracking
Use a simple Asana board:
- **Reached Out** → **Responded** → **Signed Up** → **Active Pilot**
- Move cards yourself; agents monitor and surface status each morning via Slack

---

## Priority 3 — Marketing Campaign

### Phase 1: Seed (April 5–11) — Before You Leave

#### Day-by-day content plan

**Day 1 (April 5–6) — Origin Story**
- Twitter: "I'm a commercial photographer. Three years ago I came home from a shoot with 2,400 photos, 3 client deadlines, and a broken workflow. So I built the thing that should have existed. Here's what I built 🧵"
- Reddit r/photography: "I got frustrated sorting photos after every shoot so I built my own tool — honest feedback welcome"

**Day 2 (April 7) — Product Demo**
- Instagram Reel: Screen recording of AI sort flow with voiceover — "Watch 847 photos get sorted in under 12 minutes"
- TikTok: Same video, slightly shorter hook

**Day 3 (April 8) — Take/Opinion**
- Twitter: "Most AI photo tools are built by engineers who've never shot a wedding. Here's what they get wrong 🧵"
- LinkedIn: Founder story post — "I spent 6–12 hours sorting after every shoot. Then I fixed it."

**Day 4 (April 9) — Build Log**
- Twitter: "Shipped the mobile landing page today. Here's what view1sort.com looks like on an iPhone"
- Instagram: Screenshot carousel — "5 apps I used to use vs. the one thing I built instead"

**Day 5 (April 10) — Reddit Push**
- Reddit r/SideProject: "I'm a photographer who built my own post-shoot workflow tool. Here's what I learned building in public"
- Reddit r/freelance: "Solo photographer here — how I went from 5 apps to 1 workflow"

### Phase 2: Amplify (April 11–18) — While Traveling
**Goal: Automated posting, reactions-only approvals from Kyle**

Agents batch-prepare 7 days of content before April 11. Kyle approves via Slack thumbs-up. Scheduled tasks auto-post.

**Content mix during travel:**
- 1 Twitter post/day (build log or take)
- 2 Reddit replies/week (monitor keywords, agent drafts responses)
- 1 Instagram post (auto-scheduled)
- 1 TikTok post (auto-scheduled)

### Phase 3: Push (April 18–30) — Italy + Launch

**Week of April 18:**
- Announce launch date publicly: "View1 Sort goes live April 30. Waitlist closes the night before."
- Post "state of the build" with real waitlist numbers
- Final product demo — full flow from upload to client gallery payment

**Week of April 25:**
- "48 hours left on the waitlist"
- Send personal thank-you DM to first 50 signups
- Email sequence: 3-email waitlist → launch drip

**April 30 — Launch Day:**
- "We're live" post on all channels simultaneously
- Convert waitlist to founding member access
- Personal DM to every pilot user

### Phase 4: Post-Launch (May 1–15)
- Weekly "View1 in the wild" posts — screenshot real photographer usage
- Collect 3 testimonials from pilot users
- Start SEO content: "best photo delivery software for photographers", "Pixieset alternative"
- Target: 50 active users + first paid subscription by May 15

---

## Priority 4 — AI Agent Workflow System

### Agent Roster

| Agent Name | Role | Model | Trigger | Approval method |
|-----------|------|-------|---------|-----------------|
| `content-drafter` | Drafts 5 social posts from recent build activity | Claude Sonnet | Weekly (Monday 9am) | Slack reaction 👍 to post |
| `reddit-monitor` | Watches r/photography, r/weddingphotography for "culling", "Pixieset alternative", "workflow" keywords — drafts reply | Daily (8am) | Slack reaction to approve reply |
| `outreach-researcher` | Pulls Apollo ICP leads (commercial photographers), enriches, drafts DM | Weekly | Asana card move: "Drafted" → "Send" |
| `waitlist-emailer` | Sends weekly waitlist update email to all signups | Weekly (Friday 5pm) | Slack reaction to send |
| `qa-visual` | Screenshots live Vercel URL on desktop + mobile, flags visual regressions | After each deploy | Auto — posts screenshots to Slack |
| `build-status` | Morning briefing: waitlist count, Asana tasks completed, what's broken | Daily (8am) | Auto — no approval needed |
| `content-scheduler` | Takes approved content, posts to Twitter/Instagram/TikTok via scheduled tasks | Triggered by approval | Auto-runs 30min after 👍 |

### Approval Flow

```
Agent drafts content
       ↓
Slack DM to Kyle with preview
       ↓
Kyle reacts 👍 (approve) or ✋ (reject/edit)
       ↓
If 👍 → content-scheduler fires
If ✋ → agent revises and re-sends
If no reaction in 4 hours → agent holds and reminds once
```

### Asana Board: GTM Execution

**Sections:**
- **To Draft** — tasks waiting for agent to write content/outreach
- **Review** — Kyle reviews (react in Slack or move card)
- **Scheduled** — approved, queued for posting
- **Live** — posted/sent
- **Metrics** — weekly agent posts engagement stats here

### Travel-Mode Protocol (April 11–18)

During Portugal → Italy transit:
- All agents run on normal schedule
- Morning briefing delivered to Slack at 8am Kyle's local time
- Any CRITICAL issue (e.g., waitlist form broken, Vercel down) → Slack @kyle immediately
- Non-critical issues held for morning brief
- No approvals required for: build status reports, monitoring alerts
- Approvals required for: posting content, sending emails, DMing people

---

## Priority 5 — Full Timeline to May 15

### April 5–7: Foundation
- [x] Fix landing page mobile issues
- [ ] Deploy to Vercel, verify on real iPhone
- [ ] Set up Asana GTM board
- [ ] Set up Slack channel #gtm-launch
- [ ] Configure scheduled tasks: `build-status`, `content-drafter`
- [ ] Write 5 seed pieces of content (origin story, 2 product posts, 2 takes)

### April 8–10: First Wave
- [ ] Post origin story Twitter thread
- [ ] Post Reddit r/photography (authentic, no pitch)
- [ ] Record + post first product demo Reel
- [ ] Start 20 personal outreach DMs
- [ ] Set up `reddit-monitor` agent with keyword list
- [ ] Configure Apollo outreach agent with ICP filters

### April 11: Travel Prep — Systems Check
- [ ] All scheduled agents green
- [ ] 7-day content queue approved in Slack
- [ ] Waitlist form tested + confirmed working
- [ ] Build pipeline running autonomously (design-to-dev + visual-qa)
- [ ] Emergency contact protocol set (Slack alerts only)

### April 11–18: Travel Mode
- [ ] Automated daily posting via scheduled tasks
- [ ] Agent monitors Reddit, surfaces reply opportunities
- [ ] Morning briefing via Slack daily
- [ ] Kyle reacts to content approvals from phone

### April 18–20: Italy Arrival
- [ ] Review 7-day agent activity log
- [ ] Confirm 20 pilot users hit (adjust outreach if behind)
- [ ] Record Italy-based "day after a shoot" content (authentic travel angles)

### April 20–30: Launch Sprint
- [ ] Announce April 30 launch date
- [ ] 3-email launch drip to waitlist (ship with `waitlist-emailer`)
- [ ] Final product polish (mobile verification, onboarding flow)
- [ ] "48 hours left" final waitlist push
- [ ] April 30: flip the switch — live to founding members

### May 1–15: Post-Launch
- [ ] Monitor onboarding (where do users drop off?)
- [ ] 3 pilot user testimonials collected
- [ ] First revenue target: 5 paid subscriptions
- [ ] SEO content: 2 blog posts targeting competitor keywords
- [ ] Weekly "View1 in the wild" social posts
- [ ] Prepare "Month 1" recap post for Twitter/LinkedIn

---

## Budget: Near-Zero Cash Spend

| Item | Cost | Notes |
|------|------|-------|
| Vercel hosting | $0 | Hobby tier is fine for MVP traffic |
| Claude API (agents) | ~$5–15/month | Budget-capped via Paperclip/task limits |
| Apollo (lead research) | $0 | Free tier, 50 contacts/month |
| Canva / image gen | $0 | Claude image gen for ad creatives |
| Paid social boost | $0 initially | Only if organic traction stalls after Week 2 |
| Reddit / Twitter ads | $0 | Organic first |
| **Total** | **~$5–15/month** | |

Paid amplification only activates if organic fails to reach 100 waitlist signups by Week 3. Even then, $20/day on best-performing organic post, 3-day test.

---

## KPIs

| Metric | April 10 | April 20 | April 30 | May 15 |
|--------|----------|----------|----------|--------|
| Pilot users (active testers) | 10 | 20 ✓ | 30 | 50 |
| Waitlist signups | 30 | 75 | 150 | 300 |
| Twitter followers/impressions | — | 500 impr/day | 1k impr/day | — |
| Reddit posts (combined karma) | 50 | 200 | — | — |
| Instagram Reel views | — | 500 | 2,000 | 5,000 |
| Paying subscribers | 0 | 0 | 5 (founding) | 15 |

---

## Paperclip / Agent Architecture Notes

Paperclip (https://github.com/paperclipai/paperclip) is an agent orchestration framework — it manages teams of agents, not individual browser automation. The recommended hybrid architecture:

1. **Paperclip** = the "company" — manages agent roles, budgets, task queues, heartbeats
2. **Claude Code scheduled tasks (Cowork)** = individual coding/QA agents on timers
3. **Browser-use / Playwright** = the execution layer for social posting
4. **Slack MCP** = approval gateway — all human-in-the-loop touchpoints

**Social posting agent design:**
- Agent is a Playwright script (`agents/social-poster.js`) that takes a payload `{ platform, content, mediaPath }` and posts it
- Paperclip assigns posting tasks, enforces budget, handles retries
- Kyle approves the content via Slack before Paperclip triggers the posting task
- The Playwright script handles the actual browser automation (login sessions stored locally)

**Personal assistant / voice mirroring:**
Consider using a simple CLAUDE.md in your Paperclip company config that captures your voice, style, opinions, and writing patterns — built from your existing posts, DMs, and content. Over time, the drafting agents get better at sounding like you because they're reading your prior content as context each time.

---

*Last updated: April 5, 2026*
*Next review: April 11, 2026 (before travel)*
