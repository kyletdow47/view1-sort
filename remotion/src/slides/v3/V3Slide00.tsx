// V3 Slide 00 — "Foundation: Before I wrote a single line of code..."
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

export const V3Slide00: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const subP = rise(frame, fps, 9);
  const docP = rise(frame, fps, 18);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 800 }}>
        <div style={{ opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 24 }}>Before a single line of code</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 24 }}>
            I wrote<br />
            <span style={{ background: `linear-gradient(135deg, ${COLORS.purple.light}, ${COLORS.cyan.mid})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>this.</span>
          </div>
        </div>

        <div style={{ opacity: interpolate(subP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(subP)}px)`, fontSize: 18, color: "#555", marginBottom: 40 }}>
          1075 lines. Every feature, every decision, documented first.
        </div>

        {/* SPEC.md visual */}
        <div style={{ opacity: interpolate(docP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(docP)}px)`, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: "18px 24px", textAlign: "left", maxWidth: 500, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: "#444", fontFamily: "'SF Mono', monospace", marginBottom: 12 }}>SPEC.md — 1075 lines</div>
          {["# Vision", "## User Roles", "## Core Features", "## Phase 1 Scope", "## Architecture"].map((line, i) => (
            <div key={line} style={{ fontSize: 13, color: i === 0 ? COLORS.purple.light : i < 3 ? "#555" : "#333", fontFamily: "'SF Mono', monospace", lineHeight: 1.8 }}>{line}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
