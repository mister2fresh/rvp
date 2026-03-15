# Remotion 4.x Technical Reference for Faceless TikTok Videos

**This document is a complete API and patterns reference for building vertical (1080×1920, 30fps, 30–60s) kinetic text TikTok videos with Remotion 4.x.** Every import, prop, and code example is verified against current remotion.dev documentation (v4.0.435). The architecture targets data-driven, template-based compositions where scenes are defined as typed arrays and rendered sequentially with spring-based animations.

---

## 1. Project setup and vertical video configuration

### Scaffolding a new project

```bash
npx create-video@latest
# Follow prompts. Use --blank for minimal starter.
# Also: pnpm create video / yarn create video / bun create video
```

Post-scaffold, start the Studio with `npm run dev` (runs `npx remotion studio`). Install in an existing project with `npm i --save-exact remotion@4.0.435 @remotion/cli@4.0.435` — always pin exact versions and remove all `^` prefixes to prevent version conflicts.

### Essential file structure

```
my-tiktok-video/
├── public/                   # Static assets (audio, images)
│   ├── voiceover.mp3
│   └── background.jpg
├── src/
│   ├── index.ts              # Entry: registerRoot() — MUST be separate file
│   ├── Root.tsx               # Composition registrations
│   ├── types.ts               # Shared TypeScript types/schemas
│   ├── scenes/                # Individual scene components
│   │   ├── TitleScene.tsx
│   │   ├── BulletScene.tsx
│   │   ├── NumberScene.tsx
│   │   └── ComparisonScene.tsx
│   ├── components/            # Reusable animation primitives
│   │   ├── AnimatedText.tsx
│   │   ├── ProgressBar.tsx
│   │   └── NumberCounter.tsx
│   └── compositions/          # Full video compositions
│       ├── KineticTextVideo.tsx
│       └── StatRevealVideo.tsx
├── remotion.config.ts         # CLI configuration
├── package.json
└── tsconfig.json
```

### Entry point (src/index.ts)

```typescript
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

**Critical rule:** `registerRoot()` must be called exactly once, in a separate file from the Root component. This prevents issues with React Fast Refresh.

### Root.tsx — registering compositions for 1080×1920 at 30fps

```typescript
import { Composition, Folder } from "remotion";
import { KineticTextVideo } from "./compositions/KineticTextVideo";
import { StatRevealVideo } from "./compositions/StatRevealVideo";
import { VideoPropsSchema } from "./types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="TikTok Templates">
        <Composition
          id="KineticText"
          component={KineticTextVideo}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={900}    // 30 seconds
          schema={VideoPropsSchema}
          defaultProps={{
            scenes: [],
            theme: { primaryColor: "#4F46E5", backgroundColor: "#0f0f23" },
          }}
          calculateMetadata={({ props }) => ({
            durationInFrames: props.scenes.reduce(
              (sum: number, s: { durationInFrames: number }) =>
                sum + s.durationInFrames, 0
            ),
          })}
        />
        <Composition
          id="StatReveal"
          component={StatRevealVideo}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={1800}   // 60 seconds
          defaultProps={{}}
        />
      </Folder>
    </>
  );
};
```

**Key vertical-video note:** Set `width={1080} height={1920}` (9:16 portrait). Duration for 30–60 seconds at 30fps is **900–1800 frames**. The `<Folder>` component organizes compositions in the Studio sidebar.

### remotion.config.ts

```typescript
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");      // Faster than PNG
Config.setJpegQuality(90);
Config.setCodec("h264");                 // Best TikTok compatibility
Config.setConcurrency(8);                // Adjust to your CPU
Config.setOverwriteOutput(true);
```

**V4 breaking change:** Config must import from `@remotion/cli/config`, not from `remotion`. All namespace prefixes (`Config.Bundling.X`) were flattened to `Config.X`.

---

## 2. Core API reference

### `<Composition>` — registering renderable videos

```typescript
import { Composition } from "remotion";
```

| Prop | Type | Required | Notes |
|---|---|---|---|
| `id` | `string` | ✅ | Letters, numbers, `-` only |
| `width` / `height` | `number` | ✅ | Pixels. Use 1080×1920 for TikTok |
| `fps` | `number` | ✅ | 30 for TikTok |
| `durationInFrames` | `number` | ✅ | Total frames (seconds × fps) |
| `component` | `React.FC` | ✅* | Or use `lazyComponent` |
| `defaultProps` | `object` | Required if component has props | JSON-serializable + Date/Map/Set/staticFile |
| `schema` | `z.ZodObject` | Optional | Enables visual editing in Studio |
| `calculateMetadata` | `Function` | Optional | Dynamic duration/dimensions |

**V4 rule:** Use `type` not `interface` for component props — `interface` fails the `Record<string, unknown>` constraint.

```typescript
// ✅ Correct
type MyProps = { title: string; color: string };

