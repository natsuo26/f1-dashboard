import { Tone } from '@shared';
import { ControlFilter, SectorKey, SessionTab } from './session.models';

export const SESSION_TABS: readonly { id: SessionTab; label: string }[] = [
  { id: 'results', label: 'Results' },
  { id: 'laps', label: 'Lap times' },
  { id: 'tyres', label: 'Tyre strategy' },
  { id: 'pits', label: 'Pit stops' },
  { id: 'control', label: 'Race control' },
];

export const DEFAULT_SESSION_TAB: SessionTab = 'results';

export const RESULT_STATUS_TEXT: Readonly<Record<string, string>> = {
  DNF: 'Did not finish',
  DNS: 'Did not start',
  DSQ: 'Disqualified',
};

/** Lap-time chart geometry (SVG viewBox units). */
export const LAP_CHART = {
  width: 900,
  height: 340,
  margin: { top: 12, right: 16, bottom: 30, left: 60 },
  /** Drivers pre-selected on the chart (fastest first). */
  defaultDrivers: 3,
  /** In clean mode, laps slower than fastest × this are hidden (SC, traffic, cool-down). */
  slowLapFactor: 1.1,
} as const;

export const SECTOR_COLUMNS: readonly { key: SectorKey; label: string }[] = [
  { key: 'best', label: 'Best lap' },
  { key: 's1', label: 'S1' },
  { key: 's2', label: 'S2' },
  { key: 's3', label: 'S3' },
  { key: 'ideal', label: 'Ideal' },
];

/** Tyre-strategy chart geometry (SVG viewBox units). */
export const STINT_CHART = {
  width: 900,
  rowHeight: 22,
  rowGap: 6,
  margin: { top: 8, right: 16, bottom: 28, left: 56 },
  /** Bars narrower than this get no label. */
  minLabelWidth: 22,
} as const;

export const CONTROL_FILTERS: readonly { id: ControlFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'flags', label: 'Flags' },
  { id: 'safety', label: 'Safety car' },
  { id: 'incidents', label: 'Incidents & penalties' },
];

export const CATEGORY_TONE: Readonly<Record<string, Tone>> = {
  SafetyCar: 'warning',
  Drs: 'primary',
  CarEvent: 'neutral',
  Other: 'neutral',
};

export const PENALTY_PATTERN = /PENALTY|INVESTIGATION|DELETED/i;
export const INCIDENT_PATTERN = /INCIDENT|PENALTY|INVESTIGATION|DELETED|REPRIMAND/i;
export const SAFETY_CAR_PATTERN = /SAFETY CAR/i;
