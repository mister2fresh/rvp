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
	accentColor = "#E8C547",
	contrastColor = "#3b82f6",
	textColor = "rgba(255,255,255,0.7)",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const statDriver = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const statOpacity = interpolate(statDriver, [0, 1], [0, 1]);
	const statScale = interpolate(statDriver, [0, 1], [0.4, 1]);

	const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	const contrastDelay = 40;
	const contrastDriver = spring({
		frame: frame - contrastDelay,
		fps,
		config: { damping: 10, stiffness: 200, mass: 0.8 },
	});
	const contrastOpacity = interpolate(contrastDriver, [0, 1], [0, 1]);
	const contrastScale = interpolate(contrastDriver, [0, 1], [2, 1]);
	const contrastY = interpolate(contrastDriver, [0, 1], [-40, 0]);

	const glowOpacity = interpolate(statDriver, [0, 0.5, 1], [0, 0.5, 0.3]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 28,
			}}
		>
			<div
				style={{
					fontSize: 26,
					fontWeight: 400,
					fontFamily: "Space Mono",
					color: textColor,
					opacity: labelOpacity,
					textTransform: "uppercase",
					letterSpacing: "0.15em",
				}}
			>
				{statLabel}
			</div>
			<div
				style={{
					fontSize: 110,
					fontWeight: 800,
					fontFamily: "Bricolage Grotesque",
					color: accentColor,
					opacity: statOpacity,
					transform: `scale(${statScale})`,
					textShadow: `0 0 60px ${accentColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}`,
					lineHeight: 1,
				}}
			>
				{statValue}
			</div>
			<div
				style={{
					fontSize: 26,
					fontWeight: 400,
					fontFamily: "Space Mono",
					color: textColor,
					opacity: contrastOpacity,
					textTransform: "uppercase",
					letterSpacing: "0.15em",
					marginTop: 16,
				}}
			>
				{contrastLabel}
			</div>
			<div
				style={{
					fontSize: 120,
					fontWeight: 800,
					fontFamily: "Bricolage Grotesque",
					color: contrastColor,
					opacity: contrastOpacity,
					transform: `scale(${contrastScale}) translateY(${contrastY}px)`,
					textShadow: `0 0 60px ${contrastColor}40`,
					lineHeight: 1,
				}}
			>
				{contrastValue}
			</div>
		</div>
	);
};
