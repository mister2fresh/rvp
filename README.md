# Remotion Video Pipeline

A programmatic video factory that turns typed JSON into broadcast-ready vertical videos. Code in, MP4 out — every frame deterministic, every animation a pure function of time.

Built with **Remotion 4**, **React 18**, **TypeScript**, and **Zod**. Currently producing the launch campaign for [Afterset](https://afterset.net), a music-tech brand.

```
JSON scene data  ──►  Zod-validated React tree  ──►  Frame-perfect MP4
                                                     1080×1920 @ 30fps
```

---

## Why this exists

Short-form video is now infrastructure. Brands ship 10+ vertical cuts a week across TikTok, Reels, and Shorts — the bottleneck isn't ideas, it's production. Editors don't scale, AE templates don't version-control, and design tools don't compose.

This project treats video as software:

- **Composable** — scenes, primitives, and themes combine like React components
- **Deterministic** — every render is reproducible from the same JSON + git SHA
- **Type-safe** — Zod discriminated unions validate scene data at the studio boundary
- **Branded** — themes and shared visual grammar enforce identity across a campaign
- **Renderable in parallel** — one source produces TikTok, Reels, and Shorts variants

The result: a designer writes JSON, a CI job renders three platform-specific cuts, and the visual system stays consistent across an entire video series.

---

## Architecture

```
       ┌──────────────────────────────────────────────────────────────┐
       │                  Zod schemas (src/types.ts)                  │
       │   SceneSchema · ThemeSchema · VideoPropsSchema (validated)   │
       └──────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
   ┌──────────────┐   ┌──────────────────┐   ┌────────────────────────┐
   │   themes/    │   │  public/data/    │   │   audio (public/)      │
   │  afterset.ts │──►│  *.json scenes   │──►│   voiceover + score    │
   └──────────────┘   └──────────────────┘   └────────────────────────┘
                                  │
                                  ▼
       ┌──────────────────────────────────────────────────────────────┐
       │     primitives/      ·     scenes/SceneRenderer.tsx          │
       │   TextFlyIn, KineticBeat, BeforeAfter, NumberCounter,        │
       │   GlassCard, CrowdGrid, DecayBar, FunnelDrain, DotGridBleed, │
       │   CountdownRing, ProgressBar, SceneBackground, LinkInBio …   │
       └──────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
       ┌──────────────────────────────────────────────────────────────┐
       │       templates/         ·       compositions/               │
       │   KineticTextVideo       │   TheMathProblem                  │
       │   StatRevealVideo        │   FifteenMinuteWindow             │
       │   ScreenRecordingVideo   │   FanEvaporationNumbers           │
       │                          │   ThreeVenues                     │
       └──────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌──────────────────────────────────┐
                 │   Remotion render → H.264 MP4    │
                 │   TikTok / Reels / Shorts cuts   │
                 └──────────────────────────────────┘
```

**Three layers, each replaceable:**

1. **Primitives** — pure animation components (spring physics, frame-driven interpolation, SVG graphics). No CSS transitions, no `setTimeout`, no random — every value derives from `useCurrentFrame()`.
2. **Scenes & Templates** — `SceneRenderer` dispatches a scene type to the right primitive; templates sequence scenes with `TransitionSeries`.
3. **Compositions** — per-video creative direction (custom overlays, screen-shake on stat hits, white flash on emotional beats, signature SVGs that own each video's concept).

---

## Engineering highlights

**Pure-function rendering model.** Components are forbidden from holding accumulated state — every pixel at frame `f` is derived from `f` alone. This is what makes scrubbing, parallel rendering, and exact reproducibility possible.

**Discriminated-union scene schema.** Nine scene types (`title`, `bullets`, `stat`, `stat-reveal`, `comparison`, `cta`, `quote`, `kinetic`, `beforeAfter`) live behind a single Zod `discriminatedUnion`. The studio validates props at the boundary; downstream code reads exhaustive, narrowed types.

**Spring-driven motion design.** Animations use `spring({frame, fps, config})` as a 0→1 driver, then `interpolate()` maps that to any visual range — opacity, transform, color. Configs are tuned per use case:

```ts
// Standard entrance
{ damping: 12, stiffness: 120 }

// Smooth number counting
{ damping: 60, stiffness: 80 }

// Kinetic text beats (slightly snappier mass)
{ damping: 12, stiffness: 120, mass: 0.6 }

// Bouncy contrast reveal
{ damping: 10, stiffness: 200, mass: 0.8 }
```

**Theme system.** A 13-field `ThemeSchema` (colors, typography, surfaces) flows through every primitive. Swap a theme object, get a different brand. No CSS variables, no global state.

**Multi-platform output from one source.** `scripts/render-all.sh` produces TikTok, Reels, and Shorts cuts of every video by varying `--frames` ranges against the same composition + JSON.

**Cross-video visual grammar.** Shared effects (CrowdGrid mask, screen shake, gold/red emotional arc) reused across the campaign create brand recognition; per-video signature SVGs (`CountdownRing`, `DecayBar`, `FunnelDrain`) keep each video distinct.

---

## Tech stack

| Layer | Tool |
|---|---|
| Rendering | Remotion 4.0.435 (Chromium-based, headless H.264) |
| UI | React 18, TypeScript 5.7 (strict, no `any`) |
| Validation | Zod 4 — discriminated unions for scenes |
| Transitions | `@remotion/transitions` (TransitionSeries) |
| Typography | `@remotion/google-fonts` (DM Sans, Bricolage Grotesque, Space Mono) |
| Audio | `Html5Audio` with frame-driven volume envelopes |
| Lint / type-check | `tsc --noEmit` |

---

## Quick start

```bash
npm install
npm run dev          # Remotion Studio at localhost:3000
npm run typecheck    # tsc --noEmit
```

Pick a composition in the studio sidebar, scrub the timeline, edit JSON in `public/data/`, hot-reload. The studio is the IDE.

---

## Authoring a video

**1. Write the scene data** — `public/data/your-video.json`:

```json
{
  "scenes": [
    { "type": "title", "text": "Your headline", "subtitle": "supporting line", "durationInFrames": 90 },
    {
      "type": "kinetic",
      "beats": [
        { "text": "Most bands lose fans", "emphasisWord": "lose", "animation": "spring-up", "holdFrames": 45 },
        { "text": "after every show",     "emphasisWord": "every","animation": "scale-pop", "holdFrames": 45 },
        { "text": "Zero follow-up",       "emphasisWord": "Zero", "emphasisColor": "#ef4444", "animation": "slide-left", "holdFrames": 45 }
      ],
      "durationInFrames": 280
    },
    { "type": "stat",  "label": "fans lost per show", "value": 87, "suffix": "%", "durationInFrames": 120 },
    { "type": "cta",   "text": "afterset.net",        "subtext": "link in bio",   "durationInFrames": 90 }
  ]
}
```

Frame math: `frames = seconds × 30`. A 30-second video is 900 frames.

**2. Register a composition** in `src/Root.tsx` — pick a template (or write a bespoke composition for custom overlays) and pass theme + scenes.

**3. Render**:

```bash
npx remotion render TheMathProblem out/v1.mp4 --codec=h264 --crf=18
./scripts/render-all.sh   # batch: TikTok + Reels + Shorts for all 4 videos
```

| Preset | CRF | When |
|---|---|---|
| Upload | 18 | TikTok / Reels / Shorts publish |
| Draft  | 25 | Fast iteration |

---

## Scene types

| Type | What it does |
|---|---|
| `title` | Heading + optional subtitle, fade-in |
| `bullets` | Heading + staggered list with optional emoji |
| `stat` | Spring-driven number counter with prefix/suffix |
| `stat-reveal` | Primary stat then bouncy contrast stat |
| `comparison` | Split-screen left (red/danger) vs right (gold) |
| `quote` | Glass card with decorative quote mark + attribution |
| `cta` | Closing call-to-action + subtext |
| `kinetic` | Sequenced word beats — 4 animation styles, configurable emphasis word/color, optional `verticalPosition` |
| `beforeAfter` | Temporal before→after with gold wipe at midpoint |

Every scene is wrapped in `SceneBackground` (dual ambient glows + CRT scan lines) and every video carries the `LinkInBio` watermark.

---

## Project layout

```
src/
  index.ts                  registerRoot entry point
  Root.tsx                  <Composition> registry
  types.ts                  Zod schemas (single source of truth)
  primitives/               animation + SVG building blocks (~25 files)
  scenes/SceneRenderer.tsx  scene type → primitive dispatcher
  templates/                video-level wrappers (KineticText, StatReveal, ScreenRecording)
  compositions/             per-video creative (TheMathProblem, FifteenMinuteWindow,
                            FanEvaporationNumbers, ThreeVenues)
  themes/                   ThemeSchema-conforming brand objects
public/
  data/*.json               scene data
  *.mp3                     voiceover + music beds
scripts/render-all.sh       multi-platform batch render
docs/                       handoff + technical notes
BRAND.md                    Afterset visual identity spec
CLAUDE.md                   architectural rules + Remotion 4 gotchas
```

---

## Production status

Currently shipping the **Afterset** launch series — four videos built, one in iteration, all under the same theme:

| # | Video | Composition | Concept |
|---|---|---|---|
| 1 | The Math Problem | `TheMathProblem` | DecayBar + CrowdGrid — fans you've already lost |
| 2 | Fifteen-Minute Window | `FifteenMinuteWindow` | CountdownRing — the closing-time capture window |
| 3 | Fan Evaporation Numbers | `FanEvaporationNumbers` | FunnelDrain + DotGridBleed — leakage as physics |
| 4 | Three Venues | `ThreeVenues` | Standalone single-file vignette comp |
| 5 | Screen Recording | `ScreenRecordingVideo` | Animated callout overlays on captured demo |

---

## Constraints worth knowing

- **No native media tags** — `<Img>` / `<OffthreadVideo>` / `<Html5Audio>` only (Remotion needs to control loading per frame).
- **No `Math.random()`** — use `random()` from `remotion` for deterministic output.
- **No CSS animations or `setTimeout`** — all motion via `interpolate` + `spring`; all timing via `<Sequence from={N}>`.
- **`interpolate` input ranges must be strictly monotonic** and clamped on visual props (`extrapolateRight: 'clamp'`).
- **Functions ≤ 40 lines, ≤ 4 params** (project-wide rule); type-check after every change.

Full ruleset and Remotion 4 breaking-change notes in [`CLAUDE.md`](./CLAUDE.md).

---

## Canvas

1080 × 1920 · 9:16 vertical · 30 fps · H.264.
