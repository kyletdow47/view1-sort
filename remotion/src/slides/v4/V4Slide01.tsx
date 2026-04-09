// V4 Slide 01 — "Build Loop (two-agent diagram)"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

export const V4Slide01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const buildP = rise(frame, fps, 6);
  const arrowP = rise(frame, fps, 12);
  const qaP = rise(frame, fps, 18);
  const loopP = rise(frame, fps, 28);

  const agentBox = (label: string, role: string, color: string, progress: number) => (
    <div style={{ opacity: interpolate(progress, [0,1],[0,1]), transform: `translateY(${springToTranslateY(progress)}px)`, background: "#0a0a0a", border: `2px solid ${color}44`, borderRadius: 14, padding: "20px 28px", textAlign: "center", minWidth: 200 }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: "#444", marginTop: 6, lineHeight: 1.5 }}>{role}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 900 }}>
        <div style={{ opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)`, marginBottom: 48 }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>The System</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>Two-Agent Build Loop</div>
        </div>

        {/* Two agents + arrows */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
          {agentBox("Build Agent", "Pulls from Asana\nBuilds one feature\nCommits + moves to QA", COLORS.purple.light, buildP)}

          {/* Arrow right */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: interpolate(arrowP, [0,1],[0,1]) }}>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "'SF Mono', monospace" }}>→ done</div>
            <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${COLORS.purple.light}, ${COLORS.cyan.mid})` }} />
            <div style={{ fontSize: 11, color: "#444", fontFamily: "'SF Mono', monospace" }}>failed ←</div>
          </div>

          {agentBox("QA Agent", "Tests visually\nChecks if working\nCreates fix task if not", COLORS.cyan.light, qaP)}
        </div>

        {/* Loop indicator */}
        <div style={{ marginTop: 40, opacity: interpolate(loopP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(loopP)}px)` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#0a0a0a", border: "1px dashed #1a1a1a", borderRadius: 30, padding: "10px 24px" }}>
            <span style={{ fontSize: 16 }}>🔁</span>
            <span style={{ fontSize: 13, color: "#555" }}>3-attempt retry before escalating. Tracked all through Phase 1.</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
