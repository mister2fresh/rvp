#!/usr/bin/env bash
set -euo pipefail

# Afterset Launch Videos — Batch Render Script
# Renders TikTok, Reels, and Shorts versions of all 5 videos.

OUT="out/afterset"
DATA="./data/afterset"
CRF=18
CODEC=h264

mkdir -p "$OUT"

echo "=== Video 1: The Math Problem ==="
# TikTok (full 45s)
npx remotion render AftersetKineticText "$OUT/v1-math-problem-tiktok.mp4" \
  --props="$DATA/v1-math-problem.json" --codec=$CODEC --crf=$CRF
# Reels (full duration — same props, breathing room added later)
npx remotion render AftersetKineticText "$OUT/v1-math-problem-reels.mp4" \
  --props="$DATA/v1-math-problem.json" --codec=$CODEC --crf=$CRF
# Shorts (stat reveal segment: ~frames 210-960)
npx remotion render AftersetKineticText "$OUT/v1-math-problem-shorts.mp4" \
  --props="$DATA/v1-math-problem.json" --codec=$CODEC --crf=$CRF --frames=210-960

echo "=== Video 2: The Clipboard ==="
# TikTok (full 35s)
npx remotion render AftersetKineticText "$OUT/v2-clipboard-tiktok.mp4" \
  --props="$DATA/v2-clipboard.json" --codec=$CODEC --crf=$CRF
# Reels
npx remotion render AftersetKineticText "$OUT/v2-clipboard-reels.mp4" \
  --props="$DATA/v2-clipboard.json" --codec=$CODEC --crf=$CRF
# Shorts (comparison segment: ~frames 90-690)
npx remotion render AftersetKineticText "$OUT/v2-clipboard-shorts.mp4" \
  --props="$DATA/v2-clipboard.json" --codec=$CODEC --crf=$CRF --frames=90-690

echo "=== Video 3: The Builder Story ==="
# TikTok (full 50s)
npx remotion render AftersetKineticText "$OUT/v3-builder-story-tiktok.mp4" \
  --props="$DATA/v3-builder-story.json" --codec=$CODEC --crf=$CRF
# Reels
npx remotion render AftersetKineticText "$OUT/v3-builder-story-reels.mp4" \
  --props="$DATA/v3-builder-story.json" --codec=$CODEC --crf=$CRF
# Shorts (quotes + stat reveal: ~frames 90-810)
npx remotion render AftersetKineticText "$OUT/v3-builder-story-shorts.mp4" \
  --props="$DATA/v3-builder-story.json" --codec=$CODEC --crf=$CRF --frames=90-810

echo "=== Video 4: Three Venues ==="
# TikTok (full 45s)
npx remotion render AftersetKineticText "$OUT/v4-three-venues-tiktok.mp4" \
  --props="$DATA/v4-three-venues.json" --codec=$CODEC --crf=$CRF
# Reels
npx remotion render AftersetKineticText "$OUT/v4-three-venues-reels.mp4" \
  --props="$DATA/v4-three-venues.json" --codec=$CODEC --crf=$CRF
# Shorts (venue vignettes: ~frames 90-810)
npx remotion render AftersetKineticText "$OUT/v4-three-venues-shorts.mp4" \
  --props="$DATA/v4-three-venues.json" --codec=$CODEC --crf=$CRF --frames=90-810

echo "=== Video 5: Screen Recording ==="
# TikTok (full ~40s)
npx remotion render AftersetScreenRecording "$OUT/v5-screen-recording-tiktok.mp4" \
  --props="$DATA/v5-screen-recording.json" --codec=$CODEC --crf=$CRF
# Reels
npx remotion render AftersetScreenRecording "$OUT/v5-screen-recording-reels.mp4" \
  --props="$DATA/v5-screen-recording.json" --codec=$CODEC --crf=$CRF
# Shorts (first two callouts: ~frames 0-450)
npx remotion render AftersetScreenRecording "$OUT/v5-screen-recording-shorts.mp4" \
  --props="$DATA/v5-screen-recording.json" --codec=$CODEC --crf=$CRF --frames=0-450

echo ""
echo "=== All renders complete ==="
echo "Output: $OUT/"
ls -lh "$OUT/"