// ❌ Wrong in Remotion 4
interface MyProps { title: string; color: string }
```

### `<Sequence>` — time-shifting and scene composition

```typescript
import { Sequence } from "remotion";
```

Children calling `useCurrentFrame()` receive frame values **relative to the Sequence start**, not the absolute timeline. Sequences cascade when nested — a Sequence starting at frame 60 inside one starting at frame 30 means children start at frame 90.

```typescript
const MyVideo: React.FC = () => {
  return (
    <>
      <Sequence durationInFrames={90}>
        <TitleScene text="Did you know?" />
      </Sequence>
      <Sequence from={90} durationInFrames={120}>
        <BulletScene items={bulletItems} />
      </Sequence>
      <Sequence from={210}>
        <OutroScene />
      </Sequence>
    </>
  );
};
```

Key props: `from` (start frame, default 0), `durationInFrames` (default Infinity), `name` (Studio label), `layout` (`"absolute-fill"` default or `"none"`).

### `<Series>` — sequential scenes without manual frame math

```typescript
import { Series } from "remotion";
```

Auto-calculates `from` for each child. Perfect for TikTok scene sequences:

```typescript
<Series>
  <Series.Sequence durationInFrames={90}>
    <TitleScene />
  </Series.Sequence>
  <Series.Sequence durationInFrames={120} offset={-10}>
    <BulletScene />    {/* starts 10 frames early, overlapping */}
  </Series.Sequence>
  <Series.Sequence durationInFrames={90}>
    <OutroScene />
  </Series.Sequence>
</Series>
```

### `<AbsoluteFill>` — layering and positioning

```typescript
import { AbsoluteFill } from "remotion";
```

Renders a `<div>` with `position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column;`. Layer multiple fills — **last child renders on top**:

```typescript
<AbsoluteFill>
  <AbsoluteFill style={{ backgroundColor: "#0f0f23" }} />
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <h1 style={{ color: "white", fontSize: 72 }}>Hello TikTok</h1>
  </AbsoluteFill>
</AbsoluteFill>
```

### `useCurrentFrame()` and `useVideoConfig()`

```typescript
import { useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();        // number — 0-indexed, relative to Sequence
const { fps, width, height, durationInFrames } = useVideoConfig();

// Convert seconds to frames:
const frameAtTwoSeconds = Math.round(2 * fps); // 60 at 30fps

// Convert frames to seconds:
const currentSeconds = frame / fps;
```

`useVideoConfig()` returns `{ width, height, fps, durationInFrames, id, defaultProps, props }`. The `props` field (v4.0+) contains final resolved props after `calculateMetadata`.

### `<Html5Audio>` — audio integration for voiceover sync

```typescript
import { Html5Audio, staticFile } from "remotion";
```

The classic `<Audio>` from `remotion` was **renamed to `<Html5Audio>`** in v4. A new `<Audio>` component exists in `@remotion/media` (experimental, uses Mediabunny). For stable production use, prefer `<Html5Audio>`:

```typescript
<Html5Audio
  src={staticFile("voiceover.mp3")}
  volume={(f) =>
    interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" })
  }
/>
```

Key props: `src`, `volume` (number or `(frame) => number` callback), `trimBefore`/`trimAfter` (frames, replaces deprecated `startFrom`/`endAt`), `playbackRate`, `muted`, `loop`.

### `<OffthreadVideo>` — embedding video clips

```typescript
import { OffthreadVideo, staticFile } from "remotion";
```

**Prefer over `<Html5Video>` (formerly `<Video>`)**. Extracts frames via FFmpeg during render — no Chrome throttling, no frame duplication, more codec support:

```typescript
<OffthreadVideo
  src={staticFile("clip.mp4")}
  style={{ width: "100%", height: "100%", objectFit: "cover" }}
/>
```

### `<Img>` and `staticFile()`

```typescript
import { Img, staticFile } from "remotion";

// staticFile() references public/ folder. V4 auto-encodes URI-unsafe chars.
<Img src={staticFile("background.png")} style={{ width: "100%" }} />
```

`<Img>` ensures the image loads before the frame renders — prevents flicker. Always use it over native `<img>`.

### `interpolate()` — the core animation function

```typescript
import { interpolate } from "remotion";

interpolate(
  input: number,               // usually useCurrentFrame()
  inputRange: number[],        // strictly monotonically increasing
  outputRange: number[],       // same length as inputRange
  options?: {
    easing?: (t: number) => number,
    extrapolateLeft?: "extend" | "clamp" | "identity" | "wrap",   // default: "extend"
    extrapolateRight?: "extend" | "clamp" | "identity" | "wrap",  // default: "extend"
  }
): number;
```

**Always clamp for visual properties** to avoid values overshooting valid ranges:

```typescript
const frame = useCurrentFrame();

// Fade in over 1 second (30 frames)
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: "clamp",
});

