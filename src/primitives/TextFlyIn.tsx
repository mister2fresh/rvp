import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type TextFlyInProps = {
	text: string;
	delay?: number;
	fontSize?: number;
	color?: string;
	fontFamily?: string;
	fontWeight?: number;
};

export const TextFlyIn: React.FC<TextFlyInProps> = ({
	text,
	delay = 0,
	fontSize = 64,
	color = "#ffffff",
	fontFamily = "Bricolage Grotesque",
	fontWeight = 700,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const driver = spring({
		frame: frame - delay,
		fps,
		config: { damping: 12, stiffness: 120 },
	});

	const opacity = interpolate(driver, [0, 1], [0, 1]);
	const translateY = interpolate(driver, [0, 1], [60, 0]);
	const scale = interpolate(driver, [0, 1], [0.85, 1]);

	return (
		<div
			style={{
				opacity,
				transform: `translateY(${translateY}px) scale(${scale})`,
				fontSize,
				fontWeight,
				fontFamily,
				color,
				textAlign: "center",
				padding: "0 72px",
				width: "100%",
				boxSizing: "border-box",
				lineHeight: 1.15,
				letterSpacing: "-0.02em",
			}}
		>
			{text}
		</div>
	);
};
