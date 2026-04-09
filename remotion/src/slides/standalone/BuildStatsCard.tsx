import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

const STATS = [
  { number: "184", label: "Commits" },
  { number: "11", label: "Days" },
  { number: "1", label: "Founder" },
];

export const BuildStatsCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header rises in first
  const headerProgress = rise(frame, fps, 0);
  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);
  const headerY = springToTranslateY(headerProgress);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: "-apple-system, 'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle grid background */}
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

      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
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
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        View1 Sort
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {STATS.map((stat, i) => {
          const delayFrames = i * 3; // ~0.1s stagger
          const progress = rise(frame, fps, delayFrames);
          const opacity = interpolate(progress, [0, 1], [0, 1]);
          const y = springToTranslateY(progress);

          return (
            <div key={stat.number} style={{ textAlign: "center" }}>
              {/* Divider (above each stat except first) */}
              {i > 0 && (
                <div
                  style={{
                    width: 320,
                    height: 1,
                    margin: "0 auto 0 auto",
                    background:
                      "linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)",
                    opacity: interpolate(
                      rise(frame, fps, (i - 1) * 3 + 12),
                      [0, 1],
                      [0, 1]
                    ),
                  }}
                />
              )}
              <div
                style={{
                  opacity,
                  transform: `translateY(${y}px)`,
                  paddingTop: i === 0 ? 0 : 24,
                  paddingBottom: 24,
                }}
              >
                {/* Big number with gradient */}
                <div
                  style={{
                    fontSize: 140,
                    fontWeight: 900,
                    letterSpacing: "-4px",
                    lineHeight: 1,
                    background:
                      "linear-gradient(135deg, #fff 0%, #a855f7 50%, #06b6d4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.number}
                </div>
                {/* Label */}
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#555",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Date range */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#333",
          fontSize: 13,
          letterSpacing: "0.12em",
          opacity: interpolate(rise(frame, fps, 12), [0, 1], [0, 1]),
        }}
      >
        Mar 26 → Apr 6, 2026
      </div>
    </AbsoluteFill>
  );
};
