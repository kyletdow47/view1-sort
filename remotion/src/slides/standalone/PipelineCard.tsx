import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { slideIn, springToTranslateX, rise, springToTranslateY, COLORS } from "../../lib/animate";

const STEPS = [
  {
    num: 1,
    name: "Research",
    icon: "🔍",
    desc: "Ask Claude: what should this do?",
    tools: ["claude.ai", "ARCHITECTURE-DECISIONS.md"],
    accent: COLORS.purple.light,
    bg: "#0d0014",
    border: "#2a0050",
  },
  {
    num: 2,
    name: "Document",
    icon: "📄",
    desc: "Write the spec before coding.",
    tools: ["SPEC.md", "APP-ARCHITECTURE.html"],
    accent: "#86efac",
    bg: "#001a08",
    border: "#004018",
  },
  {
    num: 3,
    name: "Design in Pencil",
    icon: "✏️",
    desc: "UI built in Pencil. Frame names match.",
    tools: ["Pencil", "design tokens"],
    accent: COLORS.orange,
    bg: "#150800",
    border: "#3a1a00",
  },
  {
    num: 4,
    name: "Agent Builds",
    icon: "🏗️",
    desc: "design-extractor reads Pencil.",
    tools: ["design-extractor", "ui-builder"],
    accent: COLORS.cyan.light,
    bg: "#00111a",
    border: "#002a40",
  },
  {
    num: 5,
    name: "Review & Ship",
    icon: "✅",
    desc: "Pencil frame next to localhost.",
    tools: ["localhost:3000", "git commit"],
    accent: COLORS.yellow,
    bg: "#111100",
    border: "#2a2800",
  },
];

export const PipelineCard: React.FC = () => {
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
            marginBottom: 36,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>
            Research → Design → Build
          </div>
          <div style={{ fontSize: 13, color: "#444", marginTop: 6 }}>
            The full pipeline for every feature
          </div>
        </div>

        {/* Pipeline steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((step, i) => {
            const delayFrames = Math.round(i * 5 + 6);
            const progress = slideIn(frame, fps, delayFrames);
            const opacity = interpolate(progress, [0, 1], [0, 1]);
            const x = springToTranslateX(progress);

            return (
              <div key={step.num} style={{ opacity, transform: `translateX(${x}px)` }}>
                <div style={{ display: "flex", alignItems: "stretch", gap: 16 }}>
                  {/* Icon box + connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: step.bg,
                        border: `1px solid ${step.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {step.icon}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 16,
                          background: `linear-gradient(to bottom, ${step.accent}44, transparent)`,
                          margin: "4px 0",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      flex: 1,
                      marginBottom: i < STEPS.length - 1 ? 8 : 0,
                      paddingTop: 4,
                      paddingBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: step.accent,
                        }}
                      >
                        {step.name}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
                      {step.desc}
                    </div>
                    {/* Tool chips */}
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {step.tools.map((tool) => (
                        <span
                          key={tool}
                          style={{
                            fontSize: 11,
                            color: "#444",
                            background: "#111",
                            border: "1px solid #1e1e1e",
                            borderRadius: 5,
                            padding: "2px 8px",
                            fontFamily: "'SF Mono', monospace",
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
