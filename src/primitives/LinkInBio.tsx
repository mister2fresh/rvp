import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

type LinkInBioProps = {
	delayFrames?: number;
};

export const LinkInBio: React.FC<LinkInBioProps> = ({
	delayFrames = 90,
}) => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [delayFrames, delayFrames + 15], [0, 0.6], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<div
			style={{
				position: "absolute",
				bottom: 24,
				right: 32,
				fontSize: 24,
				fontWeight: 600,
				color: "#ffffff",
				opacity,
				textShadow: "0 2px 8px rgba(0,0,0,0.8)",
				fontFamily: "Inter",
			}}
		>
			Link in bio
		</div>
	);
};
