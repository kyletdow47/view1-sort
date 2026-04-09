import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { barGrow, rise, springToTranslateY, COLORS } from "../../lib/animate";

// 12 days of commit data: Mar 26 → Apr 6
const COMMITS = [5, 38, 2, 7, 21, 0, 13, 46, 6, 17, 25, 4];
const DATES = ["26", "27", "28", "29", "30", "31", "1", "2", "3", "4", "5", "6"];
const DATE_LABELS = ["Mar 26", "", "", "", "", "", "Apr 1", "", "", "", "", "Apr 6"];
const MAX_COMMITS = 46;

function getBarColor(commits: number, index: number) {
  if (index === 1) {
    // March 27 — purple
    return "linear-gradient(to top, #7c3aed, #a855f7, #c084fc)";
  }
  if (index === 7) {
    // April 2 — cyan
    return "linear-gradient(to top, #0e7490, #06b6d4, #67e8f9)";
  }
  return "#1a1a1a";
}

function getBarGlow(index: number) {
  if (index === 1) return "0 0 20px rgba(168,85,247,0.4)";
  if (index === 7) return "0 0 28px rgba(6,182,212,0.5)";
  return "none";
}

function getLabelColor(index: number) {
  if (index === 1) return "#e9d5ff";
  if (index === 7) return "#a5f3fc";
  return "#444";
}

export const CommitChartCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerProgress = rise(frame, fps, 0);
  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);
  const headerY = springToTranslateY(headerProgress);

  const BAR_HEIGHT = 320;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: "-apple-system, 'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 80px",
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.grid} 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          color: "#444",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        View1 Sort
      </div>

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 48,
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.5px",
          }}
        >
          184 Commits in 11 Days
        </div>
        <div style={{ fontSize: 15, color: "#555", marginTop: 6 }}>
          March 26 — April 6, 2026
        </div>
      </div>

      {/* Bar chart */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height: BAR_HEIGHT,
          position: "relative",
          zIndex: 1,
        }}
      >
        {COMMITS.map((commits, i) => {
          // Each bar staggered by 0.05s (~1.5 frames)
          const delayFrames = Math.round(i * 1.5 + 6);
          const growProgress = barGrow(frame, fps, delayFrames);
          const barH = interpolate(growProgress, [0, 1], [0, (commits / MAX_COMMITS) * BAR_HEIGHT]);
          const barOpacity = interpolate(growProgress, [0, 0.1], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Commit count above bar */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: getLabelColor(i),
                  opacity: commits > 0 ? barOpacity : 0,
                  minHeight: 16,
                }}
              >
                {commits > 0 ? commits : ""}
              </div>

              {/* Bar */}
              <div
                style={{
                  width: 72,
                  height: barH,
                  background: getBarColor(commits, i),
                  boxShadow: getBarGlow(i),
                  borderRadius: "4px 4px 0 0",
                  opacity: barOpacity,
                }}
              />

              {/* Date label */}
              <div style={{ fontSize: 11, color: "#333", marginTop: 4, textAlign: "center" }}>
                {DATE_LABELS[i] || ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 32,
          opacity: interpolate(rise(frame, fps, 18), [0, 1], [0, 1]),
        }}
      >
        {[
          { color: "#2a2a2a", label: "Regular day" },
          { color: "#a855f7", label: "Mar 27 — 38 commits" },
          { color: "#06b6d4", label: "Apr 2 — 46 commits" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: item.color,
              }}
            />
            <span style={{ fontSize: 12, color: "#555" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
