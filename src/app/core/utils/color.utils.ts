import { COMPOUND_COLORS, FALLBACK_TEAM_COLOR, UNKNOWN_COMPOUND_COLOR } from '../constants/f1.constants';
import { Compound, Driver } from '../models/openf1.models';

export function compoundColor(compound: Compound | null | undefined): string {
  return COMPOUND_COLORS[compound ?? ''] ?? UNKNOWN_COMPOUND_COLOR;
}

/** OpenF1 colours come without "#" and are sometimes missing. */
export function teamColor(driver: Pick<Driver, 'team_colour'> | undefined): string {
  const c = driver?.team_colour;
  return c && /^[0-9a-f]{6}$/i.test(c) ? `#${c}` : FALLBACK_TEAM_COLOR;
}

/** Black or white text, whichever reads better on the given hex background. */
export function readableOn(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111111' : '#ffffff';
}
