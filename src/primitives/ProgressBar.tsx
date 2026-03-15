import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type ProgressBarProps = {
	percentage: number;
	label: string;
	color?: string;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
	percentage,
	label,
	color = "#00FF88",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const driver = spring({
		frame,
		fps,
		config: { damping: 50, stiffness: 60 },
	});

	const width = interpolate(driver, [0, 1], [0, percentage]);
	const labelOpacity = interpolate(frame, [5, 20], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 16,
				padding: "0 60px",
				width: "100%",
			}}
		>
			<div
				style={{
					fontSize: 40,
					color: "rgba(255,255,255,0.9)",
					opacity: labelOpacity,
					textShadow: "0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				{label}
			</div>
			<div
				style={{
					width: "100%",
					height: 32,
					borderRadius: 16,
					background: "rgba(255,255,255,0.15)",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						width: `${width}%`,
						height: "100%",
						borderRadius: 16,
						background: color,
					}}
				/>
			</div>
			<div
				style={{
					fontSize: 36,
					fontWeight: 700,
					color,
					textAlign: "right",
					textShadow: "0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				{Math.round(width)}%
			</div>
		</div>
	);
};
