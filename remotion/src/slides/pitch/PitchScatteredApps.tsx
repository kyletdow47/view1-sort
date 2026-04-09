// "scattered across different apps" → converge into View1 Sort
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

const APPS = [
  { label: "Google Cal", icon: "📅", startX: -220, startY: -350 },
  { label: "QuickBooks", icon: "💰", startX: 240, startY: -280 },
  { label: "WeTransfer", icon: "📤", startX: -260, startY: 100 },
  { label: "Honeybook", icon: "📋", startX: 280, startY: 180 },
  { label: "Dropbox", icon: "☁️", startX: -40, startY: -500 },
];

export const PitchScatteredApps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  const convergeProgress = spring({ frame, fps, delay: 90, config: { damping: 14, stiffness: 80 } });
  const logoP = rise(frame, fps, 120);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 100, left: 0, right: 0, textAlign: "center", zIndex: 2, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>Five Apps.</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: "#ef4444", letterSpacing: "-1px" }}>One Problem.</div>
      </div>

      {/* Scattered apps that converge — BIG cards */}
      {APPS.map((app, i) => {
        const enterP = rise(frame, fps, Math.round(i * 3 + 6));
        const x = interpolate(convergeProgress, [0, 1], [app.startX, 0]);
        const y = interpolate(convergeProgress, [0, 1], [app.startY, 0]);
        const appOpacity = interpolate(convergeProgress, [0.7, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const rotation = (i % 2 === 0 ? -1 : 1) * (5 + i * 2);
        const rotateOut = interpolate(convergeProgress, [0, 1], [rotation, 0]);

        return (
          <div key={app.label} style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotateOut}deg)`,
            opacity: interpolate(enterP, [0,1],[0,1]) * appOpacity,
            zIndex: 1,
          }}>
            <div style={{
              background: "#0a0a0a",
              border: "2px solid #222",
              borderRadius: 24,
              padding: "28px 36px",
              textAlign: "center",
              minWidth: 160,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}>
              <div style={{ fontSize: 64, marginBottom: 10 }}>{app.icon}</div>
              <div style={{ fontSize: 20, color: "#777", fontWeight: 600 }}>{app.label}</div>
            </div>
          </div>
        );
      })}

      {/* View1 Sort logo — appears after convergence */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 3, opacity: interpolate(logoP, [0,1],[0,1]), textAlign: "center" }}>
        <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: "-2px", background: `linear-gradient(135deg, ${COLORS.purple.light}, ${COLORS.cyan.mid})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", textShadow: "none" }}>View1 Sort</div>
        <div style={{ fontSize: 22, color: "#555", marginTop: 12 }}>One platform. Everything in one place.</div>
      </div>

      {/* Glow behind logo */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(168,85,247,${interpolate(logoP, [0,1],[0,0.15])}) 0%, transparent 70%)`, zIndex: 0 }} />
    </AbsoluteFill>
  );
};
