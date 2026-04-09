// V1 Slide 05 — "Bookings + Pipeline"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const STAGES = ["Inquiry", "Proposal", "Booked", "Shooting", "Editing", "Delivered"];

export const V1Slide05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        <div style={{ textAlign: "center", marginBottom: 48, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Business Management</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Bookings + Pipeline</div>
        </div>

        {/* Kanban pipeline */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {STAGES.map((stage, i) => {
            const p = pop(frame, fps, Math.round(i * 4 + 9));
            const isActive = i === 2;
            return (
              <div key={stage} style={{ flex: 1, opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                <div style={{ background: isActive ? "#040f12" : "#0a0a0a", border: `1px solid ${isActive ? "#0a2a32" : "#1a1a1a"}`, borderTop: `2px solid ${isActive ? COLORS.cyan.mid : "#1a1a1a"}`, borderRadius: "0 0 8px 8px", padding: "10px 8px" }}>
                  <div style={{ fontSize: 11, color: isActive ? COLORS.cyan.light : "#444", fontWeight: 600, textAlign: "center", marginBottom: 8 }}>{stage}</div>
                  {isActive && (
                    <div style={{ background: "#071a20", border: "1px solid #0a2a32", borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 10, color: "#a5f3fc" }}>Smith Wedding</div>
                      <div style={{ fontSize: 10, color: "#1e4a57", marginTop: 2 }}>Jun 14</div>
                    </div>
                  )}
                  {!isActive && i < 4 && (
                    <div style={{ height: 28, background: "#0d0d0d", borderRadius: 4, opacity: 0.5 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", opacity: interpolate(rise(frame, fps, 24), [0,1],[0,1]) }}>
          {["Calendar view", "List view", "Pipeline view"].map((v) => (
            <div key={v} style={{ fontSize: 12, color: "#444", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, padding: "6px 14px" }}>{v}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
