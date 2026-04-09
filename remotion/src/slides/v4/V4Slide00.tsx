// V4 Slide 00 — "QA Philosophy"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

export const V4Slide00: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const sub1 = rise(frame, fps, 9);
  const sub2 = rise(frame, fps, 18);
  const quote = rise(frame, fps, 27);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 140px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 720 }}>
        <div style={{ opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)`, marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🧪</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.15 }}>QA Philosophy</div>
        </div>

        <div style={{ opacity: interpolate(sub1, [0,1],[0,1]), transform: `translateY(${springToTranslateY(sub1)}px)`, marginBottom: 16 }}>
          <div style={{ fontSize: 20, color: "#555", lineHeight: 1.5 }}>Most v1 SaaS tools skip QA. They just build to get it done.</div>
        </div>

        <div style={{ opacity: interpolate(sub2, [0,1],[0,1]), transform: `translateY(${springToTranslateY(sub2)}px)`, marginBottom: 40 }}>
          <div style={{ fontSize: 20, color: COLORS.cyan.mid }}>I didn't.</div>
        </div>

        <div style={{ opacity: interpolate(quote, [0,1],[0,1]), transform: `translateY(${springToTranslateY(quote)}px)`, background: "#0a0a0a", border: `1px solid ${COLORS.cyan.dark}22`, borderLeft: `3px solid ${COLORS.cyan.mid}`, borderRadius: "0 10px 10px 0", padding: "16px 24px", textAlign: "left" }}>
          <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
            "I wanted Claude to check itself over and over — a QA agent that tests what the build agent creates, flags what's broken, and sends it back."
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
