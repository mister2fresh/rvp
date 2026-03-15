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
import { CrowdGrid } from "../primitives/CrowdGrid";
import { DecayBar } from "../primitives/DecayBar";
import { QrCodeGraphic } from "../primitives/QrCodeGraphic";
import { TextToJoinGraphic } from "../primitives/TextToJoinGraphic";
import { NfcChipGraphic } from "../primitives/NfcChipGraphic";

const ENTER_FRAMES = 15;
const SHAKE_FRAMES = 8;
const SHAKE_AMPLITUDE = 5;
const FLASH_FRAMES = 6;
const IMPACT_SCENE_INDEX = 5;

const SCENE_TRANSITIONS: TransitionStyle[] = [
	"wipe",  // 0→1: hook → math
	"none",  // 1→2: math → 8k counter
	"wipe",  // 2→3: counter → question
	"none",  // 3→4: question → ~50 counter
	"wipe",  // 4→5: counter → 99% impact
	"wipe",  // 5→6: impact → solution
	"fade",  // 6→7: solution → CTA
];

export const TheMathProblem: React.FC<VideoProps> = ({
	scenes,
	theme,
	audioFile,
	transition,
}) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const transitionDuration = transition?.durationInFrames ?? 15;
	const sceneStarts = computeSceneStarts(scenes, transitionDuration);

	const impactFrame = sceneStarts[IMPACT_SCENE_INDEX] + ENTER_FRAMES;
	const shakeOffset = getShakeOffset(frame, impactFrame);
	const flashOpacity = getFlashOpacity(frame, impactFrame);

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

				{/* Scene 2–3: Crowd grid fills screen, vanishes during "reach tomorrow?" */}
				<Sequence
					from={sceneStarts[2]}
					durationInFrames={
						scenes[2].durationInFrames + scenes[3].durationInFrames
					}
				>
					<AbsoluteFill
						style={{
							opacity: 0.25,
							pointerEvents: "none",
						}}
					>
						<CrowdGrid
							total={600}
							highlight={600}
							cols={30}
							color={theme.primaryColor}
							highlightColor={theme.primaryColor}
							vanishFrom={scenes[2].durationInFrames}
							vanishDuration={scenes[3].durationInFrames - 10}
						/>
					</AbsoluteFill>
				</Sequence>

				{/* Scene 4–5: Decay bar spanning ~50 counter and 99% impact */}
				<Sequence
					from={sceneStarts[4]}
					durationInFrames={
						scenes[4].durationInFrames + scenes[5].durationInFrames
					}
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
							toValue={50}
							fromColor={theme.primaryColor}
							toColor={theme.errorColor}
							width={700}
							barHeight={32}
						/>
					</AbsoluteFill>
				</Sequence>

				{/* Scene 6: QR / Text / NFC trio */}
				<Sequence
					from={sceneStarts[6]}
					durationInFrames={scenes[6].durationInFrames}
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
			</AbsoluteFill>

			{flashOpacity > 0 && (
				<AbsoluteFill
					style={{
						backgroundColor: "white",
						opacity: flashOpacity,
						pointerEvents: "none",
					}}
				/>
			)}

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
				src={staticFile("v1-math-problem-bg.mp3")}
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
	return Math.sin(t * Math.PI * 2.5) * SHAKE_AMPLITUDE * decay;
}

function getFlashOpacity(frame: number, impactFrame: number): number {
	if (frame < impactFrame || frame >= impactFrame + FLASH_FRAMES) return 0;
	return interpolate(frame, [impactFrame, impactFrame + FLASH_FRAMES], [0.35, 0], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
}
