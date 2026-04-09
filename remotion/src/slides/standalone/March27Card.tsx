import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const FEATURES = [
  { text: "Supabase auth, login, signup", tag: "Auth" },
  { text: "Stripe Connect onboarding", tag: "Payments" },
  { text: "6 email templates", tag: "Resend" },
  { text: "Gallery + magic links", tag: "Client portal" },
  { text: "Mobile responsive dashboard", tag: "UI" },
  { text: "Batch rename + ZIP export", tag: "Core" },
  { text: "Loading states + error handling", tag: "UX" },
];

export const March27Card: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerProgress = rise(frame, fps, 0);
  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1]);
  const headerY = springToTranslateY(headerProgress);

  const numProgress = rise(frame, fps, 3);
  const numOpacity = interpolate(numProgress, [0, 1], [0, 1]);
  const numY = springToTranslateY(numProgress);

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

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        {/* Day label */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.purple.light,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          March 27 — Day 2
        </div>

        {/* Big number */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 32,
            opacity: numOpacity,
            transform: `translateY(${numY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              letterSpacing: "-3px",
              lineHeight: 1,
              background: `linear-gradient(135deg, ${COLORS.purple.light}, ${COLORS.purple.mid}, ${COLORS.purple.dark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            38
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#777",
              fontWeight: 400,
              paddingBottom: 12,
            }}
          >
            commits in 24 hours
          </div>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEATURES.map((feature, i) => {
            const delayFrames = Math.round(i * 4 + 15);
            const progress = slideIn(frame, fps, delayFrames);
            const opacity = interpolate(progress, [0, 1], [0, 1]);
            const x = springToTranslateX(progress);

            return (
              <div
                key={feature.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity,
                  transform: `translateX(${x}px)`,
                  background: "#0a0a0a",
                  border: "1px solid #1a1a1a",
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: COLORS.purple.dark,
                    flexShrink: 0,
                  }}
                />
                {/* Text */}
                <div style={{ flex: 1, fontSize: 15, color: "#ccc" }}>{feature.text}</div>
                {/* Tag */}
                <div
                  style={{
                    fontSize: 11,
                    color: "#444",
                    background: "#111",
                    border: "1px solid #222",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontFamily: "'SF Mono', monospace",
                    flexShrink: 0,
                  }}
                >
                  {feature.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "#333",
            fontStyle: "italic",
            textAlign: "center",
            opacity: interpolate(rise(frame, fps, 45), [0, 1], [0, 1]),
          }}
        >
          I had never built any of this before.
        </div>
      </div>
    </AbsoluteFill>
  );
};
