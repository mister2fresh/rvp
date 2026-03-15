import React from "react";
import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Series,
} from "remotion";
import type { KineticBeat as KineticBeatType } from "../types";

type KineticBeatProps = KineticBeatType & {
	durationInFrames: number;
};

const ENTER_FRAMES = 15;
const EXIT_FRAMES = 10;
const SPRING_CONFIG = { damping: 12, stiffness: 120, mass: 0.6 };

const BeatContent: React.FC<KineticBeatProps> = ({
	text,
	emphasisWord,
	emphasisColor = "#E8C547",
	fontSize = 80,
	animation = "spring-up",
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const driver = spring({ frame, fps, config: SPRING_CONFIG });
	const exitStart = durationInFrames - EXIT_FRAMES;
	const exitOpacity = interpolate(
		frame,
		[exitStart, durationInFrames],
		[1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	const entrance = getEntrance(animation, driver);

	const words = text.split(" ");

	return (
		<div
			style={{
				opacity: entrance.opacity * exitOpacity,
				transform: entrance.transform,
				fontSize,
				fontWeight: 800,
				fontFamily: "Bricolage Grotesque",
				color: "#ffffff",
				textAlign: "center",
				padding: "0 72px",
				width: "100%",
				boxSizing: "border-box",
				lineHeight: 1.2,
				textShadow: "0 4px 30px rgba(0,0,0,0.5)",
			}}
		>
			{words.map((word, i) => (
				<React.Fragment key={i}>
					{i > 0 && " "}
					<span
						style={{
							color:
								emphasisWord && word.toLowerCase() === emphasisWord.toLowerCase()
									? emphasisColor
									: "#ffffff",
						}}
					>
						{word}
					</span>
				</React.Fragment>
			))}
		</div>
	);
};

function getEntrance(
	animation: string,
	driver: number,
): { opacity: number; transform: string } {
	const opacity = interpolate(driver, [0, 1], [0, 1]);

	switch (animation) {
		case "scale-pop": {
			const scale = interpolate(driver, [0, 0.6, 1], [0.3, 1.05, 1]);
			return { opacity, transform: `scale(${scale})` };
		}
		case "slide-left": {
			const x = interpolate(driver, [0, 1], [-200, 0]);
			return { opacity, transform: `translateX(${x}px)` };
		}
		case "fade":
			return { opacity, transform: "none" };
		default: {
			// spring-up
			const y = interpolate(driver, [0, 1], [120, 0]);
			const scale = interpolate(driver, [0, 1], [0.8, 1]);
			return { opacity, transform: `translateY(${y}px) scale(${scale})` };
		}
	}
}

type KineticBeatsProps = {
	beats: KineticBeatType[];
};

export const KineticBeats: React.FC<KineticBeatsProps> = ({ beats }) => {
	return (
		<Series>
			{beats.map((beat, i) => {
				const dur = ENTER_FRAMES + (beat.holdFrames ?? 45) + EXIT_FRAMES;
				return (
					<Series.Sequence key={i} durationInFrames={dur}>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								width: "100%",
								height: "100%",
							}}
						>
							<BeatContent {...beat} durationInFrames={dur} />
						</div>
					</Series.Sequence>
				);
			})}
		</Series>
	);
};
