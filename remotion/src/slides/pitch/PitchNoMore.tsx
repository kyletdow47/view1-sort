// "No more lost links. No more five different apps." — crossed out pain points
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const PAIN_POINTS = [
  { text: "Lost WeTransfer links", icon: "🔗" },
  { text: "Five different apps", icon: "📱" },
  { text: "Clients texting 'send it again'", icon: "💬" },
  { text: "Storage running out", icon: "💾" },
  { text: "Scattered invoices", icon: "🧾" },
];

export const PitchNoMore: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "100px 48px 0 48px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 50, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15 }}>No More.</div>
        </div>

        {/* Pain points that get crossed out */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 10px" }}>
          {PAIN_POINTS.map((pain, i) => {
            const enterDelay = Math.round(i * 8 + 12);
            const strikeDelay = enterDelay + 20;
            const enterP = slideIn(frame, fps, enterDelay);
            const strikeProgress = interpolate(frame, [strikeDelay, strikeDelay + 10], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const isStruck = frame > strikeDelay;

            return (
              <div key={pain.text} style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "20px 24px",
                background: isStruck ? "#0a0404" : "#0a0a0a",
                border: `2px solid ${isStruck ? "#ef444433" : "#1e1e1e"}`,
                borderRadius: 16,
                opacity: interpolate(enterP, [0,1],[0,1]),
                transform: `translateX(${springToTranslateX(enterP, -24)}px)`,
                position: "relative",
                overflow: "hidden",
              }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{pain.icon}</span>
                <span style={{
                  fontSize: 24,
                  color: isStruck ? "#555" : "#ccc",
                  fontWeight: 500,
                  flex: 1,
                }}>{pain.text}</span>

                {/* Strikethrough line animating across */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: 20,
                  height: 3,
                  width: `${strikeProgress}%`,
                  background: "#ef4444",
                  borderRadius: 2,
                  transform: "translateY(-50%)",
                  boxShadow: "0 0 8px rgba(239,68,68,0.4)",
                }} />

                {/* Red X on the right */}
                <span style={{
                  fontSize: 28,
                  color: "#ef4444",
                  fontWeight: 900,
                  opacity: interpolate(frame, [strikeDelay + 8, strikeDelay + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  flexShrink: 0,
                }}>✗</span>
              </div>
            );
          })}
        </div>

        {/* Replacement message */}
        <div style={{
          textAlign: "center",
          marginTop: 40,
          opacity: interpolate(rise(frame, fps, 70), [0,1],[0,1]),
          transform: `translateY(${springToTranslateY(rise(frame, fps, 70))}px)`,
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, background: `linear-gradient(135deg, ${COLORS.purple.light}, ${COLORS.cyan.mid})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Just View1 Sort.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
