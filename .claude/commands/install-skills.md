Install all required skills for the view1-sort agent system.
Run each command in order. Wait for confirmation before proceeding.

Step 1 — Anthropic official:
/plugin marketplace add anthropics/claude-code
/plugin install frontend-design@anthropics-claude-code
/plugin install skill-creator@anthropics-claude-code

Step 2 — Vercel agent skills:
/plugin marketplace add vercel-labs/agent-skills
/plugin install react-best-practices@vercel-labs-agent-skills
/plugin install view-transitions@vercel-labs-agent-skills

Step 3 — Accessibility:
/plugin marketplace add accesslint/claude-marketplace
/plugin install accesslint@accesslint-claude-marketplace

Step 4 — GSAP animation:
/plugin marketplace add greensock/gsap-skills
/plugin install gsap-core@greensock-gsap-skills
/plugin install gsap-scrolltrigger@greensock-gsap-skills
/plugin install gsap-react@greensock-gsap-skills

Step 5 — UI/UX Pro Max:
npx skills add nextlevelbuilder/ui-ux-pro-max-skill --global

Step 6 — Security:
/plugin marketplace add agamm/claude-code-owasp
/plugin install owasp@agamm-claude-code-owasp

Step 7 — Expo native UI:
/plugin marketplace add expo/skills
/plugin install expo-app-design@expo-skills

After install: run /mcp to verify all plugins show as connected.
