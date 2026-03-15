import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type LinkInBioProps = {
	delayFrames?: number;
};

export const LinkInBio: React.FC<LinkInBioProps> = ({
	delayFrames = 90,
}) => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [delayFrames, delayFrames + 15], [0, 0.3], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<div
			style={{
				position: "absolute",
				bottom: 28,
				right: 36,
				fontSize: 24,
				fontWeight: 400,
				fontFamily: "Space Mono",
				color: "#ffffff",
				opacity,
				letterSpacing: "0.05em",
				textTransform: "uppercase",
			}}
		>
			afterset.net
		</div>
	);
};
