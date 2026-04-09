// "your clients get their own dashboard where everything lives" — portal mockup
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const GALLERY_ITEMS = Array.from({ length: 6 }, (_, i) => ({
  color: [COLORS.purple.dark, COLORS.cyan.dark, "#1a3a1a", "#3a2a0a", COLORS.purple.dark, COLORS.cyan.dark][i],
}));

export const PitchClientDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const cardP = rise(frame, fps, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Client Experience</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>Their Own Dashboard</div>
          <div style={{ fontSize: 15, color: "#444", marginTop: 8 }}>No more lost links. Everything in one place.</div>
        </div>

        {/* Portal mockup */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, overflow: "hidden", opacity: interpolate(cardP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(cardP)}px)` }}>
          {/* Header bar */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.purple.dark}, ${COLORS.cyan.dark})` }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Sarah's Gallery</div>
                <div style={{ fontSize: 11, color: "#444" }}>Wedding — June 14, 2026</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: COLORS.green.mid, background: `${COLORS.green.mid}15`, border: `1px solid ${COLORS.green.mid}33`, borderRadius: 6, padding: "4px 10px" }}>✓ Paid</div>
          </div>

          {/* Gallery grid */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {GALLERY_ITEMS.map((item, i) => {
                const p = pop(frame, fps, Math.round(i * 3 + 18));
                return (
                  <div key={i} style={{ aspectRatio: "4/3", borderRadius: 8, background: `${item.color}44`, border: `1px solid ${item.color}66`, opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 20, opacity: 0.4 }}>📷</span>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, background: `${COLORS.purple.mid}22`, border: `1px solid ${COLORS.purple.mid}44`, borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.purple.light, fontWeight: 600 }}>⬇ Download All</div>
              <div style={{ flex: 1, background: `${COLORS.cyan.dark}22`, border: `1px solid ${COLORS.cyan.dark}44`, borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 12, color: COLORS.cyan.light, fontWeight: 600 }}>💬 Message</div>
              <div style={{ flex: 1, background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 12, color: "#555", fontWeight: 600 }}>📄 Invoice</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
