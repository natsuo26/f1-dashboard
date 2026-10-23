import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OPENF1_BASE_URL, OPENF1_RATE_LIMITS, RETRY_ATTEMPTS, RETRY_BASE_DELAY_MS } from '../constants/api.constants';
import { Filters, buildQuery } from './query-builder';
import { RateLimiter } from './rate-limiter';
import { readStore, writeStore } from './response-store';

export interface GetOptions {
  /** Persist the response in localStorage across reloads (small, immutable data only). */
  persist?: boolean;
  /** Keep the response in the in-memory cache (default true). Off for large, one-shot data. */
  cache?: boolean;
}

/**
 * Thin OpenF1 client: rate-limited to the free tier, de-duplicates in-flight
 * requests and caches responses (historical data never changes).
 */
@Injectable({ providedIn: 'root' })
export class OpenF1Client {
  private readonly http = inject(HttpClient);
  private readonly limiter = new RateLimiter(OPENF1_RATE_LIMITS);
  private readonly cache = new Map<string, Promise<unknown>>();

  get<T>(endpoint: string, filters: Filters = {}, options: GetOptions = {}): Promise<T[]> {
    const url = `${OPENF1_BASE_URL}/${endpoint}${buildQuery(filters)}`;
    const cached = this.cache.get(url);
    if (cached) return cached as Promise<T[]>;

    const stored = options.persist ? readStore<T[]>(url) : null;
    const request = stored
      ? Promise.resolve(stored)
      : this.fetch<T>(url).then((rows) => {
          if (options.persist) writeStore(url, rows);
          return rows;
        });
    if (options.cache === false) return request;
    this.cache.set(url, request);
    request.catch(() => this.cache.delete(url));
    return request;
  }

  private async fetch<T>(url: string, attempt = 0): Promise<T[]> {
    await this.limiter.acquire();
    try {
      return await firstValueFrom(this.http.get<T[]>(url));
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        // OpenF1 answers "no results" with a 404.
        if (err.status === 404) return [];
        if (err.status === 429 && attempt < RETRY_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, RETRY_BASE_DELAY_MS * (attempt + 1)));
          return this.fetch<T>(url, attempt + 1);
        }
      }
      throw err;
    }
  }
}
