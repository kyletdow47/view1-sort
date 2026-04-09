// "you come back with 500 photos" — chaos grid with mixed categories
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { rise, pop, springToTranslateY, springToScale, COLORS } from "../../lib/animate";

const CATEGORIES = [
  { label: "🌅 Sunset", color: "#f97316" },
  { label: "🏙️ Street", color: "#a855f7" },
  { label: "🍕 Food", color: "#22c55e" },
  { label: "🏛️ Architecture", color: "#06b6d4" },
  { label: "👤 People", color: "#ec4899" },
  { label: "🌿 Nature", color: "#84cc16" },
];

// Generate a grid of random "photo" tiles
const GRID_SIZE = 8;
const TILES: Array<{ row: number; col: number; cat: number }> = [];
for (let r = 0; r < 6; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    TILES.push({ row: r, col: c, cat: Math.floor(Math.abs(Math.sin(r * 7 + c * 13)) * CATEGORIES.length) });
  }
}

export const Pitch500Photos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = rise(frame, fps, 0);
  const numP = rise(frame, fps, 4);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: "-apple-system, 'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 80px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${COLORS.grid} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.grid} 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1100 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24, opacity: interpolate(hp, [0,1],[0,1]), transform: `translateY(${springToTranslateY(hp)}px)` }}>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: "-4px", lineHeight: 1, background: "linear-gradient(135deg, #fff 0%, #a855f7 60%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>500</div>
          <div style={{ fontSize: 22, color: "#555", paddingBottom: 8 }}>photos from one trip</div>
        </div>

        {/* Category legend */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", opacity: interpolate(rise(frame, fps, 8), [0,1],[0,1]) }}>
          {CATEGORIES.map(cat => (
            <div key={cat.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: cat.color }} />
              <span style={{ fontSize: 11, color: "#444" }}>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Photo grid — all mixed up */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: 4 }}>
          {TILES.map((tile, i) => {
            const p = pop(frame, fps, Math.round(i * 0.4 + 12));
            const cat = CATEGORIES[tile.cat];
            return (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 4, backgroundColor: `${cat.color}22`, border: `1px solid ${cat.color}33`, opacity: interpolate(p, [0,1],[0,1]), transform: `scale(${springToScale(p)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: cat.color, opacity: 0.6 }}>■</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, fontSize: 13, color: "#333", fontStyle: "italic", opacity: interpolate(rise(frame, fps, 32), [0,1],[0,1]) }}>
          All mixed together. Sunsets next to food next to architecture.
        </div>
      </div>
    </AbsoluteFill>
  );
};
