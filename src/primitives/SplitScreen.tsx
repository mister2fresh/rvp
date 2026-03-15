import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type SplitScreenProps = {
	leftTitle: string;
	rightTitle: string;
	leftItems: string[];
	rightItems: string[];
	leftColor?: string;
	rightColor?: string;
};

export const SplitScreen: React.FC<SplitScreenProps> = ({
	leftTitle,
	rightTitle,
	leftItems,
	rightItems,
	leftColor = "#ff6b6b",
	rightColor = "#E8C547",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const dividerDriver = spring({
		frame,
		fps,
		config: { damping: 12, stiffness: 120 },
	});
	const dividerScale = interpolate(dividerDriver, [0, 1], [0, 1]);

	const renderPanel = (
		title: string,
		items: string[],
		color: string,
		baseDelay: number,
	) => (
		<div
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "column",
				padding: "40px 28px",
				gap: 20,
			}}
		>
			<div
				style={{
					fontSize: 24,
					fontWeight: 400,
					fontFamily: "Space Mono",
					color,
					textTransform: "uppercase",
					letterSpacing: "0.1em",
				}}
			>
				{title}
			</div>
			{items.map((item, i) => {
				const d = spring({
					frame: frame - baseDelay - i * 10,
					fps,
					config: { damping: 12, stiffness: 120 },
				});
				const opacity = interpolate(d, [0, 1], [0, 1]);
				const y = interpolate(d, [0, 1], [20, 0]);
				return (
					<div
						key={i}
						style={{
							fontSize: 34,
							fontFamily: "DM Sans",
							fontWeight: 500,
							color: "rgba(255, 255, 255, 0.85)",
							opacity,
							transform: `translateY(${y}px)`,
							lineHeight: 1.3,
						}}
					>
						{item}
					</div>
				);
			})}
		</div>
	);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				width: "100%",
				height: "100%",
			}}
		>
			{renderPanel(leftTitle, leftItems, leftColor, 15)}
			<div
				style={{
					width: 2,
					background:
						"linear-gradient(180deg, transparent 10%, rgba(255,255,255,0.15) 50%, transparent 90%)",
					transform: `scaleY(${dividerScale})`,
					transformOrigin: "center",
				}}
			/>
			{renderPanel(rightTitle, rightItems, rightColor, 25)}
		</div>
	);
};
