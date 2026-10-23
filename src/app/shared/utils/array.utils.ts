/** The row with the smallest positive value, ignoring nulls and non-positive values. */
export function minBy<T>(rows: readonly T[], pick: (r: T) => number | null): T | undefined {
  let best: T | undefined;
  let bestValue = Infinity;
  for (const r of rows) {
    const v = pick(r);
    if (v === null || v <= 0) continue;
    if (v < bestValue) {
      best = r;
      bestValue = v;
    }
  }
  return best;
}

/** Groups rows into a map by key, keeping input order within each group. */
export function groupBy<T, K>(rows: Iterable<T>, key: (r: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const r of rows) {
    const k = key(r);
    const list = map.get(k);
    if (list) list.push(r);
    else map.set(k, [r]);
  }
  return map;
}
