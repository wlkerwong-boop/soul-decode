/* Geometry adapted from RoxyAPI/ui, MIT. See bodygraph-geometry.LICENSE.txt. */
/**
 * Fixed geometry and renderer for the Human Design bodygraph: nine centers, 36 channels, all 64 gates, over a front-facing silhouette. Only which centers are defined and which gates are activated changes per chart.
 *
 * @remarks
 * Points are authored in a 0 to 100 grid and mapped into {@link BODYGRAPH_VIEWBOX} by {@link g}, so the chart and the silhouette share one space. The window is tight to the drawing rather than square, because every unused grid unit costs gate-number size. `tests/bodygraph.test.ts` holds the layout to the canonical shapes, orientations and row order.
 */

export type BodygraphCenterId =
	| 'head'
	| 'ajna'
	| 'throat'
	| 'g'
	| 'heart'
	| 'sacral'
	| 'solar-plexus'
	| 'spleen'
	| 'root';

interface Point {
	x: number;
	y: number;
}

/** Which of the two sources activated a gate; both splits the circle. The renderer names neither, so one card reads them as the two sides of a person and another as two people. */
export interface GateSources {
	left: boolean;
	right: boolean;
}

/** One center's drawable geometry, plus the English fallback name for its accessible title when the response carries none. */
interface CenterGeometry {
	id: BodygraphCenterId;
	label: string;
	color: CenterColor;
	points: Point[];
	/** Where the centre name sits and how wide it may run, for a centre whose gate circles leave no gap inside the shape: the three side triangles are solid with numbers, so their names sit just outside, below the shape. A centre without one prints its name at the centroid, as ground behind the numbers. */
	caption?: { at: Point; room: number };
}

/** Traditional center color group: gold for Head and G, green for Ajna, red for the Heart and Sacral motors, brown for the rest. A defined center is filled with it; an open one takes the card surface so the wiring passes behind. */
export type CenterColor = 'gold' | 'green' | 'red' | 'brown';

/** The grid window the viewBox covers, with nothing to spare: margin here is space the drawing does not get. Symmetric about {@link AXIS}, and the topmost element is the Head apex rather than the silhouette. */
const X_MIN = 14;
const X_MAX = 86;
const Y_MIN = 0;
const Y_MAX = 102;
/** Grid units to viewBox units. One number sets the resolution of every coordinate below. */
const UNIT = 6;
const VIEW_W = (X_MAX - X_MIN) * UNIT;
const VIEW_H = (Y_MAX - Y_MIN) * UNIT;

/** Map a normalized grid point into viewBox units. */
function g(x: number, y: number): Point {
	return { x: (x - X_MIN) * UNIT, y: (y - Y_MIN) * UNIT };
}

/** Chart horizontal center, the axis of symmetry for the body and the side centers. */
const AXIS = 50;

/** Reflect a normalized grid x across {@link AXIS}. */
const mirrorX = (x: number): number => 2 * AXIS - x;

/** Gate circle and number size, in grid units. Bounded by the closest pair on the chart (Throat 12 and 45, 2.3 apart) and by fitting two digits inside the circle. */
export const GATE_RADIUS = 1.02 * UNIT;
export const GATE_FONT_SIZE = 1.35 * UNIT;
/** The centre name behind the numbers. Smaller than a gate number so it reads as ground rather than as another value. */
export const CENTER_NAME_FONT_SIZE = 1.15 * UNIT;

/** The three x offsets from {@link AXIS} a central-column gate sits on: the inner triples, the outer column of the square centers, and the G's wider waist pair. Named so they cannot drift apart one edit at a time. */
const COL = 2.87;
const EDGE = 4.4;
const G_EDGE = 5.65;

/** Gate positions per center, in canonical reading order. Symmetry is structural rather than typed: the central column is authored as offsets from {@link AXIS}, and the Solar Plexus is left empty and filled by reflecting the Spleen in {@link buildGatePoints}. */
const GATES_BY_CENTER: Record<
	BodygraphCenterId,
	Record<number, [number, number]>
