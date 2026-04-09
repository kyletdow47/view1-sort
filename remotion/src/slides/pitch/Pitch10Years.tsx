// "photographer for ten years" — Big 10 + timeline
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

const MILESTONES = [
  { year: "2016", label: "First shoot" },
  { year: "2018", label: "Full-time" },
  { year: "2021", label: "Studio" },
  { year: "2024", label: "10,000+ photos" },
  { year: "2026", label: "View1 Sort" },
];

export const Pitch10Years: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const numP = rise(frame, fps, 6);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)`, marginBottom: 8 }}>
          <span style={{ fontSize: 48 }}>📷</span>
        </div>
        <div style={{ opacity: interpolate(numP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(numP)}px)`, marginBottom: 16 }}>
          <div style={{ fontSize: 160, fontWeight: 900, letterSpacing: "-6px", lineHeight: 1, background: "linear-gradient(135deg, #fff 0%, #a855f7 50%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>10</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8 }}>Years Behind the Lens</div>
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 40, justifyContent: "center" }}>
          {MILESTONES.map((m, i) => {
            const p = rise(frame, fps, Math.round(i * 5 + 15));
            const isLast = i === MILESTONES.length - 1;
            return (
              <React.Fragment key={m.year}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: interpolate(p, [0,1],[0,1]), transform: `translateY(${springToTranslateY(p)}px)` }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: isLast ? COLORS.cyan.mid : COLORS.purple.dark, boxShadow: isLast ? `0 0 12px ${COLORS.cyan.mid}` : "none" }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: isLast ? COLORS.cyan.mid : "#444", fontFamily: "'SF Mono', monospace" }}>{m.year}</div>
                  <div style={{ fontSize: 10, color: "#333", maxWidth: 80, textAlign: "center" }}>{m.label}</div>
                </div>
                {i < MILESTONES.length - 1 && (
                  <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, ${COLORS.purple.dark}44, ${COLORS.purple.dark}22)`, marginBottom: 28 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
