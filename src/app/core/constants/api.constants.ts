import { RateWindow } from '../api/rate-limiter';

export const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

/** OpenF1 free tier: 3 requests per second and 30 per minute. */
export const OPENF1_RATE_LIMITS: readonly RateWindow[] = [
  { limit: 3, ms: 1_000 },
  { limit: 30, ms: 60_000 },
];

/** Retries on HTTP 429, waiting this long × attempt number between tries. */
export const RETRY_ATTEMPTS = 2;
export const RETRY_BASE_DELAY_MS = 2_000;

/** localStorage key prefix and size cap for persisted responses. */
export const STORE_PREFIX = 'openf1:';
export const STORE_MAX_CHARS = 250_000;
