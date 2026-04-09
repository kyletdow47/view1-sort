import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Video } from "@remotion/media";
import { SLIDE_REGISTRY } from "./slideRegistry";

export interface OverlaySlide {
  slideId: string;
  startFrame: number;
  durationFrames: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface VideoSegment {
  startSec: number;
  endSec: number;
}

export interface CutClipProps {
  videoSrc: string;
  hook?: {
    startSec: number;
    endSec: number;
  };
  segments: VideoSegment[];
  overlays: OverlaySlide[];
}

function OverlayWrapper({
  slideId,
  durationFrames,
  fadeIn = 12,
  fadeOut = 12,
}: {
  slideId: string;
  durationFrames: number;
  fadeIn?: number;
  fadeOut?: number;
}) {
  const frame = useCurrentFrame();
  const Component = SLIDE_REGISTRY[slideId];

  if (!Component) {
    return (
      <AbsoluteFill style={{ backgroundColor: "red", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#fff", fontSize: 24 }}>Missing slide: {slideId}</div>
      </AbsoluteFill>
    );
  }

  let opacity: number;
  if (frame < fadeIn) {
    opacity = interpolate(frame, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" });
  } else if (frame > durationFrames - fadeOut) {
    opacity = interpolate(frame, [durationFrames - fadeOut, durationFrames], [1, 0], { extrapolateRight: "clamp" });
  } else {
    opacity = 1;
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <Component />
    </AbsoluteFill>
  );
}

// Crossfade component: fades from white to transparent over durationFrames
function CrossfadeOverlay({ durationFrames }: { durationFrames: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationFrames], [1, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff", opacity: opacity * 0.9 }} />
  );
}

const CROSSFADE_FRAMES = 20;

export const CutClip: React.FC<CutClipProps> = ({
  videoSrc,
  hook,
  segments,
  overlays,
}) => {
  const { fps } = useVideoConfig();

  // Build timeline: compute frame offset for each piece
  let cursor = 0;
  const pieces: Array<{ from: number; durationFrames: number; trimBeforeFrames: number; trimAfterFrames: number }> = [];

  // Hook segment
  if (hook) {
    const hookFrames = Math.round((hook.endSec - hook.startSec) * fps);
    pieces.push({
      from: cursor,
      durationFrames: hookFrames,
      trimBeforeFrames: Math.round(hook.startSec * fps),
      trimAfterFrames: Math.round(hook.endSec * fps),
    });
    cursor += hookFrames;
  }

  // Main segments (hard cuts between them)
  for (const seg of segments) {
    const segFrames = Math.round((seg.endSec - seg.startSec) * fps);
    pieces.push({
      from: cursor,
      durationFrames: segFrames,
      trimBeforeFrames: Math.round(seg.startSec * fps),
      trimAfterFrames: Math.round(seg.endSec * fps),
    });
    cursor += segFrames;
  }

  // Crossfade position: right at the boundary between hook and first segment
  const crossfadeFrom = hook
    ? Math.round((hook.endSec - hook.startSec) * fps) - Math.floor(CROSSFADE_FRAMES / 2)
    : -1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* === VIDEO SEGMENTS === */}
      {pieces.map((piece, i) => (
        <Sequence
          key={`vid-${i}`}
          from={piece.from}
          durationInFrames={piece.durationFrames}
        >
          <AbsoluteFill>
            <Video
              src={videoSrc}
              trimBefore={piece.trimBeforeFrames}
              trimAfter={piece.trimAfterFrames}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* === CROSSFADE between hook and main === */}
      {hook && crossfadeFrom >= 0 && (
        <Sequence
          from={crossfadeFrom}
          durationInFrames={CROSSFADE_FRAMES}
          layout="none"
        >
          <CrossfadeOverlay durationFrames={CROSSFADE_FRAMES} />
        </Sequence>
      )}

      {/* === OVERLAY SLIDES === */}
      {overlays.map((overlay, i) => (
        <Sequence
          key={`ov-${i}`}
          from={overlay.startFrame}
          durationInFrames={overlay.durationFrames}
          layout="none"
        >
          <OverlayWrapper
            slideId={overlay.slideId}
            durationFrames={overlay.durationFrames}
            fadeIn={overlay.fadeIn}
            fadeOut={overlay.fadeOut}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
