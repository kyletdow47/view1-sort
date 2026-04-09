// V4 Slide 06 — "The Bible"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const SECTIONS = [
  { icon: "📊", name: "Live Metrics", desc: "Supabase + Stripe stats, updating live", color: COLORS.cyan.mid },
  { icon: "🎯", name: "Milestones", desc: "Launch goals + progress tracking", color: COLORS.green.mid },
  { icon: "📄", name: "Product + Tech", desc: "All docs, research, architecture", color: COLORS.purple.light },
  { icon: "📢", name: "Marketing + GTM", desc: "Launch checklist, waitlist, pilots", color: COLORS.orange },
  { icon: "🤖", name: "Agent System", desc: "Slack + Asana, KPIs, budget", color: COLORS.yellow },
  { icon: "📋", name: "Operations", desc: "SOPs, guides, reproducible systems", color: "#86efac" },
];

export const V4Slide06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 80px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1000 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📖</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>The Bible</div>
          <div style={{ fontSize: 15, color: "#444", marginTop: 8 }}>All sections live. Metrics pulled from API connections.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {SECTIONS.map((sec, i) => {
            const p = pop(frame, fps, Math.round(i * 4 + 9));
            return (
              <div key={sec.name} style={{ background: "#0a0a0a", border: `1px solid ${sec.color}22`, borderRadius: 12, padding: "20px 18px", opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{sec.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: sec.color, marginBottom: 6 }}>{sec.name}</div>
                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>{sec.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
