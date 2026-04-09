// V1 Slide 03 — "Command Bar ⌘K"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

export const V1Slide03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hp = rise(frame, fps, 0);
  const kp = pop(frame, fps, 6);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Big ⌘K */}
        <div style={{ opacity: interpolate(kp, [0,1],[0,1]), transform: `scale(${springToScale(kp, 0.8, 1)})`, marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #2a2a2a", borderRadius: 16, padding: "16px 32px", boxShadow: "0 0 40px rgba(168,85,247,0.15)" }}>
            <span style={{ fontSize: 48, fontWeight: 900, background: "linear-gradient(135deg, #fff 0%, #a855f7 60%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "-apple-system" }}>⌘K</span>
          </div>
        </div>

        <div style={{ opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: "-0.5px" }}>Command Bar Search</div>
          <div style={{ fontSize: 16, color: "#555", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
            One keyboard shortcut to access anything. Search projects, pages, clients, or any feature — instantly.
          </div>
        </div>

        {/* Search bar mockup */}
        <div style={{ marginTop: 40, background: "#0d0d0d", border: "1px solid #222", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, maxWidth: 500, margin: "40px auto 0", opacity: interpolate(rise(frame, fps, 12), [0,1],[0,1]) }}>
          <span style={{ color: "#333", fontSize: 16 }}>🔍</span>
          <span style={{ fontSize: 14, color: "#333" }}>Search anything...</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#222", background: "#111", border: "1px solid #1e1e1e", borderRadius: 4, padding: "2px 6px", fontFamily: "'SF Mono', monospace" }}>⌘</span>
            <span style={{ fontSize: 11, color: "#222", background: "#111", border: "1px solid #1e1e1e", borderRadius: 4, padding: "2px 6px", fontFamily: "'SF Mono', monospace" }}>K</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
