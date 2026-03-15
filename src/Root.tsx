import React from "react";
import { Composition } from "remotion";
import type { VideoProps } from "./types";
import { VideoPropsSchema } from "./types";
import { aftersetTheme } from "./themes/afterset";
import { KineticTextVideo } from "./templates/KineticTextVideo";

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
		</>
	);
};
