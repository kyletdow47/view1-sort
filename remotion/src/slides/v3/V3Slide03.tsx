// V3 Slide 03 — "App Architecture"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const PAGES = [
  { name: "Dashboard", features: ["Quick stats", "Upcoming shoots", "Activity feed"], color: COLORS.purple.mid },
  { name: "AI Sort", features: ["Upload", "Sort by prompt", "Gallery creation"], color: COLORS.cyan.mid },
  { name: "Bookings", features: ["Calendar", "Pipeline", "Client calendar"], color: COLORS.green.mid },
  { name: "Clients", features: ["Kanban", "Revenue", "Portal"], color: COLORS.orange },
  { name: "Analytics", features: ["Revenue", "Gallery perf", "AI insights"], color: COLORS.yellow },
  { name: "Content Hub", features: ["Calendar", "Multi-platform", "AI plan"], color: COLORS.purple.light },
];

export const V3Slide03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 80px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1100 }}>
        <div style={{ textAlign: "center", marginBottom: 36, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Visual Reference</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>App Architecture</div>
          <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>Every page broken down — features, status, done vs missing</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {PAGES.map((page, i) => {
            const p = pop(frame, fps, Math.round(i * 4 + 9));
            return (
              <div key={page.name} style={{ background: "#0a0a0a", border: `1px solid ${page.color}22`, borderTop: `2px solid ${page.color}`, borderRadius: "0 0 10px 10px", padding: "14px 16px", opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: page.color, marginBottom: 10 }}>{page.name}</div>
                {page.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: page.color, opacity: 0.5 }} />
                    <span style={{ fontSize: 11, color: "#444" }}>{f}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
