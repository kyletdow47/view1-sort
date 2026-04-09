// V4 Slide 07 — "Launch Ready"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const CHECKLIST = [
  { item: "Core product (Phase 1) complete", done: true },
  { item: "QA pass — all user journeys tested", done: true },
  { item: "Waitlist page live", done: true },
  { item: "Pilot users onboarded", done: false },
  { item: "Stripe billing activated", done: false },
  { item: "Public launch", done: false },
];

export const V4Slide07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  const doneCount = CHECKLIST.filter(c => c.done).length;
  const pct = (doneCount / CHECKLIST.length) * 100;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.green.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Status</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>Launch Ready</div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 32, opacity: interpolate(rise(frame, fps, 6), [0,1],[0,1]) }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#444" }}>Launch progress</span>
            <span style={{ fontSize: 12, color: COLORS.green.mid, fontWeight: 700 }}>{doneCount}/{CHECKLIST.length} done</span>
          </div>
          <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.green.mid}, ${COLORS.cyan.mid})`, borderRadius: 3 }} />
          </div>
        </div>

        {/* Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CHECKLIST.map((item, i) => {
            const p = slideIn(frame, fps, Math.round(i * 4 + 12));
            return (
              <div key={item.item} style={{ display: "flex", alignItems: "center", gap: 14, background: "#0a0a0a", border: `1px solid ${item.done ? COLORS.green.mid + "22" : "#1a1a1a"}`, borderRadius: 10, padding: "12px 16px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${item.done ? COLORS.green.mid : "#222"}`, background: item.done ? COLORS.green.mid + "22" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.done && <span style={{ fontSize: 12, color: COLORS.green.mid }}>✓</span>}
                </div>
                <span style={{ fontSize: 14, color: item.done ? "#ccc" : "#444" }}>{item.item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
