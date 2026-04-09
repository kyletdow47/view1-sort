// V1 Slide 07 — "Client Management"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const CLIENT_STATS = [
  { label: "Projects", value: "12" },
  { label: "Revenue", value: "$8,400" },
  { label: "Avg value", value: "$700" },
  { label: "Pay speed", value: "Fast" },
];

export const V1Slide07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Business Tool</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Client Management</div>
        </div>

        {/* Client card */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "24px", marginBottom: 16, opacity: interpolate(rise(frame, fps, 6), [0,1],[0,1]), transform: `translateY(${springToTranslateY(rise(frame, fps, 6))}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.purple.dark}, ${COLORS.cyan.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Sarah Johnson</div>
              <div style={{ fontSize: 13, color: "#444" }}>Wedding client · since 2024</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {CLIENT_STATS.map((stat, i) => {
              const p = rise(frame, fps, Math.round(i * 3 + 12));
              return (
                <div key={stat.label} style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: "10px 14px", opacity: interpolate(p, [0,1],[0,1]) }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        {["Client portal — they check in anytime", "Task list per client", "Recent activity + notes", "Quick actions"].map((feat, i) => {
          const p = slideIn(frame, fps, Math.round(i * 4 + 24));
          return (
            <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: COLORS.purple.mid, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#777" }}>{feat}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
