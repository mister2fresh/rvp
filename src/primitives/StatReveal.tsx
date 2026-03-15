import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type StatRevealProps = {
	statLabel: string;
	statValue: string;
	contrastLabel: string;
	contrastValue: string;
	accentColor?: string;
	contrastColor?: string;
	textColor?: string;
};

export const StatReveal: React.FC<StatRevealProps> = ({
	statLabel,
	statValue,
	contrastLabel,
	contrastValue,
	accentColor = "#00FF88",
	contrastColor = "#FF6B6B",
	textColor = "rgba(255,255,255,0.8)",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Phase 1: stat appears (scale + fade)
	const statDriver = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 100 },
	});
	const statOpacity = interpolate(statDriver, [0, 1], [0, 1]);
	const statScale = interpolate(statDriver, [0, 1], [0.4, 1]);

	// Label fades in alongside stat
	const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	// Phase 2: contrast slams in after pause (high stiffness, low damping)
	const contrastDelay = 40;
	const contrastDriver = spring({
		frame: frame - contrastDelay,
		fps,
		config: { damping: 10, stiffness: 200, mass: 0.8 },
	});
	const contrastOpacity = interpolate(contrastDriver, [0, 1], [0, 1]);
	const contrastScale = interpolate(contrastDriver, [0, 1], [2, 1]);
	const contrastY = interpolate(contrastDriver, [0, 1], [-40, 0]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 30,
			}}
		>
			<div
				style={{
					fontSize: 40,
					fontWeight: 600,
					color: textColor,
					opacity: labelOpacity,
					textShadow: "0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				{statLabel}
			</div>
			<div
				style={{
					fontSize: 110,
					fontWeight: 800,
					fontFamily: "monospace",
					color: accentColor,
					opacity: statOpacity,
					transform: `scale(${statScale})`,
					textShadow: "0 4px 30px rgba(0,0,0,0.6)",
				}}
			>
				{statValue}
			</div>
			<div
				style={{
					fontSize: 36,
					fontWeight: 600,
					color: textColor,
					opacity: contrastOpacity,
					textShadow: "0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				{contrastLabel}
			</div>
			<div
				style={{
					fontSize: 120,
					fontWeight: 800,
					fontFamily: "monospace",
					color: contrastColor,
					opacity: contrastOpacity,
					transform: `scale(${contrastScale}) translateY(${contrastY}px)`,
					textShadow: "0 6px 40px rgba(0,0,0,0.7)",
				}}
			>
				{contrastValue}
			</div>
		</div>
	);
};
