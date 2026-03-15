import React from "react";
import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
} from "remotion";

type CountdownRingProps = {
	size?: number;
	color?: string;
	depletedColor?: string;
	glowColor?: string;
	depleteFrom?: number;
	depleteDuration?: number;
};

const STROKE_WIDTH = 10;

export const CountdownRing: React.FC<CountdownRingProps> = ({
	size = 280,
	color = "#E8C547",
	depletedColor = "#ef4444",
	glowColor = "#E8C547",
	depleteFrom = 0,
	depleteDuration = 90,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const radius = (size - STROKE_WIDTH) / 2;
	const circumference = 2 * Math.PI * radius;
	const cx = size / 2;
	const cy = size / 2;

	// Entrance: ring draws itself in
	const enterDriver = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const enterOpacity = interpolate(enterDriver, [0, 1], [0, 1]);
	const enterScale = interpolate(enterDriver, [0, 1], [0.7, 1]);

	// Depletion: ring empties over time
	const depleteDriver = spring({
		frame: frame - depleteFrom,
		fps,
		config: { damping: 60, stiffness: 40 },
		durationInFrames: depleteDuration,
	});
	const dashOffset = interpolate(
		depleteDriver,
		[0, 1],
		[0, circumference],
	);

	// Color shifts from gold to red as ring depletes
	const ringColor = depleteDriver > 0.6 ? depletedColor : color;

	// Glow pulses then fades with depletion
	const glowStrength = interpolate(
		depleteDriver,
		[0, 0.3, 0.7, 1],
		[12, 18, 10, 0],
		{ extrapolateRight: "clamp" },
	);

	// Tick marks around the ring (like a clock face)
	const tickCount = 12;
	const ticks = Array.from({ length: tickCount }, (_, i) => {
		const angle = (i / tickCount) * 360 - 90;
		const rad = (angle * Math.PI) / 180;
		const isMajor = i % 3 === 0;
		const innerR = radius - (isMajor ? 18 : 12);
		const outerR = radius - 4;
		return {
			x1: cx + innerR * Math.cos(rad),
			y1: cy + innerR * Math.sin(rad),
			x2: cx + outerR * Math.cos(rad),
			y2: cy + outerR * Math.sin(rad),
			isMajor,
		};
	});

	return (
		<div
			style={{
				opacity: enterOpacity,
				transform: `scale(${enterScale})`,
				width: size,
				height: size,
			}}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				style={{ overflow: "visible" }}
			>
				<defs>
					<filter id="countdown-glow">
						<feDropShadow
							dx={0}
							dy={0}
							stdDeviation={glowStrength}
							floodColor={glowColor}
							floodOpacity={0.6}
						/>
					</filter>
				</defs>

				{/* Track (dim background ring) */}
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="none"
					stroke="rgba(255,255,255,0.06)"
					strokeWidth={STROKE_WIDTH}
				/>

				{/* Active ring (depletes) */}
				<circle
					cx={cx}
					cy={cy}
					r={radius}
					fill="none"
					stroke={ringColor}
					strokeWidth={STROKE_WIDTH}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					transform={`rotate(-90 ${cx} ${cy})`}
					filter="url(#countdown-glow)"
				/>

				{/* Clock tick marks */}
				{ticks.map((tick, i) => {
					const tickOpacity = interpolate(
						enterDriver,
						[0, 0.5, 1],
						[0, 0, tick.isMajor ? 0.5 : 0.25],
						{ extrapolateRight: "clamp" },
					);
					return (
						<line
							key={i}
							x1={tick.x1}
							y1={tick.y1}
							x2={tick.x2}
							y2={tick.y2}
							stroke="rgba(255,255,255,1)"
							strokeWidth={tick.isMajor ? 2.5 : 1.5}
							opacity={tickOpacity}
							strokeLinecap="round"
						/>
					);
				})}
			</svg>
		</div>
	);
};
