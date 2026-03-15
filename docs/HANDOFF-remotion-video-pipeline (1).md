# HANDOFF — Remotion Faceless Video Pipeline

> **Purpose:** This document transfers full context to a dedicated chat for building
> a reusable, data-driven Remotion video production pipeline. The first client is
> Afterset (music-tech SaaS), but the architecture is designed to be project-agnostic
> and scalable to any brand or product that needs programmatic short-form video.

---

## What You're Building

A Remotion 4.x project that produces faceless short-form videos (TikTok, Reels, Shorts)
from JSON data files. The system has three layers:

1. **Template compositions** — Reusable React components that render different video formats
   (kinetic text, stat reveals, screen recording overlays). These are the "engines."
2. **Theme system** — A brand configuration layer (colors, fonts, animation presets) that
   can be swapped per project. Afterset is the first theme; future projects get their own.
3. **Scene data files** — JSON files that define what each video says, shows, and when.
   Creating a new video = writing a JSON file and running `npx remotion render`.

The goal: **a solo creator can go from "I have a script" to "I have 3 platform-optimized
MP4 files" in under 30 minutes, with zero video editing software.**

---

## Architecture Decisions (Locked)

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Remotion 4.x | React-based, data-driven, renders real MP4s. Existing React skills transfer. |
| Canvas | 1080×1920, 30fps | TikTok/Reels/Shorts native vertical format. |
| Separate repo | Yes — not inside the Afterset Next.js app | Keeps concerns clean. Video pipeline is its own tool. |
| Template count | 3 for v1 | Kinetic Text, Stat Reveal, Screen Recording Overlay. Covers full content funnel. |
| Theming | Props-based, per-project config | Afterset theme first. Theme object passed to all compositions. |
| Audio | Pre-recorded voiceover MP3s in `public/` | Synced via cue sheet (timestamp → frame mapping). |
| Rendering | Local only (no Lambda) | `npx remotion render` is free and fast enough for 5–10 videos/week. |
| Multi-platform | Three render configs per video | TikTok (30–45s), Reels (45–90s), Shorts (15–30s). Same composition, different duration/pacing params. |

---

## First Client: Afterset

**Product:** Fan capture tool for live musicians (QR, text-to-join, NFC at gigs).
**TikTok goal:** Drive waitlist signups during a 14-day validation sprint.
**Content themes:**
- The "99% fan evaporation" problem (musicians lose live audience)
- Product demos (QR scan → email capture → dashboard)
- Build-in-public updates (signup milestones, feature progress)
- Pain-point storytelling (clipboard signup sheets, dark venues)

**Afterset brand theme:**
```json
{
  "primaryColor": "#E8C547",
  "secondaryColor": "#3b82f6",
  "backgroundColor": "#0f0f23",
  "textColor": "#ffffff",
  "accentColor": "#00FF88",
  "errorColor": "#ff6b6b",
  "fontFamily": "Inter",
  "fontFamilyDisplay": "Montserrat"
}
```

**Voice strategy:** Creator's own voice recorded as MP3. Consistent across all videos.
Pace: 150–170 WPM (conversational, not corporate).

---

## The Five Launch Videos

These are adapted from existing scripts. Original scripts are in `afterset-tiktok-scripts.md`.

### Video 1: "The Math Problem" — Kinetic Text + Stat Reveal
**Hook:** "Here's a math problem nobody in the music industry is talking about."
**Structure:** Animated numbers count up (100 shows × 80 people = 8,000) → dramatic
drop to 50 → "99% evaporation rate" fills screen → solution tease → CTA.
**Template:** Kinetic Text (title scene → stat scenes → bullet scene → CTA scene)
**Duration:** 45 seconds (TikTok), 60s (Reels), 25s (Shorts — stat reveal segment only)

### Video 2: "The Clipboard" (Reimagined) — Kinetic Text
**Hook:** "POV: your entire fan growth strategy" (text over animated clipboard visual)
**Structure:** Animated clipboard appears with progressively illegible handwriting →
"Is this jmith or jsmith?" text → split-screen: clipboard method vs Afterset flow → CTA.
**Template:** Kinetic Text (title scene → comparison scene → CTA scene)
**Duration:** 35 seconds (TikTok), 50s (Reels), 20s (Shorts)

