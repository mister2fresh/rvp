import React from "react";
import {
	AbsoluteFill,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Html5Audio,
	staticFile,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import type { VideoProps, TransitionStyle } from "../types";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { LinkInBio } from "../primitives/LinkInBio";
import { getPresentation } from "../primitives/getTransition";
import { CountdownRing } from "../primitives/CountdownRing";
import { CrowdGrid } from "../primitives/CrowdGrid";
import { QrCodeGraphic } from "../primitives/QrCodeGraphic";
import { TextToJoinGraphic } from "../primitives/TextToJoinGraphic";
import { NfcChipGraphic } from "../primitives/NfcChipGraphic";

const SHAKE_FRAMES = 12;
const SHAKE_AMPLITUDE = 3.5;
const GUT_PUNCH_SCENE = 3;
const ENTER_FRAMES = 15;

const SCENE_TRANSITIONS: TransitionStyle[] = [
	"fade",  // 0→1: "15 minutes" → "fans feeling it" (warm continuation)
	"none",  // 1→2: feeling it → "but you don't ask" (hard cut = silence)
	"fade",  // 2→3: don't ask → "48 hours later" (slow dread)
	"none",  // 3→4: forgot name → "no tool exists" (hard cut = pivot)
	"fade",  // 4→5: no tool → "until now" (resolution)
];

export const FifteenMinuteWindow: React.FC<VideoProps> = ({
	scenes,
	theme,
	audioFile,
	transition,
}) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const transitionDuration = transition?.durationInFrames ?? 15;
	const sceneStarts = computeSceneStarts(scenes, transitionDuration);

	// Shake on "forgot your name" — softer and longer decay than Video 1
	// Beat 2 of scene 3: beat 1 takes ~(15 enter + 35 hold + 10 exit) = 60 frames
	const gutPunchFrame = sceneStarts[GUT_PUNCH_SCENE] + 60 + ENTER_FRAMES;
	const shakeOffset = getShakeOffset(frame, gutPunchFrame);

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
								<SceneRenderer scene={scene} theme={theme} />
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

				{/* Scenes 0–1: CountdownRing at bottom of frame, below text */}
				<Sequence
					from={sceneStarts[0]}
					durationInFrames={
						scenes[0].durationInFrames + scenes[1].durationInFrames
					}
				>
					<AbsoluteFill
						style={{
							justifyContent: "flex-end",
							alignItems: "center",
							paddingBottom: 260,
							pointerEvents: "none",
							opacity: 0.3,
						}}
					>
						<CountdownRing
							size={340}
							color={theme.primaryColor}
							depletedColor={theme.errorColor}
							glowColor={theme.primaryColor}
							depleteFrom={40}
							depleteDuration={scenes[0].durationInFrames + scenes[1].durationInFrames - 50}
						/>
					</AbsoluteFill>
				</Sequence>

				{/* Scenes 2–3: CrowdGrid split top/bottom, clearing center for text */}
				<Sequence
					from={sceneStarts[2]}
					durationInFrames={
						scenes[2].durationInFrames + scenes[3].durationInFrames
					}
				>
					<AbsoluteFill
						style={{
							pointerEvents: "none",
							opacity: 0.15,
							maskImage:
								"linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)",
							WebkitMaskImage:
								"linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 100%)",
						}}
					>
						<CrowdGrid
							total={400}
							highlight={400}
							cols={20}
							color={theme.errorColor}
							highlightColor={theme.errorColor}
							vanishFrom={scenes[2].durationInFrames - 10}
							vanishDuration={scenes[3].durationInFrames - 20}
						/>
					</AbsoluteFill>
				</Sequence>
			</AbsoluteFill>

			{/* Last scene: QR / Text / NFC trio springs in with "Link in bio" */}
			<Sequence
				from={sceneStarts[scenes.length - 1] + 40}
				durationInFrames={scenes[scenes.length - 1].durationInFrames - 40}
			>
				<AbsoluteFill
					style={{
						justifyContent: "flex-end",
						alignItems: "center",
						paddingBottom: 300,
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
				src={staticFile("FifteenMinuteWindowSong.mp3")}
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
	// Slower frequency, lower amplitude than Video 1 — dread, not explosion
	return Math.sin(t * Math.PI * 1.8) * SHAKE_AMPLITUDE * decay;
}
