// "hey can you send those again, I can't find them" — chat bubble pain, typewriter
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, springToTranslateY, COLORS } from "../../lib/animate";

// Each message types out character by character
// typeStart = frame when typing begins, typeSpeed = frames per character
const MESSAGES: Array<{
  from: string;
  text: string;
  typeStart: number;
  typeSpeed: number;
  mono?: boolean;
  highlight?: boolean;
}> = [
  { from: "you", text: "Here's the gallery link! 📸", typeStart: 15, typeSpeed: 1.5 },
  { from: "you", text: "wetransfer.com/dl/abc123...", typeStart: 60, typeSpeed: 1.2, mono: true },
  { from: "client", text: "Thanks! 🙏", typeStart: 110, typeSpeed: 2 },
  { from: "client", text: "hey can you send those again? I can't find the link 😅", typeStart: 145, typeSpeed: 1.2, highlight: true },
  { from: "client", text: "sorry lol", typeStart: 210, typeSpeed: 2.5 },
];

function TypedMessage({ text, frame, typeStart, typeSpeed }: { text: string; frame: number; typeStart: number; typeSpeed: number }) {
  if (frame < typeStart) return null;
  const elapsed = frame - typeStart;
  const charCount = Math.min(text.length, Math.floor(elapsed / typeSpeed));
  const showCursor = charCount < text.length && elapsed % 16 < 10;
  return (
    <span>
      {text.slice(0, charCount)}
      {showCursor && <span style={{ color: "#555" }}>|</span>}
    </span>
  );
}

export const PitchWetransferPain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);

  const et1 = rise(frame, fps, 195);
  const et2 = rise(frame, fps, 210);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", padding: "80px 48px 0 48px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Header — pushed to top */}
        <div style={{ textAlign: "center", marginBottom: 50, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 22, color: "#ef4444", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Sound Familiar?</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>The WeTransfer Problem</div>
        </div>

        {/* Chat bubbles — typewriter effect */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 50, padding: "0 20px" }}>
          {MESSAGES.map((msg, i) => {
            const isYou = msg.from === "you";
            // Bubble appears when typing starts
            const bubbleOpacity = interpolate(frame, [msg.typeStart - 5, msg.typeStart], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const bubbleX = interpolate(frame, [msg.typeStart - 5, msg.typeStart + 8], [isYou ? 30 : -30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            if (frame < msg.typeStart - 5) return null;

            return (
              <div key={i} style={{ display: "flex", justifyContent: isYou ? "flex-end" : "flex-start", opacity: bubbleOpacity, transform: `translateX(${bubbleX}px)` }}>
                <div style={{
                  maxWidth: "85%",
                  background: msg.highlight ? "#1a0404" : "#0d0d0d",
                  border: `2px solid ${msg.highlight ? "#ef444466" : isYou ? COLORS.cyan.dark + "44" : "#1e1e1e"}`,
                  borderRadius: isYou ? "24px 24px 6px 24px" : "24px 24px 24px 6px",
                  padding: "18px 24px",
                  boxShadow: msg.highlight ? "0 4px 30px rgba(239,68,68,0.15)" : "none",
                }}>
                  <div style={{ fontSize: 16, color: isYou ? COLORS.cyan.light : "#666", marginBottom: 6, fontWeight: 700, letterSpacing: "0.05em" }}>{isYou ? "You" : "Client"}</div>
                  <div style={{
                    fontSize: msg.highlight ? 26 : 24,
                    color: msg.highlight ? "#ef4444" : "#ccc",
                    fontFamily: msg.mono ? "'SF Mono', monospace" : "inherit",
                    fontWeight: msg.highlight ? 700 : 400,
                    wordBreak: "break-all",
                    lineHeight: 1.3,
                    minHeight: 32,
                  }}>
                    <TypedMessage text={msg.text} frame={frame} typeStart={msg.typeStart} typeSpeed={msg.typeSpeed} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* "Every time. Every time." */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: "#ef4444", opacity: interpolate(et1, [0,1],[0,1]), marginRight: 20 }}>Every time.</span>
          <span style={{ fontSize: 52, fontWeight: 900, color: "#ef444466", opacity: interpolate(et2, [0,1],[0,1]) }}>Every time.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
