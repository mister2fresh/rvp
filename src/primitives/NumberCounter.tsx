import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type NumberCounterProps = {
	target: number;
	prefix?: string;
	suffix?: string;
	label: string;
	color?: string;
};

export const NumberCounter: React.FC<NumberCounterProps> = ({
	target,
	prefix = "",
	suffix = "",
	label,
	color = "#00FF88",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const progress = spring({
		frame,
		fps,
		config: { damping: 60, stiffness: 80 },
	});

	const num = Math.floor(interpolate(progress, [0, 1], [0, target]));

	const labelOpacity = interpolate(frame, [10, 25], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 20,
			}}
		>
			<div
				style={{
					fontSize: 96,
					fontWeight: 800,
					color,
					textShadow: "0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				{prefix}
				{num.toLocaleString()}
				{suffix}
			</div>
			<div
				style={{
					fontSize: 40,
					color: "rgba(255,255,255,0.8)",
					opacity: labelOpacity,
					textShadow: "0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				{label}
			</div>
		</div>
	);
};
