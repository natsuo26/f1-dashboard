/** First season OpenF1 has data for. */
export const FIRST_YEAR = 2023;

export const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'] as const;

export const COMPOUND_COLORS: Readonly<Record<string, string>> = {
  SOFT: '#e8002d',
  MEDIUM: '#ffd12e',
  HARD: '#f0f0ec',
  INTERMEDIATE: '#43b02a',
  WET: '#0067ad',
};

export const UNKNOWN_COMPOUND_COLOR = '#9a9a9a';

/** Used when OpenF1 has no team colour for a driver. */
export const FALLBACK_TEAM_COLOR = '#8a8a8a';

/** F1's "purple" for the fastest time in a session. */
export const FASTEST_COLOR = '#a855f7';

/** Race control flags as badge colours. */
export const FLAG_COLORS: Readonly<Record<string, { color: string; text: string }>> = {
  GREEN: { color: '#1f9d55', text: '#fff' },
  CLEAR: { color: '#1f9d55', text: '#fff' },
  YELLOW: { color: '#f5c518', text: '#111' },
  'DOUBLE YELLOW': { color: '#f5c518', text: '#111' },
  RED: { color: '#d62828', text: '#fff' },
  BLUE: { color: '#1e6fd9', text: '#fff' },
  CHEQUERED: { color: '#111', text: '#fff' },
  'BLACK AND WHITE': { color: '#444', text: '#fff' },
  BLACK: { color: '#000', text: '#fff' },
};
