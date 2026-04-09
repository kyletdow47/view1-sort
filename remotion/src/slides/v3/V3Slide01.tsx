// V3 Slide 01 — "SPEC.md"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const SECTIONS = [
  { heading: "Vision + Goals", lines: 84 },
  { heading: "User Roles (Photographer / Client)", lines: 120 },
  { heading: "Phase 1 Scope (MVP)", lines: 210 },
  { heading: "Phase 2 Features", lines: 180 },
  { heading: "Architecture Decisions", lines: 156 },
  { heading: "Tech Stack Rationale", lines: 98 },
  { heading: "Non-Negotiables", lines: 62 },
  { heading: "Phased Rollout Plan", lines: 165 },
];

export const V3Slide01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ marginBottom: 32, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 32, fontFamily: "'SF Mono', monospace", color: COLORS.purple.mid }}>📄</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>SPEC.md</div>
              <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>1075 lines · Built via Claude interview · Foundation for everything</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {SECTIONS.map((sec, i) => {
            const p = slideIn(frame, fps, Math.round(i * 3 + 9));
            const barW = (sec.lines / 210) * 100;
            return (
              <div key={sec.heading} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px 16px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                <div style={{ fontSize: 12, color: "#ccc", marginBottom: 8 }}>{sec.heading}</div>
                <div style={{ height: 3, borderRadius: 2, background: "#111", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${barW}%`, background: `linear-gradient(90deg, ${COLORS.purple.dark}, ${COLORS.cyan.mid})` }} />
                </div>
                <div style={{ fontSize: 10, color: "#333", marginTop: 4, fontFamily: "'SF Mono', monospace" }}>{sec.lines} lines</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
