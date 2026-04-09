// V4 Slide 09 — "Bible Live Metrics"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const METRICS = [
  { label: "Users in Supabase", value: "1", note: "just me", color: COLORS.purple.light },
  { label: "Media files", value: "0", note: "day zero", color: COLORS.cyan.mid },
  { label: "Galleries created", value: "0", note: "updating live", color: COLORS.green.mid },
  { label: "Active subscribers", value: "0", note: "Stripe live", color: COLORS.orange },
];

export const V4Slide09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const pulse = interpolate(
    Math.sin((frame / 30) * Math.PI * 2),
    [-1, 1],
    [0.6, 1]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          {/* Live indicator */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: COLORS.green.mid, opacity: pulse, boxShadow: `0 0 8px ${COLORS.green.mid}` }} />
            <span style={{ fontSize: 12, color: COLORS.green.mid, letterSpacing: "0.15em", fontWeight: 600 }}>LIVE</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Bible Live Metrics</div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 8 }}>Real numbers. Pulled from Supabase + Stripe. Not fake demos.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {METRICS.map((m, i) => {
            const p = pop(frame, fps, Math.round(i * 4 + 9));
            return (
              <div key={m.label} style={{ background: "#0a0a0a", border: `1px solid ${m.color}22`, borderRadius: 14, padding: "24px 20px", opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                <div style={{ fontSize: 11, color: "#444", marginBottom: 8, letterSpacing: "0.08em" }}>{m.label}</div>
                <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-2px", color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 12, color: "#333", marginTop: 4, fontStyle: "italic" }}>{m.note}</div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "#0a0a0a", border: "1px dashed #1a1a1a", borderRadius: 10, padding: "14px 20px", opacity: interpolate(rise(frame, fps, 24), [0,1],[0,1]), textAlign: "center" }}>
          <span style={{ fontSize: 14, color: "#444" }}>
            Zero to one.{" "}
            <span style={{ color: "#666" }}>Building in public. These numbers go up from here.</span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
