import { Lap, PositionSample, Session } from '@core';
import { pickOutlineLap, positionAt, replayRange } from './replay.utils';

describe('replay.utils', () => {
  const lap = (n: number, start: string | null, duration: number | null, pitOut = false) =>
    ({ lap_number: n, date_start: start, lap_duration: duration, is_pit_out_lap: pitOut }) as Lap;

  it('picks the fastest clean lap for the outline', () => {
    const laps = [lap(1, '2026-01-01T00:00:00Z', 95), lap(2, '2026-01-01T00:01:35Z', 90, true), lap(3, null, 80)];
    expect(pickOutlineLap(laps)?.lap_number).toBe(1);
  });

  it('spans the replay from the first lap start to the last lap end', () => {
    const session = { date_start: '2026-01-01T00:00:00Z', date_end: '2026-01-01T02:00:00Z' } as Session;
    const laps = [lap(1, '2026-01-01T00:03:00Z', 100), lap(2, '2026-01-01T00:04:40Z', 90)];
    expect(replayRange(session, laps)).toEqual({
      start: Date.parse('2026-01-01T00:03:00Z'),
      end: Date.parse('2026-01-01T00:06:10Z'),
    });
    expect(replayRange(session, []).start).toBe(Date.parse(session.date_start));
  });

  it('finds the position at a time', () => {
    const samples = [
      { date: '2026-01-01T00:00:00Z', position: 4 },
      { date: '2026-01-01T00:10:00Z', position: 2 },
    ] as PositionSample[];
    expect(positionAt(samples, Date.parse('2026-01-01T00:05:00Z'))).toBe(4);
    expect(positionAt(samples, Date.parse('2026-01-01T00:15:00Z'))).toBe(2);
    expect(positionAt([], 0)).toBe(99);
  });
});
