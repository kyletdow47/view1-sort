// V4 Slide 08 — "QA 3-Attempt Retry Pattern"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

const ATTEMPTS = [
  { num: 1, result: "Fail", desc: "QA finds issue → creates fix task → back to build agent", color: "#ef4444", bg: "#1a0404" },
  { num: 2, result: "Fail", desc: "Build agent fixes → QA tests again → still broken", color: "#f97316", bg: "#1a0a00" },
  { num: 3, result: "Pass ✓", desc: "Fixed properly → committed → QA marks done", color: COLORS.green.mid, bg: "#001a08" },
];

export const V4Slide08: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800 }}>
        <div style={{ textAlign: "center", marginBottom: 48, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.orange, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Retry Pattern</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>3-Attempt QA Rule</div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 8 }}>Every feature gets up to 3 QA attempts before escalating</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ATTEMPTS.map((attempt, i) => {
            const p = rise(frame, fps, Math.round(i * 7 + 9));
            return (
              <div key={attempt.num} style={{ display: "flex", alignItems: "flex-start", gap: 20, opacity: interpolate(p, [0,1],[0,1]), transform: `translateY(${springToTranslateY(p)}px)` }}>
                {/* Attempt number */}
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: attempt.bg, border: `2px solid ${attempt.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: attempt.color }}>{attempt.num}</span>
                </div>
                {/* Content */}
                <div style={{ flex: 1, background: attempt.bg, border: `1px solid ${attempt.color}22`, borderLeft: `3px solid ${attempt.color}`, borderRadius: "0 10px 10px 0", padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: attempt.color }}>Attempt {attempt.num} — {attempt.result}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#555" }}>{attempt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28, padding: "12px 20px", background: "#0a0a0a", border: "1px dashed #1a1a1a", borderRadius: 10, textAlign: "center", opacity: interpolate(rise(frame, fps, 28), [0,1],[0,1]) }}>
          <span style={{ fontSize: 13, color: "#444" }}>After 3 fails → escalated to human review → fixed manually → re-run</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
