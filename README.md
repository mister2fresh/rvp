# Remotion Video Pipeline (RVP)

Automated vertical video factory for TikTok, Reels, and Shorts. Built with Remotion 4.x, React 18, and TypeScript.

## Quick Start

```bash
npm install
npm run dev          # Open Remotion Studio at localhost:3000
npm run typecheck    # Run TypeScript checks
```

## Creating a New Video

1. **Write a JSON data file** in `data/<brand>/`:

```json
{
  "scenes": [
    { "type": "title", "text": "Your headline", "durationInFrames": 90 },
    { "type": "stat", "label": "metric name", "value": 500, "suffix": "+", "durationInFrames": 150 },
    { "type": "cta", "text": "Call to action", "subtext": "Link in bio", "durationInFrames": 120 }
  ],
  "theme": {
    "primaryColor": "#E8C547",
    "secondaryColor": "#3b82f6",
    "backgroundColor": "#0f0f23",
    "textColor": "#ffffff",
    "accentColor": "#00FF88",
    "errorColor": "#ff6b6b",
    "fontFamily": "Inter",
    "fontFamilyDisplay": "Montserrat"
  }
}
```

2. **Preview in Studio** — select the composition and load your JSON via the props panel.

3. **Render to MP4:**

```bash
npx remotion render AftersetKineticText out/video.mp4 --props=./data/afterset/v1-math-problem.json
```

### Scene Types

| Type | Key Fields |
|------|-----------|
| `title` | `text`, `subtitle?` |
| `bullets` | `heading`, `items[{text, emoji?}]` |
| `stat` | `label`, `value`, `prefix?`, `suffix?` |
| `stat-reveal` | `statLabel`, `statValue`, `contrastLabel`, `contrastValue` |
| `comparison` | `leftTitle`, `rightTitle`, `leftItems[]`, `rightItems[]` |
| `quote` | `quote`, `attribution?` |
| `cta` | `text`, `subtext?` |

All scenes require `durationInFrames`. Use `frames = seconds * 30`.

## Adding a New Brand

1. Create a theme file in `src/themes/` (copy `_template.ts`).
2. Register new `<Composition>` entries in `src/Root.tsx` using your theme.
3. Create a data folder at `data/<brand>/` for JSON props.
4. Add render commands to `scripts/render-all.sh`.

## Render Commands

```bash
# Full video
npx remotion render AftersetKineticText out/video.mp4 \
  --props=./data/afterset/v1-math-problem.json --codec=h264 --crf=18

# Clip a segment (frames 210-960)
npx remotion render AftersetKineticText out/clip.mp4 \
  --props=./data/afterset/v1-math-problem.json --codec=h264 --crf=18 --frames=210-960

# Screen recording with callout overlays
npx remotion render AftersetScreenRecording out/demo.mp4 \
  --props=./data/afterset/v5-screen-recording.json --codec=h264 --crf=18

# Batch render all videos (TikTok + Reels + Shorts)
./scripts/render-all.sh
```

### Quality Presets

| Use Case | CRF | Notes |
|----------|-----|-------|
| Upload (TikTok/Reels) | 18 | High quality, larger files |
| Draft/preview | 25 | Fast, smaller files |

## Project Structure

```
src/
  index.ts              # registerRoot entry point
  Root.tsx              # Composition definitions
  types.ts              # Zod schemas for scenes, themes, props
  templates/            # Video composition components
  scenes/               # Scene type dispatcher
  primitives/           # Reusable animation components
  themes/               # Brand color/font themes
data/                   # JSON props per brand
public/                 # Static assets (audio, video)
scripts/render-all.sh   # Batch render script
```

## Canvas

1080 x 1920 (9:16 vertical), 30 fps.
