import React from "react";
import { random } from "remotion";

type DotGridBleedProps = {
	totalDots: number;
	cols: number;
	color: string;
	vanishProgress: number;
};

export const DotGridBleed: React.FC<DotGridBleedProps> = ({
	totalDots,
	cols,
	color,
	vanishProgress,
}) => {
	const rows = Math.ceil(totalDots / cols);
	const vanishedCount = Math.round(vanishProgress * totalDots);

	const vanishSet = React.useMemo(() => {
		const order = Array.from({ length: totalDots }, (_, i) => ({
			index: i,
			sort: random(`bleed-${i}`),
		}));
		order.sort((a, b) => a.sort - b.sort);
		return new Set(order.slice(0, vanishedCount).map((o) => o.index));
	}, [totalDots, vanishedCount]);

	return (
		<svg
			viewBox={`0 0 ${cols} ${rows}`}
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid slice"
		>
			{Array.from({ length: totalDots }, (_, i) => {
				const row = Math.floor(i / cols);
				const col = i % cols;
				return (
					<circle
						key={i}
						cx={col + 0.5}
						cy={row + 0.5}
						r={0.12}
						fill={color}
						opacity={vanishSet.has(i) ? 0 : 0.6}
					/>
				);
			})}
		</svg>
	);
};