// Slide up 200px then hold
const translateY = interpolate(frame, [0, 20], [200, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// Fade in AND out across a scene
const { durationInFrames } = useVideoConfig();
const sceneOpacity = interpolate(
  frame,
  [0, 15, durationInFrames - 15, durationInFrames],
  [0, 1, 1, 0]
);
```

Multi-point interpolation lets you define complex curves. Input range must be strictly increasing (no duplicate values).

### `spring()` — physics-based animation

```typescript
import { spring } from "remotion";

const value = spring({
  frame: useCurrentFrame(),    // required
  fps: useVideoConfig().fps,   // required
  from: 0,                     // default: 0
  to: 1,                       // default: 1
  config: {
    mass: 1,                   // default: 1 — lower = faster
    damping: 10,               // default: 10 — higher = less bounce
    stiffness: 100,            // default: 100 — higher = snappier
    overshootClamping: false,  // default: false
  },
  durationInFrames: 30,        // optional: stretch to exact duration
  delay: 0,                    // optional: delay start by N frames
  reverse: false,              // optional: play backwards
});
```

**Use spring as a driver for interpolate** to map 0→1 spring output to any range:

```typescript
const driver = spring({ frame, fps, config: { damping: 12 } });
const translateX = interpolate(driver, [0, 1], [-500, 0]);
const scale = interpolate(driver, [0, 1], [0.5, 1]);
```

Helper: `measureSpring({ fps, config })` returns how many frames until the spring settles — useful for sizing Sequences.

### `interpolateColors()` and `Easing`

```typescript
import { interpolateColors, Easing } from "remotion";

// Color transitions (auto-clamps)
const bg = interpolateColors(frame, [0, 60], ["#1a1a2e", "#e94560"]);

// Easing with interpolate
const scale = interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  extrapolateRight: "clamp",
});
```

Available easings: `Easing.linear`, `.ease`, `.quad`, `.cubic`, `.sin`, `.circle`, `.exp`, `.elastic()`, `.back()`, `.bounce`, `.bezier(x1,y1,x2,y2)`. Modifiers: `Easing.in()`, `.out()`, `.inOut()`.

---

## 3. Animation patterns for kinetic text TikTok videos

### Text fly-in with spring physics

```typescript
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from "remotion";

type TextFlyInProps = { text: string; delay?: number };

