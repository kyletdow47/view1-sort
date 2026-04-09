// V1 Slide 02 — "The 10 Features"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const FEATURES = [
  { icon: "⌘", label: "Command K Search" },
  { icon: "🤖", label: "AI Sort" },
  { icon: "🖼️", label: "Gallery Delivery" },
  { icon: "📅", label: "Bookings + Pipeline" },
  { icon: "👥", label: "Client Management" },
  { icon: "📊", label: "Analytics" },
  { icon: "📢", label: "Content Hub" },
  { icon: "💳", label: "Stripe Billing" },
  { icon: "🔔", label: "Notifications" },
  { icon: "⚙️", label: "Settings + Workspace" },
];

export const V1Slide02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Phase 1 Features</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Everything in View1 Sort</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {FEATURES.map((f, i) => {
            const p = slideIn(frame, fps, Math.round(i * 3 + 9));
            return (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: "#ccc", fontWeight: 500 }}>{f.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
