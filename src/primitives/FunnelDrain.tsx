import React from "react";
import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
} from "remotion";
import { random } from "remotion";

type FunnelDrainProps = {
	drainProgress: number;
	inputColor: string;
	outputColor: string;
};

const W = 400;
const H = 800;
const TOP_Y = 40;
const NECK_Y = 480;
const BASIN_TOP = 540;
const BASIN_BOT = 740;
const TOP_LEFT = 30;
const TOP_RIGHT = 370;
const NECK_LEFT = 165;
const NECK_RIGHT = 235;
const BASIN_LEFT = 140;
const BASIN_RIGHT = 260;

const INPUT_DOTS = 120;
const OUTPUT_DOTS = 4;
const DOT_R = 5;

function lerp(
	v: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number,
): number {
	return outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}

const inputDots = Array.from({ length: INPUT_DOTS }, (_, i) => {
	const y = TOP_Y + 10 + random(`fy-${i}`) * (NECK_Y - TOP_Y - 40);
	const left = lerp(y, TOP_Y, NECK_Y, TOP_LEFT + 15, NECK_LEFT + 10);
	const right = lerp(y, TOP_Y, NECK_Y, TOP_RIGHT - 15, NECK_RIGHT - 10);
	const x = left + random(`fx-${i}`) * (right - left);
	return { x, y };
});

const outputDots = Array.from({ length: OUTPUT_DOTS }, (_, i) => ({
	x: BASIN_LEFT + 20 + random(`bx-${i}`) * (BASIN_RIGHT - BASIN_LEFT - 40),
	y: BASIN_TOP + 20 + random(`by-${i}`) * (BASIN_BOT - BASIN_TOP - 40),
}));

const WALL_PATH = [
	`M ${TOP_LEFT} ${TOP_Y}`,
	`L ${NECK_LEFT} ${NECK_Y}`,
	`L ${BASIN_LEFT} ${BASIN_TOP}`,
	`L ${BASIN_LEFT} ${BASIN_BOT}`,
	`L ${BASIN_RIGHT} ${BASIN_BOT}`,
	`L ${BASIN_RIGHT} ${BASIN_TOP}`,
	`L ${NECK_RIGHT} ${NECK_Y}`,
	`L ${TOP_RIGHT} ${TOP_Y}`,
].join(" ");

export const FunnelDrain: React.FC<FunnelDrainProps> = ({
	drainProgress,
	inputColor,
	outputColor,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const entryDriver = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const wallOpacity = interpolate(entryDriver, [0, 1], [0, 0.2]);

	const fillDriver = spring({
		frame,
		fps,
		config: { damping: 30, stiffness: 60 },
	});
	const filledCount = Math.round(
		interpolate(fillDriver, [0, 1], [0, INPUT_DOTS]),
	);

	const vanishedCount = Math.round(drainProgress * INPUT_DOTS);

	const vanishSet = React.useMemo(() => {
		const order = Array.from({ length: INPUT_DOTS }, (_, i) => ({
			index: i,
			sort: random(`fv-${i}`),
		}));
		order.sort((a, b) => a.sort - b.sort);
		return new Set(order.slice(0, vanishedCount).map((o) => o.index));
	}, [vanishedCount]);

	const outputOpacity = interpolate(drainProgress, [0.3, 0.7], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	const neckGlow = interpolate(drainProgress, [0, 0.5, 1], [0, 0.25, 0.05], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid meet"
			style={{ overflow: "visible" }}
		>
			<path
				d={WALL_PATH}
				fill="none"
				stroke="rgba(255,255,255,0.12)"
				strokeWidth={1.5}
				opacity={wallOpacity > 0 ? 1 : 0}
			/>

			{inputDots.map((dot, i) => {
				const visible = i < filledCount && !vanishSet.has(i);
				return (
					<circle
						key={`in-${i}`}
						cx={dot.x}
						cy={dot.y}
						r={DOT_R}
						fill={inputColor}
						opacity={visible ? 0.7 : 0}
					/>
				);
			})}

			{outputDots.map((dot, i) => (
				<circle
					key={`out-${i}`}
					cx={dot.x}
					cy={dot.y}
					r={DOT_R}
					fill={outputColor}
					opacity={outputOpacity}
				/>
			))}

			<ellipse
				cx={(NECK_LEFT + NECK_RIGHT) / 2}
				cy={NECK_Y}
				rx={25}
				ry={8}
				fill={inputColor}
				opacity={neckGlow}
			/>
		</svg>
	);
};
