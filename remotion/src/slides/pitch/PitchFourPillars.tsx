// "AI sorting, client galleries, payments, bookings" — 4 feature cards vertical
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const PILLARS = [
  { icon: "🤖", title: "AI Sorting", desc: "Upload → prompt → organized by scene", color: COLORS.purple.light },
  { icon: "🖼️", title: "Client Galleries", desc: "Watermarked previews, licensed downloads", color: COLORS.cyan.light },
  { icon: "💳", title: "Payments", desc: "Invoicing, Stripe, get paid in-app", color: COLORS.green.mid },
  { icon: "📅", title: "Bookings", desc: "Calendar, pipeline, scheduling", color: COLORS.orange },
];

export const PitchFourPillars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "100px 48px 0 48px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 50, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 22, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>All-in-One</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Four Pillars. One App.</div>
        </div>

        {/* Vertical stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 10px" }}>
          {PILLARS.map((p, i) => {
            const prog = slideIn(frame, fps, Math.round(i * 8 + 12));
            return (
              <div key={p.title} style={{
                background: "#0a0a0a",
                border: `2px solid ${p.color}33`,
                borderLeft: `4px solid ${p.color}`,
                borderRadius: "0 20px 20px 0",
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: interpolate(prog, [0,1],[0,1]),
                transform: `translateX(${springToTranslateX(prog, -30)}px)`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
              }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  background: `${p.color}15`,
                  border: `2px solid ${p.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  flexShrink: 0,
                }}>{p.icon}</div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: p.color, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 20, color: "#666", lineHeight: 1.4 }}>{p.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
