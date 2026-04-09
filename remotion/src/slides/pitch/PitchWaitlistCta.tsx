// "comment 'waitlist' and I'll send you the link" — CTA card
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

export const PitchWaitlistCta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const wordP = pop(frame, fps, 9);
  const subP = rise(frame, fps, 18);
  const commentP = rise(frame, fps, 28);
  const logoP = rise(frame, fps, 36);

  // Pulse on the WAITLIST text
  const pulse = interpolate(Math.sin((frame / 20) * Math.PI), [-1, 1], [0.95, 1.05]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      {/* Glow */}
      <div style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(6,182,212,0.05) 40%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Intro */}
        <div style={{ opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)`, marginBottom: 24 }}>
          <div style={{ fontSize: 20, color: "#555" }}>Want early access?</div>
        </div>

        {/* BIG WAITLIST */}
        <div style={{ opacity: interpolate(wordP, [0,1],[0,1]), transform: `scale(${springToScale(wordP, 0.6, 1) * pulse})`, marginBottom: 24 }}>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: "-4px", background: "linear-gradient(135deg, #fff 0%, #a855f7 40%, #06b6d4 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>WAITLIST</div>
        </div>

        {/* Subtitle */}
        <div style={{ opacity: interpolate(subP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(subP)}px)`, marginBottom: 36 }}>
          <div style={{ fontSize: 16, color: "#555" }}>Limited early access · Free for pilot users</div>
        </div>

        {/* Comment instruction */}
        <div style={{ opacity: interpolate(commentP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(commentP)}px)`, marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 30, padding: "14px 28px" }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <span style={{ fontSize: 16, color: "#ccc" }}>Comment</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.purple.light, fontFamily: "'SF Mono', monospace" }}>"waitlist"</span>
          </div>
        </div>

        {/* Logo */}
        <div style={{ opacity: interpolate(logoP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(logoP)}px)` }}>
          <div style={{ fontSize: 14, color: "#333", letterSpacing: "0.15em", fontWeight: 600 }}>VIEW1 SORT</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
