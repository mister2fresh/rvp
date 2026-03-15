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
const num = Math.round(interpolate(progress, [0, 1], [0, target]));

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
- Standard entrance: `{ damping: 12, stiffness: 120 }` — used by all entrance animations
- Smooth counting: `{ damping: 60, stiffness: 80 }` — NumberCounter only
- Kinetic beats: `{ damping: 12, stiffness: 120, mass: 0.6 }` — KineticBeat
- Bouncy contrast: `{ damping: 10, stiffness: 200, mass: 0.8 }` — StatReveal contrast value

## V4 Breaking Changes (vs older tutorials)
- `<Audio>` → `<Html5Audio>` (new `<Audio>` is experimental in @remotion/media)
- `<Video>` → `<Html5Video>` (prefer `<OffthreadVideo>`)
- `Config` import from `@remotion/cli/config` not `remotion`
- `interface` → `type` for component props
- `startFrom`/`endAt` → `trimBefore`/`trimAfter`
- `quality` → `jpegQuality`
- `setImageFormat()` → `setVideoImageFormat()` + `setStillImageFormat()`
- FFmpeg is bundled — no more ensureFfmpeg()

## Scene Types
9 types in `SceneSchema` discriminated union (`src/types.ts`):
- `title` — heading + optional subtitle
- `bullets` — heading + staggered items with optional emoji
- `stat` — animated number counter with label, prefix/suffix
- `stat-reveal` — primary stat + delayed contrast stat with bounce
- `comparison` — split-screen left (red/danger) vs right (gold)
- `cta` — call-to-action text + optional subtext
- `quote` — glass card with decorative quote mark + attribution
- `kinetic` — sequenced beats (2–7 words each) with emphasis word highlighting; 4 animation types: spring-up, scale-pop, slide-left, fade; per-beat timing: 15 enter + holdFrames + 10 exit; optional `verticalPosition`: "top" | "center" | "bottom" (default center) to vary beat placement on screen
- `beforeAfter` — temporal before/after with gold wipe transition at midpoint; before=red accents, after=gold accents

## Theme Shape
`ThemeSchema` has 13 fields — see `src/themes/afterset.ts` for canonical values:
- Colors: `primaryColor` (gold), `secondaryColor` (blue), `backgroundColor` (midnight), `surfaceColor`, `textColor`, `textSecondary`, `textMuted`, `accentColor`, `errorColor` (red), `successColor` (green)
- Fonts: `fontFamily` (DM Sans), `fontFamilyDisplay` (Bricolage Grotesque), `fontMono` (Space Mono)

## Architecture
```
src/primitives/      — reusable animation components (TextFlyIn, KineticBeat, BeforeAfter, etc.)
src/primitives/      — SVG graphics (QrCodeGraphic, TextToJoinGraphic, NfcChipGraphic, CrowdGrid, DecayBar, CountdownRing, ProgressBar, FunnelDrain, DotGridBleed)
src/scenes/          — SceneRenderer routes scene type → primitive
src/templates/       — video-level components (KineticTextVideo, StatRevealVideo, ScreenRecordingVideo)
src/compositions/    — per-video components with custom overlays and effects (TheMathProblem, FifteenMinuteWindow, FanEvaporationNumbers, etc.)
src/themes/          — theme objects conforming to ThemeSchema
public/data/         — JSON scene data for compositions
```
- All scenes wrapped in `SceneBackground` (dual ambient glows + CRT scan lines)
- All videos include `LinkInBio` watermark ("afterset.net", bottom-right, `delayFrames={0}` for immediate)
- Templates use `TransitionSeries` from `@remotion/transitions`

## Composition Pattern
Compositions wrap templates with per-video creative (effects, SVG overlays, per-transition styles):
- SVG graphics are `<Sequence>` overlays positioned with padding, NOT embedded in scene schemas
- Per-scene transition styles via array (wipe for spatial, none/hard-cut into stat counters, fade for emotional)
- Custom effects (screen shake, white flash) computed from `computeSceneStarts()` frame offsets
- Scene data lives in `public/data/` JSON files, imported into Root.tsx
- Overlays must avoid the center text zone — use CSS mask gradients or flex-end/flex-start positioning
- CrowdGrid overlays use `maskImage` with transparent center band (38%–62%) to frame text without overlap

## Creative Principles (cross-video consistency)
- **Shared visual grammar:** screen shake, CrowdGrid, spring physics, gold/red emotional arc — reuse across videos for brand recognition
- **Vary intensity per video:** same effect types but different configs (amplitude, frequency, with/without flash) so videos feel like a series, not copies
- **One unique hero SVG per video:** each video gets a signature graphic that owns its concept (e.g., CountdownRing for "15 minutes", DecayBar+CrowdGrid for "math problem", FunnelDrain+DotGridBleed for "fan evaporation")
- **Don't overuse product trio (QR/Text/NFC):** reserve for videos that explicitly pitch the capture mechanism — omit on emotional/CTA-driven videos to avoid feeling like a commercial
- **Kinetic beat positioning:** use `verticalPosition` to move setup beats to "top", hero beats to "center", closing beats to "bottom" — creates visual movement and clears space for overlays

## Stack
- TypeScript, Remotion 4.x, React 18, Zod
- Linter: `npx tsc --noEmit`
- No `any` — use `unknown` or generics
