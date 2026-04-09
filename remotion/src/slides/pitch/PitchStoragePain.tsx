// "storage scattered across Dropbox and Google Drive" — storage chaos
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, slideIn, springToTranslateY, springToScale, springToTranslateX, COLORS } from "../../lib/animate";

// Storage bars that fill up and turn red
const DRIVES = [
  {
    name: "Dropbox",
    icon: "📦",
    color: "#0061FF",
    used: 1.8,
    total: 2,
    label: "1.8 GB / 2 GB",
  },
  {
    name: "Google Drive",
    icon: "🔺",
    color: "#4285F4",
    used: 14.2,
    total: 15,
    label: "14.2 GB / 15 GB",
  },
];

const PROBLEMS = [
  { icon: "📁", text: "Wedding photos in Dropbox" },
  { icon: "📁", text: "Corporate shoot on Google Drive" },
  { icon: "📁", text: "Family session on a hard drive" },
  { icon: "📁", text: "Edits in a WeTransfer link (expired)" },
];

export const PitchStoragePain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "100px 48px 0 48px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 50, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 22, color: "#ef4444", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>The Storage Problem</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: "-1px", lineHeight: 1.1 }}>Files Everywhere.</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#ef4444", letterSpacing: "-1px", lineHeight: 1.1 }}>Space Nowhere.</div>
        </div>

        {/* Storage meters — big and prominent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
          {DRIVES.map((drive, i) => {
            const p = pop(frame, fps, Math.round(i * 10 + 12));
            const pct = drive.used / drive.total;
            const barFill = interpolate(
              frame,
              [Math.round(i * 10 + 20), Math.round(i * 10 + 60)],
              [0, pct * 100],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const isAlmostFull = pct > 0.85;

            return (
              <div key={drive.name} style={{
                background: "#0a0a0a",
                border: `2px solid ${isAlmostFull ? "#ef444444" : "#222"}`,
                borderRadius: 20,
                padding: "24px 28px",
                opacity: interpolate(p, [0,1],[0,1]),
                transform: `scale(${springToScale(p)})`,
                boxShadow: isAlmostFull ? "0 4px 30px rgba(239,68,68,0.1)" : "0 4px 24px rgba(0,0,0,0.4)",
              }}>
                {/* Drive header */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: `${drive.color}22`,
                    border: `2px solid ${drive.color}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                  }}>{drive.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{drive.name}</div>
                    <div style={{ fontSize: 16, color: isAlmostFull ? "#ef4444" : "#555", fontFamily: "'SF Mono', monospace", marginTop: 4 }}>{drive.label}</div>
                  </div>
                  {isAlmostFull && (
                    <div style={{
                      fontSize: 14,
                      color: "#ef4444",
                      background: "#1a0404",
                      border: "1px solid #ef444444",
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontWeight: 700,
                      opacity: interpolate(rise(frame, fps, Math.round(i * 10 + 50)), [0,1],[0,1]),
                    }}>⚠️ Almost full</div>
                  )}
                </div>

                {/* Storage bar */}
                <div style={{ height: 14, background: "#1a1a1a", borderRadius: 7, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${barFill}%`,
                    background: isAlmostFull
                      ? "linear-gradient(90deg, #f97316, #ef4444)"
                      : `linear-gradient(90deg, ${drive.color}88, ${drive.color})`,
                    borderRadius: 7,
                    boxShadow: isAlmostFull ? "0 0 12px rgba(239,68,68,0.4)" : "none",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Scattered files list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PROBLEMS.map((prob, i) => {
            const p = slideIn(frame, fps, Math.round(i * 6 + 40));
            return (
              <div key={prob.text} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: 12,
                opacity: interpolate(p, [0,1],[0,1]),
                transform: `translateX(${springToTranslateX(p, -20)}px)`,
              }}>
                <span style={{ fontSize: 22 }}>{prob.icon}</span>
                <span style={{ fontSize: 18, color: "#777" }}>{prob.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
