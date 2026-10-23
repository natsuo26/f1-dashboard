/** Pure helpers for the track replay: fitting circuit coordinates and interpolating cars. */

export interface Point {
  x: number;
  y: number;
}

export interface TimedPoint extends Point {
  /** Epoch milliseconds. */
  t: number;
}

export interface Fit {
  width: number;
  height: number;
  project: (p: Point) => Point;
}

/**
 * Fits circuit coordinates into a box of `size` on its longest side, keeping the
 * aspect ratio. OpenF1's y axis points up, SVG's points down, so y is flipped.
 */
export function fitTransform(points: readonly Point[], size = 1000, pad = 40): Fit {
  if (!points.length) return { width: size, height: size, project: (p) => p };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = (size - pad * 2) / Math.max(spanX, spanY);
  const width = spanX * scale + pad * 2;
  const height = spanY * scale + pad * 2;
  return {
    width,
    height,
    project: (p) => ({ x: pad + (p.x - minX) * scale, y: height - pad - (p.y - minY) * scale }),
  };
}

/** SVG path through points, closed when the ends nearly meet. */
export function toPath(points: readonly Point[]): string {
  if (!points.length) return '';
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  const first = points[0];
  const last = points[points.length - 1];
  return Math.hypot(first.x - last.x, first.y - last.y) < 60 ? `${d}Z` : d;
}

/** Index of the last sample at or before `t` (-1 when `t` precedes all samples). */
export function indexAtOrBefore(samples: readonly TimedPoint[], t: number): number {
  let lo = 0;
  let hi = samples.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= t) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

/**
 * Position at time `t`, linearly interpolated between the surrounding samples.
 * Returns null if `t` is outside the samples or the gap between them is longer
 * than `maxGapMs` (data missing — better to hide the car than to slide it).
 */
export function interpolate(samples: readonly TimedPoint[], t: number, maxGapMs = 5_000): Point | null {
  const i = indexAtOrBefore(samples, t);
  if (i < 0) return null;
  const a = samples[i];
  const b = samples[i + 1];
  if (!b) return t - a.t <= maxGapMs ? { x: a.x, y: a.y } : null;
  if (b.t - a.t > maxGapMs) return t - a.t <= maxGapMs ? { x: a.x, y: a.y } : null;
  const k = (t - a.t) / (b.t - a.t);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

/** Merges new samples into a sorted track, dropping exact duplicate timestamps. */
export function mergeSorted(track: readonly TimedPoint[], incoming: readonly TimedPoint[]): TimedPoint[] {
  const merged = [...track, ...incoming].sort((a, b) => a.t - b.t);
  return merged.filter((p, i) => i === 0 || p.t !== merged[i - 1].t);
}

/** Which fixed-length window a time falls in, counted from `start`. */
export function windowIndex(t: number, start: number, windowMs: number): number {
  return Math.max(0, Math.floor((t - start) / windowMs));
}
