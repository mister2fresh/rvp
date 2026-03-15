# Remotion Video Pipeline (RVP)

## Project
- Canvas: `width={1080} height={1920} fps={30}` (9:16 TikTok vertical)
- 30s = 900 frames, 60s = 1800 frames. Formula: `frames = seconds * 30`
- Dev: `npx remotion studio`
- Entry: `registerRoot()` in `src/index.ts`, separate from Root component
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
- `trimBefore`/`trimAfter` for trimming (NOT startFrom/endAt — deprecated)
- Volume callback `f` starts at 0 when audio begins, NOT useCurrentFrame()

## Rendering
```bash
npx remotion render CompositionId out/video.mp4 --codec=h264 --crf=18
npx remotion render CompositionId out/video.mp4 --props=./data.json
```
- H.264 for TikTok. CRF 18–20 for upload. CRF 25+ for drafts.

## Critical Rules
1. Components MUST be pure functions of frame number — no accumulated state
2. NO CSS transitions/animations/@keyframes — use interpolate() instead
3. NO setTimeout/setInterval — use `<Sequence from={N}>` for timing
4. NO Math.random() — use `random()` from 'remotion' for deterministic output
5. NO native `<img>`/`<video>`/`<audio>` — use `<Img>`/`<OffthreadVideo>`/`<Html5Audio>`
6. ALWAYS clamp interpolate() for visual props: `{extrapolateRight: 'clamp'}`
7. Input ranges must be strictly monotonically increasing (no duplicates)
8. Use spring() as driver for interpolate(): spring→[0,1]→interpolate→[any range]
9. `<Sequence>` shifts useCurrentFrame() — children get frame relative to sequence start
10. defaultProps required on `<Composition>` when component has props

## Spring Configs
- Bouncy: `damping: 10–15`
- Smooth: `damping: 50–100`
- Snappy: `mass: 0.5`
- Heavy: `mass: 1–2`

## V4 Breaking Changes (vs older tutorials)
- `<Audio>` → `<Html5Audio>` (new `<Audio>` is experimental in @remotion/media)
- `<Video>` → `<Html5Video>` (prefer `<OffthreadVideo>`)
- `Config` import from `@remotion/cli/config` not `remotion`
- `interface` → `type` for component props
- `startFrom`/`endAt` → `trimBefore`/`trimAfter`
- `quality` → `jpegQuality`
- `setImageFormat()` → `setVideoImageFormat()` + `setStillImageFormat()`
- FFmpeg is bundled — no more ensureFfmpeg()

## Stack
- TypeScript, Remotion 4.x, React 18, Zod
- Linter: `npx tsc --noEmit`
- No `any` — use `unknown` or generics
