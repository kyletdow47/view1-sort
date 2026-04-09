import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const PAGES = [
  "AI Sort Upload",
  "AI Workspace",
  "Projects",
  "Bookings",
  "Clients",
  "Contracts",
  "Analytics",
  "Content Hub",
  "Public Booking",
  "Client Portal",
  "AI Preferences",
  "Calendar / List",
];

export const April2Card: React.FC = () => {
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
            color: COLORS.cyan.mid,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
          }}
        >
          April 2 — The Peak
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
              background: `linear-gradient(135deg, ${COLORS.cyan.light}, ${COLORS.cyan.mid}, ${COLORS.cyan.dark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            46
          </div>
          <div style={{ fontSize: 20, color: "#777", fontWeight: 400, paddingBottom: 12 }}>
            commits · 16 pages rebuilt
          </div>
        </div>

        {/* Page grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {PAGES.map((page, i) => {
            const delayFrames = Math.round(i * 3 + 15);
            const progress = pop(frame, fps, delayFrames);
            const opacity = interpolate(progress, [0, 1], [0, 1]);
            const scale = springToScale(progress);

            return (
              <div
                key={page}
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  background: "#040f12",
                  border: "1px solid #0a2a32",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: COLORS.cyan.dark,
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 13, color: "#a5f3fc", fontWeight: 500 }}>
                  {page}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            padding: "12px 16px",
            background: "#040f12",
            border: "1px solid #0a2a32",
            borderRadius: 10,
            opacity: interpolate(rise(frame, fps, 52), [0, 1], [0, 1]),
          }}
        >
          <div style={{ fontSize: 13, color: "#444" }}>All shipped in one day</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.cyan.mid,
            }}
          >
            24 hrs
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
