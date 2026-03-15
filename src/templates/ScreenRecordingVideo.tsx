import React from "react";
import {
	AbsoluteFill,
	Html5Audio,
	OffthreadVideo,
	Sequence,
	interpolate,
	staticFile,
} from "remotion";
import type { ScreenRecordingProps } from "../types";
import { AnimatedCallout } from "../primitives/AnimatedCallout";
import { LinkInBio } from "../primitives/LinkInBio";

export const ScreenRecordingVideo: React.FC<ScreenRecordingProps> = ({
	videoSrc,
	callouts,
	theme,
	audioFile,
	ctaText,
}) => {
	return (
		<AbsoluteFill style={{ backgroundColor: "#000000" }}>
			<OffthreadVideo
				src={staticFile(videoSrc)}
				style={{ width: "100%", height: "100%", objectFit: "contain" }}
			/>

			{callouts.map((callout, i) => (
				<Sequence
					key={i}
					from={callout.fromFrame}
					durationInFrames={callout.durationInFrames}
				>
					<AnimatedCallout
						x={callout.x}
						y={callout.y}
						width={callout.width}
						height={callout.height}
						label={callout.label}
						borderColor={callout.borderColor ?? theme.accentColor}
					/>
				</Sequence>
			))}

			{ctaText && (
				<div
					style={{
						position: "absolute",
						bottom: 60,
						width: "100%",
						textAlign: "center",
						fontSize: 32,
						fontWeight: 700,
						color: theme.textColor,
						fontFamily: theme.fontFamily,
						textShadow: "0 2px 16px rgba(0,0,0,0.7)",
					}}
				>
					{ctaText}
				</div>
			)}

			<LinkInBio />

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
		</AbsoluteFill>
	);
};
