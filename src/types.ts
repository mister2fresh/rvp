import { z } from "zod";

const TitleSceneSchema = z.object({
  type: z.literal("title"),
  text: z.string(),
  subtitle: z.string().optional(),
  durationInFrames: z.number(),
});

const BulletSceneSchema = z.object({
  type: z.literal("bullets"),
  heading: z.string(),
  items: z.array(z.object({ text: z.string(), emoji: z.string().optional() })),
  durationInFrames: z.number(),
});

const StatSceneSchema = z.object({
  type: z.literal("stat"),
  label: z.string(),
  value: z.number(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  durationInFrames: z.number(),
});

const StatRevealSceneSchema = z.object({
  type: z.literal("stat-reveal"),
  statLabel: z.string(),
  statValue: z.string(),
  contrastLabel: z.string(),
  contrastValue: z.string(),
  durationInFrames: z.number(),
});

const ComparisonSceneSchema = z.object({
  type: z.literal("comparison"),
  leftTitle: z.string(),
  rightTitle: z.string(),
  leftItems: z.array(z.string()),
  rightItems: z.array(z.string()),
  durationInFrames: z.number(),
});

const CTASceneSchema = z.object({
  type: z.literal("cta"),
  text: z.string(),
  subtext: z.string().optional(),
  durationInFrames: z.number(),
});

const QuoteSceneSchema = z.object({
  type: z.literal("quote"),
  quote: z.string(),
  attribution: z.string().optional(),
  durationInFrames: z.number(),
});

const KineticBeatSchema = z.object({
  text: z.string(),
  emphasisWord: z.string().optional(),
  emphasisColor: z.string().optional(),
  fontSize: z.number().default(80),
  animation: z.enum(["spring-up", "scale-pop", "slide-left", "fade"]).default("spring-up"),
  holdFrames: z.number().default(45),
});

const KineticSceneSchema = z.object({
  type: z.literal("kinetic"),
  beats: z.array(KineticBeatSchema),
  durationInFrames: z.number(),
});

const BeforeAfterSceneSchema = z.object({
  type: z.literal("beforeAfter"),
  beforeLabel: z.string().default("BEFORE"),
  afterLabel: z.string().default("AFTER"),
  beforeItems: z.array(z.object({
    text: z.string(),
    emoji: z.string().optional(),
  })),
  afterItems: z.array(z.object({
    text: z.string(),
    emoji: z.string().optional(),
  })),
  durationInFrames: z.number().default(270),
});

export const SceneSchema = z.discriminatedUnion("type", [
  TitleSceneSchema,
  BulletSceneSchema,
  StatSceneSchema,
  StatRevealSceneSchema,
  ComparisonSceneSchema,
  CTASceneSchema,
  QuoteSceneSchema,
  KineticSceneSchema,
  BeforeAfterSceneSchema,
]);

export const ThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  backgroundColor: z.string(),
  surfaceColor: z.string(),
  textColor: z.string(),
  textSecondary: z.string(),
  textMuted: z.string(),
  accentColor: z.string(),
  errorColor: z.string(),
  successColor: z.string(),
  fontFamily: z.string(),
  fontFamilyDisplay: z.string(),
  fontMono: z.string(),
});

const TransitionStyleSchema = z
  .enum(["fade", "slide", "wipe", "flip", "clock-wipe", "none"])
  .default("fade");

const TransitionConfigSchema = z.object({
  style: TransitionStyleSchema,
  durationInFrames: z.number().default(15),
});

export const VideoPropsSchema = z.object({
  scenes: z.array(SceneSchema),
  theme: ThemeSchema,
  audioFile: z.string().optional(),
  transition: TransitionConfigSchema.optional(),
});

export type Scene = z.infer<typeof SceneSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type VideoProps = z.infer<typeof VideoPropsSchema>;
export type TitleScene = z.infer<typeof TitleSceneSchema>;
export type BulletScene = z.infer<typeof BulletSceneSchema>;
export type StatScene = z.infer<typeof StatSceneSchema>;
export type StatRevealScene = z.infer<typeof StatRevealSceneSchema>;
export type ComparisonScene = z.infer<typeof ComparisonSceneSchema>;
export type CTAScene = z.infer<typeof CTASceneSchema>;
export type QuoteScene = z.infer<typeof QuoteSceneSchema>;
export type KineticBeat = z.infer<typeof KineticBeatSchema>;
export type KineticScene = z.infer<typeof KineticSceneSchema>;
export type BeforeAfterScene = z.infer<typeof BeforeAfterSceneSchema>;
export type TransitionStyle = z.infer<typeof TransitionStyleSchema>;
export type TransitionConfig = z.infer<typeof TransitionConfigSchema>;

const CalloutSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  label: z.string(),
  borderColor: z.string().optional(),
  fromFrame: z.number(),
  durationInFrames: z.number(),
});

export const ScreenRecordingPropsSchema = z.object({
  videoSrc: z.string(),
  callouts: z.array(CalloutSchema),
  theme: ThemeSchema,
  audioFile: z.string().optional(),
  ctaText: z.string().optional(),
});

export type Callout = z.infer<typeof CalloutSchema>;
export type ScreenRecordingProps = z.infer<typeof ScreenRecordingPropsSchema>;
