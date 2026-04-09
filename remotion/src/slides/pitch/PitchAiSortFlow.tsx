// "upload everything... sorts it all by scene automatically" — 3-step flow
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const STEPS = [
  { icon: "📤", title: "Upload", desc: "Drop all your photos", color: COLORS.purple.light, bg: "#1a0d2e", border: "#3b1f5e" },
  { icon: "✨", title: "AI Sorts", desc: "By scene, automatically", color: COLORS.cyan.light, bg: "#040f12", border: "#0a2a32" },
  { icon: "📂", title: "Organized", desc: "Clean category buckets", color: COLORS.green.mid, bg: "#001a08", border: "#004018" },
];

const CATEGORIES = ["🌅 Sunsets", "🏙️ City", "🍕 Food", "🏛️ Architecture"];

export const PitchAiSortFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 80px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1000 }}>
        <div style={{ textAlign: "center", marginBottom: 48, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>The New Way</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>Upload → AI Sorts → Done</div>
        </div>

        {/* 3-step pipeline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
          {STEPS.map((step, i) => {
            const p = pop(frame, fps, Math.round(i * 8 + 9));
            return (
              <React.Fragment key={step.title}>
                <div style={{ textAlign: "center", opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})` }}>
                  <div style={{ width: 140, height: 140, borderRadius: 20, background: step.bg, border: `2px solid ${step.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, margin: "0 auto" }}>
                    <div style={{ fontSize: 40 }}>{step.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: step.color }}>{step.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 10, maxWidth: 140 }}>{step.desc}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 24, opacity: interpolate(rise(frame, fps, Math.round(i * 8 + 15)), [0,1],[0,1]) }}>
                    <div style={{ width: 60, height: 2, background: `linear-gradient(90deg, ${step.color}66, ${STEPS[i+1].color}66)` }} />
                    <div style={{ fontSize: 14, color: "#333", margin: "0 4px" }}>→</div>
                    <div style={{ width: 60, height: 2, background: `linear-gradient(90deg, ${STEPS[i+1].color}33, ${STEPS[i+1].color}66)` }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Sorted output preview */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 36 }}>
          {CATEGORIES.map((cat, i) => {
            const p = rise(frame, fps, Math.round(i * 4 + 30));
            return (
              <div key={cat} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px 16px", fontSize: 12, color: "#666", opacity: interpolate(p, [0,1],[0,1]), transform: `translateY(${springToTranslateY(p)}px)` }}>{cat}</div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
