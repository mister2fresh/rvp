import React from "react";
import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	AbsoluteFill,
} from "remotion";

type Item = { text: string; emoji?: string };

type BeforeAfterProps = {
	beforeLabel?: string;
	afterLabel?: string;
	beforeItems: Item[];
	afterItems: Item[];
	durationInFrames: number;
};

const SPRING_CONFIG = { damping: 12, stiffness: 120 };

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
	beforeLabel = "BEFORE",
	afterLabel = "AFTER",
	beforeItems,
	afterItems,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const midpoint = Math.floor(durationInFrames / 2);
	const wipeFrames = 15;
	const isBefore = frame < midpoint;

	// Wipe transition: gold line sweeps top to bottom
	const wipeProgress = interpolate(
		frame,
		[midpoint - wipeFrames / 2, midpoint + wipeFrames / 2],
		[0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	return (
		<AbsoluteFill>
			{/* Red tint overlay for "before" phase */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					background: "rgba(239, 68, 68, 0.04)",
					opacity: isBefore ? 1 : 0,
					pointerEvents: "none",
				}}
			/>

			{/* Before content */}
			{isBefore && (
				<Phase
					label={beforeLabel}
					items={beforeItems}
					labelColor="#ef4444"
					accentColor="#ef4444"
					frame={frame}
					fps={fps}
				/>
			)}

			{/* After content */}
			{!isBefore && (
				<Phase
					label={afterLabel}
					items={afterItems}
					labelColor="#E8C547"
					accentColor="#E8C547"
					frame={frame - midpoint}
					fps={fps}
				/>
			)}

			{/* Gold wipe line */}
			{wipeProgress > 0 && wipeProgress < 1 && (
				<div
					style={{
						position: "absolute",
						left: 0,
						right: 0,
						top: `${wipeProgress * 100}%`,
						height: 4,
						background:
							"linear-gradient(90deg, transparent 5%, #E8C547 30%, #E8C547 70%, transparent 95%)",
						boxShadow: "0 0 30px #E8C547, 0 0 60px rgba(232, 197, 71, 0.3)",
						pointerEvents: "none",
						zIndex: 10,
					}}
				/>
			)}
		</AbsoluteFill>
	);
};

type PhaseProps = {
	label: string;
	items: Item[];
	labelColor: string;
	accentColor: string;
	frame: number;
	fps: number;
};

const Phase: React.FC<PhaseProps> = ({
	label,
	items,
	labelColor,
	accentColor,
	frame,
	fps,
}) => {
	const labelDriver = spring({ frame, fps, config: SPRING_CONFIG });
	const labelOpacity = interpolate(labelDriver, [0, 1], [0, 1]);
	const labelScale = interpolate(labelDriver, [0, 1], [0.8, 1]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				padding: "180px 72px",
				gap: 28,
				width: "100%",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					fontSize: 28,
					fontWeight: 400,
					fontFamily: "Space Mono",
					color: labelColor,
					textTransform: "uppercase",
					letterSpacing: "0.15em",
					opacity: labelOpacity,
					transform: `scale(${labelScale})`,
					transformOrigin: "left center",
				}}
			>
				{label}
			</div>

			{items.map((item, i) => {
				const d = spring({
					frame: frame - 10 - i * 10,
					fps,
					config: SPRING_CONFIG,
				});
				const opacity = interpolate(d, [0, 1], [0, 1]);
				const x = interpolate(d, [0, 1], [40, 0]);

				return (
					<div
						key={i}
						style={{
							opacity,
							transform: `translateX(${x}px)`,
							display: "flex",
							alignItems: "center",
							gap: 20,
							borderLeft: `3px solid ${accentColor}`,
							paddingLeft: 24,
							paddingTop: 12,
							paddingBottom: 12,
						}}
					>
						{item.emoji && (
							<span style={{ fontSize: 36, flexShrink: 0 }}>{item.emoji}</span>
						)}
						<span
							style={{
								fontSize: 40,
								fontFamily: "DM Sans",
								fontWeight: 500,
								color: "#ffffff",
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
