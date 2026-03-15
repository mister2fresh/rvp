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
	color = "#E8C547",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const progress = spring({
		frame,
		fps,
		config: { damping: 60, stiffness: 80 },
	});

	const num = Math.floor(interpolate(progress, [0, 1], [0, target]));

	const labelDriver = spring({
		frame: frame - 5,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const labelOpacity = interpolate(labelDriver, [0, 1], [0, 1]);
	const labelY = interpolate(labelDriver, [0, 1], [20, 0]);

	// Glow pulse that follows the count
	const glowOpacity = interpolate(progress, [0, 0.5, 1], [0, 0.6, 0.3]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 24,
			}}
		>
			<div
				style={{
					opacity: labelOpacity,
					transform: `translateY(${labelY}px)`,
					fontSize: 28,
					fontFamily: "Space Mono",
					fontWeight: 400,
					color: "rgba(255, 255, 255, 0.5)",
					textTransform: "uppercase",
					letterSpacing: "0.15em",
				}}
			>
				{label}
			</div>
			<div
				style={{
					fontSize: 120,
					fontWeight: 800,
					fontFamily: "Bricolage Grotesque",
					color,
					textShadow: `0 0 60px ${color}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}, 0 4px 20px rgba(0,0,0,0.5)`,
					lineHeight: 1,
				}}
			>
				{prefix}
				{num.toLocaleString()}
				{suffix}
			</div>
		</div>
	);
};
