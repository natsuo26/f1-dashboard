import { groupBy, minBy } from './array.utils';

describe('array.utils', () => {
  it('finds the smallest positive value', () => {
    const rows = [{ v: 3 }, { v: null }, { v: 0 }, { v: 2 }];
    expect(minBy(rows, (r) => r.v)).toEqual({ v: 2 });
    expect(minBy([], () => 1)).toBeUndefined();
  });

  it('groups rows by key', () => {
    const grouped = groupBy([1, 2, 3, 4], (n) => n % 2);
    expect(grouped.get(1)).toEqual([1, 3]);
    expect(grouped.get(0)).toEqual([2, 4]);
  });
});
