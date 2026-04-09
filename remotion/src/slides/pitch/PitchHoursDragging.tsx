// "hours dragging files into folders one by one" — the old way
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const FOLDERS = ["📁 Sunsets", "📁 Street", "📁 Food", "📁 Architecture", "📁 People"];

export const PitchHoursDragging: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  // Animated counter: counts up from 0:00 to 3:47
  const counterSec = interpolate(frame, [30, 200], [0, 227], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mins = Math.floor(counterSec / 60);
  const secs = Math.floor(counterSec % 60);
  const counterText = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: "#ef4444", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>The Old Way</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>Dragging Files Into Folders</div>
        </div>

        {/* Time counter */}
        <div style={{ textAlign: "center", marginBottom: 32, opacity: interpolate(rise(frame, fps, 6), [0,1],[0,1]) }}>
          <div style={{ fontSize: 72, fontWeight: 900, fontFamily: "'SF Mono', monospace", color: "#ef4444", letterSpacing: "-2px" }}>{counterText}</div>
          <div style={{ fontSize: 13, color: "#444", marginTop: 4 }}>hours spent organizing</div>
        </div>

        {/* Folder targets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FOLDERS.map((folder, i) => {
            const p = slideIn(frame, fps, Math.round(i * 4 + 15));
            const photoCount = Math.floor(interpolate(frame, [Math.round(i * 8 + 30), 200], [0, 30 + i * 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
            return (
              <div key={folder} style={{ display: "flex", alignItems: "center", gap: 16, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px 18px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                <div style={{ fontSize: 16 }}>{folder}</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 12, fontFamily: "'SF Mono', monospace", color: "#ef4444" }}>{photoCount} files</div>
                <div style={{ fontSize: 14, color: "#333" }}>← drag</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#333", fontStyle: "italic", opacity: interpolate(rise(frame, fps, 36), [0,1],[0,1]) }}>
          One by one. Every single time.
        </div>
      </div>
    </AbsoluteFill>
  );
};
