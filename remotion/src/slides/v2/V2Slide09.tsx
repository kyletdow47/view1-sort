// V2 Slide 09 — "Review Ritual"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const STEPS = [
  { icon: "📸", title: "Take a screenshot", desc: "Capture the UI as it looks right now" },
  { icon: "✏️", title: "Annotate issues", desc: "Circle, arrow, highlight what's wrong" },
  { icon: "🤖", title: "Paste to Claude", desc: "\"Fix these issues. Here's the context.\"" },
  { icon: "✅", title: "Correct + commit", desc: "One fix per commit. Move on." },
];

export const V2Slide09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.orange, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Quality Control</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>The Review Ritual</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STEPS.map((step, i) => {
            const p = slideIn(frame, fps, Math.round(i * 5 + 9));
            return (
              <div key={step.title} style={{ display: "flex", alignItems: "center", gap: 18, background: "#0a0a0a", border: "1px solid #1a1a1a", borderLeft: `3px solid ${COLORS.orange}44`, borderRadius: "0 10px 10px 0", padding: "16px 20px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                <span style={{ fontSize: 28, width: 40, textAlign: "center" }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
