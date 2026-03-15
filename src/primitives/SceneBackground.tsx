import React from "react";
import { AbsoluteFill } from "remotion";
import type { Theme } from "../types";

type SceneBackgroundProps = {
	theme: Theme;
	children: React.ReactNode;
};

export const SceneBackground: React.FC<SceneBackgroundProps> = ({
	theme,
	children,
}) => {
	return (
		<AbsoluteFill style={{ backgroundColor: theme.backgroundColor }}>
			{/* Ambient gold glow — top left */}
			<div
				style={{
					position: "absolute",
					top: -200,
					left: -200,
					width: 800,
					height: 800,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${theme.primaryColor}18 0%, transparent 70%)`,
					pointerEvents: "none",
				}}
			/>
			{/* Ambient blue glow — bottom right */}
			<div
				style={{
					position: "absolute",
					bottom: -200,
					right: -200,
					width: 800,
					height: 800,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${theme.secondaryColor}15 0%, transparent 70%)`,
					pointerEvents: "none",
				}}
			/>
			{/* CRT scan-line overlay */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background:
						"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
					pointerEvents: "none",
					zIndex: 10,
				}}
			/>
			{/* Content */}
			<AbsoluteFill style={{ zIndex: 1 }}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};
