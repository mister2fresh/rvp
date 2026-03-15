import React from "react";
import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
} from "remotion";
import { random } from "remotion";

type CrowdGridProps = {
	total: number;
	highlight: number;
	color?: string;
	highlightColor?: string;
	dimColor?: string;
	cols?: number;
	vanishFrom?: number;
	vanishDuration?: number;
};

const PERSON_PATH =
	"M12 12c2.7 0 5-2.3 5-5S14.7 2 12 2 7 4.3 7 7s2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z";

const PATH_SIZE = 24;

export const CrowdGrid: React.FC<CrowdGridProps> = ({
	total,
	highlight,
	color = "#E8C547",
	highlightColor = "#E8C547",
	dimColor = "rgba(255,255,255,0.08)",
	cols = 30,
	vanishFrom,
	vanishDuration = 40,
}) => {
	const frame = useCurrentFrame();
	const { fps, width: canvasW, height: canvasH } = useVideoConfig();

	const rows = Math.ceil(total / cols);
	const displayCount = Math.min(total, rows * cols);

	const cellW = canvasW / cols;
	const cellH = canvasH / rows;
	const cellSize = Math.min(cellW, cellH);
	const scale = (cellSize * 0.85) / PATH_SIZE;

	const gridW = cols * cellSize;
	const gridH = rows * cellSize;

	const fillDriver = spring({
		frame,
		fps,
		config: { damping: 60, stiffness: 40 },
	});
	const filledCount = Math.round(
		interpolate(fillDriver, [0, 1], [0, displayCount]),
	);

	const dimDriver = spring({
		frame: frame - 40,
		fps,
		config: { damping: 30, stiffness: 60 },
	});
	const dimProgress = interpolate(dimDriver, [0, 1], [0, 1]);

	const highlightRatio = highlight / total;
	const highlightCount = Math.max(1, Math.round(displayCount * highlightRatio));

	// Vanish: icons disappear in shuffled order
	const isVanishing = vanishFrom !== undefined && frame >= vanishFrom;
	const vanishProgress = isVanishing
		? Math.min(1, (frame - vanishFrom) / vanishDuration)
		: 0;
	const vanishedCount = Math.round(vanishProgress * displayCount);

	// Pre-compute a deterministic shuffle order for vanishing
	const vanishOrder = React.useMemo(() => {
		const order = Array.from({ length: displayCount }, (_, i) => ({
			index: i,
			sort: random(`vanish-${i}`),
		}));
		order.sort((a, b) => a.sort - b.sort);
		return new Set(order.slice(0, vanishedCount).map((o) => o.index));
	}, [displayCount, vanishedCount]);

	return (
		<svg
			viewBox={`0 0 ${gridW} ${gridH}`}
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid slice"
			style={{ overflow: "hidden" }}
		>
			{Array.from({ length: displayCount }, (_, i) => {
				const row = Math.floor(i / cols);
				const col = i % cols;
				const isVisible = i < filledCount && !vanishOrder.has(i);
				const isHighlighted = i < highlightCount;

				const personColor = isHighlighted
					? highlightColor
					: interpolateColor(color, dimColor, dimProgress);

				const opacity = isVisible
					? isHighlighted
						? 1
						: interpolate(dimProgress, [0, 1], [1, 0.3])
					: 0;

				return (
					<g
						key={i}
						transform={`translate(${col * cellSize}, ${row * cellSize})`}
						opacity={opacity}
					>
						<path
							d={PERSON_PATH}
							fill={personColor}
							transform={`scale(${scale})`}
						/>
					</g>
				);
			})}
		</svg>
	);
};

function interpolateColor(
	from: string,
	to: string,
	progress: number,
): string {
	return progress < 0.5 ? from : to;
}
