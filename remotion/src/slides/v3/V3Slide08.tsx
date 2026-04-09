// V3 Slide 08 — "SPEC.md Genesis"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const EXCHANGES = [
  { role: "You", text: "I want to build a photo sorting app for photographers.", color: COLORS.cyan.light, align: "right" as const },
  { role: "Claude", text: "What types of photographers? Wedding, commercial, event?", color: COLORS.purple.light, align: "left" as const },
  { role: "You", text: "All three. They need AI to sort by narrative, not just quality.", color: COLORS.cyan.light, align: "right" as const },
  { role: "Claude", text: "How do clients receive the final gallery? Download? Portal?", color: COLORS.purple.light, align: "left" as const },
  { role: "You", text: "Both. Watermarked preview, then licensed download.", color: COLORS.cyan.light, align: "right" as const },
  { role: "Claude", text: "→ 30 questions later: SPEC.md created. 1075 lines.", color: COLORS.green.mid, align: "left" as const },
];

export const V3Slide08: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800 }}>
        <div style={{ textAlign: "center", marginBottom: 36, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>How It Starts</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>The Claude Interview</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXCHANGES.map((msg, i) => {
            const p = slideIn(frame, fps, Math.round(i * 5 + 9));
            const isRight = msg.align === "right";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isRight ? "flex-end" : "flex-start", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p, isRight ? 16 : -16)}px)` }}>
                <div style={{ maxWidth: "75%", background: "#0a0a0a", border: `1px solid ${msg.color}33`, borderRadius: isRight ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: msg.color, marginBottom: 4, fontWeight: 600 }}>{msg.role}</div>
                  <div style={{ fontSize: 13, color: "#bbb" }}>{msg.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
