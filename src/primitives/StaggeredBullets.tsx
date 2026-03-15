import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type BulletItem = {
	text: string;
	emoji?: string;
};

type StaggeredBulletsProps = {
	items: BulletItem[];
	stagger?: number;
	color?: string;
};

export const StaggeredBullets: React.FC<StaggeredBulletsProps> = ({
	items,
	stagger = 12,
	color = "#ffffff",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 28,
				padding: "0 60px",
			}}
		>
			{items.map((item, i) => {
				const driver = spring({
					frame: frame - i * stagger,
					fps,
					config: { damping: 14, stiffness: 100 },
				});

				const opacity = interpolate(driver, [0, 1], [0, 1]);
				const x = interpolate(driver, [0, 1], [60, 0]);

				return (
					<div
						key={i}
						style={{
							opacity,
							transform: `translateX(${x}px)`,
							fontSize: 48,
							color,
							textShadow: "0 4px 20px rgba(0,0,0,0.5)",
						}}
					>
						{item.emoji ? `${item.emoji}  ${item.text}` : item.text}
					</div>
				);
			})}
		</div>
	);
};
