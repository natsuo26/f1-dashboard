import { RateLimiter } from './rate-limiter';

describe('RateLimiter', () => {
  it('waits once a window is full', async () => {
    let now = 0;
    const slept: number[] = [];
    const limiter = new RateLimiter(
      [
        { limit: 3, ms: 1_000 },
        { limit: 5, ms: 60_000 },
      ],
      () => now,
      async (ms) => {
        slept.push(ms);
        now += ms;
      },
    );
    for (let i = 0; i < 3; i++) await limiter.acquire();
    expect(slept).toEqual([]);
    await limiter.acquire(); // 4th inside the same second
    expect(slept).toEqual([1_000]);
    await limiter.acquire(); // 5th fits the minute window
    await limiter.acquire(); // 6th must wait for the minute to roll over
    expect(now).toBe(60_000);
  });
});
