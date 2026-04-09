// V2 Slide 03 — "Asana Task Structure"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const TASKS = [
  { title: "Build AI sort upload page", priority: "P1", status: "Done ✓", color: COLORS.green.mid },
  { title: "Implement gallery watermarking", priority: "P1", status: "Done ✓", color: COLORS.green.mid },
  { title: "Add client portal auth flow", priority: "P1", status: "In QA", color: COLORS.cyan.mid },
  { title: "Stripe webhook handler", priority: "P2", status: "Pending", color: "#444" },
];

export const V2Slide03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>System</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Asana Task Structure</div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 8 }}>56 tasks. Each detailed enough for an agent to build without asking.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TASKS.map((task, i) => {
            const p = slideIn(frame, fps, Math.round(i * 4 + 9));
            return (
              <div key={task.title} style={{ display: "flex", alignItems: "center", gap: 16, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "14px 18px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                <div style={{ fontSize: 11, fontFamily: "'SF Mono', monospace", color: COLORS.purple.light, background: "#1a0d2e", border: "1px solid #3b1f5e", borderRadius: 5, padding: "2px 8px", flexShrink: 0 }}>{task.priority}</div>
                <div style={{ flex: 1, fontSize: 14, color: "#ccc" }}>{task.title}</div>
                <div style={{ fontSize: 12, color: task.color, fontWeight: 600, flexShrink: 0 }}>{task.status}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, padding: "14px 18px", background: "#0a0a0a", border: "1px dashed #1a1a1a", borderRadius: 10, opacity: interpolate(rise(frame, fps, 24), [0,1],[0,1]) }}>
          <div style={{ fontSize: 13, color: "#444" }}>Agent flow: Pick task → Read description → Build → Complete → Create QA task → Repeat</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
