import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type NfcChipGraphicProps = {
	size?: number;
	color?: string;
	glowColor?: string;
};

export const NfcChipGraphic: React.FC<NfcChipGraphicProps> = ({
	size = 240,
	color = "#E8C547",
	glowColor = "#E8C547",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const chipDriver = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 100 },
	});
	const chipScale = interpolate(chipDriver, [0, 1], [0.6, 1]);
	const chipOpacity = interpolate(chipDriver, [0, 1], [0, 1]);

	const cx = size / 2;
	const cy = size / 2;

	const arcs = [
		{ radius: 36, delay: 8 },
		{ radius: 54, delay: 14 },
		{ radius: 72, delay: 20 },
	];

	const glowOpacity = interpolate(chipDriver, [0, 0.5, 1], [0, 0.5, 0.3]);

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			style={{
				overflow: "visible",
				filter: `drop-shadow(0 0 ${20 * glowOpacity}px ${glowColor})`,
			}}
		>
			{/* Center chip */}
			<g
				opacity={chipOpacity}
				transform={`translate(${cx}, ${cy}) scale(${chipScale}) translate(${-cx}, ${-cy})`}
			>
				{/* Chip body */}
				<rect
					x={cx - 18}
					y={cy - 18}
					width={36}
					height={36}
					rx={6}
					fill="none"
					stroke={color}
					strokeWidth={2.5}
				/>
				{/* Chip inner circuit lines */}
				<rect
					x={cx - 8}
					y={cy - 8}
					width={16}
					height={16}
					rx={3}
					fill={color}
					opacity={0.4}
				/>
				{/* Contact pads */}
				<line
					x1={cx - 18}
					y1={cy - 6}
					x2={cx - 24}
					y2={cy - 6}
					stroke={color}
					strokeWidth={2}
					opacity={0.5}
				/>
				<line
					x1={cx - 18}
					y1={cy + 6}
					x2={cx - 24}
					y2={cy + 6}
					stroke={color}
					strokeWidth={2}
					opacity={0.5}
				/>
				<line
					x1={cx + 18}
					y1={cy - 6}
					x2={cx + 24}
					y2={cy - 6}
					stroke={color}
					strokeWidth={2}
					opacity={0.5}
				/>
				<line
					x1={cx + 18}
					y1={cy + 6}
					x2={cx + 24}
					y2={cy + 6}
					stroke={color}
					strokeWidth={2}
					opacity={0.5}
				/>
			</g>

			{/* Radio wave arcs */}
			{arcs.map(({ radius, delay }, i) => {
				const arcDriver = spring({
					frame: frame - delay,
					fps,
					config: { damping: 12, stiffness: 120 },
				});
				const arcOpacity = interpolate(arcDriver, [0, 1], [0, 0.7 - i * 0.15]);
				const arcScale = interpolate(arcDriver, [0, 1], [0.5, 1]);

				return (
					<g
						key={i}
						opacity={arcOpacity}
						transform={`translate(${cx}, ${cy}) scale(${arcScale}) translate(${-cx}, ${-cy})`}
					>
						<path
							d={describeArc(cx + 20, cy - 20, radius, -45, 45)}
							fill="none"
							stroke={color}
							strokeWidth={3}
							strokeLinecap="round"
						/>
					</g>
				);
			})}
		</svg>
	);
};

function describeArc(
	cx: number,
	cy: number,
	r: number,
	startAngle: number,
	endAngle: number,
): string {
	const rad = (deg: number) => (deg * Math.PI) / 180;
	const x1 = cx + r * Math.cos(rad(startAngle));
	const y1 = cy + r * Math.sin(rad(startAngle));
	const x2 = cx + r * Math.cos(rad(endAngle));
	const y2 = cy + r * Math.sin(rad(endAngle));
	const largeArc = endAngle - startAngle > 180 ? 1 : 0;
	return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
