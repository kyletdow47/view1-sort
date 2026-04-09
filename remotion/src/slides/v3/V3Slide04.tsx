// V3 Slide 04 — "Feature Roadmap / Competitive Parity"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const COMPETITORS = [
  { name: "Pic-Time", features: [true, true, false, false, false] },
  { name: "Sprout Studio", features: [true, true, true, false, false] },
  { name: "HoneyBook", features: [false, false, true, true, false] },
  { name: "View1 Sort ✦", features: [true, true, true, true, true], highlight: true },
];

const FEATURE_COLS = ["AI Sort", "Gallery", "Bookings", "Analytics", "Content AI"];

export const V3Slide04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Market Research</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>Feature Parity Matrix</div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 8 }}>Take every competitor's features + build on top with AI intelligence</div>
        </div>

        {/* Table header */}
        <div style={{ display: "flex", gap: 0, marginBottom: 8, paddingLeft: 160 }}>
          {FEATURE_COLS.map((col) => (
            <div key={col} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#444", fontWeight: 600, letterSpacing: "0.08em" }}>{col}</div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {COMPETITORS.map((comp, i) => {
            const p = slideIn(frame, fps, Math.round(i * 5 + 9));
            return (
              <div key={comp.name} style={{ display: "flex", alignItems: "center", background: comp.highlight ? "#0d1a10" : "#0a0a0a", border: `1px solid ${comp.highlight ? "#0a3015" : "#1a1a1a"}`, borderLeft: comp.highlight ? `3px solid ${COLORS.green.mid}` : "1px solid #1a1a1a", borderRadius: comp.highlight ? "0 10px 10px 0" : 10, padding: "12px 16px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                <div style={{ width: 144, fontSize: 14, fontWeight: comp.highlight ? 700 : 400, color: comp.highlight ? COLORS.green.mid : "#555" }}>{comp.name}</div>
                {comp.features.map((has, j) => (
                  <div key={j} style={{ flex: 1, textAlign: "center", fontSize: 16 }}>{has ? (comp.highlight ? "✦" : "✓") : "—"}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
