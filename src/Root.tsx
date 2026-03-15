import React from "react";
import { Composition } from "remotion";
import type { VideoProps } from "./types";
import { VideoPropsSchema, ScreenRecordingPropsSchema } from "./types";
import { aftersetTheme } from "./themes/afterset";
import { KineticTextVideo } from "./templates/KineticTextVideo";
import { StatRevealVideo } from "./templates/StatRevealVideo";
import { ScreenRecordingVideo } from "./templates/ScreenRecordingVideo";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const MIN_DURATION = 150; // 5 seconds minimum

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="AftersetKineticText"
				component={KineticTextVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: [],
					theme: aftersetTheme,
				}}
				calculateMetadata={({ props }) => {
					const total = props.scenes.reduce(
						(sum: number, s: { durationInFrames: number }) =>
							sum + s.durationInFrames,
						0,
					);
					return {
						durationInFrames: Math.max(total, MIN_DURATION),
					};
				}}
			/>
			<Composition
				id="AftersetStatReveal"
				component={StatRevealVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: [],
					theme: aftersetTheme,
				}}
				calculateMetadata={({ props }) => {
					const total = props.scenes.reduce(
						(sum: number, s: { durationInFrames: number }) =>
							sum + s.durationInFrames,
						0,
					);
					return {
						durationInFrames: Math.max(total, MIN_DURATION),
					};
				}}
			/>
			<Composition
				id="AftersetScreenRecording"
				component={ScreenRecordingVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={ScreenRecordingPropsSchema}
				defaultProps={{
					videoSrc: "demo.mp4",
					callouts: [],
					theme: aftersetTheme,
				}}
				calculateMetadata={({ props }) => {
					const lastEnd = props.callouts.reduce(
						(max: number, c: { fromFrame: number; durationInFrames: number }) =>
							Math.max(max, c.fromFrame + c.durationInFrames),
						0,
					);
					return {
						durationInFrames: Math.max(lastEnd, MIN_DURATION),
					};
				}}
			/>
		</>
	);
};
