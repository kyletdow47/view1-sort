import React from "react";
import { Composition, staticFile } from "remotion";
import { Img, AbsoluteFill } from "remotion";

// ═══════════════════════════════════════════════════════════════
// Each slide is a standalone composition — no video, just the
// animated graphic. Export individually for use in your editor.
//
// Render all:  npx remotion render src/index.ts --all
// Render one:  npx remotion render src/index.ts build-stats
// ═══════════════════════════════════════════════════════════════

// Pitch script animations
import { Pitch10Years } from "./slides/pitch/Pitch10Years";
import { PitchNoOneTool } from "./slides/pitch/PitchNoOneTool";
import { Pitch500Photos } from "./slides/pitch/Pitch500Photos";
import { PitchHoursDragging } from "./slides/pitch/PitchHoursDragging";
import { PitchAiSortFlow } from "./slides/pitch/PitchAiSortFlow";
import { PitchCustomizePrompts } from "./slides/pitch/PitchCustomizePrompts";
import { PitchWetransferPain } from "./slides/pitch/PitchWetransferPain";
import { PitchScatteredApps } from "./slides/pitch/PitchScatteredApps";
import { PitchView1Brand } from "./slides/pitch/PitchView1Brand";
import { PitchFourPillars } from "./slides/pitch/PitchFourPillars";
import { PitchClientDashboard } from "./slides/pitch/PitchClientDashboard";
import { PitchWaitlistCta } from "./slides/pitch/PitchWaitlistCta";
import { PitchStoragePain } from "./slides/pitch/PitchStoragePain";
import { PitchNoMore } from "./slides/pitch/PitchNoMore";
import { PitchPilotBenefits } from "./slides/pitch/PitchPilotBenefits";

// Standalone cards
import { BuildStatsCard } from "./slides/standalone/BuildStatsCard";
import { CommitChartCard } from "./slides/standalone/CommitChartCard";
import { March27Card } from "./slides/standalone/March27Card";
import { April2Card } from "./slides/standalone/April2Card";
import { VibeLoopCard } from "./slides/standalone/VibeLoopCard";
import { PipelineCard } from "./slides/standalone/PipelineCard";

// V1 slides
import { V1Slide02 } from "./slides/v1/V1Slide02";
import { V1Slide03 } from "./slides/v1/V1Slide03";
import { V1Slide04 } from "./slides/v1/V1Slide04";
import { V1Slide05 } from "./slides/v1/V1Slide05";
import { V1Slide06 } from "./slides/v1/V1Slide06";
import { V1Slide07 } from "./slides/v1/V1Slide07";
import { V1Slide08 } from "./slides/v1/V1Slide08";
import { V1Slide09 } from "./slides/v1/V1Slide09";

// V2 slides
import { V2Slide03 } from "./slides/v2/V2Slide03";
import { V2Slide06 } from "./slides/v2/V2Slide06";
import { V2Slide07 } from "./slides/v2/V2Slide07";
import { V2Slide09 } from "./slides/v2/V2Slide09";

// V3 slides
import { V3Slide00 } from "./slides/v3/V3Slide00";
import { V3Slide01 } from "./slides/v3/V3Slide01";
import { V3Slide03 } from "./slides/v3/V3Slide03";
import { V3Slide04 } from "./slides/v3/V3Slide04";
import { V3Slide05 } from "./slides/v3/V3Slide05";
import { V3Slide06 } from "./slides/v3/V3Slide06";
import { V3Slide08 } from "./slides/v3/V3Slide08";

// V4 slides
import { V4Slide00 } from "./slides/v4/V4Slide00";
import { V4Slide01 } from "./slides/v4/V4Slide01";
import { V4Slide06 } from "./slides/v4/V4Slide06";
import { V4Slide07 } from "./slides/v4/V4Slide07";
import { V4Slide08 } from "./slides/v4/V4Slide08";
import { V4Slide09 } from "./slides/v4/V4Slide09";

// BUILD-SIGNAL-art
const BuildSignalArt: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Img
      src={staticFile("assets/BUILD-SIGNAL-art.png")}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  </AbsoluteFill>
);

// Each animation runs for 8 seconds (240 frames) — enough to see the
// full staggered entrance, hold, then you cut in your editor.
const DURATION = 240;

