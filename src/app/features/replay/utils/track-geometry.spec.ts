import { fitTransform, indexAtOrBefore, interpolate, mergeSorted, toPath, windowIndex } from './track-geometry';

describe('track-geometry', () => {
  it('fits points into the box, keeping aspect and flipping y', () => {
    const fit = fitTransform(
      [
        { x: -100, y: 0 },
        { x: 100, y: 100 },
      ],
      220,
      10,
    );
    expect(fit.width).toBe(220);
    expect(fit.height).toBe(120);
    expect(fit.project({ x: -100, y: 0 })).toEqual({ x: 10, y: 110 });
    expect(fit.project({ x: 100, y: 100 })).toEqual({ x: 210, y: 10 });
  });

  it('closes a path when it loops back', () => {
    expect(
      toPath([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toBe('M0.0,0.0L100.0,0.0L1.0,1.0Z');
  });

  const track = [
    { t: 0, x: 0, y: 0 },
    { t: 1000, x: 10, y: 20 },
    { t: 2000, x: 20, y: 20 },
    { t: 20_000, x: 99, y: 99 },
  ];

  it('finds the sample at or before a time', () => {
    expect(indexAtOrBefore(track, -1)).toBe(-1);
    expect(indexAtOrBefore(track, 0)).toBe(0);
    expect(indexAtOrBefore(track, 1500)).toBe(1);
    expect(indexAtOrBefore(track, 50_000)).toBe(3);
  });

  it('interpolates and hides cars across long gaps', () => {
    expect(interpolate(track, 500)).toEqual({ x: 5, y: 10 });
    expect(interpolate(track, -10)).toBeNull();
    expect(interpolate(track, 3000)).toEqual({ x: 20, y: 20 });
    expect(interpolate(track, 10_000)).toBeNull();
  });

  it('merges sorted tracks without duplicates', () => {
    const merged = mergeSorted(track.slice(2), track.slice(0, 3));
    expect(merged.map((p) => p.t)).toEqual([0, 1000, 2000, 20_000]);
  });

  it('computes window indices', () => {
    expect(windowIndex(0, 0, 60_000)).toBe(0);
    expect(windowIndex(59_999, 0, 60_000)).toBe(0);
    expect(windowIndex(60_000, 0, 60_000)).toBe(1);
    expect(windowIndex(-5, 0, 60_000)).toBe(0);
  });
});
