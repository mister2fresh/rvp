import React from "react";
import { Composition } from "remotion";
import type { VideoProps } from "./types";
import { VideoPropsSchema, ScreenRecordingPropsSchema } from "./types";
import { aftersetTheme } from "./themes/afterset";
import { KineticTextVideo } from "./templates/KineticTextVideo";
import { StatRevealVideo } from "./templates/StatRevealVideo";
import { ScreenRecordingVideo } from "./templates/ScreenRecordingVideo";
import { TheMathProblem } from "./compositions/TheMathProblem";
import { FifteenMinuteWindow } from "./compositions/FifteenMinuteWindow";
import mathProblemData from "../public/data/video-01-math-problem.json";
import fifteenMinuteData from "../public/data/video-02-fifteen-minutes.json";

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const MIN_DURATION = 150; // 5 seconds minimum

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="AftersetKineticText"
				component={KineticTextVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: [
						{
							type: "title" as const,
							text: "Why 90% of Startups Fail",
							subtitle: "And how to beat the odds",
							durationInFrames: 90,
						},
						{
							type: "kinetic" as const,
							beats: [
								{ text: "Most bands lose fans", emphasisWord: "lose", animation: "spring-up" as const, fontSize: 80, holdFrames: 45 },
								{ text: "after every show", emphasisWord: "every", animation: "scale-pop" as const, fontSize: 80, holdFrames: 45 },
								{ text: "Zero follow-up", emphasisWord: "Zero", emphasisColor: "#ef4444", animation: "slide-left" as const, fontSize: 80, holdFrames: 45 },
								{ text: "No way to reconnect", animation: "fade" as const, fontSize: 80, holdFrames: 45 },
							],
							durationInFrames: 280,
						},
						{
							type: "beforeAfter" as const,
							beforeLabel: "BEFORE",
							afterLabel: "AFTER",
							beforeItems: [
								{ text: "Fans leave and forget", emoji: "👋" },
								{ text: "No emails collected", emoji: "📭" },
								{ text: "Zero repeat attendance", emoji: "📉" },
							],
							afterItems: [
								{ text: "Capture fans at the show", emoji: "📱" },
								{ text: "Automated follow-ups", emoji: "🚀" },
								{ text: "3x repeat attendance", emoji: "📈" },
							],
							durationInFrames: 270,
						},
						{
							type: "bullets" as const,
							heading: "Top 3 Reasons",
							items: [
								{ text: "No market need", emoji: "🚫" },
								{ text: "Ran out of cash", emoji: "💸" },
								{ text: "Wrong team", emoji: "👥" },
							],
							durationInFrames: 120,
						},
						{
							type: "stat" as const,
							label: "Startups that pivot",
							value: 73,
							suffix: "%",
							durationInFrames: 90,
						},
						{
							type: "quote" as const,
							quote: "The best way to predict the future is to create it.",
							attribution: "Peter Drucker",
							durationInFrames: 90,
						},
						{
							type: "cta" as const,
							text: "Follow for more",
							subtext: "@afterset",
							durationInFrames: 60,
						},
					],
					theme: aftersetTheme,
					transition: { style: "fade", durationInFrames: 15 },
				}}
				calculateMetadata={({ props }) => {
					const total = props.scenes.reduce(
						(sum: number, s: { durationInFrames: number }) =>
							sum + s.durationInFrames,
						0,
					);
					return {
						durationInFrames: Math.max(total, MIN_DURATION),
					};
				}}
			/>
			<Composition
				id="AftersetStatReveal"
				component={StatRevealVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: [],
					theme: aftersetTheme,
					transition: { style: "fade", durationInFrames: 15 },
				}}
				calculateMetadata={({ props }) => {
					const total = props.scenes.reduce(
						(sum: number, s: { durationInFrames: number }) =>
							sum + s.durationInFrames,
						0,
					);
					return {
						durationInFrames: Math.max(total, MIN_DURATION),
					};
				}}
			/>
			<Composition
				id="PreviewKineticBeats"
				component={KineticTextVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={280}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: [
						{
							type: "kinetic" as const,
							beats: [
								{ text: "Most bands lose fans", emphasisWord: "lose", animation: "spring-up" as const, fontSize: 80, holdFrames: 45 },
								{ text: "after every single show", emphasisWord: "every", animation: "scale-pop" as const, fontSize: 80, holdFrames: 45 },
								{ text: "Zero follow-up", emphasisWord: "Zero", emphasisColor: "#ef4444", animation: "slide-left" as const, fontSize: 80, holdFrames: 45 },
								{ text: "No way to reconnect", animation: "fade" as const, fontSize: 80, holdFrames: 45 },
							],
							durationInFrames: 280,
						},
					],
					theme: aftersetTheme,
				}}
			/>
			<Composition
				id="PreviewBeforeAfter"
				component={KineticTextVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={270}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: [
						{
							type: "beforeAfter" as const,
							beforeLabel: "BEFORE",
							afterLabel: "AFTER",
							beforeItems: [
								{ text: "Fans leave and forget", emoji: "👋" },
								{ text: "No emails collected", emoji: "📭" },
								{ text: "Zero repeat attendance", emoji: "📉" },
							],
							afterItems: [
								{ text: "Capture fans at the show", emoji: "📱" },
								{ text: "Automated follow-ups", emoji: "🚀" },
								{ text: "3x repeat attendance", emoji: "📈" },
							],
							durationInFrames: 270,
						},
					],
					theme: aftersetTheme,
				}}
			/>
			<Composition
				id="AftersetScreenRecording"
				component={ScreenRecordingVideo}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={ScreenRecordingPropsSchema}
				defaultProps={{
					videoSrc: "demo.mp4",
					callouts: [],
					theme: aftersetTheme,
				}}
				calculateMetadata={({ props }) => {
					const lastEnd = props.callouts.reduce(
						(max: number, c: { fromFrame: number; durationInFrames: number }) =>
							Math.max(max, c.fromFrame + c.durationInFrames),
						0,
					);
					return {
						durationInFrames: Math.max(lastEnd, MIN_DURATION),
					};
				}}
			/>
			<Composition
				id="TheMathProblem"
				component={TheMathProblem}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: mathProblemData.scenes as VideoProps["scenes"],
					theme: aftersetTheme,
					transition: { style: "fade", durationInFrames: 15 },
				}}
				calculateMetadata={({ props }) => {
					const total = props.scenes.reduce(
						(sum: number, s: { durationInFrames: number }) =>
							sum + s.durationInFrames,
						0,
					);
					return {
						durationInFrames: Math.max(total, MIN_DURATION),
					};
				}}
			/>
			<Composition
				id="FifteenMinuteWindow"
				component={FifteenMinuteWindow}
				width={WIDTH}
				height={HEIGHT}
				fps={FPS}
				durationInFrames={MIN_DURATION}
				schema={VideoPropsSchema}
				defaultProps={{
					scenes: fifteenMinuteData.scenes as VideoProps["scenes"],
					theme: aftersetTheme,
					transition: { style: "fade", durationInFrames: 15 },
				}}
				calculateMetadata={({ props }) => {
					const total = props.scenes.reduce(
						(sum: number, s: { durationInFrames: number }) =>
							sum + s.durationInFrames,
						0,
					);
					return {
						durationInFrames: Math.max(total, MIN_DURATION),
					};
				}}
			/>
		</>
	);
};
