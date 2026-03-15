import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type AnimatedCalloutProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	borderColor?: string;
};

export const AnimatedCallout: React.FC<AnimatedCalloutProps> = ({
	x,
	y,
	width,
	height,
	label,
	borderColor = "#FF4444",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const driver = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 120 },
	});

	const opacity = interpolate(driver, [0, 1], [0, 1]);
	const scale = interpolate(driver, [0, 1], [0.85, 1]);
	const labelY = interpolate(driver, [0, 1], [20, 0]);

	return (
		<div
			style={{
				position: "absolute",
				left: x,
				top: y,
				width,
				height,
				opacity,
				transform: `scale(${scale})`,
				transformOrigin: "top left",
			}}
		>
			<div
				style={{
					width: "100%",
					height: "100%",
					border: `4px solid ${borderColor}`,
					borderRadius: 12,
					boxShadow: `0 0 24px ${borderColor}44`,
				}}
			/>
			<div
				style={{
					marginTop: 8,
					opacity,
					transform: `translateY(${labelY}px)`,
					fontSize: 28,
					fontWeight: 600,
					color: "#ffffff",
					textShadow: "0 2px 12px rgba(0,0,0,0.8)",
					whiteSpace: "nowrap",
				}}
			>
				{label}
			</div>
		</div>
	);
};