### Video 3: "The Builder Story" — Kinetic Text + Quote Cards
**Hook:** "I talked to 30 musicians in 2 weeks. Same problem. No solution."
**Structure:** Quote cards from musician conversations ("I don't." / "I post and hope.") →
"150 shows → 47 monthly listeners" stat reveal → solution overview → CTA.
**Template:** Kinetic Text (title scene → quote scenes → stat scene → CTA scene)
**Duration:** 50 seconds (TikTok), 75s (Reels), 30s (Shorts)

### Video 4: "Three Venues" (Reimagined) — Kinetic Text (Scene Sequence)
**Hook:** "One capture method doesn't work. Here's why."
**Structure:** Three animated vignettes — dive bar (dark icon + "too dark for QR" text),
packed room (crowd icon + "nobody walks to the table"), festival (distance icon +
"QR is 50 feet away") → "Three venues. Three methods. Zero excuses." → CTA.
**Template:** Kinetic Text (title scene → 3× venue scene → summary scene → CTA scene)
**Duration:** 45 seconds (TikTok), 60s (Reels), 25s (Shorts)

### Video 5: "The Screen Recording" — Screen Recording Overlay
**Hook:** "Watch what happens when this musician scans one QR code after their set."
**Structure:** Screen recording of Afterset product flow with animated callout boxes
highlighting each step: QR scan → fan page loads → email entered → dashboard updates.
**Template:** Screen Recording Overlay (video clip + sequenced callouts)
**Duration:** 40 seconds (TikTok), 55s (Reels), 20s (Shorts)
**Note:** Requires actual screen recording of the product. Can use the landing page
walkthrough or a prototype recording if MVP isn't built yet.

---

## Hook Library (10 Templates for A/B Testing)

Each hook can be swapped into any video by editing the first scene in the JSON data file.
The rest of the video stays the same. This is Remotion's core production advantage.

1. **"Your [method] is costing you [amount]"** — "That clipboard is losing you 200 fans per show."
2. **"[Result] — here's exactly how"** — "We captured 847 fan emails in one weekend."
3. **"Most [audience] are [doing X] wrong"** — "Most musicians are killing their fanbase after every show."
4. **"Why do [some get X] while [others get Y]?"** — "Why do some bands sell out while others can't fill 20 seats?"
5. **"Stop scrolling if you're a [persona] who [struggle]"** — "Stop scrolling if you play to packed rooms but have zero fan emails."
6. **"Watch what happens when I [action]"** — "Watch what happens when this musician scans one QR code."
7. **"What if you could [outcome] without [barrier]?"** — "What if you could capture every fan's email without a clipboard?"
8. **"Nobody is talking about [hidden strategy]"** — "Nobody is talking about the real reason indie musicians can't sell tickets."
9. **"[Shocking statistic]"** — "The average indie musician loses 98% of their live audience forever."
10. **"I [analyzed/talked to] X and found this"** — "I talked to 50 touring musicians. Every single one said this."

---

## Production Specs (from Research)

**Video length targets:**
- Kinetic text: 15–25 seconds (for Shorts), 30–45 seconds (TikTok), 45–90 seconds (Reels)
- Screen recordings: 30–45 seconds (TikTok), 45–60 seconds (Reels), 15–30 seconds (Shorts)
- Stat reveals: 30–45 seconds (TikTok)

**Pacing:** Visual change every 3–5 seconds. New text/words every 1–2 seconds for kinetic.
Never more than 5 seconds of visual stasis.

**Typography:**
- Hook text: 80–100px equivalent, bold sans-serif (Inter Bold / Montserrat Bold)
- Body text: 48–64px
- Captions/labels: 36–48px with outline or dark background
- Animations: word-by-word highlight, scale pop (120% → 100%), slide-in, spring bounce

