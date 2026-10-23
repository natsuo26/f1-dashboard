export interface RateWindow {
  /** Maximum requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  ms: number;
}

/**
 * Sliding-window limiter. `acquire()` resolves when a request may be sent
 * without breaking any of the windows (OpenF1 free tier: 3/s and 30/min).
 */
export class RateLimiter {
  private readonly sent: number[] = [];
  private chain: Promise<void> = Promise.resolve();

  constructor(
    private readonly windows: readonly RateWindow[],
    private readonly now: () => number = () => Date.now(),
    private readonly sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
  ) {}

  /** How long the next request must wait, in ms (0 = can go now). */
  delay(): number {
    const now = this.now();
    let wait = 0;
    for (const { limit, ms } of this.windows) {
      const inWindow = this.sent.filter((t) => now - t < ms);
      if (inWindow.length >= limit) {
        // The oldest request in the window must age out first.
        const oldest = inWindow[inWindow.length - limit];
        wait = Math.max(wait, oldest + ms - now);
      }
    }
    return wait;
  }

  /** Waits for a free slot, then records the request as sent. */
  acquire(): Promise<void> {
    const next = this.chain.then(async () => {
      for (let wait = this.delay(); wait > 0; wait = this.delay()) {
        await this.sleep(wait);
      }
      this.record();
    });
    this.chain = next.catch(() => undefined);
    return next;
  }

  private record(): void {
    const now = this.now();
    this.sent.push(now);
    const longest = Math.max(...this.windows.map((w) => w.ms));
    while (this.sent.length && now - this.sent[0] >= longest) this.sent.shift();
  }
}