> = {
	head: { 64: [AXIS - COL, 11.2], 61: [AXIS, 11.2], 63: [AXIS + COL, 11.2] },
	ajna: {
		47: [AXIS - COL, 18.0],
		24: [AXIS, 18.0],
		4: [AXIS + COL, 18.0],
		17: [AXIS - COL, 20.6],
		11: [AXIS + COL, 20.6],
		43: [AXIS, 25.3],
	},
	throat: {
		62: [AXIS - COL, 32.4],
		23: [AXIS, 32.4],
		56: [AXIS + COL, 32.4],
		16: [AXIS - EDGE, 34.7],
		35: [AXIS + EDGE, 34.7],
		20: [AXIS - EDGE, 37.3],
		12: [AXIS + EDGE, 37.3],
		45: [AXIS + EDGE, 39.6],
		31: [AXIS - COL, 41.9],
		8: [AXIS, 41.9],
		33: [AXIS + COL, 41.9],
	},
	g: {
		1: [AXIS, 47.7],
		7: [AXIS - COL, 50.3],
		13: [AXIS + COL, 50.3],
		10: [AXIS - G_EDGE, 53.4],
		25: [AXIS + G_EDGE, 53.4],
		15: [AXIS - COL, 56.8],
		46: [AXIS + COL, 56.8],
		2: [AXIS, 59.2],
	},
	heart: {
		21: [63.9, 59.5],
		51: [62.1, 61.3],
		26: [60.1, 63.3],
		40: [66.6, 63.3],
	},
	spleen: {
		48: [20.0, 70.8],
		57: [22.5, 72.4],
		44: [25.0, 73.8],
		50: [27.7, 75.3],
		32: [25.0, 76.6],
		28: [22.5, 78.0],
		18: [20.0, 79.5],
	},
	sacral: {
		5: [AXIS - COL, 72.7],
		14: [AXIS, 72.7],
		29: [AXIS + COL, 72.7],
		34: [AXIS - EDGE, 75.4],
		27: [AXIS - EDGE, 79.0],
		59: [AXIS + EDGE, 79.0],
		42: [AXIS - COL, 81.7],
		3: [AXIS, 81.7],
		9: [AXIS + COL, 81.7],
	},
	'solar-plexus': {},
	root: {
		53: [AXIS - COL, 90.2],
		60: [AXIS, 90.2],
		52: [AXIS + COL, 90.2],
		54: [AXIS - EDGE, 92.6],
		19: [AXIS + EDGE, 92.6],
		38: [AXIS - EDGE, 95.3],
		39: [AXIS + EDGE, 95.3],
		58: [AXIS - EDGE, 98.1],
		41: [AXIS + EDGE, 98.1],
	},
};

/** Spleen gate to the Solar Plexus gate at its mirror position (base-top, ..., apex, ..., base-bottom). */
const SPLEEN_TO_SOLAR_PLEXUS: Record<number, number> = {
	48: 36,
	57: 22,
	44: 37,
	50: 6,
	32: 49,
	28: 55,
	18: 30,
};

/** Gate anchors and the gate-to-center index, filling the Solar Plexus by reflecting the Spleen so the two can never drift apart. */
function buildGatePoints(): {
	points: Record<number, Point>;
	centerOf: Record<number, BodygraphCenterId>;
} {
	const points: Record<number, Point> = {};
	const centerOf: Record<number, BodygraphCenterId> = {};
	for (const [spleenGate, [x, y]] of Object.entries(GATES_BY_CENTER.spleen)) {
		GATES_BY_CENTER['solar-plexus'][
			SPLEEN_TO_SOLAR_PLEXUS[Number(spleenGate)]
		] = [mirrorX(x), y];
	}
	for (const [center, gates] of Object.entries(GATES_BY_CENTER) as Array<
		[BodygraphCenterId, Record<number, [number, number]>]
	>) {
		for (const [gate, [x, y]] of Object.entries(gates)) {
			points[Number(gate)] = g(x, y);
			centerOf[Number(gate)] = center;
		}
	}
	return { points, centerOf };
}

/**
 * The viewBox-space gate anchors ({@link GATE_POINTS}) and the gate to center
 * index ({@link GATE_CENTER}). Exported so the geometry tests can assert the
 * layout invariants (side-center mirror symmetry, central-column balance, gates
 * inside their centers, circles that never overlap) without rendering.
 */
export const { points: GATE_POINTS, centerOf: GATE_CENTER } = buildGatePoints();

/** Horizontal axis of symmetry in viewBox units, the reflection axis for geometry tests. */
export const CHART_AXIS_X = VIEW_W / 2;

/** Build a polygon from normalized grid corner pairs, mapping each through {@link g}. */
function shape(corners: ReadonlyArray<readonly [number, number]>): Point[] {
	return corners.map(([x, y]) => g(x, y));
}

/** A square center, centered on {@link AXIS}, spanning the given half-width and y range. */
function squareShape(halfWidth: number, top: number, bottom: number): Point[] {
	return shape([
		[AXIS - halfWidth, top],
		[AXIS + halfWidth, top],
		[AXIS + halfWidth, bottom],
		[AXIS - halfWidth, bottom],
	]);
}

