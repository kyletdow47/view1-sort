// V1 Slide 06 — "Analytics"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, barGrow, springToTranslateY, COLORS } from "../../lib/animate";

const WEEKLY = [42, 61, 38, 78, 55, 90, 67];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export const V1Slide06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const MAX_H = 120;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Business Intelligence</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Analytics</div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Revenue", value: "$12,400", change: "+18%" },
            { label: "Bookings", value: "24", change: "+3" },
            { label: "Gallery views", value: "1,847", change: "+12%" },
          ].map((stat, i) => {
            const p = rise(frame, fps, Math.round(i * 4 + 6));
            return (
              <div key={stat.label} style={{ flex: 1, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 20px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateY(${springToTranslateY(p)}px)` }}>
                <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: COLORS.green.mid, marginTop: 4 }}>{stat.change} this week</div>
              </div>
            );
          })}
        </div>

        {/* Mini bar chart */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: "20px 24px", opacity: interpolate(rise(frame, fps, 18), [0,1],[0,1]) }}>
          <div style={{ fontSize: 12, color: "#444", marginBottom: 16 }}>Revenue vs Bookings — this week</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: MAX_H + 20 }}>
            {WEEKLY.map((val, i) => {
              const p = barGrow(frame, fps, Math.round(i * 2 + 18));
              const h = interpolate(p, [0,1],[0,(val / 100) * MAX_H]);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", height: h, background: i === 5 ? `linear-gradient(to top, ${COLORS.cyan.dark}, ${COLORS.cyan.mid})` : "#1a1a1a", borderRadius: "3px 3px 0 0", boxShadow: i === 5 ? `0 0 16px rgba(6,182,212,0.4)` : "none" }} />
                  <span style={{ fontSize: 11, color: "#333" }}>{DAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#333", opacity: interpolate(rise(frame, fps, 28), [0,1],[0,1]) }}>
          AI insights based on your full analytics →
        </div>
      </div>
    </AbsoluteFill>
  );
};
