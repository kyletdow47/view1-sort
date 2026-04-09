import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

const STEPS = [
  {
    num: "01",
    name: "Read STATE.md",
    emoji: "📋",
    desc: "What's broken. What's next.",
    bg: "#1a0d2e",
    border: "#3b1f5e",
    accent: COLORS.purple.light,
    line: "rgba(192,132,252,0.3)",
  },
  {
    num: "02",
    name: "Pick One Task",
    emoji: "🎯",
    desc: "One thing. One commit.",
    bg: "#040f12",
    border: "#0a2a32",
    accent: COLORS.cyan.light,
    line: "rgba(103,232,249,0.3)",
  },
  {
    num: "03",
    name: "Agent Builds",
    emoji: "🤖",
    desc: "Reads codebase. Writes real files.",
    bg: "#0a0f00",
    border: "#1a2400",
    accent: "#a3e635",
    line: "rgba(163,230,53,0.3)",
  },
  {
    num: "04",
    name: "You Review",
    emoji: "👁️",
    desc: "Does it work? Commit if yes.",
    bg: "#150500",
    border: "#2a0f00",
    accent: COLORS.orange,
    line: "rgba(251,146,60,0.3)",
  },
];

export const VibeLoopCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
        padding: "60px 120px",
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

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 800 }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 40,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            The Vibe Coding Loop
          </div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 6 }}>
            How 184 commits happened
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((step, i) => {
            const delayFrames = Math.round(i * 6 + 6);
            const progress = rise(frame, fps, delayFrames);
            const opacity = interpolate(progress, [0, 1], [0, 1]);
            const y = springToTranslateY(progress);

            return (
              <div key={step.num} style={{ opacity, transform: `translateY(${y}px)` }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 16,
                  }}
                >
                  {/* Left: number circle + connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: step.bg,
                        border: `1px solid ${step.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {step.emoji}
                    </div>
                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          minHeight: 24,
                          background: `linear-gradient(to bottom, ${step.line}, transparent)`,
                          margin: "4px 0",
                        }}
                      />
                    )}
                  </div>

                  {/* Right: content */}
                  <div
                    style={{
                      flex: 1,
                      background: step.bg,
                      border: `1px solid ${step.border}`,
                      borderLeft: `3px solid ${step.accent}`,
                      borderRadius: "0 10px 10px 0",
                      padding: "14px 18px",
                      marginBottom: i < STEPS.length - 1 ? 8 : 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: step.accent, fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>
                        {step.num}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                        {step.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loop back */}
        <div
          style={{
            marginTop: 20,
            padding: "12px 20px",
            background: "#0a0a0a",
            border: "1px dashed #222",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: interpolate(rise(frame, fps, 30), [0, 1], [0, 1]),
            transform: `translateY(${springToTranslateY(rise(frame, fps, 30))}px)`,
          }}
        >
          <span style={{ fontSize: 18 }}>🔁</span>
          <span style={{ fontSize: 13, color: "#555" }}>
            Back to step 01.{" "}
            <strong style={{ color: "#777" }}>Repeat until it ships.</strong>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
