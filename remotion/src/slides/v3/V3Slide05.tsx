// V3 Slide 05 — "Asana System" (Architecture perspective)
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, slideIn, springToTranslateY, springToTranslateX, COLORS } from "../../lib/animate";

const TASK_EXAMPLE = {
  title: "Build AI workspace page",
  priority: "P1",
  description: "Create /workspace/ai page. Use existing WorkspaceLayout. Implement: 1) Model selector (Haiku/Sonnet/Opus) 2) Prompt presets panel 3) Usage stats card connected to Supabase. Match Pencil frame #AI-WORKSPACE exactly.",
  subtasks: ["Model selector component", "Prompt presets panel", "Usage stats card"],
  status: "In QA",
};

export const V3Slide05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const taskP = rise(frame, fps, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 880 }}>
        <div style={{ textAlign: "center", marginBottom: 36, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 13, color: COLORS.cyan.mid, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Task System</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>56 Tasks. Agent-Ready.</div>
          <div style={{ fontSize: 14, color: "#444", marginTop: 8 }}>Detailed enough that an agent picks it up without asking a single question.</div>
        </div>

        {/* Task card */}
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "24px", opacity: interpolate(taskP, [0,1],[0,1]), transform: `translateY(${springToTranslateY(taskP)}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily: "'SF Mono', monospace", color: COLORS.purple.light, background: "#1a0d2e", border: "1px solid #3b1f5e", borderRadius: 5, padding: "3px 8px" }}>{TASK_EXAMPLE.priority}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", flex: 1 }}>{TASK_EXAMPLE.title}</div>
            <div style={{ fontSize: 12, color: COLORS.cyan.mid, fontWeight: 600 }}>{TASK_EXAMPLE.status}</div>
          </div>

          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, background: "#050505", border: "1px solid #111", borderRadius: 8, padding: "12px 16px", fontFamily: "'SF Mono', monospace", marginBottom: 16 }}>
            {TASK_EXAMPLE.description}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {TASK_EXAMPLE.subtasks.map((sub, i) => {
              const p = slideIn(frame, fps, Math.round(i * 4 + 18));
              return (
                <div key={sub} style={{ flex: 1, background: "#111", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px 12px", opacity: interpolate(p, [0,1],[0,1]), transform: `translateX(${springToTranslateX(p)}px)` }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${COLORS.cyan.dark}`, marginBottom: 6 }} />
                  <div style={{ fontSize: 11, color: "#555" }}>{sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
