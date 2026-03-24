import React from "react";
import {
	AbsoluteFill,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
} from "remotion";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";

const { fontFamily } = loadDMSans();
const { fontFamily: displayFont } = loadBricolage();

const SPRING_CONFIG = { stiffness: 100, damping: 18 };
const GOLD = "#E8C547";
const BG = "#0a0e1a";
const SURFACE = "#111827";
const GRAY = "rgba(255, 255, 255, 0.5)";
const TEXT_SECONDARY = "rgba(255, 255, 255, 0.7)";
const GREEN = "#22c55e";
const RED = "#ef4444";

// ─── Shared Components ───────────────────────────────────────────────

type VenueCardProps = {
	bgColor: string;
	label: string;
	headline: string[];
	children: React.ReactNode;
};

const VenueCard: React.FC<VenueCardProps> = ({
	bgColor,
	label,
	headline,
	children,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const labelY = interpolate(
		spring({ frame, fps, config: SPRING_CONFIG }),
		[0, 1],
		[-60, 40],
	);

	const headlineX = interpolate(
		spring({ frame: frame - 10, fps, config: SPRING_CONFIG }),
		[0, 1],
		[-400, 0],
	);

	const headlineOpacity = interpolate(frame, [10, 25], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<AbsoluteFill
			style={{ backgroundColor: bgColor, fontFamily, padding: 60 }}
		>
			<div
				style={{
					fontSize: 32,
					color: GRAY,
					transform: `translateY(${labelY}px)`,
				}}
			>
				{label}
			</div>
			<div
				style={{
					marginTop: 80,
					transform: `translateX(${headlineX}px)`,
					opacity: headlineOpacity,
				}}
			>
				{headline.map((line) => (
					<div
						key={line}
						style={{
							fontSize: 70,
							fontWeight: 700,
							color: "white",
							lineHeight: 1.15,
							fontFamily: displayFont,
						}}
					>
						{line}
					</div>
				))}
			</div>
			{children}
		</AbsoluteFill>
	);
};

type StatCardProps = {
	bgColor: string;
	icon: string;
	mainText: string;
	subText: string;
	startFrame: number;
};

const StatCard: React.FC<StatCardProps> = ({
	bgColor,
	icon,
	mainText,
	subText,
	startFrame,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const local = frame - startFrame;

	const slideY = interpolate(
		spring({
			frame: Math.max(0, local),
			fps,
			config: SPRING_CONFIG,
		}),
		[0, 1],
		[200, 0],
	);

	const opacity = interpolate(local, [0, 10], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<div
			style={{
				position: "absolute",
				bottom: 120,
				left: 60,
				right: 60,
				backgroundColor: bgColor,
				borderRadius: 16,
				padding: "32px 36px",
				transform: `translateY(${slideY}px)`,
				opacity,
			}}
		>
			<div style={{ fontSize: 32, color: "white", fontWeight: 500 }}>
				{icon} {mainText}
			</div>
			<div
				style={{ fontSize: 24, color: TEXT_SECONDARY, marginTop: 12, fontWeight: 500 }}
			>
				{subText}
			</div>
		</div>
	);
};

// ─── SVG Illustrations ───────────────────────────────────────────────

const MockQrCode: React.FC = () => {
	const SIZE = 200;
	const CELL = 20;
	const GRID = SIZE / CELL;
	// Deterministic "random" fill
	const filled = (r: number, c: number) => {
		const v = ((r * 7 + c * 13 + 37) * 17) % 100;
		return v < 55;
	};

	return (
		<svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
			{Array.from({ length: GRID }, (_, r) =>
				Array.from({ length: GRID }, (_, c) =>
					filled(r, c) ? (
						<rect
							key={`${r}-${c}`}
							x={c * CELL}
							y={r * CELL}
							width={CELL}
							height={CELL}
							fill="white"
						/>
					) : null,
				),
			)}
		</svg>
	);
};

const AnimatedRedX: React.FC<{ progress: number }> = ({ progress }) => {
	const LINE_LEN = 283; // diagonal of 200x200
	const offset1 = interpolate(progress, [0, 0.5], [LINE_LEN, 0], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
	const offset2 = interpolate(progress, [0.5, 1], [LINE_LEN, 0], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<svg
			width={200}
			height={200}
			viewBox="0 0 200 200"
			style={{ position: "absolute", top: 0, left: 0 }}
		>
			<line
				x1={20}
				y1={20}
				x2={180}
				y2={180}
				stroke={RED}
				strokeWidth={12}
				strokeLinecap="round"
				strokeDasharray={LINE_LEN}
				strokeDashoffset={offset1}
			/>
			<line
				x1={180}
				y1={20}
				x2={20}
				y2={180}
				stroke={RED}
				strokeWidth={12}
				strokeLinecap="round"
				strokeDasharray={LINE_LEN}
				strokeDashoffset={offset2}
			/>
		</svg>
	);
};

// Deterministic pseudo-random for fan placement
const seeded = (i: number) => ((i * 1597 + 51749) % 244944) / 244944;

const CROWD_FANS: Array<{ x: number; y: number }> = [];
// Dense crowd near stage — 5 rows, staggered
for (let row = 0; row < 6; row++) {
	const fansInRow = 11 - row;
	const rowY = 170 + row * 52;
	const rowWidth = 780 - row * 40;
	const startX = (960 - rowWidth) / 2;
	for (let i = 0; i < fansInRow; i++) {
		const jitter = seeded(row * 20 + i) * 20 - 10;
		CROWD_FANS.push({
			x: startX + (rowWidth / (fansInRow - 1 || 1)) * i + jitter,
			y: rowY + seeded(row * 20 + i + 99) * 16 - 8,
		});
	}
}

// Scattered fans in mid-venue (milling about, between crowd and merch)
const MID_FANS: Array<{ x: number; y: number }> = [];
for (let i = 0; i < 14; i++) {
	MID_FANS.push({
		x: 100 + seeded(i + 200) * 760,
		y: 520 + seeded(i + 300) * 200,
	});
}

// A few fans near exit (bottom-left)
const EXIT_FANS: Array<{ x: number; y: number }> = [
	{ x: 80, y: 810 },
	{ x: 140, y: 830 },
	{ x: 110, y: 860 },
	{ x: 60, y: 850 },
	{ x: 170, y: 850 },
];

const Fan: React.FC<{ x: number; y: number; color: string; scale?: number }> = ({
	x,
	y,
	color,
	scale = 1,
}) => (
	<g transform={`translate(${x},${y}) scale(${scale})`}>
		<circle cy={-14} r={8} fill={color} />
		<ellipse cy={4} rx={7} ry={10} fill={color} opacity={0.8} />
	</g>
);

const VenueDiagram: React.FC<{ progress: number }> = ({ progress }) => {
	const PATH_LEN = 700;
	const pathDraw = interpolate(progress, [0, 0.6], [PATH_LEN, PATH_LEN * 0.45], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
	const xOpacity = interpolate(progress, [0.6, 0.75], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
	const exitFanOpacity = interpolate(progress, [0.75, 1], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
	const midFanOpacity = interpolate(progress, [0.2, 0.5], [0, 0.5], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<svg width={960} height={920} viewBox="0 0 960 920">
			{/* Venue walls */}
			<rect
				x={20}
				y={20}
				width={920}
				height={880}
				rx={16}
				fill="none"
				stroke="#2a2a3a"
				strokeWidth={2}
				strokeDasharray="8 4"
			/>

			{/* Stage — wide platform at top */}
			<rect
				x={180}
				y={40}
				width={600}
				height={90}
				rx={12}
				fill="#1e2538"
				stroke={GOLD}
				strokeWidth={2}
				opacity={0.8}
			/>
			<rect x={220} y={55} width={520} height={4} rx={2} fill={GOLD} opacity={0.3} />
			<text
				x={480}
				y={100}
				textAnchor="middle"
				fill="white"
				fontSize={28}
				fontWeight={700}
				fontFamily={displayFont}
				opacity={0.9}
			>
				STAGE
			</text>

			{/* Stage lights (decorative dots) */}
			{[280, 380, 480, 580, 680].map((lx) => (
				<circle key={lx} cx={lx} cy={48} r={4} fill={GOLD} opacity={0.5} />
			))}

			{/* Dense crowd near stage */}
			{CROWD_FANS.map((fan, i) => (
				<Fan
					key={`crowd-${i}`}
					x={fan.x}
					y={fan.y}
					color={i % 7 === 0 ? GOLD : "#8899aa"}
					scale={0.9 + seeded(i + 50) * 0.3}
				/>
			))}

			{/* Sound/bar area — left wall */}
			<rect
				x={30}
				y={400}
				width={60}
				height={140}
				rx={6}
				fill="#1a1f2e"
				stroke="#2a2a3a"
				strokeWidth={1}
			/>
			<text
				x={60}
				y={478}
				textAnchor="middle"
				fill="#556"
				fontSize={13}
				fontWeight={600}
				fontFamily={fontFamily}
			>
				BAR
			</text>

			{/* Mid-venue scattered fans (milling, not paying attention) */}
			{MID_FANS.map((fan, i) => (
				<Fan
					key={`mid-${i}`}
					x={fan.x}
					y={fan.y}
					color="#556677"
					scale={0.8}
				/>
			))}
			{/* Opacity overlay for mid fans to show them fading */}
			{MID_FANS.map((fan, i) => (
				<Fan
					key={`mid-fade-${i}`}
					x={fan.x}
					y={fan.y}
					color="#556677"
					scale={0.8}
				/>
			))}

			{/* Merch table — small, tucked in bottom-right corner */}
			<rect
				x={740}
				y={780}
				width={180}
				height={70}
				rx={10}
				fill="#1a1f2e"
				stroke={GOLD}
				strokeWidth={2}
				opacity={0.6}
			/>
			{/* Merch items on table */}
			<rect x={760} y={795} width={30} height={24} rx={4} fill="#2a3040" />
			<rect x={800} y={795} width={30} height={24} rx={4} fill="#2a3040" />
			<rect x={840} y={795} width={30} height={24} rx={4} fill="#2a3040" />
			<text
				x={830}
				y={835}
				textAnchor="middle"
				fill="white"
				fontSize={22}
				fontWeight={700}
				fontFamily={displayFont}
				opacity={0.7}
			>
				MERCH TABLE
			</text>

			{/* Animated dotted path: crowd center → merch (curved, stops halfway) */}
			<path
				d="M 480 430 C 520 550, 620 650, 830 780"
				fill="none"
				stroke="#445"
				strokeWidth={3}
				strokeDasharray="12 8"
				strokeDashoffset={pathDraw}
			/>

			{/* Red X where path dies */}
			<g opacity={xOpacity}>
				<circle cx={620} cy={600} r={28} fill={RED} opacity={0.15} />
				<text
					x={620}
					y={615}
					textAnchor="middle"
					fill={RED}
					fontSize={40}
					fontWeight={700}
					fontFamily={fontFamily}
				>
					✗
				</text>
			</g>

			{/* "90% leave" label near X */}
			<text
				x={620}
				y={650}
				textAnchor="middle"
				fill={RED}
				fontSize={18}
				fontWeight={600}
				fontFamily={fontFamily}
				opacity={xOpacity * 0.8}
			>
				90% never make it
			</text>

			{/* Exit door — bottom-left */}
			<rect
				x={30}
				y={800}
				width={80}
				height={60}
				rx={8}
				fill="#111520"
				stroke="#2a2a3a"
				strokeWidth={1}
			/>
			<text
				x={70}
				y={836}
				textAnchor="middle"
				fill="#556"
				fontSize={16}
				fontWeight={700}
				fontFamily={fontFamily}
			>
				EXIT
			</text>
			{/* Arrow pointing out */}
			<polygon points="70,870 55,860 85,860" fill="#556" opacity={0.5} />

			{/* Fans leaving toward exit */}
			{EXIT_FANS.map((fan, i) => (
				<g key={`exit-${i}`} opacity={exitFanOpacity}>
					<Fan x={fan.x} y={fan.y} color="#445566" scale={0.75} />
				</g>
			))}

			{/* Dotted arrow from crowd to exit (fans leaving) */}
			<path
				d="M 400 470 C 300 600, 180 720, 110 800"
				fill="none"
				stroke="#445"
				strokeWidth={2}
				strokeDasharray="6 6"
				opacity={exitFanOpacity * 0.5}
			/>
		</svg>
	);
};

const DistanceVisual: React.FC<{ progress: number }> = ({ progress }) => {
	const ARROW_LEN = 500;
	const arrowDraw = interpolate(progress, [0, 0.7], [ARROW_LEN, 0], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
	const labelOpacity = interpolate(progress, [0.5, 0.7], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
	const xOpacity = interpolate(progress, [0.7, 1], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<svg width={700} height={200} viewBox="0 0 700 200">
			{/* Stage icon */}
			<rect
				x={20}
				y={60}
				width={80}
				height={50}
				rx={6}
				fill="#333"
				stroke="#666"
				strokeWidth={2}
			/>
			<text
				x={60}
				y={92}
				textAnchor="middle"
				fill="white"
				fontSize={16}
				fontWeight={700}
				fontFamily={fontFamily}
			>
				STAGE
			</text>

			{/* Arrow line */}
			<line
				x1={120}
				y1={85}
				x2={580}
				y2={85}
				stroke="#666"
				strokeWidth={3}
				strokeDasharray={ARROW_LEN}
				strokeDashoffset={arrowDraw}
			/>
			{/* Arrowhead */}
			<polygon
				points="575,75 595,85 575,95"
				fill="#666"
				opacity={labelOpacity}
			/>

			{/* Label */}
			<text
				x={350}
				y={65}
				textAnchor="middle"
				fill="white"
				fontSize={32}
				fontWeight={700}
				opacity={labelOpacity}
				fontFamily={fontFamily}
			>
				50 ft
			</text>

			{/* QR icon */}
			<rect
				x={600}
				y={60}
				width={50}
				height={50}
				rx={4}
				fill="#222"
				stroke="#666"
				strokeWidth={2}
			/>
			<rect x={610} y={70} width={12} height={12} fill="white" />
			<rect x={628} y={70} width={12} height={12} fill="white" />
			<rect x={610} y={88} width={12} height={12} fill="white" />
			<rect x={628} y={88} width={12} height={12} fill="white" />

			{/* Red X */}
			<text
				x={625}
				y={155}
				textAnchor="middle"
				fill={RED}
				fontSize={48}
				fontWeight={700}
				opacity={xOpacity}
				fontFamily={fontFamily}
			>
				✗
			</text>
		</svg>
	);
};

// ─── Solution Row Icons ──────────────────────────────────────────────

const QrIcon: React.FC = () => (
	<svg width={56} height={56} viewBox="0 0 56 56">
		<rect width={56} height={56} rx={8} fill="none" />
		<rect x={4} y={4} width={20} height={20} rx={3} fill={GOLD} />
		<rect x={32} y={4} width={20} height={20} rx={3} fill={GOLD} />
		<rect x={4} y={32} width={20} height={20} rx={3} fill={GOLD} />
		<rect x={36} y={36} width={12} height={12} rx={2} fill={GOLD} />
		<rect x={8} y={8} width={12} height={12} rx={2} fill={BG} />
		<rect x={36} y={8} width={12} height={12} rx={2} fill={BG} />
		<rect x={8} y={36} width={12} height={12} rx={2} fill={BG} />
	</svg>
);

const SmsIcon: React.FC = () => (
	<svg width={56} height={56} viewBox="0 0 56 56">
		<rect
			x={6}
			y={10}
			width={44}
			height={30}
			rx={8}
			fill="none"
			stroke={GOLD}
			strokeWidth={3}
		/>
		<circle cx={20} cy={25} r={3} fill={GOLD} />
		<circle cx={28} cy={25} r={3} fill={GOLD} />
		<circle cx={36} cy={25} r={3} fill={GOLD} />
		<polygon points="16,40 24,40 18,48" fill={GOLD} />
	</svg>
);

const NfcIcon: React.FC = () => (
	<svg width={56} height={56} viewBox="0 0 56 56">
		{[18, 26, 34].map((r, i) => (
			<path
				key={r}
				d={`M ${28 - r} 28 A ${r} ${r} 0 0 1 ${28 + r} 28`}
				fill="none"
				stroke={GOLD}
				strokeWidth={3}
				strokeLinecap="round"
				opacity={0.5 + i * 0.25}
				transform="rotate(-45 28 28)"
			/>
		))}
		<circle cx={28} cy={28} r={6} fill={GOLD} />
	</svg>
);

const Checkmark: React.FC = () => (
	<svg width={36} height={36} viewBox="0 0 36 36">
		<circle cx={18} cy={18} r={16} fill={GREEN} opacity={0.15} />
		<path
			d="M10 18 L16 24 L26 12"
			fill="none"
			stroke={GREEN}
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// ─── Scene Components ────────────────────────────────────────────────

const HookCard: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const scale = interpolate(
		spring({ frame, fps, config: { stiffness: 120, damping: 14 } }),
		[0, 1],
		[0.85, 1],
	);

	const subOpacity = interpolate(frame, [60, 75], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: BG,
				fontFamily,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
				<div style={{ fontSize: 80, fontWeight: 700, color: "white", fontFamily: displayFont }}>
					One QR code
				</div>
				<div style={{ fontSize: 80, fontWeight: 700, color: GOLD, fontFamily: displayFont }}>
					isn't enough.
				</div>
			</div>
			<div
				style={{
					fontSize: 36,
					color: TEXT_SECONDARY,
					marginTop: 32,
					opacity: subOpacity,
					fontWeight: 500,
				}}
			>
				Here's why.
			</div>
		</AbsoluteFill>
	);
};

const DiveBarScene: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const qrOpacity = interpolate(frame, [90, 100], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	const xProgress = interpolate(frame, [100, 160], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<VenueCard
			bgColor="#0d1220"
			label="🍺  Dive Bar"
			headline={["The room is packed.", "Nobody can scan your QR."]}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					marginTop: 60,
					opacity: qrOpacity,
					position: "relative",
					width: 200,
					alignSelf: "center",
					marginLeft: "auto",
					marginRight: "auto",
				}}
			>
				<MockQrCode />
				<AnimatedRedX progress={xProgress} />
			</div>
			<StatCard
				bgColor="#161e2e"
				icon="📵"
				mainText="Camera can't focus in the dark"
				subText="QR fail rate in dark venues: ~60%"
				startFrame={150}
			/>
		</VenueCard>
	);
};

const BigRoomScene: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const diagramOpacity = interpolate(frame, [90, 100], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	const diagramProgress = interpolate(frame, [90, 150], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<VenueCard
			bgColor="#0a1024"
			label="🎸  300-Cap Room"
			headline={["The crowd is there.", "Your merch table isn't."]}
		>
			<div
				style={{
					position: "absolute",
					top: 340,
					left: 60,
					right: 60,
					bottom: 200,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					opacity: diagramOpacity,
				}}
			>
				<VenueDiagram progress={diagramProgress} />
			</div>
			<StatCard
				bgColor="#141c2c"
				icon="🚶"
				mainText="Only ~10% of fans walk to the merch table"
				subText="The other 90% walk out the door."
				startFrame={150}
			/>
		</VenueCard>
	);
};

const FestivalScene: React.FC = () => {
	const frame = useCurrentFrame();

	const distOpacity = interpolate(frame, [90, 100], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	const distProgress = interpolate(frame, [90, 145], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<VenueCard
			bgColor="#0b1118"
			label="🌤️  Outdoor Festival"
			headline={["Your poster has a QR code.", "It's 50 feet from the crowd."]}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					marginTop: 80,
					opacity: distOpacity,
				}}
			>
				<DistanceVisual progress={distProgress} />
			</div>
			<StatCard
				bgColor="#111c26"
				icon="😬"
				mainText="QR codes need to be <3 feet to scan reliably"
				subText="Festival stages make this nearly impossible."
				startFrame={135}
			/>
		</VenueCard>
	);
};

const TransitionCard: React.FC = () => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: BG,
				fontFamily,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<div
				style={{
					fontSize: 56,
					fontWeight: 700,
					color: "white",
					opacity,
					textAlign: "center",
				}}
			>
				<span style={{ fontFamily: displayFont }}>So what actually works?</span>
			</div>
		</AbsoluteFill>
	);
};

type SolutionRowProps = {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	startFrame: number;
};

const SolutionRow: React.FC<SolutionRowProps> = ({
	icon,
	title,
	subtitle,
	startFrame,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const local = frame - startFrame;

	const slideY = interpolate(
		spring({
			frame: Math.max(0, local),
			fps,
			config: SPRING_CONFIG,
		}),
		[0, 1],
		[80, 0],
	);

	const opacity = interpolate(local, [0, 10], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 24,
				transform: `translateY(${slideY}px)`,
				opacity,
				padding: "16px 0",
			}}
		>
			{icon}
			<div style={{ flex: 1 }}>
				<div style={{ fontSize: 44, fontWeight: 700, color: "white", fontFamily: displayFont }}>
					{title}
				</div>
				<div
					style={{ fontSize: 28, color: TEXT_SECONDARY, marginTop: 6, fontWeight: 500 }}
				>
					{subtitle}
				</div>
			</div>
			<Checkmark />
		</div>
	);
};

const SolutionCard: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Divider at frame 150 (relative to solution card start)
	const dividerWidth = interpolate(
		spring({
			frame: Math.max(0, frame - 150),
			fps,
			config: SPRING_CONFIG,
		}),
		[0, 1],
		[0, 960],
	);

	const taglineOpacity = interpolate(frame, [155, 170], [0, 1], {
		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",
	});
	const taglineScale = interpolate(
		spring({
			frame: Math.max(0, frame - 155),
			fps,
			config: { stiffness: 120, damping: 14 },
		}),
		[0, 1],
		[0.9, 1],
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "#0c1220",
				fontFamily,
				padding: "120px 60px",
			}}
		>
			<SolutionRow
				icon={<QrIcon />}
				title="QR code"
				subtitle="Great for merch tables + projected screens"
				startFrame={0}
			/>
			<SolutionRow
				icon={<SmsIcon />}
				title="Text a keyword"
				subtitle="Works in dark rooms. Fans text from their seat."
				startFrame={40}
			/>
			<SolutionRow
				icon={<NfcIcon />}
				title="NFC tap"
				subtitle="Poster by the bathroom. One tap. Done."
				startFrame={80}
			/>

			{/* Divider */}
			<div
				style={{
					width: dividerWidth,
					height: 2,
					backgroundColor: "white",
					marginTop: 60,
					alignSelf: "center",
				}}
			/>

			{/* Tagline */}
			<div
				style={{
					marginTop: 48,
					textAlign: "center",
					opacity: taglineOpacity,
					transform: `scale(${taglineScale})`,
				}}
			>
				{["Every venue.", "Every fan.", "Every time."].map((line) => (
					<div
						key={line}
						style={{
							fontSize: 56,
							fontWeight: 700,
							color: "white",
							lineHeight: 1.3,
							fontFamily: displayFont,
						}}
					>
						{line}
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

const CtaCard: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const lines = [
		{ delay: 0, content: "● afterset", size: 96, color: "white", weight: 700 },
		{
			delay: 15,
			content: "Turn tonight's audience",
			size: 36,
			color: TEXT_SECONDARY,
			weight: 500,
		},
		{
			delay: 30,
			content: "into tomorrow's fans.",
			size: 36,
			color: TEXT_SECONDARY,
			weight: 500,
		},
		{
			delay: 45,
			content: "🔗 Link in bio — waitlist open",
			size: 32,
			color: GOLD,
			weight: 500,
		},
	];

	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(circle at center, #1a1e2e, ${BG})`,
				fontFamily,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{lines.map(({ delay, content, size, color, weight }) => {
				const scale = interpolate(
					spring({
						frame: Math.max(0, frame - delay),
						fps,
						config: SPRING_CONFIG,
					}),
					[0, 1],
					[0.85, 1],
				);
				const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
					extrapolateRight: "clamp",
					extrapolateLeft: "clamp",
				});

				return (
					<div
						key={content}
						style={{
							fontSize: size,
							fontWeight: weight,
							color,
							transform: `scale(${scale})`,
							opacity,
							marginBottom: 16,
						}}
					>
						{content === "● afterset" ? (
							<span style={{ fontFamily: displayFont }}>
								<span style={{ color: GOLD }}>●</span> afterset
							</span>
						) : (
							content
						)}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

// ─── Main Composition ────────────────────────────────────────────────

export const ThreeVenues: React.FC = () => {
	return (
		<AbsoluteFill>
			<Sequence from={0} durationInFrames={90}>
				<HookCard />
			</Sequence>
			<Sequence from={90} durationInFrames={210}>
				<DiveBarScene />
			</Sequence>
			<Sequence from={300} durationInFrames={210}>
				<BigRoomScene />
			</Sequence>
			<Sequence from={510} durationInFrames={180}>
				<FestivalScene />
			</Sequence>
			<Sequence from={690} durationInFrames={60}>
				<TransitionCard />
			</Sequence>
			<Sequence from={750} durationInFrames={180}>
				<SolutionCard />
			</Sequence>
			<Sequence from={930} durationInFrames={120}>
				<CtaCard />
			</Sequence>
		</AbsoluteFill>
	);
};
