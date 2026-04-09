import React from "react";
import { Img, AbsoluteFill, staticFile } from "remotion";

// Standalone cards
import { BuildStatsCard } from "../slides/standalone/BuildStatsCard";
import { CommitChartCard } from "../slides/standalone/CommitChartCard";
import { March27Card } from "../slides/standalone/March27Card";
import { April2Card } from "../slides/standalone/April2Card";
import { VibeLoopCard } from "../slides/standalone/VibeLoopCard";
import { PipelineCard } from "../slides/standalone/PipelineCard";

// V1 slides
import { V1Slide02 } from "../slides/v1/V1Slide02";
import { V1Slide03 } from "../slides/v1/V1Slide03";
import { V1Slide04 } from "../slides/v1/V1Slide04";
import { V1Slide05 } from "../slides/v1/V1Slide05";
import { V1Slide06 } from "../slides/v1/V1Slide06";
import { V1Slide07 } from "../slides/v1/V1Slide07";
import { V1Slide08 } from "../slides/v1/V1Slide08";
import { V1Slide09 } from "../slides/v1/V1Slide09";

// V2 slides
import { V2Slide03 } from "../slides/v2/V2Slide03";
import { V2Slide06 } from "../slides/v2/V2Slide06";
import { V2Slide07 } from "../slides/v2/V2Slide07";
import { V2Slide09 } from "../slides/v2/V2Slide09";

// V3 slides
import { V3Slide00 } from "../slides/v3/V3Slide00";
import { V3Slide01 } from "../slides/v3/V3Slide01";
import { V3Slide03 } from "../slides/v3/V3Slide03";
import { V3Slide04 } from "../slides/v3/V3Slide04";
import { V3Slide05 } from "../slides/v3/V3Slide05";
import { V3Slide06 } from "../slides/v3/V3Slide06";
import { V3Slide08 } from "../slides/v3/V3Slide08";

// V4 slides
import { V4Slide00 } from "../slides/v4/V4Slide00";
import { V4Slide01 } from "../slides/v4/V4Slide01";
import { V4Slide06 } from "../slides/v4/V4Slide06";
import { V4Slide07 } from "../slides/v4/V4Slide07";
import { V4Slide08 } from "../slides/v4/V4Slide08";
import { V4Slide09 } from "../slides/v4/V4Slide09";

// BUILD-SIGNAL-art static image
const BuildSignalArt: React.FC = () => (
  <AbsoluteFill>
    <Img
      src={staticFile("assets/BUILD-SIGNAL-art.png")}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  </AbsoluteFill>
);

export const SLIDE_REGISTRY: Record<string, React.FC> = {
  // Standalone
  "build-stats": BuildStatsCard,
  "commit-chart": CommitChartCard,
  "march27": March27Card,
  "april2": April2Card,
  "vibe-loop": VibeLoopCard,
  "pipeline": PipelineCard,
  "build-signal-art": BuildSignalArt,

  // V1
  "v1-02": V1Slide02,
  "v1-03": V1Slide03,
  "v1-04": V1Slide04,
  "v1-05": V1Slide05,
  "v1-06": V1Slide06,
  "v1-07": V1Slide07,
  "v1-08": V1Slide08,
  "v1-09": V1Slide09,

  // V2
  "v2-03": V2Slide03,
  "v2-06": V2Slide06,
  "v2-07": V2Slide07,
  "v2-09": V2Slide09,

  // V3
  "v3-00": V3Slide00,
  "v3-01": V3Slide01,
  "v3-03": V3Slide03,
  "v3-04": V3Slide04,
  "v3-05": V3Slide05,
  "v3-06": V3Slide06,
  "v3-08": V3Slide08,

  // V4
  "v4-00": V4Slide00,
  "v4-01": V4Slide01,
  "v4-06": V4Slide06,
  "v4-07": V4Slide07,
  "v4-08": V4Slide08,
  "v4-09": V4Slide09,
};
