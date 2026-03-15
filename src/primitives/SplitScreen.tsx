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
	rightColor = "#00FF88",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const dividerDriver = spring({
		frame,
		fps,
		config: { damping: 20, stiffness: 80 },
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
				padding: "40px 30px",
				gap: 20,
			}}
		>
			<div
				style={{
					fontSize: 44,
					fontWeight: 700,
					color,
					textShadow: "0 4px 20px rgba(0,0,0,0.5)",
				}}
			>
				{title}
			</div>
			{items.map((item, i) => {
				const d = spring({
					frame: frame - baseDelay - i * 10,
					fps,
					config: { damping: 14 },
				});
				const opacity = interpolate(d, [0, 1], [0, 1]);
				return (
					<div
						key={i}
						style={{
							fontSize: 36,
							color: "rgba(255,255,255,0.9)",
							opacity,
							textShadow: "0 4px 20px rgba(0,0,0,0.5)",
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
					width: 4,
					background: "rgba(255,255,255,0.3)",
					transform: `scaleY(${dividerScale})`,
					transformOrigin: "center",
				}}
			/>
			{renderPanel(rightTitle, rightItems, rightColor, 25)}
		</div>
	);
};
