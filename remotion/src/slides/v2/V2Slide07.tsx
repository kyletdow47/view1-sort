// V2 Slide 07 — "The Result"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

const RESULTS = [
  { num: "184", label: "Total commits", color: COLORS.purple.light },
  { num: "11", label: "Days to ship", color: COLORS.cyan.mid },
  { num: "13", label: "Social clips ready", color: COLORS.green.mid },
  { num: "1", label: "Founder", color: COLORS.orange },
];

export const V2Slide07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 860 }}>
        <div style={{ opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)`, marginBottom: 48 }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Phase 1 Complete</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>The Result</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {RESULTS.map((r, i) => {
            const p = rise(frame, fps, Math.round(i * 5 + 9));
            return (
              <div key={r.label} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "28px 20px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateY(${springToTranslateY(p)}px)` }}>
                <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-2px", background: `linear-gradient(135deg, ${r.color}, #fff)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{r.num}</div>
                <div style={{ fontSize: 14, color: "#555", marginTop: 4 }}>{r.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, fontSize: 14, color: "#333", opacity: interpolate(rise(frame, fps, 28), [0,1],[0,1]) }}>
          Built with AI. Shipped for real. Apr 6, 2026.
        </div>
      </div>
    </AbsoluteFill>
  );
};
