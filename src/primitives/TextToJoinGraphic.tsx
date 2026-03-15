import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type TextToJoinGraphicProps = {
	size?: number;
	color?: string;
	glowColor?: string;
};

export const TextToJoinGraphic: React.FC<TextToJoinGraphicProps> = ({
	size = 240,
	color = "#E8C547",
	glowColor = "#E8C547",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const phoneDriver = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 100 },
	});
	const phoneScale = interpolate(phoneDriver, [0, 1], [0.7, 1]);
	const phoneOpacity = interpolate(phoneDriver, [0, 1], [0, 1]);

	const bubbleDriver = spring({
		frame: frame - 12,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const bubbleScale = interpolate(bubbleDriver, [0, 1], [0, 1]);
	const bubbleOpacity = interpolate(bubbleDriver, [0, 1], [0, 1]);

	const glowOpacity = interpolate(bubbleDriver, [0, 0.5, 1], [0, 0.5, 0.3]);

	const w = size;
	const h = size;
	const phoneW = w * 0.5;
	const phoneH = h * 0.8;
	const phoneX = (w - phoneW) / 2;
	const phoneY = (h - phoneH) / 2;

	return (
		<svg
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			style={{
				overflow: "visible",
				filter: `drop-shadow(0 0 ${20 * glowOpacity}px ${glowColor})`,
			}}
		>
			{/* Phone body */}
			<g
				opacity={phoneOpacity}
				transform={`translate(${w / 2}, ${h / 2}) scale(${phoneScale}) translate(${-w / 2}, ${-h / 2})`}
			>
				<rect
					x={phoneX}
					y={phoneY}
					width={phoneW}
					height={phoneH}
					rx={16}
					fill="none"
					stroke={color}
					strokeWidth={3}
					opacity={0.6}
				/>
				{/* Screen area */}
				<rect
					x={phoneX + 8}
					y={phoneY + 24}
					width={phoneW - 16}
					height={phoneH - 48}
					rx={4}
					fill={color}
					opacity={0.06}
				/>
				{/* Top notch */}
				<rect
					x={w / 2 - 16}
					y={phoneY + 6}
					width={32}
					height={6}
					rx={3}
					fill={color}
					opacity={0.3}
				/>
			</g>

			{/* Chat bubble */}
			<g
				opacity={bubbleOpacity}
				transform={`translate(${w / 2}, ${h * 0.42}) scale(${bubbleScale}) translate(${-w / 2}, ${-h * 0.42})`}
			>
				<rect
					x={phoneX + 16}
					y={h * 0.32}
					width={phoneW - 32}
					height={28}
					rx={8}
					fill={color}
					opacity={0.2}
				/>
				<text
					x={w / 2}
					y={h * 0.32 + 19}
					textAnchor="middle"
					fontSize={13}
					fontFamily="Space Mono"
					fontWeight={700}
					fill={color}
				>
					JOIN
				</text>
			</g>
		</svg>
	);
};
