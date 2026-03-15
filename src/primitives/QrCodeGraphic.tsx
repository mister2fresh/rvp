import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { random } from "remotion";

type QrCodeGraphicProps = {
	size?: number;
	color?: string;
	glowColor?: string;
	cellCount?: number;
};

export const QrCodeGraphic: React.FC<QrCodeGraphicProps> = ({
	size = 320,
	color = "#E8C547",
	glowColor = "#E8C547",
	cellCount = 21,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const cellSize = size / cellCount;
	const totalCells = cellCount * cellCount;

	const revealDriver = spring({
		frame,
		fps,
		config: { damping: 20, stiffness: 60 },
	});
	const revealedCount = Math.round(
		interpolate(revealDriver, [0, 1], [0, totalCells]),
	);

	const glowDriver = spring({
		frame: frame - 20,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const glowOpacity = interpolate(glowDriver, [0, 1], [0, 0.4]);

	const borderDriver = spring({
		frame,
		fps,
		config: { damping: 14, stiffness: 100 },
	});
	const borderScale = interpolate(borderDriver, [0, 1], [0.8, 1]);
	const borderOpacity = interpolate(borderDriver, [0, 1], [0, 1]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 16,
				opacity: borderOpacity,
				transform: `scale(${borderScale})`,
			}}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				style={{
					filter: `drop-shadow(0 0 ${30 * glowOpacity}px ${glowColor})`,
					overflow: "visible",
				}}
			>
				{/* Border frame */}
				<rect
					x={0}
					y={0}
					width={size}
					height={size}
					rx={8}
					fill="none"
					stroke={color}
					strokeWidth={3}
					opacity={0.3}
				/>

				{/* Finder patterns (three corners) */}
				{renderFinder(0, 0, cellSize, color)}
				{renderFinder((cellCount - 7) * cellSize, 0, cellSize, color)}
				{renderFinder(0, (cellCount - 7) * cellSize, cellSize, color)}

				{/* Data cells */}
				{Array.from({ length: totalCells }, (_, i) => {
					const row = Math.floor(i / cellCount);
					const col = i % cellCount;

					if (isFinderArea(row, col, cellCount)) return null;

					const isFilled = random(`qr-${row}-${col}`) > 0.45;
					if (!isFilled) return null;

					const staggerIndex = Math.round(
						random(`qr-order-${row}-${col}`) * totalCells,
					);
					const isRevealed = staggerIndex < revealedCount;

					return (
						<rect
							key={i}
							x={col * cellSize + 1}
							y={row * cellSize + 1}
							width={cellSize - 2}
							height={cellSize - 2}
							rx={2}
							fill={color}
							opacity={isRevealed ? 0.9 : 0}
						/>
					);
				})}
			</svg>
		</div>
	);
};

function renderFinder(
	x: number,
	y: number,
	cellSize: number,
	color: string,
): React.ReactNode {
	const outerSize = 7 * cellSize;
	const midSize = 5 * cellSize;
	const innerSize = 3 * cellSize;
	const midOffset = cellSize;
	const innerOffset = 2 * cellSize;

	return (
		<g>
			<rect
				x={x}
				y={y}
				width={outerSize}
				height={outerSize}
				rx={4}
				fill="none"
				stroke={color}
				strokeWidth={cellSize * 0.8}
			/>
			<rect
				x={x + midOffset}
				y={y + midOffset}
				width={midSize}
				height={midSize}
				rx={3}
				fill="none"
				stroke="rgba(0,0,0,0.3)"
				strokeWidth={cellSize * 0.4}
			/>
			<rect
				x={x + innerOffset}
				y={y + innerOffset}
				width={innerSize}
				height={innerSize}
				rx={2}
				fill={color}
			/>
		</g>
	);
}

function isFinderArea(row: number, col: number, count: number): boolean {
	const inTopLeft = row < 8 && col < 8;
	const inTopRight = row < 8 && col >= count - 8;
	const inBottomLeft = row >= count - 8 && col < 8;
	return inTopLeft || inTopRight || inBottomLeft;
}