// ═══ PITCH — 9:16 vertical (1080×1920) for Instagram Reels ═══
const pitchSlides: Array<{ id: string; component: React.FC; duration?: number }> = [
  { id: "pitch-10-years", component: Pitch10Years },
  { id: "pitch-no-one-tool", component: PitchNoOneTool },
  { id: "pitch-500-photos", component: Pitch500Photos },
  { id: "pitch-hours-dragging", component: PitchHoursDragging },
  { id: "pitch-ai-sort-flow", component: PitchAiSortFlow },
  { id: "pitch-customize-prompts", component: PitchCustomizePrompts },
  { id: "pitch-wetransfer-pain", component: PitchWetransferPain },
  { id: "pitch-scattered-apps", component: PitchScatteredApps },
  { id: "pitch-storage-pain", component: PitchStoragePain },
  { id: "pitch-view1-brand", component: PitchView1Brand },
  { id: "pitch-four-pillars", component: PitchFourPillars },
  { id: "pitch-client-dashboard", component: PitchClientDashboard },
  { id: "pitch-no-more", component: PitchNoMore },
  { id: "pitch-pilot-benefits", component: PitchPilotBenefits },
  { id: "pitch-waitlist-cta", component: PitchWaitlistCta },
];

// ═══ ORIGINAL — 4:3 (1440×1080) standalone animated cards ═══
const slides: Array<{ id: string; component: React.FC; duration?: number }> = [
  { id: "build-stats", component: BuildStatsCard },
  { id: "commit-chart", component: CommitChartCard },
  { id: "march27", component: March27Card },
  { id: "april2", component: April2Card },
  { id: "vibe-loop", component: VibeLoopCard },
  { id: "pipeline", component: PipelineCard },
  { id: "build-signal-art", component: BuildSignalArt, duration: 150 },

  // V1 — Product Phase 1
  { id: "v1-02-features", component: V1Slide02 },
  { id: "v1-03-command-k", component: V1Slide03 },
  { id: "v1-04-ai-sort", component: V1Slide04 },
  { id: "v1-05-bookings", component: V1Slide05 },
  { id: "v1-06-analytics", component: V1Slide06 },
  { id: "v1-07-clients", component: V1Slide07 },
  { id: "v1-08-content-hub", component: V1Slide08 },
  { id: "v1-09-command-deep", component: V1Slide09 },

  // V2 — Vibe Coding
  { id: "v2-03-asana-tasks", component: V2Slide03 },
  { id: "v2-06-night-agents", component: V2Slide06 },
  { id: "v2-07-the-result", component: V2Slide07 },
  { id: "v2-09-review-ritual", component: V2Slide09 },

  // V3 — Architecture
  { id: "v3-00-foundation", component: V3Slide00 },
  { id: "v3-01-specmd", component: V3Slide01 },
  { id: "v3-03-app-arch", component: V3Slide03 },
  { id: "v3-04-feature-roadmap", component: V3Slide04 },
  { id: "v3-05-asana-system", component: V3Slide05 },
  { id: "v3-06-doc-stack", component: V3Slide06 },
  { id: "v3-08-claude-interview", component: V3Slide08 },

  // V4 — QA System
  { id: "v4-00-qa-philosophy", component: V4Slide00 },
  { id: "v4-01-build-loop", component: V4Slide01 },
  { id: "v4-06-the-bible", component: V4Slide06 },
  { id: "v4-07-launch-ready", component: V4Slide07 },
  { id: "v4-08-retry-pattern", component: V4Slide08 },
  { id: "v4-09-live-metrics", component: V4Slide09 },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Pitch animations — 9:16 vertical for Reels/TikTok */}
      {pitchSlides.map((slide) => (
        <Composition
          key={slide.id}
          id={slide.id}
          component={slide.component}
          durationInFrames={slide.duration ?? DURATION}
          fps={30}
          width={1080}
          height={1920}
        />
      ))}

      {/* Original animations — 4:3 */}
      {slides.map((slide) => (
        <Composition
          key={slide.id}
          id={slide.id}
          component={slide.component}
          durationInFrames={slide.duration ?? DURATION}
          fps={30}
          width={1440}
          height={1080}
        />
      ))}
    </>
  );
};
