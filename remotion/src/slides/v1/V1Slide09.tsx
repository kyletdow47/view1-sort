// V1 Slide 09 — "Command Bar Deep Dive"
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const COMMANDS = [
  { icon: "📁", label: "Go to Projects", shortcut: "P" },
  { icon: "📅", label: "Open Bookings", shortcut: "B" },
  { icon: "👥", label: "View Clients", shortcut: "C" },
  { icon: "📊", label: "Analytics", shortcut: "A" },
  { icon: "🤖", label: "AI Sort", shortcut: "S" },
  { icon: "⚙️", label: "Settings", shortcut: "," },
];

export const V1Slide09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 120px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 700 }}>
        <div style={{ textAlign: "center", marginBottom: 32, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>Everything via ⌘K</div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 8 }}>Navigate the entire app without touching the mouse</div>
        </div>

        {/* Command palette */}
        <div style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 60px rgba(168,85,247,0.1)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#333", fontSize: 16 }}>🔍</span>
            <span style={{ fontSize: 14, color: "#333" }}>Search commands...</span>
          </div>
          <div style={{ padding: 8 }}>
            {COMMANDS.map((cmd, i) => {
              const p = slideIn(frame, fps, Math.round(i * 3 + 9));
              const isFirst = i === 0;
              return (
                <div key={cmd.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: isFirst ? "#1a0d2e" : "transparent", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{cmd.icon}</span>
                  <span style={{ flex: 1, fontSize: 14, color: isFirst ? "#e9d5ff" : "#555" }}>{cmd.label}</span>
                  <span style={{ fontSize: 11, color: isFirst ? COLORS.purple.light : "#222", background: isFirst ? "#3b1f5e" : "#111", border: `1px solid ${isFirst ? "#5b2f8e" : "#1e1e1e"}`, borderRadius: 4, padding: "2px 7px", fontFamily: "'SF Mono', monospace" }}>{cmd.shortcut}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
