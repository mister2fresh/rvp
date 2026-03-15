import React from "react";
import { AbsoluteFill } from "remotion";
import type { Scene, Theme } from "../types";
import { TextFlyIn } from "../primitives/TextFlyIn";
import { NumberCounter } from "../primitives/NumberCounter";
import { StaggeredBullets } from "../primitives/StaggeredBullets";
import { SplitScreen } from "../primitives/SplitScreen";
import { StatReveal } from "../primitives/StatReveal";
import { GlassCard } from "../primitives/GlassCard";
import { SceneBackground } from "../primitives/SceneBackground";
import { KineticBeats } from "../primitives/KineticBeat";
import { BeforeAfter } from "../primitives/BeforeAfter";

type SceneRendererProps = {
	scene: Scene;
	theme: Theme;
};

export const SceneRenderer: React.FC<SceneRendererProps> = ({
	scene,
	theme,
}) => {
	return (
		<SceneBackground theme={theme}>
			<AbsoluteFill
				style={{
					justifyContent: "center",
					alignItems: "center",
					fontFamily: theme.fontFamily,
				}}
			>
				{renderScene(scene, theme)}
			</AbsoluteFill>
		</SceneBackground>
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
						gap: 36,
						width: "100%",
					}}
				>
					<TextFlyIn
						text={scene.text}
						fontSize={76}
						color={theme.primaryColor}
						fontFamily="Bricolage Grotesque"
						fontWeight={800}
					/>
					{scene.subtitle && (
						<TextFlyIn
							text={scene.subtitle}
							delay={15}
							fontSize={38}
							color="rgba(255, 255, 255, 0.7)"
							fontFamily="DM Sans"
							fontWeight={400}
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
						gap: 36,
						width: "100%",
					}}
				>
					{/* Eyebrow label */}
					<TextFlyIn
						text={scene.heading}
						fontSize={26}
						color="rgba(255, 255, 255, 0.5)"
						fontFamily="Space Mono"
						fontWeight={400}
					/>
					<StaggeredBullets
						items={scene.items}
						color={theme.textColor}
						accentColor={theme.primaryColor}
					/>
				</div>
			);

		case "stat":
			return (
				<GlassCard delay={0}>
					<NumberCounter
						target={scene.value}
						prefix={scene.prefix}
						suffix={scene.suffix}
						label={scene.label}
						color={theme.primaryColor}
						countDuration={scene.countDuration}
					/>
				</GlassCard>
			);

		case "stat-reveal":
			return (
				<StatReveal
					statLabel={scene.statLabel}
					statValue={scene.statValue}
					contrastLabel={scene.contrastLabel}
					contrastValue={scene.contrastValue}
					accentColor={theme.primaryColor}
					contrastColor={theme.secondaryColor}
					textColor="rgba(255, 255, 255, 0.7)"
				/>
			);

		case "comparison":
			return (
				<SplitScreen
					leftTitle={scene.leftTitle}
					rightTitle={scene.rightTitle}
					leftItems={scene.leftItems}
					rightItems={scene.rightItems}
					leftColor={theme.errorColor}
					rightColor={theme.primaryColor}
				/>
			);

		case "kinetic":
			return <KineticBeats beats={scene.beats} />;

		case "beforeAfter":
			return (
				<BeforeAfter
					beforeLabel={scene.beforeLabel}
					afterLabel={scene.afterLabel}
					beforeItems={scene.beforeItems}
					afterItems={scene.afterItems}
					durationInFrames={scene.durationInFrames}
				/>
			);

		case "cta":
			return (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 32,
						width: "100%",
					}}
				>
					<TextFlyIn
						text={scene.text}
						fontSize={68}
						color={theme.primaryColor}
						fontFamily="Bricolage Grotesque"
						fontWeight={800}
					/>
					{scene.subtext && (
						<TextFlyIn
							text={scene.subtext}
							delay={15}
							fontSize={40}
							color="rgba(255, 255, 255, 0.5)"
							fontFamily="DM Sans"
							fontWeight={400}
						/>
					)}
				</div>
			);

		case "quote":
			return (
				<GlassCard delay={0} width="88%">
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 36,
						}}
					>
						{/* Decorative quote mark */}
						<TextFlyIn
							text={"\u201C"}
							fontSize={120}
							color={theme.primaryColor}
							fontFamily="Bricolage Grotesque"
							fontWeight={800}
						/>
						<TextFlyIn
							text={scene.quote}
							delay={8}
							fontSize={44}
							color="rgba(255, 255, 255, 0.9)"
							fontFamily="DM Sans"
							fontWeight={400}
						/>
						{scene.attribution && (
							<TextFlyIn
								text={`\u2014 ${scene.attribution}`}
								delay={20}
								fontSize={28}
								color="rgba(255, 255, 255, 0.5)"
								fontFamily="Space Mono"
								fontWeight={400}
							/>
						)}
					</div>
				</GlassCard>
			);
	}
}
