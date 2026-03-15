import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type GlassCardProps = {
	children: React.ReactNode;
	delay?: number;
	width?: string;
};

export const GlassCard: React.FC<GlassCardProps> = ({
	children,
	delay = 0,
	width = "85%",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const driver = spring({
		frame: frame - delay,
		fps,
		config: { damping: 12, stiffness: 120 },
	});

	const opacity = interpolate(driver, [0, 1], [0, 1]);
	const scale = interpolate(driver, [0, 1], [0.95, 1]);
	const y = interpolate(driver, [0, 1], [30, 0]);

	return (
		<div
			style={{
				opacity,
				transform: `translateY(${y}px) scale(${scale})`,
				width,
				background: "rgba(17, 24, 39, 0.7)",
				border: "1px solid rgba(255, 255, 255, 0.08)",
				borderRadius: 24,
				padding: "48px 40px",
				backdropFilter: "blur(20px)",
				boxShadow:
					"0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
			}}
		>
			{children}
		</div>
	);
};
