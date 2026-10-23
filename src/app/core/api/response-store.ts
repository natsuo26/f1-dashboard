import { STORE_MAX_CHARS, STORE_PREFIX } from '../constants/api.constants';

/** localStorage persistence for small, immutable responses. Failures are ignored. */
export function readStore<T>(url: string): T | null {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + url);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStore(url: string, value: unknown): void {
  try {
    const raw = JSON.stringify(value);
    if (raw.length <= STORE_MAX_CHARS) localStorage.setItem(STORE_PREFIX + url, raw);
  } catch {
    // Storage full or unavailable: the in-memory cache still applies.
  }
}
