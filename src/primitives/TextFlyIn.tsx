import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type TextFlyInProps = {
	text: string;
	delay?: number;
	fontSize?: number;
	color?: string;
};

export const TextFlyIn: React.FC<TextFlyInProps> = ({
	text,
	delay = 0,
	fontSize = 64,
	color = "#ffffff",
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const driver = spring({
		frame: frame - delay,
		fps,
		config: { damping: 12, stiffness: 100 },
	});

	const opacity = interpolate(driver, [0, 1], [0, 1]);
	const translateY = interpolate(driver, [0, 1], [80, 0]);
	const scale = interpolate(driver, [0, 1], [0.8, 1]);

	return (
		<div
			style={{
				opacity,
				transform: `translateY(${translateY}px) scale(${scale})`,
				fontSize,
				fontWeight: 700,
				color,
				textAlign: "center",
				padding: "0 60px",
				textShadow: "0 4px 20px rgba(0,0,0,0.5)",
			}}
		>
			{text}
		</div>
	);
};
