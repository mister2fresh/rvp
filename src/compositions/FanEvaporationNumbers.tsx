import React from "react";
import {
	AbsoluteFill,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	measureSpring,
	Html5Audio,
	staticFile,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import type { VideoProps, TransitionStyle, Scene } from "../types";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { SceneBackground } from "../primitives/SceneBackground";
import { GlassCard } from "../primitives/GlassCard";
import { NumberCounter } from "../primitives/NumberCounter";
import { LinkInBio } from "../primitives/LinkInBio";
import { getPresentation } from "../primitives/getTransition";
import { FunnelDrain } from "../primitives/FunnelDrain";
import { DotGridBleed } from "../primitives/DotGridBleed";
import { CrowdGrid } from "../primitives/CrowdGrid";
import { DecayBar } from "../primitives/DecayBar";
import { QrCodeGraphic } from "../primitives/QrCodeGraphic";
import { TextToJoinGraphic } from "../primitives/TextToJoinGraphic";
import { NfcChipGraphic } from "../primitives/NfcChipGraphic";

const LOSS_RATE_SCENE = 5;
const SHAKE_FRAMES = 3;
const SHAKE_AMPLITUDE = 2;

const SCENE_TRANSITIONS: TransitionStyle[] = [
	"none", // 0→1: hook → setup (hard cut)
	"none", // 1→2: setup → 8k counter (hard cut)
	"none", // 2→3: 8k → email question (hard cut)
	"none", // 3→4: question → under 100 (hard cut into disappointment)
	"none", // 4→5: under 100 → 98.7% (hard cut)
	"wipe", // 5→6: 98.7% → 40× pivot
	"fade", // 6→7: pivot → emotional close
	"fade", // 7→8: close → capture methods
];

type StatOverride = {
	color: string;
	fontSize?: number;
};

const STAT_OVERRIDES: Record<number, StatOverride> = {
	4: { color: "#3b82f6", fontSize: 80 },
	5: { color: "#ef4444", fontSize: 140 },
};

const CENTER_MASK =
	"linear-gradient(to bottom, black 0%, black 32%, transparent 38%, transparent 62%, black 68%, black 100%)";

export const FanEvaporationNumbers: React.FC<VideoProps> = ({
	scenes,
	theme,
	audioFile,
	transition,
}) => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();
	const transitionDuration = transition?.durationInFrames ?? 15;
	const sceneStarts = computeSceneStarts(scenes, transitionDuration);

	const counterSettleFrame = measureSpring({
		fps,
		config: { damping: 60, stiffness: 80 },
	});
	const impactFrame = sceneStarts[LOSS_RATE_SCENE] + counterSettleFrame;
	const shakeOffset = getShakeOffset(frame, impactFrame);

	// Dot grid bleeds out over the stat arc (scenes 2–5)
	const dotDrainStart = sceneStarts[2];
	const dotDrainEnd = sceneStarts[5] + scenes[5].durationInFrames;
	const dotVanishProgress = interpolate(
		frame,
		[dotDrainStart, dotDrainEnd],
		[0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	// Funnel drain progress tracks the same arc
	const funnelDrainStart = sceneStarts[2] + 40;
	const funnelDrainEnd = sceneStarts[5] + scenes[5].durationInFrames;
	const funnelDrainProgress = interpolate(
		frame,
		[funnelDrainStart, funnelDrainEnd],
		[0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	const funnelStart = sceneStarts[2];
	const funnelDuration =
		sceneStarts[5] + scenes[5].durationInFrames - funnelStart;

	const lastScene = scenes.length - 1;

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{ transform: `translateX(${shakeOffset}px)` }}>
				<TransitionSeries>
					{scenes.flatMap((scene, i) => {
						const elements: React.ReactNode[] = [
							<TransitionSeries.Sequence
								key={`scene-${i}`}
								durationInFrames={scene.durationInFrames}
							>
								{renderSceneWithOverrides(scene, theme, i)}
							</TransitionSeries.Sequence>,
						];

						if (i < scenes.length - 1) {
							const style = SCENE_TRANSITIONS[i] ?? "fade";
							const isHardCut = style === "none";
							elements.push(
								<TransitionSeries.Transition
									key={`transition-${i}`}
									presentation={getPresentation(style)}
									timing={springTiming({
										durationInFrames: isHardCut ? 1 : transitionDuration,
									})}
								/>,
							);
						}

						return elements;
					})}
				</TransitionSeries>

				{/* Ambient dot grid — bleeds out as fans evaporate */}
				<Sequence from={0} durationInFrames={sceneStarts[6]}>
					<AbsoluteFill
						style={{
							opacity: 0.12,
							pointerEvents: "none",
							maskImage: CENTER_MASK,
							WebkitMaskImage: CENTER_MASK,
						}}
					>
						<DotGridBleed
							totalDots={400}
							cols={20}
							color={theme.primaryColor}
							vanishProgress={dotVanishProgress}
						/>
					</AbsoluteFill>
				</Sequence>

				{/* Hero SVG: funnel drain during stat arc (scenes 2–5) */}
				<Sequence from={funnelStart} durationInFrames={funnelDuration}>
					<AbsoluteFill
						style={{
							opacity: 0.35,
							pointerEvents: "none",
							maskImage: CENTER_MASK,
							WebkitMaskImage: CENTER_MASK,
						}}
					>
						<FunnelDrain
							drainProgress={funnelDrainProgress}
							inputColor={theme.primaryColor}
							outputColor="#3b82f6"
						/>
					</AbsoluteFill>
				</Sequence>

				{/* CrowdGrid behind 8k counter — fills up, gold */}
				<Sequence
					from={sceneStarts[2]}
					durationInFrames={scenes[2].durationInFrames}
				>
					<AbsoluteFill
						style={{
							opacity: 0.2,
							pointerEvents: "none",
							maskImage: CENTER_MASK,
							WebkitMaskImage: CENTER_MASK,
						}}
					>
						<CrowdGrid
							total={400}
							highlight={400}
							cols={20}
							color={theme.primaryColor}
							highlightColor={theme.primaryColor}
						/>
					</AbsoluteFill>
				</Sequence>

				{/* DecayBar during 98.7% — visual gut punch */}
				<Sequence
					from={sceneStarts[5]}
					durationInFrames={scenes[5].durationInFrames}
				>
					<AbsoluteFill
						style={{
							justifyContent: "flex-end",
							alignItems: "center",
							paddingBottom: 420,
							pointerEvents: "none",
						}}
					>
						<DecayBar
							fromValue={8000}
							toValue={100}
							fromColor={theme.primaryColor}
							toColor={theme.errorColor}
							width={700}
							barHeight={28}
						/>
					</AbsoluteFill>
				</Sequence>

				{/* QR / Text / NFC trio on final scene */}
				<Sequence
					from={sceneStarts[lastScene]}
					durationInFrames={scenes[lastScene].durationInFrames}
				>
					<AbsoluteFill
						style={{
							justifyContent: "flex-end",
							alignItems: "center",
							paddingBottom: 380,
							pointerEvents: "none",
						}}
					>
						<div
							style={{
								display: "flex",
								gap: 48,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<CaptureIcon delay={0}>
								<QrCodeGraphic
									size={160}
									color={theme.primaryColor}
									glowColor={theme.primaryColor}
								/>
							</CaptureIcon>
							<CaptureIcon delay={6}>
								<TextToJoinGraphic
									size={160}
									color={theme.primaryColor}
									glowColor={theme.primaryColor}
								/>
							</CaptureIcon>
							<CaptureIcon delay={12}>
								<NfcChipGraphic
									size={160}
									color={theme.primaryColor}
									glowColor={theme.primaryColor}
								/>
							</CaptureIcon>
						</div>
					</AbsoluteFill>
				</Sequence>
			</AbsoluteFill>

			<LinkInBio delayFrames={0} />

			{audioFile && (
				<Html5Audio
					src={staticFile(audioFile)}
					volume={(f) =>
						interpolate(f, [0, 30], [0, 1], {
							extrapolateRight: "clamp",
							extrapolateLeft: "clamp",
						})
					}
				/>
			)}
			<Html5Audio
				src={staticFile("FanEvaporationNumbersSong.mp3")}
				trimBefore={8 * fps}
				volume={(f) => {
					const fadeIn = interpolate(f, [0, 30], [0, 0.15], {
						extrapolateRight: "clamp",
						extrapolateLeft: "clamp",
					});
					const fadeOut = interpolate(
						f,
						[durationInFrames - 60, durationInFrames],
						[0.15, 0],
						{ extrapolateRight: "clamp", extrapolateLeft: "clamp" },
					);
					return Math.min(fadeIn, fadeOut);
				}}
			/>
		</AbsoluteFill>
	);
};

const CaptureIcon: React.FC<{
	delay: number;
	children: React.ReactNode;
}> = ({ delay, children }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const driver = spring({
		frame: frame - delay,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const opacity = interpolate(driver, [0, 1], [0, 1]);
	const y = interpolate(driver, [0, 1], [30, 0]);

	return (
		<div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>
	);
};

function renderSceneWithOverrides(
	scene: Scene,
	theme: VideoProps["theme"],
	index: number,
): React.ReactNode {
	const override = STAT_OVERRIDES[index];
	if (scene.type === "stat" && override) {
		return (
			<SceneBackground theme={theme}>
				<AbsoluteFill
					style={{
						justifyContent: "center",
						alignItems: "center",
						fontFamily: theme.fontFamily,
					}}
				>
					<GlassCard delay={0}>
						<NumberCounter
							target={scene.value}
							prefix={scene.prefix}
							suffix={scene.suffix}
							label={scene.label}
							color={override.color}
							fontSize={override.fontSize}
							countDuration={scene.countDuration}
						/>
					</GlassCard>
				</AbsoluteFill>
			</SceneBackground>
		);
	}
	return <SceneRenderer scene={scene} theme={theme} />;
}

function computeSceneStarts(
	scenes: VideoProps["scenes"],
	transitionDuration: number,
): number[] {
	const starts: number[] = [0];
	for (let i = 0; i < scenes.length - 1; i++) {
		const style = SCENE_TRANSITIONS[i] ?? "fade";
		const overlap = style === "none" ? 1 : transitionDuration;
		starts.push(starts[i] + scenes[i].durationInFrames - overlap);
	}
	return starts;
}

function getShakeOffset(frame: number, impactFrame: number): number {
	if (frame < impactFrame || frame >= impactFrame + SHAKE_FRAMES) return 0;
	const t = frame - impactFrame;
	const decay = 1 - t / SHAKE_FRAMES;
	return Math.sin(t * Math.PI * 2.5) * SHAKE_AMPLITUDE * decay;
}
