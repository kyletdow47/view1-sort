// "looking for photographers to try it for free" — pilot user benefits
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const BENEFITS = [
  { icon: "🎁", title: "100% Free Access", desc: "Full platform, no credit card, no trial limit" },
  { icon: "🏗️", title: "Shape the Product", desc: "Your feedback directly influences what gets built next" },
  { icon: "🚀", title: "Early Adopter Pricing", desc: "Lock in the lowest price forever when we launch" },
  { icon: "🤝", title: "Direct Access to the Founder", desc: "Slack channel, priority support, 1-on-1 onboarding" },
  { icon: "⭐", title: "Founding Member Badge", desc: "Public credit as a founding user of View1 Sort" },
];

export const PitchPilotBenefits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const subP = rise(frame, fps, 8);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "80px 48px 0 48px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      {/* Glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 16, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 22, color: COLORS.purple.light, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Limited Spots</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", letterSpacing: "-1px", lineHeight: 1.15 }}>Become a Pilot User</div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 40, opacity: interpolate(subP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(subP)}px)` }}>
          <div style={{ fontSize: 20, color: "#555" }}>Here's what you get:</div>
        </div>

        {/* Benefits list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {BENEFITS.map((benefit, i) => {
            const p = slideIn(frame, fps, Math.round(i * 7 + 16));
            return (
              <div key={benefit.title} style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "20px 24px",
                background: "#0a0a0a",
                border: `2px solid ${COLORS.purple.dark}22`,
                borderLeft: `4px solid ${COLORS.purple.mid}`,
                borderRadius: "0 16px 16px 0",
                opacity: interpolate(p, [0,1],[0,1]),
                transform: `translateX(${springToTranslateX(p, -24)}px)`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `${COLORS.purple.dark}22`,
                  border: `1px solid ${COLORS.purple.dark}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}>{benefit.icon}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{benefit.title}</div>
                  <div style={{ fontSize: 16, color: "#555", lineHeight: 1.4 }}>{benefit.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
