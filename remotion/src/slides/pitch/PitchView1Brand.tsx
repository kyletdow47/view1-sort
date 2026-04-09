// "It's called View1 Sort" — brand reveal, fills the screen
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, slideIn, springToTranslateY, springToScale, springToTranslateX, COLORS } from "../../lib/animate";

const FEATURES = [
  { icon: "🤖", label: "AI Sorting", color: COLORS.purple.light },
  { icon: "🖼️", label: "Galleries", color: COLORS.cyan.light },
  { icon: "💳", label: "Payments", color: COLORS.green.mid },
  { icon: "📅", label: "Bookings", color: COLORS.orange },
];

export const PitchView1Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const brandP = pop(frame, fps, 6);
  const tagP = rise(frame, fps, 16);
  const dividerP = rise(frame, fps, 24);
  const pillsP = rise(frame, fps, 30);

  const glowSize = interpolate(Math.sin((frame / 30) * Math.PI), [-1, 1], [700, 900]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "120px 48px 0 48px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      {/* Glow orb — big */}
      <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%, -50%)", width: glowSize, height: glowSize, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, rgba(6,182,212,0.07) 40%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%" }}>
        {/* Brand name — massive */}
        <div style={{ opacity: interpolate(brandP, [0,1],[0,1]), transform: `scale(${springToScale(brandP, 0.6, 1)})`, marginBottom: 24 }}>
          <div style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: "-5px",
            lineHeight: 1,
            background: "linear-gradient(135deg, #fff 0%, #a855f7 40%, #06b6d4 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>View1</div>
          <div style={{
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: "-5px",
            lineHeight: 1,
            background: "linear-gradient(135deg, #a855f7 0%, #06b6d4 60%, #67e8f9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginTop: -8,
          }}>Sort</div>
        </div>

        {/* Tagline */}
        <div style={{ opacity: interpolate(tagP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(tagP)}px)`, marginBottom: 40 }}>
          <div style={{ fontSize: 32, color: "#666", fontWeight: 400 }}>One platform for photographers</div>
        </div>

        {/* Divider line */}
        <div style={{
          width: 200,
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.3), transparent)",
          margin: "0 auto 40px",
          opacity: interpolate(dividerP, [0,1],[0,1]),
        }} />

        {/* Feature cards — vertical list, big */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 40px", opacity: interpolate(pillsP, [0,1],[0,1]) }}>
          {FEATURES.map((f, i) => {
            const p = slideIn(frame, fps, Math.round(i * 6 + 34));
            return (
              <div key={f.label} style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "16px 24px",
                background: "#0a0a0a",
                border: `2px solid ${f.color}22`,
                borderLeft: `4px solid ${f.color}`,
                borderRadius: "0 14px 14px 0",
                opacity: interpolate(p, [0,1],[0,1]),
                transform: `translateX(${springToTranslateX(p, -20)}px)`,
              }}>
                <span style={{ fontSize: 32 }}>{f.icon}</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: f.color }}>{f.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
