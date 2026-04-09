import { interpolate, spring } from "remotion";

// Rise: opacity 0→1, translateY 20→0. Maps to original CSS rise keyframe.
export function rise(frame: number, fps: number, delay = 0) {
  return spring({ frame, fps, delay, config: { damping: 14, stiffness: 180 } });
}

// Pop: scale 0.95→1, opacity 0→1. Bouncy entry.
export function pop(frame: number, fps: number, delay = 0) {
  return spring({ frame, fps, delay, config: { damping: 20, stiffness: 300 } });
}

// SlideIn: translateX -16→0, opacity 0→1.
export function slideIn(frame: number, fps: number, delay = 0) {
  return spring({ frame, fps, delay, config: { damping: 15, stiffness: 150 } });
}

// Fade: pure opacity 0→1 over N frames.
export function fade(frame: number, durationFrames: number) {
  return interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// Overlay fade: fade in over fadeInF frames, hold, fade out over fadeOutF frames at end.
export function overlayFade(
  frame: number,
  durationFrames: number,
  fadeInF = 15,
  fadeOutF = 15
) {
  if (frame < fadeInF) {
    return interpolate(frame, [0, fadeInF], [0, 1], { extrapolateRight: "clamp" });
  }
  if (frame > durationFrames - fadeOutF) {
    return interpolate(
      frame,
      [durationFrames - fadeOutF, durationFrames],
      [1, 0],
      { extrapolateRight: "clamp" }
    );
  }
  return 1;
}

// Convert spring 0→1 to a translateY value (positive = starts below).
export function springToTranslateY(
  progress: number,
  startY = 20,
  endY = 0
): number {
  return interpolate(progress, [0, 1], [startY, endY]);
}

// Convert spring 0→1 to a translateX value (negative = starts left).
export function springToTranslateX(
  progress: number,
  startX = -16,
  endX = 0
): number {
  return interpolate(progress, [0, 1], [startX, endX]);
}

// Convert spring 0→1 to scale (starts small).
export function springToScale(
  progress: number,
  startScale = 0.95,
  endScale = 1
): number {
  return interpolate(progress, [0, 1], [startScale, endScale]);
}

// Bar height animation using spring — used in CommitChartCard.
export function barGrow(frame: number, fps: number, delay = 0) {
  return spring({ frame, fps, delay, config: { damping: 14, stiffness: 200 } });
}

// Color palette constants.
export const COLORS = {
  bg: "#000",
  grid: "rgba(168,85,247,0.04)",
  purple: {
    light: "#c084fc",
    mid: "#a855f7",
    dark: "#7c3aed",
  },
  cyan: {
    light: "#67e8f9",
    mid: "#06b6d4",
    dark: "#0891b2",
  },
  green: {
    light: "#86efac",
    mid: "#22c55e",
  },
  orange: "#fb923c",
  yellow: "#fde68a",
  gray: {
    100: "#e5e5e5",
    400: "#aaaaaa",
    600: "#555555",
    700: "#333333",
    800: "#1a1a1a",
    900: "#0a0a0a",
  },
} as const;
