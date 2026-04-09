// "customize the prompts so it sorts the way you think" — typewriter prompt
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const PROMPT_TEXT = "Sort by golden hour, architecture, people";
const RESULTS = [
  { label: "🌅 Golden Hour", count: 47, color: "#f97316" },
  { label: "🏛️ Architecture", count: 83, color: "#06b6d4" },
  { label: "👤 People", count: 62, color: "#a855f7" },
  { label: "📷 Other", count: 308, color: "#444" },
];

export const PitchCustomizePrompts: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  // Typewriter: reveal characters over frames 20-100
  const charCount = Math.floor(interpolate(frame, [20, 100], [0, PROMPT_TEXT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const visibleText = PROMPT_TEXT.slice(0, charCount);
  const showCursor = frame % 30 < 20;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 860 }}>
        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.purple.light, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Your Rules</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>Sort the Way You Think</div>
        </div>

        {/* Prompt input */}
        <div style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: 14, padding: "20px 24px", marginBottom: 32, opacity: interpolate(rise(frame, fps, 6), [0,1],[0,1]) }}>
          <div style={{ fontSize: 11, color: "#333", marginBottom: 10, fontFamily: "'SF Mono', monospace" }}>prompt</div>
          <div style={{ fontSize: 18, color: "#ccc", fontFamily: "'SF Mono', monospace", minHeight: 28 }}>
            {visibleText}
            {showCursor && <span style={{ color: COLORS.purple.light }}>|</span>}
          </div>
        </div>

        {/* Results */}
        <div style={{ display: "flex", gap: 12 }}>
          {RESULTS.map((r, i) => {
            const p = pop(frame, fps, Math.round(i * 5 + 34));
            return (
              <div key={r.label} style={{ flex: 1, background: "#0a0a0a", border: `1px solid ${r.color}22`, borderTop: `2px solid ${r.color}`, borderRadius: "0 0 10px 10px", padding: "16px 14px", textAlign: "center", opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: r.color }}>{r.count}</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{r.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