/** Measured half-width of the three square centers (Throat, Sacral, Root), which share one width. */
const SQUARE_HALF = 5.9;

/** The Spleen triangle (base on the far-left edge, apex pointing right toward center). */
const SPLEEN_SHAPE: ReadonlyArray<readonly [number, number]> = [
	[18.3, 68.3],
	[18.3, 82.0],
	[30.3, 75.15],
];
/**
 * The side captions sit under the lower edge of their triangle, toward the base
 * corner, where the channels leaving the two bottom gates for the Root have not
 * yet crossed; the mirrored anchor serves the Solar Plexus. The Heart's sits
 * under its base, which nothing crosses. Room is the triangle's own span.
 */
const SIDE_CAPTION: readonly [number, number] = [20.0, 84.4];
const SIDE_CAPTION_ROOM = 12 * UNIT;
const HEART_CAPTION: readonly [number, number] = [63.2, 67.9];
const HEART_CAPTION_ROOM = 13.1 * UNIT;

/**
 * Center shapes in canonical orientation and color. Central-column centers are
 * built centered on {@link AXIS}; the Solar Plexus shape is the Spleen reflected
 * across the axis, so the side centers stay exact mirrors. The Heart is the
 * deliberate off-axis exception and points UP, not right.
 */
export const CENTER_GEOMETRY: readonly CenterGeometry[] = [
	{
		id: 'head',
		label: 'Head',
		color: 'gold',
		points: shape([
			[43.55, 12.5],
			[56.45, 12.5],
			[50.0, 1.7],
		]),
	},
	{
		id: 'ajna',
		label: 'Ajna',
		color: 'green',
		points: shape([
			[43.55, 16.5],
			[56.45, 16.5],
			[50.0, 27.7],
		]),
	},
	{
		id: 'throat',
		label: 'Throat',
		color: 'brown',
		points: squareShape(SQUARE_HALF, 31.0, 43.3),
	},
	{
		id: 'g',
		label: 'G',
		color: 'gold',
		points: shape([
			[50.0, 45.8],
			[57.7, 53.6],
			[50.0, 61.4],
			[42.3, 53.6],
		]),
	},
	{
		id: 'heart',
		label: 'Heart',
		color: 'red',
		points: shape([
			[56.65, 65.23],
			[64.2, 56.74],
			[69.75, 65.23],
		]),
		caption: { at: g(...HEART_CAPTION), room: HEART_CAPTION_ROOM },
	},
	{
		id: 'spleen',
		label: 'Spleen',
		color: 'brown',
		points: shape(SPLEEN_SHAPE),
		caption: { at: g(...SIDE_CAPTION), room: SIDE_CAPTION_ROOM },
	},
	{
		id: 'sacral',
		label: 'Sacral',
		color: 'red',
		points: squareShape(SQUARE_HALF, 71.3, 83.1),
	},
	{
		id: 'solar-plexus',
		label: 'Solar Plexus',
		color: 'brown',
		points: shape(
			SPLEEN_SHAPE.map(([x, y]) => [mirrorX(x), y] as [number, number]),
		),
		caption: {
			at: g(mirrorX(SIDE_CAPTION[0]), SIDE_CAPTION[1]),
			room: SIDE_CAPTION_ROOM,
		},
	},
	{
		id: 'root',
		label: 'Root',
		color: 'brown',
		points: squareShape(SQUARE_HALF, 88.5, 99.8),
	},
];

/**
 * The 36 channels as ordered gate pairs. This is the canonical Human Design
 * channel set; a channel is active only when both of its gates are activated,
 * which the live response reports in its `channels` array. The static list lets
 * the renderer draw every channel as an inactive connector and overlay the
 * activated halves, so an open bodygraph still shows its full wiring skeleton.
 */
export const CHANNEL_PAIRS: ReadonlyArray<readonly [number, number]> = [
	[64, 47],
	[61, 24],
	[63, 4],
	[17, 62],
	[11, 56],
	[43, 23],
	[16, 48],
	[20, 34],
	[20, 10],
	[7, 31],
	[1, 8],
	[13, 33],
	[21, 45],
	[12, 22],
	[35, 36],
	[57, 20],
	[15, 5],
	[2, 14],
	[46, 29],
	[34, 10],
	[10, 57],
	[25, 51],
	[27, 50],
	[57, 34],
	[26, 44],
	[18, 58],
	[28, 38],
	[32, 54],
	[3, 60],
	[9, 52],
	[42, 53],
	[59, 6],
	[19, 49],
	[39, 55],
	[41, 30],
	[37, 40],
];
