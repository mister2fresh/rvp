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
	accentColor?: string;
};

export const StaggeredBullets: React.FC<StaggeredBulletsProps> = ({
	items,
	stagger = 12,
	color = "#ffffff",
	accentColor = "#E8C547",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 20,
				padding: "0 72px",
				width: "100%",
				boxSizing: "border-box",
			}}
		>
			{items.map((item, i) => {
				const driver = spring({
					frame: frame - i * stagger,
					fps,
					config: { damping: 12, stiffness: 120 },
				});

				const opacity = interpolate(driver, [0, 1], [0, 1]);
				const x = interpolate(driver, [0, 1], [40, 0]);

				return (
					<div
						key={i}
						style={{
							opacity,
							transform: `translateX(${x}px)`,
							display: "flex",
							alignItems: "center",
							gap: 20,
							background: "rgba(17, 24, 39, 0.6)",
							border: "1px solid rgba(255, 255, 255, 0.06)",
							borderRadius: 16,
							padding: "24px 28px",
						}}
					>
						{item.emoji && (
							<span style={{ fontSize: 40, flexShrink: 0 }}>
								{item.emoji}
							</span>
						)}
						<span
							style={{
								fontSize: 40,
								fontFamily: "DM Sans",
								fontWeight: 500,
								color,
								lineHeight: 1.3,
							}}
						>
							{item.text}
						</span>
					</div>
				);
			})}
		</div>
	);
};