**Color:** Dark backgrounds (#0f0f23 for Afterset), white primary text,
1–2 bright accent colors. High contrast mandatory. Brand accent for emphasis only.

**Audio:** Voiceover at 150–170 WPM. Background lo-fi at 15–25% volume.
Sound effects: whoosh for transitions, pop/ding for reveals, error buzzer for "wrong" examples.
All text must carry the full message independently of audio (assume muted viewing).

**CTA placement:** Final 3–5 seconds only. Text overlay + verbal + pinned comment.
Never open with a CTA. Structure: Hook → Value → CTA.

---

## Remotion 4.x Technical Reference

### CLAUDE.md Snippet (Include in project CLAUDE.md)

```markdown
## Remotion 4.x — Core Reference

### Project
- Canvas: `width={1080} height={1920} fps={30}` (9:16 TikTok vertical)
- 30s = 900 frames, 60s = 1800 frames. Formula: `frames = seconds * 30`
- Init: `npx create-video@latest`. Dev: `npx remotion studio`
- Entry: `registerRoot()` in separate file from Root component
- Config import: `import {Config} from '@remotion/cli/config'` (NOT from 'remotion')
- Use `type` not `interface` for component props (v4 requirement)

### Core Imports
```ts
import {
  Composition, Sequence, Series, AbsoluteFill,
  useCurrentFrame, useVideoConfig,
  Img, OffthreadVideo, Html5Audio,
  staticFile, interpolate, spring, interpolateColors,
  Easing, measureSpring,
} from "remotion";
```

### Key APIs
- `useCurrentFrame()` → frame number (0-indexed, relative to Sequence)
- `useVideoConfig()` → `{fps, width, height, durationInFrames, id, props}`
- `staticFile("file.mp3")` → URL for `public/` folder assets
- `interpolate(frame, [0,30], [0,1], {extrapolateRight:'clamp'})` → animated value
- `spring({frame, fps, config:{damping:12,stiffness:100}})` → 0→1 physics curve
- `interpolateColors(frame, [0,30], ['#000','#fff'])` → color string
- `measureSpring({fps, config})` → frames until spring settles

### Component Patterns
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

### Audio
```tsx
<Html5Audio src={staticFile("voiceover.mp3")}
  volume={(f) => interpolate(f, [0, 30], [0, 1], {extrapolateRight: 'clamp'})}
/>
```
- `trimBefore`/`trimAfter` for trimming (NOT startFrom/endAt — deprecated)
- Volume callback `f` starts at 0 when audio begins, NOT useCurrentFrame()

### Rendering
```bash
npx remotion render CompositionId out/video.mp4 --codec=h264 --crf=18
npx remotion render CompositionId out/video.mp4 --props=./data.json
```
- H.264 for TikTok. CRF 18–20 for upload. CRF 25+ for drafts.

### Critical Rules
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

### Spring Configs
- Bouncy: `damping: 10–15`
- Smooth: `damping: 50–100`
- Snappy: `mass: 0.5`
- Heavy: `mass: 1–2`

### V4 Breaking Changes (vs older tutorials)
- `<Audio>` → `<Html5Audio>` (new `<Audio>` is experimental in @remotion/media)
- `<Video>` → `<Html5Video>` (prefer `<OffthreadVideo>`)
- `Config` import from `@remotion/cli/config` not `remotion`
- `interface` → `type` for component props
- `startFrom`/`endAt` → `trimBefore`/`trimAfter`
- `quality` → `jpegQuality`
- `setImageFormat()` → `setVideoImageFormat()` + `setStillImageFormat()`
- FFmpeg is bundled — no more ensureFfmpeg()
```

---

## Scalability Architecture

This pipeline is designed to serve future projects beyond Afterset.

### What's Project-Specific vs Reusable

| Layer | Reusable Across Projects | Project-Specific |
|-------|--------------------------|------------------|
| Animation primitives (TextFlyIn, NumberCounter, StaggeredBullets, ProgressBar, SplitScreen) | ✅ | — |
| Scene type system (Zod schemas, scene router, Series-based sequencing) | ✅ | — |
| Rendering pipeline (multi-platform export configs, CLI scripts) | ✅ | — |
| Theme object (colors, fonts, animation presets) | — | ✅ One per brand |
| Scene data JSON files (text, timing, structure) | — | ✅ One per video |
| Voiceover audio files | — | ✅ One per video |
| Brand-specific templates (if any extend beyond the base 3) | — | ✅ As needed |

### File Structure for Multi-Project Use

```
remotion-video-pipeline/
├── public/
│   └── afterset/              # Per-project audio + assets
│       ├── v1-math-problem.mp3
│       └── logo.png
├── src/
│   ├── index.ts               # registerRoot()
│   ├── Root.tsx                # All composition registrations
│   ├── types.ts               # Scene schemas (Zod) — SHARED
│   │
│   ├── primitives/            # REUSABLE animation building blocks
│   │   ├── TextFlyIn.tsx
│   │   ├── NumberCounter.tsx
│   │   ├── StaggeredBullets.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── SplitScreen.tsx
│   │   └── AnimatedCallout.tsx
│   │
│   ├── templates/             # REUSABLE composition templates
│   │   ├── KineticTextVideo.tsx
│   │   ├── StatRevealVideo.tsx
│   │   └── ScreenRecordingVideo.tsx
│   │
│   ├── themes/                # PER-PROJECT brand configs
│   │   ├── afterset.ts
│   │   └── _template.ts       # Copy this for new projects
│   │
│   └── scenes/                # Scene router + renderer
│       └── SceneRenderer.tsx
│
├── data/                      # PER-VIDEO scene data JSONs
│   └── afterset/
│       ├── v1-math-problem.json
│       ├── v2-clipboard.json
│       ├── v3-builder-story.json
│       ├── v4-three-venues.json
│       └── v5-screen-recording.json
│
├── scripts/                   # CLI helpers
│   └── render-all.sh          # Batch render TikTok + Reels + Shorts
│
├── out/                       # Rendered videos (gitignored)
├── remotion.config.ts
├── CLAUDE.md
├── package.json
└── tsconfig.json
```

### Adding a New Project (Future)

1. Create a new theme file in `src/themes/` (copy `_template.ts`, set colors/fonts)
2. Create a new folder in `public/` for audio/assets
3. Create a new folder in `data/` for scene data JSONs
4. Register new compositions in `Root.tsx` pointing to existing templates with the new theme
5. Write scene data JSONs for each video
6. Render: `npx remotion render ProjectName-KineticText out/project/video.mp4 --props=./data/project/video.json`

No new React components needed unless the project requires a novel scene type.

---

## Phased Claude Code Prompts

Run these one at a time. Review output after each phase before proceeding.
Each phase has a DO NOT TOUCH list and acceptance criteria.

### Phase 1: Project Scaffolding + Configuration

```
Create a new Remotion 4.x project for producing faceless short-form videos.
Refer to CLAUDE.md for the full Remotion 4.x technical reference.

This is a STANDALONE project — not inside any existing codebase.

SETUP:
1. Initialize with `npx create-video@latest` (use --blank for minimal starter)
2. Pin exact Remotion versions (remove all ^ prefixes)
3. Install zod as a dependency
4. Configure remotion.config.ts:
   - Video image format: jpeg
   - JPEG quality: 90
   - Codec: h264
   - Concurrency: 8
   - Overwrite output: true

5. Create the file structure:
   src/index.ts          — registerRoot() in separate file
   src/Root.tsx           — Empty for now (compositions added in later phases)
   src/types.ts           — Scene type definitions with Zod schemas
   src/primitives/        — Empty folder (populated in Phase 2)
   src/templates/         — Empty folder (populated in Phase 2)
   src/themes/afterset.ts — Afterset brand theme
   src/themes/_template.ts — Blank theme template for future projects
   src/scenes/SceneRenderer.tsx — Empty for now
   data/afterset/         — Empty folder for scene data JSONs
   scripts/render-all.sh  — Placeholder batch render script
   CLAUDE.md              — Paste the Remotion reference from the handoff doc

6. Define the COMPLETE scene type system in src/types.ts:
   - TitleScene: { type: "title", text, subtitle?, durationInFrames }
   - BulletScene: { type: "bullets", heading, items: {text, emoji?}[], durationInFrames }
   - StatScene: { type: "stat", label, value (number), prefix?, suffix?, durationInFrames }
   - StatRevealScene: { type: "stat-reveal", statLabel, statValue (string),
     contrastLabel, contrastValue (string), durationInFrames }
   - ComparisonScene: { type: "comparison", leftTitle, rightTitle, leftItems, rightItems, durationInFrames }
   - CTAScene: { type: "cta", text, subtext?, durationInFrames }
   - QuoteScene: { type: "quote", quote, attribution?, durationInFrames }
   - Use z.discriminatedUnion("type", [...]) for the Scene union — ALL 7 scene types
   - Export VideoPropsSchema with: scenes array, theme object, audioFile (optional)

   IMPORTANT: This is the complete type system for the entire project. All 7 scene
   types must be defined here. Later phases will build components and templates that
   consume these types, but types.ts will not be modified again.

7. Define the Afterset theme in src/themes/afterset.ts:
   primaryColor: "#E8C547"
   secondaryColor: "#3b82f6"
   backgroundColor: "#0f0f23"
   textColor: "#ffffff"
   accentColor: "#00FF88"
   errorColor: "#ff6b6b"
   fontFamily: "Inter"
   fontFamilyDisplay: "Montserrat"

DO NOT TOUCH:
- Do not create any animation components yet (Phase 2)
- Do not register any compositions yet (Phase 2)
- Do not create scene data files yet (Phase 5)

ACCEPTANCE CRITERIA:
1. `npx remotion studio` launches without errors
2. `npx tsc --noEmit` passes
3. types.ts exports VideoPropsSchema and all 7 scene schemas
   (title, bullets, stat, stat-reveal, comparison, cta, quote)
4. Both theme files exist and export typed theme objects
5. CLAUDE.md contains the full Remotion reference
6. File structure matches the specification above
```

### Phase 2: Kinetic Text Template + Animation Primitives

```
Build the Kinetic Text video template and all shared animation primitives.
Refer to CLAUDE.md for Remotion API patterns. Read src/types.ts for scene schemas.

CREATE these animation primitives in src/primitives/:

1. TextFlyIn.tsx — Spring-based text entrance (translateY + opacity + scale).
   Props: text, delay?, fontSize?, color?

2. NumberCounter.tsx — Counts from 0 to target with spring physics.
   Props: target, prefix?, suffix?, label, color?

3. StaggeredBullets.tsx — Multiple items appearing with staggered timing.
   Props: items: {text, emoji?}[], stagger? (frames between items)

4. SplitScreen.tsx — Two-panel comparison with animated divider.
   Props: leftTitle, rightTitle, leftItems, rightItems, leftColor?, rightColor?

5. ProgressBar.tsx — Animated fill bar.
   Props: percentage, label, color?

CREATE the scene renderer in src/scenes/SceneRenderer.tsx:
- Switch on scene.type, render the appropriate primitive(s)
- Accept theme as a prop, pass colors/fonts through
- Handle ALL 7 scene types from types.ts (title, bullets, stat, stat-reveal,
  comparison, cta, quote). For "stat-reveal", render a placeholder or basic
  version using NumberCounter — the dedicated StatReveal primitive comes in Phase 3.

CREATE the Kinetic Text template in src/templates/KineticTextVideo.tsx:
- Accepts VideoProps (scenes array, theme, audioFile)
- Renders scenes sequentially using <Sequence> with frame offsets
- If audioFile provided, renders <Html5Audio> with fade-in
- Background color from theme
- Font family from theme

REGISTER in Root.tsx:
- Composition id="AftersetKineticText" with 1080×1920, 30fps
- Use calculateMetadata for dynamic duration from scene array
- Default props with empty scenes array and afterset theme

DESIGN RULES (from faceless TikTok research):
- Hook text: 80px+ fontSize, bold
- Body text: 48–64px
- Labels/captions: 36–48px
- Spring configs: damping 10–15 for bouncy reveals, damping 50+ for smooth counters
- All text centered with generous padding (60px sides minimum)
- Text shadow for depth: "0 4px 20px rgba(0,0,0,0.5)"
- Accent colors used ONLY for emphasis words, not all text

DO NOT TOUCH:
- types.ts (already complete from Phase 1)
- Theme files (already defined in Phase 1)
- remotion.config.ts

ACCEPTANCE CRITERIA:
1. `npx tsc --noEmit` passes
2. `npx remotion studio` shows "AftersetKineticText" in sidebar
3. Clicking the composition shows a dark background (no scenes = empty but no errors)
4. All 5 primitives exist and export typed React components
5. SceneRenderer handles all 7 scene types from types.ts without errors
```

### Phase 3: Stat Reveal Template

```
Build the Stat Reveal video template. This extends the Kinetic Text template
with dramatic number emphasis — large animated counters with contrast reveals.
Refer to CLAUDE.md for Remotion patterns. Read existing primitives for consistency.

CREATE in src/primitives/:

6. StatReveal.tsx — Two-phase reveal: first stat appears (scale + fade) →
   pause → contrast stat slams in (high stiffness spring, low damping).
   Props: statLabel, statValue, contrastLabel, contrastValue

MODIFY src/scenes/SceneRenderer.tsx:
- Replace the placeholder "stat-reveal" case with the new StatReveal primitive

CREATE src/templates/StatRevealVideo.tsx:
- Similar structure to KineticTextVideo but optimized for stat-heavy content
- Larger default font sizes for numbers (110–120px)
- Monospace font for animated counters (fontFamily: "monospace")
- Supports a mix of title, stat, stat-reveal, and CTA scenes

REGISTER in Root.tsx:
- New Composition id="AftersetStatReveal"
- Same 1080×1920, 30fps, calculateMetadata pattern

DO NOT TOUCH:
- types.ts (complete since Phase 1 — no schema changes needed)
- Existing primitives (don't modify TextFlyIn, NumberCounter, etc.)
- KineticTextVideo template (don't modify)
- Theme files
- remotion.config.ts

ACCEPTANCE CRITERIA:
1. `npx tsc --noEmit` passes
2. "AftersetStatReveal" appears in Remotion Studio
3. StatReveal primitive renders two-phase animation when previewed
4. SceneRenderer handles "stat-reveal" type using the new StatReveal primitive
5. All existing compositions still work
```

### Phase 4: Screen Recording Overlay Template

```
Build the Screen Recording Overlay template for product demo videos.
Refer to CLAUDE.md for <OffthreadVideo> patterns. Read existing code for consistency.

CREATE in src/primitives/:

7. AnimatedCallout.tsx — Highlight box that springs into view over a video.
   Props: x, y, width, height, label, borderColor?

CREATE src/templates/ScreenRecordingVideo.tsx:
- Accepts: videoSrc (string), callouts array (each with x, y, width, height,
  label, fromFrame, durationInFrames), theme, audioFile
- Renders <OffthreadVideo> as background (objectFit: "contain")
- Renders callouts as <Sequence>-wrapped AnimatedCallout components
- Optional text overlay footer for persistent CTA ("Link in bio")

REGISTER in Root.tsx:
- New Composition id="AftersetScreenRecording"
- Different defaultProps structure (videoSrc + callouts, not scenes array)

DO NOT TOUCH:
- Existing templates and primitives
- Scene type system (screen recording uses its own props, not the scene array)
- Theme files

ACCEPTANCE CRITERIA:
1. `npx tsc --noEmit` passes
2. "AftersetScreenRecording" appears in Remotion Studio
3. If a test video file is placed in public/, the composition renders it
   with callout overlays appearing at specified frames
4. All existing compositions still work
```

### Phase 5: Scene Data Files for Afterset Videos 1–5

```
Create the JSON scene data files for Afterset's five launch videos.
Read the video descriptions in CLAUDE.md / handoff doc for content and timing.
Read src/types.ts to ensure all scene objects match the Zod schemas.

CREATE in data/afterset/:

1. v1-math-problem.json — Kinetic Text + Stat Reveal hybrid
   Scenes: title hook → stat (100 shows × 80 people) → stat-reveal (8,000 → 50) →
   bullet (solution points: QR, text, NFC) → CTA
   Target duration: ~45 seconds (1350 frames)

2. v2-clipboard.json — Kinetic Text
   Scenes: title hook ("POV: your entire fan growth strategy") →
   quote ("Is this jmith or jsmith?") → comparison (clipboard vs Afterset) → CTA
   Target duration: ~35 seconds (1050 frames)

3. v3-builder-story.json — Kinetic Text + Quote Cards
   Scenes: title hook → quote ("I don't." / "I post and hope.") →
   stat-reveal (150 shows → 47 listeners) → bullets (solution overview) → CTA
   Target duration: ~50 seconds (1500 frames)

4. v4-three-venues.json — Kinetic Text (Scene Sequence)
   Scenes: title hook → title (Dive bar: too dark for QR) →
   title (Packed room: nobody walks to table) →
   title (Festival: QR is 50 feet away) →
   title (Three venues. Three methods. Zero excuses.) → CTA
   Target duration: ~45 seconds (1350 frames)

5. v5-screen-recording.json — Screen Recording Overlay
   Note: This file has a different structure (videoSrc + callouts, not scenes).
   Use placeholder values for videoSrc and callout positions. The creator
   will update coordinates after recording the actual screen capture.
   Include 4 callout positions as examples.

RULES:
- Every scene must include durationInFrames
- Scene durations must sum to the target total
- CTA scenes should be 90–120 frames (3–4 seconds)
- Hook/title scenes should be 60–90 frames (2–3 seconds)
- Stat and content scenes get the remaining time
- All text should match the approved scripts (see handoff video descriptions)
- All scene objects must pass Zod validation against the schemas in types.ts

ALSO CREATE:
- scripts/render-all.sh that renders all 5 Afterset videos:
  For each video, render 3 versions:
  - TikTok: full duration, --props=./data/afterset/vN.json
  - Reels: full duration (use same file — Reels version gets breathing room later)
  - Shorts: partial render using --frames=START-END for the strongest segment

DO NOT TOUCH:
- Any source code files
- Theme files
- remotion.config.ts

ACCEPTANCE CRITERIA:
1. All 5 JSON files exist and are valid JSON
2. Each file's scenes validate against the Zod schemas (test with a quick script)
3. `npx remotion render AftersetKineticText out/test.mp4 --props=./data/afterset/v1-math-problem.json`
   produces a video without errors
4. render-all.sh is executable and contains correct render commands for all 5 videos
```

### Phase 6: Polish + Multi-Platform Rendering

```
Final polish pass. Make the pipeline production-ready.
Preview all 5 videos in Remotion Studio and fix any issues.

TASKS:

1. Preview each Afterset video in Studio. Fix any:
   - Timing issues (scenes too fast/slow, awkward gaps)
   - Text overflow (text too long for screen at current font size)
   - Animation conflicts (overlapping sequences)
   - Color contrast issues

2. Add a persistent "Link in bio" watermark component:
   - Small text (24px) in bottom-right corner
   - 60% opacity, white with dark shadow
   - Present throughout entire video except first 3 seconds
   - Reusable across all templates

3. Verify render-all.sh produces all outputs without errors.
   Test at least one full render to MP4.

4. Create a README.md in the project root with:
   - Quick start instructions
   - How to create a new video (write JSON → render)
   - How to add a new project/brand (create theme → create data folder)
   - Render commands reference

DO NOT TOUCH:
- Scene data content (text/copy) — only fix technical rendering issues
- Theme colors
- Type definitions (unless a bug is found)

ACCEPTANCE CRITERIA:
1. All 5 videos preview cleanly in Remotion Studio
2. At least one video renders to MP4 without errors
3. render-all.sh runs without errors
4. README.md exists with clear instructions
5. `npx tsc --noEmit` passes
6. No console warnings in Remotion Studio
```

---

## After the Build

Once all 6 phases are complete:

1. **Record voiceovers** for Videos 1–5 (your task — quiet room, consistent mic)
2. **Place audio files** in `public/afterset/`
3. **Run render-all.sh** to produce all MP4s
4. **Review in any video player** — check timing against voiceover
5. **Iterate** — adjust scene timing in JSON files to match voiceover cadence, re-render
6. **Upload** — TikTok versions go to TikTok, Reels versions go to Instagram, etc.

The pipeline is now operational. New videos = new JSON file + optional voiceover + render.

---

## Reference Documents

| What | File |
|------|------|
| Faceless TikTok strategy research | `Facelesstiktokstrategy.md` |
| Remotion technical deep dive | `RemotionTechnicalReport.md` |
| Afterset product context | `HANDOFF-gig-to-fan-bridge.md` |
| Original TikTok scripts (adapt from these) | `afterset-tiktok-scripts.md` |
| Afterset landing page CLAUDE.md (brand reference) | `afterset-codebase-reference.md` |
| Main project task tracker | `TASKS.md` |
