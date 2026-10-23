/** Location is fetched for all cars in windows of this length (≈650 kB each). */
export const LOCATION_WINDOW_MS = 60_000;

/** Windows to prefetch ahead of the playhead, by playback speed. */
export const PREFETCH_WINDOWS = { normal: 1, fast: 3 } as const;
/** At or above this speed, prefetch the `fast` number of windows. */
export const FAST_SPEED = 16;

export const PLAYBACK_SPEEDS = [1, 4, 16, 32] as const;
export const DEFAULT_SPEED = 4;

/** The fitted track's longest side and padding (SVG viewBox units). */
export const TRACK_SIZE = 1000;
export const TRACK_PADDING = 40;

/** An outline needs at least this many samples to be drawn. */
export const MIN_OUTLINE_SAMPLES = 10;

/** Hide a car rather than slide it across a data gap longer than this. */
export const MAX_SAMPLE_GAP_MS = 5_000;

export const SCRUB_STEP_MS = 1_000;
