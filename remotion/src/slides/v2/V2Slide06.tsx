// V2 Slide 06 — "Night Agents"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const AGENTS = [
  { name: "Coordinator", role: "Reads Asana, picks next task", model: "Sonnet", color: COLORS.purple.light },
  { name: "ui-builder", role: "Builds UI from Pencil designs", model: "Sonnet", color: COLORS.cyan.light },
  { name: "logic-builder", role: "Implements business logic", model: "Sonnet", color: COLORS.green.light },
  { name: "QA Agent", role: "Tests, flags bugs, creates tasks", model: "Sonnet", color: COLORS.orange },
];

export const V2Slide06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg,${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      {/* Night glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 400, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 48, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌙</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Agents Run All Night</div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 8 }}>10pm → 8am. 46 commits while you sleep.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {AGENTS.map((agent, i) => {
            const p = pop(frame, fps, Math.round(i * 4 + 9));
            return (
              <div key={agent.name} style={{ display: "flex", alignItems: "center", gap: 16, background: "#0a0a0a", border: "1px solid #1a1a1a", borderLeft: `3px solid ${agent.color}`, borderRadius: "0 10px 10px 0", padding: "14px 18px", opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${agent.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{agent.name}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{agent.role}</div>
                </div>
                <div style={{ fontSize: 11, color: agent.color, fontFamily: "'SF Mono', monospace", background: `${agent.color}11`, border: `1px solid ${agent.color}33`, borderRadius: 5, padding: "2px 8px" }}>{agent.model}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
