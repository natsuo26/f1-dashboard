export type FilterOperator = '<' | '<=' | '>' | '>=';

/** A filter value; use `{ op, value }` for comparisons such as `date>=…`. */
export type FilterValue =
  | string
  | number
  | boolean
  | { op: FilterOperator; value: string | number }
  | (string | number | { op: FilterOperator; value: string | number })[];

export type Filters = Record<string, FilterValue | null | undefined>;

/** Builds an OpenF1 query string. Operators go between key and value unescaped. */
export function buildQuery(filters: Filters): string {
  const parts: string[] = [];
  for (const [key, raw] of Object.entries(filters)) {
    if (raw === null || raw === undefined) continue;
    for (const v of Array.isArray(raw) ? raw : [raw]) {
      if (typeof v === 'object') {
        parts.push(`${encodeURIComponent(key)}${v.op}${encodeURIComponent(String(v.value))}`);
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
      }
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
