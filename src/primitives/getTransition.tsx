import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { none } from "@remotion/transitions/none";
import type { TransitionStyle } from "../types";

const WIDTH = 1080;
const HEIGHT = 1920;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- presentations have heterogeneous prop types
export function getPresentation(style: TransitionStyle): any {
	switch (style) {
		case "fade":
			return fade();
		case "slide":
			return slide({ direction: "from-bottom" });
		case "wipe":
			return wipe();
		case "flip":
			return flip();
		case "clock-wipe":
			return clockWipe({ width: WIDTH, height: HEIGHT });
		case "none":
			return none();
	}
}
