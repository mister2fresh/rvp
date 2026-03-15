import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import type { VideoProps } from "../types";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { LinkInBio } from "../primitives/LinkInBio";

export const StatRevealVideo: React.FC<VideoProps> = ({
	scenes,
	theme,
	audioFile,
}) => {
	let frameOffset = 0;

	return (
		<AbsoluteFill style={{ backgroundColor: theme.backgroundColor }}>
			{scenes.map((scene, i) => {
				const from = frameOffset;
				frameOffset += scene.durationInFrames;
				return (
					<Sequence
						key={i}
						from={from}
						durationInFrames={scene.durationInFrames}
					>
						<SceneRenderer scene={scene} theme={theme} />
					</Sequence>
				);
			})}

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