export const TextFlyIn: React.FC<TextFlyInProps> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const driver = spring({
    fps,
    frame: frame - delay,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });

  const translateY = interpolate(driver, [0, 1], [120, 0]);
  const opacity = interpolate(driver, [0, 1], [0, 1]);
  const scale = interpolate(driver, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          fontSize: 80,
          fontWeight: "bold",
          color: "white",
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
          textAlign: "center",
          padding: "0 60px",
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

### Number counter (counting up from 0 to target)

```typescript
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from "remotion";

type NumberCounterProps = {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export const NumberCounter: React.FC<NumberCounterProps> = ({
  target, prefix = "", suffix = "", label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame, fps,
    config: { damping: 100, stiffness: 60, mass: 1 },
    durationInFrames: 45,
  });

  const displayNumber = Math.floor(interpolate(progress, [0, 1], [0, target]));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, color: "#aaa", marginBottom: 12 }}>
          {label}
        </div>
        <div style={{
          fontSize: 120, fontWeight: "bold", color: "#00FF88",
          fontFamily: "monospace",
        }}>
          {prefix}{displayNumber.toLocaleString()}{suffix}
        </div>
      </div>
    </AbsoluteFill>
  );
};
```

### Stat reveal with dramatic emphasis

```typescript
import React from "react";
import {
  spring, useCurrentFrame, useVideoConfig,
  AbsoluteFill, Sequence, interpolate,
} from "remotion";

type StatRevealProps = {
  statLabel: string;
  statValue: string;
  contrastLabel: string;
  contrastValue: string;
};

export const StatReveal: React.FC<StatRevealProps> = ({
  statLabel, statValue, contrastLabel, contrastValue,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      justifyContent: "center", alignItems: "center",
      backgroundColor: "#0f0f23",
    }}>
      {/* First stat appears */}
      <Sequence durationInFrames={90}>
        <StatLine label={statLabel} value={statValue} />
      </Sequence>

      {/* Dramatic pause, then contrast stat slams in */}
      <Sequence from={60}>
        <AbsoluteFill style={{
          justifyContent: "center", alignItems: "center",
          paddingTop: 200,
        }}>
          <ContrastStat label={contrastLabel} value={contrastValue} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const StatLine: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });

  return (
    <div style={{
      opacity: enter, transform: `scale(${interpolate(enter, [0, 1], [0.5, 1])})`,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 36, color: "#888" }}>{label}</div>
      <div style={{ fontSize: 96, fontWeight: "bold", color: "white" }}>{value}</div>
    </div>
  );
};

const ContrastStat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({
    frame, fps,
    config: { damping: 8, stiffness: 200, mass: 0.5 },
  });

  return (
    <div style={{
      transform: `scale(${slam})`,
      textAlign: "center",
    }}>
      <div style={{ fontSize: 36, color: "#ff6b6b" }}>{label}</div>
      <div style={{ fontSize: 110, fontWeight: "bold", color: "#FFD700" }}>{value}</div>
    </div>
  );
};
```

### Sequenced bullet points with staggered timing

```typescript
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from "remotion";

type BulletItem = { text: string; emoji?: string };

export const StaggeredBullets: React.FC<{ items: BulletItem[] }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const STAGGER = 12; // frames between each bullet

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: 60 }}>
      {items.map((item, i) => {
        const driver = spring({
          fps, frame: frame - i * STAGGER,
          config: { damping: 14, stiffness: 120 },
        });
        const translateX = interpolate(driver, [0, 1], [-80, 0]);
        const opacity = interpolate(driver, [0, 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <div key={i} style={{
            opacity, transform: `translateX(${translateX}px)`,
            fontSize: 44, color: "white", marginBottom: 28,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ fontSize: 48 }}>{item.emoji || "→"}</span>
            <span>{item.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

### Progress bar fill animation

```typescript
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

type ProgressBarProps = { percentage: number; label: string; color?: string };

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage, label, color = "#4F46E5",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fill = spring({
    frame: frame - 8, fps,
    config: { damping: 50, stiffness: 80 },
  });
  const width = interpolate(fill, [0, 1], [0, percentage], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "85%", margin: "0 auto" }}>
      <div style={{ fontSize: 32, color: "white", marginBottom: 12 }}>{label}</div>
      <div style={{
        height: 36, backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 18, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${width}%`,
          backgroundColor: color, borderRadius: 18,
        }} />
      </div>
      <div style={{ fontSize: 28, color, marginTop: 8, textAlign: "right" }}>
        {Math.round(width)}%
      </div>
    </div>
  );
};
```

### Split screen comparing two scenarios

```typescript
import React from "react";
import {
  spring, useCurrentFrame, useVideoConfig,
  AbsoluteFill, Sequence, interpolate,
} from "remotion";

type SplitScreenProps = {
  leftTitle: string; rightTitle: string;
  leftItems: string[]; rightItems: string[];
  leftColor?: string; rightColor?: string;
};

export const SplitScreen: React.FC<SplitScreenProps> = ({
  leftTitle, rightTitle, leftItems, rightItems,
  leftColor = "#ff6b6b", rightColor = "#4ecdc4",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const divider = spring({ fps, frame, config: { damping: 15 } });
  const dividerScale = interpolate(divider, [0, 1], [0, 1]);

  const halfStyle: React.CSSProperties = {
    position: "absolute", top: 0, bottom: 0, width: "50%",
    display: "flex", flexDirection: "column",
    padding: "80px 40px", justifyContent: "center",
  };

  return (
    <AbsoluteFill>
      <div style={{ ...halfStyle, left: 0, backgroundColor: "#1a1a2e" }}>
        <h2 style={{ color: leftColor, fontSize: 44, marginBottom: 30 }}>{leftTitle}</h2>
        {leftItems.map((item, i) => (
          <Sequence key={i} from={15 + i * 12} layout="none">
            <BulletLine text={item} color={leftColor} />
          </Sequence>
        ))}
      </div>
      <div style={{
        position: "absolute", left: "50%", top: "10%", bottom: "10%", width: 3,
        backgroundColor: "white", transform: `scaleY(${dividerScale})`,
        transformOrigin: "top",
      }} />
      <div style={{ ...halfStyle, right: 0, left: "auto", backgroundColor: "#16213e" }}>
        <h2 style={{ color: rightColor, fontSize: 44, marginBottom: 30 }}>{rightTitle}</h2>
        {rightItems.map((item, i) => (
          <Sequence key={i} from={15 + i * 12} layout="none">
            <BulletLine text={item} color={rightColor} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const BulletLine: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, 10], [30, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ opacity, transform: `translateX(${x}px)`, fontSize: 32,
      color: "white", marginBottom: 16, paddingLeft: 16,
      borderLeft: `3px solid ${color}`,
    }}>
      {text}
    </div>
  );
};
```

### Screen recording overlay with animated callout

```typescript
import React from "react";
import {
  AbsoluteFill, OffthreadVideo, Sequence, staticFile,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from "remotion";

type CalloutProps = { x: number; y: number; width: number; height: number; label: string };

export const ScreenRecordingOverlay: React.FC<{
  videoSrc: string;
  callouts: (CalloutProps & { fromFrame: number })[];
}> = ({ videoSrc, callouts }) => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(videoSrc)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      {callouts.map((c, i) => (
        <Sequence key={i} from={c.fromFrame} durationInFrames={60}>
          <AnimatedCallout x={c.x} y={c.y} width={c.width} height={c.height} label={c.label} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const AnimatedCallout: React.FC<CalloutProps> = ({ x, y, width, height, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });

  return (
    <>
      {/* Highlight box */}
      <div style={{
        position: "absolute", left: x, top: y, width, height,
        border: "3px solid #FFD700", borderRadius: 8,
        transform: `scale(${enter})`, transformOrigin: "center",
        boxShadow: "0 0 20px rgba(255,215,0,0.4)",
      }} />
      {/* Label */}
      <div style={{
        position: "absolute", left: x, top: y + height + 8,
        fontSize: 24, color: "#FFD700", fontWeight: "bold",
        opacity: interpolate(enter, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
        transform: `translateY(${interpolate(enter, [0, 1], [10, 0])}px)`,
      }}>
        {label}
      </div>
    </>
  );
};
```

---

## 4. Audio sync patterns for voiceover-driven videos

### Importing and playing audio

```typescript
import { Html5Audio, staticFile, Sequence } from "remotion";

// Full voiceover starting at frame 0
<Html5Audio src={staticFile("voiceover.mp3")} />

// Background music at 20% volume
<Html5Audio src={staticFile("bgmusic.mp3")} volume={0.2} />

// Trimmed audio: plays frames 60–240 of the audio file
<Html5Audio src={staticFile("audio.mp3")} trimBefore={60} trimAfter={240} />
```

### Volume fades using the callback pattern

The `volume` callback receives a frame counter `f` that **starts at 0 when the audio begins** — it is NOT `useCurrentFrame()`.

```typescript
import { Html5Audio, interpolate, staticFile, useVideoConfig } from "remotion";

// Fade in over 1 second, play, fade out over last second
const { fps, durationInFrames: dur } = useVideoConfig();

<Html5Audio
  src={staticFile("voiceover.mp3")}
  volume={(f) => {
    const fadeIn = interpolate(f, [0, fps], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(f, [dur - fps, dur], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    return fadeIn * fadeOut;
  }}
/>
```

### Syncing visuals to voiceover timestamps

Define a cue sheet mapping spoken content to frame numbers. At 30fps: **frame = seconds × 30**.

```typescript
// Voiceover cue sheet
const CUE_SHEET = [
  { text: "Did you know...",       startSec: 0.0, endSec: 1.5 },
  { text: "8,000 people per day",  startSec: 1.5, endSec: 3.2 },
  { text: "switch to solar energy", startSec: 3.2, endSec: 5.0 },
] as const;

const FPS = 30;
const toFrame = (sec: number) => Math.round(sec * FPS);

// In your composition:
<>
  <Html5Audio src={staticFile("voiceover.mp3")} />
  {CUE_SHEET.map((cue, i) => (
    <Sequence
      key={i}
      from={toFrame(cue.startSec)}
      durationInFrames={toFrame(cue.endSec) - toFrame(cue.startSec)}
    >
      <TextFlyIn text={cue.text} />
    </Sequence>
  ))}
</>
```

### Audio format best practices

**Recommended format:** MP3 at **44.1kHz, 128–320kbps** for voiceover. WAV (44.1kHz 16-bit) for highest fidelity. Place files in `public/` and reference with `staticFile()`. Remotion's `<Html5Audio>` uses FFmpeg for extraction during render, supporting all FFmpeg-compatible formats.

---

## 5. Rendering and TikTok-optimized output

### Preview with Remotion Studio

```bash
npx remotion studio                              # Opens at localhost:3000
npx remotion studio --props='{"key":"value"}'    # With input props
```

Studio features: timeline playback (Space/L/J/K), prop editing panel (requires Zod schema), render dialog (R key), Quick Switcher (⌘K).

### Render to MP4 — TikTok-optimized command

```bash
# Basic TikTok render
npx remotion render KineticText out/tiktok.mp4

# High quality
npx remotion render KineticText out/tiktok.mp4 --codec=h264 --crf=18

# With custom props
npx remotion render KineticText out/tiktok.mp4 \
  --props='./scenes/my-video-data.json'

# Fast draft preview
npx remotion render KineticText out/draft.mp4 \
  --crf=28 --jpeg-quality=60 --frames=0-150
```

### Codec and quality settings for TikTok

**Use H.264** (`--codec=h264`, the default). It has maximum platform compatibility. CRF scale for H.264: **1 (best quality) to 51 (worst)**, default 18.

| Use case | CRF | Approx bitrate | Notes |
|---|---|---|---|
| Final TikTok upload | **18–20** | ~4–6 Mbps | TikTok recompresses anyway |
| Archive/master | 15–17 | ~8–12 Mbps | Overkill for social |
| Draft preview | 25–28 | ~1–2 Mbps | Fast render for review |

Additional flags: `--x264-preset=fast` speeds up encoding (options: `superfast` through `placebo`). `--pixel-format=yuv420p` ensures maximum player compatibility.

### Render time expectations

A **60-second 1080×1920 video** at CRF 18 with text-only animations (no embedded video) typically renders in **30–90 seconds** on a modern 8-core machine. Heavy `<OffthreadVideo>` usage or complex SVG/canvas operations increase this. VP9 is 5–10× slower than H.264. The `--concurrency` flag defaults to half your CPU threads.

### Parameterized rendering for template reuse

```bash
# Props file approach (recommended, required on Windows)
echo '{"scenes":[{"type":"title","text":"Hello"}]}' > props.json
npx remotion render KineticText out/video.mp4 --props=./props.json
```

At the Composition level, `calculateMetadata` re-runs when props change, enabling dynamic duration:

```typescript
calculateMetadata={({ props }) => ({
  durationInFrames: props.scenes.reduce((sum, s) => sum + s.durationInFrames, 0),
})}
```

---

## 6. Template architecture for data-driven videos

### Scene type definition with Zod schema

```typescript
import { z } from "zod";

const TitleSceneSchema = z.object({
  type: z.literal("title"),
  text: z.string(),
  subtitle: z.string().optional(),
  durationInFrames: z.number().default(90),
});

const BulletSceneSchema = z.object({
  type: z.literal("bullets"),
  heading: z.string(),
  items: z.array(z.object({ text: z.string(), emoji: z.string().optional() })),
  durationInFrames: z.number().default(150),
});

const NumberSceneSchema = z.object({
  type: z.literal("stat"),
  label: z.string(),
  value: z.number(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  durationInFrames: z.number().default(90),
});

const ComparisonSceneSchema = z.object({
  type: z.literal("comparison"),
  leftTitle: z.string(),
  rightTitle: z.string(),
  leftItems: z.array(z.string()),
  rightItems: z.array(z.string()),
  durationInFrames: z.number().default(180),
});

const SceneSchema = z.discriminatedUnion("type", [
  TitleSceneSchema,
  BulletSceneSchema,
  NumberSceneSchema,
  ComparisonSceneSchema,
]);

export const VideoPropsSchema = z.object({
  scenes: z.array(SceneSchema),
  theme: z.object({
    primaryColor: z.string().default("#4F46E5"),
    backgroundColor: z.string().default("#0f0f23"),
    textColor: z.string().default("#ffffff"),
    fontFamily: z.string().default("Inter"),
  }).default({}),
  audioFile: z.string().optional(),
});

export type VideoProps = z.infer<typeof VideoPropsSchema>;
export type Scene = z.infer<typeof SceneSchema>;
```

### Scene router — rendering scenes sequentially

```typescript
import React from "react";
import { AbsoluteFill, Sequence, Html5Audio, staticFile } from "remotion";
import type { VideoProps, Scene } from "./types";

export const KineticTextVideo: React.FC<VideoProps> = ({ scenes, theme, audioFile }) => {
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{
      backgroundColor: theme.backgroundColor,
      fontFamily: theme.fontFamily,
    }}>
      {audioFile && <Html5Audio src={staticFile(audioFile)} />}
      {scenes.map((scene, index) => {
        const from = currentFrame;
        currentFrame += scene.durationInFrames;
        return (
          <Sequence key={index} from={from} durationInFrames={scene.durationInFrames}>
            <SceneRenderer scene={scene} theme={theme} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SceneRenderer: React.FC<{ scene: Scene; theme: VideoProps["theme"] }> = ({ scene, theme }) => {
  switch (scene.type) {
    case "title":
      return <TitleScene {...scene} theme={theme} />;
    case "bullets":
      return <StaggeredBullets items={scene.items} />;
    case "stat":
      return <NumberCounter target={scene.value} label={scene.label}
               prefix={scene.prefix} suffix={scene.suffix} />;
    case "comparison":
      return <SplitScreen {...scene} />;
  }
};
```

### What to make props vs hardcode

**Props (dynamic per video):** all text content, numeric values, scene order and timing, colors/theme, audio file path, scene-specific configuration.

**Hardcode (constant across templates):** canvas dimensions (1080×1920), fps (30), spring physics configs (damping/stiffness/mass), internal padding/margins, animation primitives, font loading logic.

---

## 7. Gotchas and Claude Code tips

### Remotion is NOT standard React animation

**The fundamental rule:** your component must be a **pure function of `useCurrentFrame()`**. Given the same frame number, it must produce identical visual output. Remotion renders frames in parallel across multiple browser tabs, in arbitrary order.

**Things that break rendering:**

- `useState` for animation state — state doesn't persist across parallel render tabs
- `useEffect` with accumulated values — frames rendered out of order
- CSS `transition`, `animation`, `@keyframes` — no real time passes between frames
- `setTimeout` / `setInterval` / `requestAnimationFrame` — time-based, not frame-based
- `Math.random()` — non-deterministic (use `random()` from `"remotion"` instead)
- Native `<img>`, `<video>`, `<audio>` tags — don't wait for load, cause flicker

### Frame math cheat sheet at 30fps

| Time | Frames | Calculation |
|---|---|---|
| 0.5 seconds | 15 | `Math.round(0.5 * 30)` |
| 1 second | 30 | `1 * 30` |
| 2.5 seconds | 75 | `Math.round(2.5 * 30)` |
| 30 seconds | 900 | `30 * 30` |
| 60 seconds | 1800 | `60 * 30` |

Always use `const fps = useVideoConfig().fps` for dynamic calculation: `Math.round(seconds * fps)`.

### Common interpolation mistakes

**Forgetting to clamp:** `interpolate(frame, [0, 30], [0, 1])` returns **2.0** at frame 60 because the default extrapolation is `"extend"`. Always add `extrapolateRight: "clamp"` for visual properties like opacity, scale, position.

**Duplicate input values:** `interpolate(f, [0, 30, 30, 60], [0, 1, 1, 0])` throws an error — input range must be *strictly* increasing. Use `[0, 29, 30, 60]` instead.

**Using spring output wrong:** `spring()` returns 0→1 by default. Don't pass it directly as a pixel value — use `interpolate(springValue, [0, 1], [startPx, endPx])` to map to your desired range.

### Remotion 4.x breaking changes vs older tutorials

Older tutorials and Stack Overflow answers may show patterns that no longer work in v4:

- `import {Config} from 'remotion'` → must be `from '@remotion/cli/config'`
- `Config.Bundling.overrideWebpackConfig()` → `Config.overrideWebpackConfig()`
- `<Audio>` from `'remotion'` → now named `<Html5Audio>` (new `<Audio>` is in `@remotion/media`)
- `<Video>` from `'remotion'` → now named `<Html5Video>` (new is `<OffthreadVideo>`)
- `startFrom` / `endAt` props → deprecated, use `trimBefore` / `trimAfter`
- `interface` for component props → must use `type` (v4 requires `Record<string, unknown>`)
- `Config.setImageFormat()` → split into `setVideoImageFormat()` + `setStillImageFormat()`
- `defaultProps` is now required on `<Composition>` when component accepts props
- `staticFile()` now auto-encodes URI characters — remove manual `encodeURIComponent`
- `quality` option everywhere → renamed to `jpegQuality`
- FFmpeg is bundled — no more `ensureFfmpeg()` or `ffmpegExecutable` options

---

## 8. CLAUDE.md condensed reference (< 800 words)

```markdown
# CLAUDE.md — Remotion 4.x TikTok Video Reference

## Project
- Canvas: `width={1080} height={1920} fps={30}` (9:16 TikTok vertical)
- 30s = 900 frames, 60s = 1800 frames. Formula: `frames = seconds * 30`
- Init: `npx create-video@latest`. Dev: `npx remotion studio`
- Entry: `registerRoot()` in separate file from Root component
- Config import: `import {Config} from '@remotion/cli/config'` (NOT from 'remotion')
- Use `type` not `interface` for component props (v4 requirement)

## Core Imports
```ts
import {
  Composition, Sequence, Series, AbsoluteFill,
  useCurrentFrame, useVideoConfig,
  Img, OffthreadVideo, Html5Audio,
  staticFile, interpolate, spring, interpolateColors,
  Easing, measureSpring,
} from "remotion";
```

## Key APIs
- `useCurrentFrame()` → frame number (0-indexed, relative to Sequence)
- `useVideoConfig()` → `{fps, width, height, durationInFrames, id, props}`
- `staticFile("file.mp3")` → URL for `public/` folder assets
- `interpolate(frame, [0,30], [0,1], {extrapolateRight:'clamp'})` → animated value
- `spring({frame, fps, config:{damping:12,stiffness:100}})` → 0→1 physics curve
- `interpolateColors(frame, [0,30], ['#000','#fff'])` → color string
- `measureSpring({fps, config})` → frames until spring settles

## Component Patterns
```tsx
// Fade-in text
const opacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

// Spring fly-in
const driver = spring({frame, fps, config: {damping: 12}});
const y = interpolate(driver, [0, 1], [100, 0]);

// Number counter
const progress = spring({frame, fps, durationInFrames: 45});
const num = Math.floor(interpolate(progress, [0, 1], [0, target]));

// Staggered items
items.map((item, i) => {
  const d = spring({fps, frame: frame - i * 12, config: {damping: 14}});
  // use d for opacity/translateX
});

// Scene sequencing
<Series>
  <Series.Sequence durationInFrames={90}><Scene1 /></Series.Sequence>
  <Series.Sequence durationInFrames={120}><Scene2 /></Series.Sequence>
</Series>
```

## Audio
```tsx
<Html5Audio src={staticFile("voiceover.mp3")}
  volume={(f) => interpolate(f, [0, 30], [0, 1], {extrapolateRight: 'clamp'})}
/>
```
- `trimBefore`/`trimAfter` for trimming (NOT startFrom/endAt, those are deprecated)
- Volume callback `f` starts at 0 when audio begins, NOT useCurrentFrame()

## Rendering
```bash
npx remotion render CompositionId out/video.mp4 --codec=h264 --crf=18
npx remotion render CompositionId out/video.mp4 --props=./data.json
```
- H.264 codec for TikTok. CRF 18-20 for upload quality. CRF 25+ for drafts.
- `--x264-preset=fast` for speed. Default concurrency = half CPU threads.

## Data-Driven Template
```tsx
// Root.tsx — dynamic duration from scene array
<Composition id="Video" component={Main} width={1080} height={1920} fps={30}
  durationInFrames={900} schema={VideoPropsSchema}
  defaultProps={{scenes: [], theme: {}}}
  calculateMetadata={({props}) => ({
    durationInFrames: props.scenes.reduce((s, sc) => s + sc.durationInFrames, 0),
  })}
/>
```

## Critical Rules
1. Components MUST be pure functions of frame number — no accumulated state
2. NO CSS transitions/animations/@keyframes — use interpolate() instead
3. NO setTimeout/setInterval — use <Sequence from={N}> for timing
4. NO Math.random() — use random() from 'remotion' for deterministic output
5. NO native <img>/<video>/<audio> — use <Img>/<OffthreadVideo>/<Html5Audio>
6. ALWAYS clamp interpolate() for visual props: `{extrapolateRight: 'clamp'}`
7. Input ranges must be strictly monotonically increasing (no duplicates)
8. Use spring() output as driver for interpolate(): spring→[0,1]→interpolate→[any range]
9. <Sequence> shifts useCurrentFrame() — children get frame relative to sequence start
10. defaultProps required on <Composition> when component has props
```

This condensed reference covers the patterns needed to build any kinetic text TikTok video template. For spring configs: `damping: 10-15` for bouncy, `damping: 50-100` for smooth; `mass: 0.5` for snappy, `mass: 1-2` for heavy. Use `<Series>` for sequential scenes to avoid manual frame arithmetic.