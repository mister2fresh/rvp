import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type DecayBarProps = {
	fromValue: number;
	toValue: number;
	fromColor?: string;
	toColor?: string;
	barHeight?: number;
	width?: number;
	label?: string;
};

export const DecayBar: React.FC<DecayBarProps> = ({
	fromValue,
	toValue,
	fromColor = "#E8C547",
	toColor = "#ef4444",
	barHeight = 48,
	width = 800,
	label,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const fillDriver = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const fillWidth = interpolate(fillDriver, [0, 1], [0, width]);

	const decayDriver = spring({
		frame: frame - 30,
		fps,
		config: { damping: 20, stiffness: 80 },
	});
	const ratio = toValue / fromValue;
	const decayWidth = interpolate(
		decayDriver,
		[0, 1],
		[fillWidth, width * ratio],
	);

	const currentWidth = frame < 30 ? fillWidth : decayWidth;

	const glowOpacity = interpolate(decayDriver, [0, 0.5, 1], [0, 0.6, 0.2]);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			{label && (
				<div
					style={{
						fontSize: 22,
						fontFamily: "Space Mono",
						color: "rgba(255,255,255,0.5)",
						textTransform: "uppercase",
						letterSpacing: "0.1em",
					}}
				>
					{label}
				</div>
			)}
			<svg width={width} height={barHeight} style={{ overflow: "visible" }}>
				{/* Track */}
				<rect
					x={0}
					y={0}
					width={width}
					height={barHeight}
					rx={barHeight / 2}
					fill="rgba(255,255,255,0.06)"
				/>
				{/* Fill */}
				<rect
					x={0}
					y={0}
					width={Math.max(0, currentWidth)}
					height={barHeight}
					rx={barHeight / 2}
					fill={frame < 30 ? fromColor : toColor}
					style={{
						filter: `drop-shadow(0 0 ${20 * glowOpacity}px ${toColor})`,
					}}
				/>
			</svg>
		</div>
	);
};
