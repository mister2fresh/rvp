import React from "react";
import { AbsoluteFill } from "remotion";
import type { Scene, Theme } from "../types";
import { TextFlyIn } from "../primitives/TextFlyIn";
import { NumberCounter } from "../primitives/NumberCounter";
import { StaggeredBullets } from "../primitives/StaggeredBullets";
import { SplitScreen } from "../primitives/SplitScreen";

type SceneRendererProps = {
	scene: Scene;
	theme: Theme;
};

export const SceneRenderer: React.FC<SceneRendererProps> = ({
	scene,
	theme,
}) => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: "center",
				alignItems: "center",
				fontFamily: theme.fontFamily,
			}}
		>
			{renderScene(scene, theme)}
		</AbsoluteFill>
	);
};

function renderScene(scene: Scene, theme: Theme): React.ReactNode {
	switch (scene.type) {
		case "title":
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 30,
					}}
				>
					<TextFlyIn
						text={scene.text}
						fontSize={80}
						color={theme.primaryColor}
					/>
					{scene.subtitle && (
						<TextFlyIn
							text={scene.subtitle}
							delay={15}
							fontSize={44}
							color={theme.textColor}
						/>
					)}
				</div>
			);

		case "bullets":
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 40,
						width: "100%",
					}}
				>
					<TextFlyIn
						text={scene.heading}
						fontSize={56}
						color={theme.primaryColor}
					/>
					<StaggeredBullets
						items={scene.items}
						color={theme.textColor}
					/>
				</div>
			);

		case "stat":
			return (
				<NumberCounter
					target={scene.value}
					prefix={scene.prefix}
					suffix={scene.suffix}
					label={scene.label}
					color={theme.accentColor}
				/>
			);

		case "stat-reveal":
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 50,
					}}
				>
					<TextFlyIn
						text={scene.statLabel}
						fontSize={44}
						color={theme.textColor}
					/>
					<TextFlyIn
						text={scene.statValue}
						delay={10}
						fontSize={96}
						color={theme.accentColor}
					/>
					<TextFlyIn
						text={`${scene.contrastLabel}: ${scene.contrastValue}`}
						delay={25}
						fontSize={40}
						color={theme.secondaryColor}
					/>
				</div>
			);

		case "comparison":
			return (
				<SplitScreen
					leftTitle={scene.leftTitle}
					rightTitle={scene.rightTitle}
					leftItems={scene.leftItems}
					rightItems={scene.rightItems}
					leftColor={theme.errorColor}
					rightColor={theme.accentColor}
				/>
			);

		case "cta":
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 30,
					}}
				>
					<TextFlyIn
						text={scene.text}
						fontSize={72}
						color={theme.accentColor}
					/>
					{scene.subtext && (
						<TextFlyIn
							text={scene.subtext}
							delay={15}
							fontSize={44}
							color={theme.textColor}
						/>
					)}
				</div>
			);

		case "quote":
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 40,
						padding: "0 60px",
					}}
				>
					<TextFlyIn
						text={`"${scene.quote}"`}
						fontSize={52}
						color={theme.textColor}
					/>
					{scene.attribution && (
						<TextFlyIn
							text={`— ${scene.attribution}`}
							delay={20}
							fontSize={36}
							color={theme.primaryColor}
						/>
					)}
				</div>
			);
	}
}
