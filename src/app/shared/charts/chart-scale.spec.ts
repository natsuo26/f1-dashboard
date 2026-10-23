import { extent, linearScale, median, niceTicks } from './chart-scale';

describe('chart-scale', () => {
  it('maps a domain onto a range, including inverted ranges', () => {
    const x = linearScale([0, 10], [0, 100]);
    expect(x(5)).toBe(50);
    const y = linearScale([90, 100], [200, 0]);
    expect(y(90)).toBe(200);
    expect(y(95)).toBe(100);
    expect(linearScale([3, 3], [0, 10])(3)).toBe(5);
  });

  it('builds nice ticks', () => {
    expect(niceTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(91.2, 99.7, 4)).toEqual([92.5, 95, 97.5]);
    expect(niceTicks(4, 4)).toEqual([4]);
  });

  it('computes extent and median', () => {
    expect(extent([3, null, 1, 7, undefined, NaN])).toEqual([1, 7]);
    expect(extent([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});
