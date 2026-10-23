import { PhaseValue } from '../models/openf1.models';

/** 97.51 → "1:37.510"; 9.4 → "9.400". */
export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return '—';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  const secs = rest.toFixed(3).padStart(minutes ? 6 : 1, '0');
  return minutes ? `${minutes}:${secs}` : secs;
}

/** Race duration in seconds → "1:42:00.785". */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return '—';
  const h = Math.floor(seconds / 3600);
  const rest = seconds - h * 3600;
  return h ? `${h}:${formatLapTime(rest).padStart(9, '0')}` : formatLapTime(rest);
}

/** Gap to the leader: seconds → "+7.335", or OpenF1's "+1 LAP" strings as-is. */
export function formatGap(gap: number | string | null | undefined): string {
  if (gap === null || gap === undefined) return '—';
  if (typeof gap === 'string') return gap;
  if (gap === 0) return 'Leader';
  return `+${gap.toFixed(3)}`;
}

/** Elapsed milliseconds → "1:02:05" / "2:05". */
export function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h ? h + ':' : ''}${String(m).padStart(h ? 2 : 1, '0')}:${String(sec).padStart(2, '0')}`;
}

/** Qualifying values are per phase; take the last phase the driver set a value in. */
export function lastPhase(value: PhaseValue | undefined): number | null;
export function lastPhase(value: PhaseValue | string | undefined): number | string | null;
export function lastPhase(value: PhaseValue | string | undefined): number | string | null {
  if (Array.isArray(value)) {
    for (let i = value.length - 1; i >= 0; i--) if (value[i] !== null) return value[i];
    return null;
  }
  return value ?? null;
}
