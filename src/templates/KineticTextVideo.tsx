import React from "react";
import { AbsoluteFill, Html5Audio, interpolate, staticFile } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { springTiming } from "@remotion/transitions";
import type { VideoProps } from "../types";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { LinkInBio } from "../primitives/LinkInBio";
import { getPresentation } from "../primitives/getTransition";

export const KineticTextVideo: React.FC<VideoProps> = ({
	scenes,
	theme,
	audioFile,
	transition,
}) => {
	const style = transition?.style ?? "fade";
	const transitionDuration = transition?.durationInFrames ?? 15;
	const presentation = getPresentation(style);

	return (
		<AbsoluteFill>
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
						elements.push(
							<TransitionSeries.Transition
								key={`transition-${i}`}
								presentation={presentation}
								timing={springTiming({
									durationInFrames: transitionDuration,
								})}
							/>,
						);
					}

					return elements;
				})}
			</TransitionSeries>

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
