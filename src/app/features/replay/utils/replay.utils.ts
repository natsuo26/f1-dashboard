import { Lap, PositionSample, Session } from '@core';
import { ReplayRange } from '../replay.models';

/** A clean, quick lap to trace the circuit: the session's fastest timed lap. */
export function pickOutlineLap(laps: readonly Lap[]): Lap | undefined {
  return laps
    .filter((l) => l.date_start && l.lap_duration && !l.is_pit_out_lap)
    .sort((a, b) => (a.lap_duration as number) - (b.lap_duration as number))[0];
}

/** ISO end time of a lap. */
export function lapEnd(lap: Lap): string {
  return new Date(Date.parse(lap.date_start as string) + (lap.lap_duration ?? 0) * 1000).toISOString();
}

/** Replay spans from the first lap's start to the end of the last lap, falling back to the session times. */
export function replayRange(session: Session, laps: readonly Lap[]): ReplayRange {
  const timed = laps.filter((l) => l.date_start);
  if (!timed.length) return { start: Date.parse(session.date_start), end: Date.parse(session.date_end) };
  return {
    start: Math.min(...timed.map((l) => Date.parse(l.date_start as string))),
    end: Math.max(...timed.map((l) => Date.parse(lapEnd(l)))),
  };
}

/** A driver's position at time `t` from their date-sorted position samples. */
export function positionAt(samples: readonly PositionSample[], t: number): number {
  let pos = samples[0]?.position ?? 99;
  for (const s of samples) {
    if (Date.parse(s.date) > t) break;
    pos = s.position;
  }
  return pos;
}
