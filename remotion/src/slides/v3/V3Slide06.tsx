// V3 Slide 06 — "Full Doc Stack"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const DOCS = [
  { name: "SPEC.md", desc: "1075 lines · Full product spec", icon: "📄", color: COLORS.purple.light },
  { name: "APP-ARCHITECTURE.html", desc: "Visual page map · Every feature", icon: "🗺️", color: COLORS.cyan.light },
  { name: "ARCHITECTURE-DECISIONS.md", desc: "Tech choices · Rationale", icon: "⚙️", color: COLORS.green.light },
  { name: "STATE.md", desc: "Live build state · Updated daily", icon: "🔄", color: COLORS.orange },
  { name: "ROADMAP.md", desc: "3-phase plan · Phase 1 → 3", icon: "🗓️", color: COLORS.yellow },
  { name: "PLAN.md", desc: "Agent playbook · Session rules", icon: "🤖", color: COLORS.purple.mid },
  { name: "Asana Board", desc: "56 tasks · Agent-readable", icon: "✅", color: COLORS.cyan.mid },
  { name: "Pencil Designs", desc: "Every UI frame · Pixel-perfect", icon: "✏️", color: COLORS.green.mid },
];

export const V3Slide06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 80px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1000 }}>
        <div style={{ textAlign: "center", marginBottom: 36, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Reference Stack</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>All The Docs</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {DOCS.map((doc, i) => {
            const p = pop(frame, fps, Math.round(i * 3 + 9));
            return (
              <div key={doc.name} style={{ background: "#0a0a0a", border: `1px solid ${doc.color}22`, borderTop: `2px solid ${doc.color}`, borderRadius: "0 0 10px 10px", padding: "14px 14px", opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{doc.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: doc.color, marginBottom: 4, fontFamily: "'SF Mono', monospace" }}>{doc.name}</div>
                <div style={{ fontSize: 11, color: "#333" }}>{doc.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
