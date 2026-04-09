// "there's no one tool that does everything" — big scattered tools around center
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { pop, springToScale, rise, springToTranslateY, COLORS } from "../../lib/animate";

// Positions clustered around center (40-60% range), tight together
// On 1080×1920 canvas, center is roughly where the speaker's head would be
const TOOLS = [
  { icon: "📅", label: "Calendar",  x: 18, y: 28 },
  { icon: "💰", label: "Invoicing", x: 72, y: 24 },
  { icon: "🖼️", label: "Gallery",   x: 10, y: 52 },
  { icon: "☁️", label: "Storage",   x: 82, y: 50 },
  { icon: "📧", label: "Email",     x: 22, y: 72 },
  { icon: "📋", label: "Booking",   x: 75, y: 74 },
];

export const PitchNoOneTool: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const textP = rise(frame, fps, 8);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      {/* Big centered text — the main message */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) translateY(${springToTranslateY(textP)}px)`,
        opacity: interpolate(textP, [0,1],[0,1]),
        zIndex: 10,
        textAlign: "center",
        width: "80%",
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-2px",
          lineHeight: 1.1,
          textShadow: "0 0 60px rgba(0,0,0,0.9), 0 0 120px rgba(0,0,0,0.7)",
        }}>
          No One Tool
        </div>
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: "-2px",
          lineHeight: 1.1,
          background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "none",
        }}>
          Does Everything
        </div>
        <div style={{
          fontSize: 20,
          color: "#555",
          marginTop: 16,
          textShadow: "0 0 40px rgba(0,0,0,0.9)",
        }}>
          So you end up using six.
        </div>
      </div>

      {/* Big scattered tool cards */}
      {TOOLS.map((tool, i) => {
        const p = pop(frame, fps, Math.round(i * 3 + 6));
        const rotation = (i % 2 === 0 ? -1 : 1) * (4 + i);
        return (
          <div key={tool.label} style={{
            position: "absolute",
            left: `${tool.x}%`,
            top: `${tool.y}%`,
            transform: `translate(-50%, -50%) scale(${springToScale(p)}) rotate(${rotation}deg)`,
            opacity: interpolate(p, [0,1],[0,1]),
            zIndex: 1,
          }}>
            <div style={{
              background: "#0a0a0a",
              border: "2px solid #222",
              borderRadius: 24,
              padding: "24px 32px",
              textAlign: "center",
              minWidth: 140,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}>
              <div style={{ fontSize: 64, marginBottom: 8 }}>{tool.icon}</div>
              <div style={{ fontSize: 18, color: "#777", fontWeight: 600 }}>{tool.label}</div>
              <div style={{
                fontSize: 28,
                color: "#ef4444",
                marginTop: 8,
                opacity: interpolate(rise(frame, fps, Math.round(i * 3 + 18)), [0,1],[0,1]),
              }}>✗</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
