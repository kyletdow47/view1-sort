// V1 Slide 08 — "Content Hub"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const PLATFORMS = [
  { name: "Instagram", color: "#E1306C", icon: "📸" },
  { name: "TikTok", color: "#69C9D0", icon: "🎵" },
  { name: "Facebook", color: "#1877F2", icon: "📘" },
  { name: "LinkedIn", color: "#0A66C2", icon: "💼" },
];

const CAL_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const V1Slide08: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Marketing</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Content Hub</div>
          <div style={{ fontSize: 15, color: "#444", marginTop: 8 }}>Plan + schedule content across every platform</div>
        </div>

        {/* Platform connections */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, justifyContent: "center" }}>
          {PLATFORMS.map((p, i) => {
            const prog = pop(frame, fps, Math.round(i * 4 + 9));
            return (
              <div key={p.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: interpolate(prog, [0,1],[0,1]), transform: `scale(${springToScale(prog)})` }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${p.color}22`, border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{p.icon}</div>
                <span style={{ fontSize: 11, color: "#444" }}>{p.name}</span>
              </div>
            );
          })}
        </div>

        {/* Mini calendar */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: "20px", opacity: interpolate(rise(frame, fps, 24), [0,1],[0,1]) }}>
          <div style={{ fontSize: 12, color: "#444", marginBottom: 14 }}>Content calendar — this week</div>
          <div style={{ display: "flex", gap: 8 }}>
            {CAL_DAYS.map((day, i) => {
              const hasContent = [1, 3, 5].includes(i);
              return (
                <div key={day} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#333", marginBottom: 6 }}>{day}</div>
                  <div style={{ height: 36, borderRadius: 6, background: hasContent ? (i === 1 ? "#1a0d2e" : "#040f12") : "#0d0d0d", border: `1px solid ${hasContent ? (i === 1 ? "#3b1f5e" : "#0a2a32") : "#141414"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {hasContent && <span style={{ fontSize: 14 }}>{i === 1 ? "📸" : i === 3 ? "🎬" : "📊"}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
