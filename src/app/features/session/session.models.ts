import { Driver, Meeting, Session } from '@core';

/** Everything the session tabs share, loaded once by the session page. */
export interface SessionContext {
  session: Session;
  meeting: Meeting | undefined;
  /** All sessions of the same meeting, in date order. */
  weekend: Session[];
  drivers: Map<number, Driver>;
}

export interface DriverLabel {
  number: number;
  acronym: string;
  name: string;
  team: string;
  color: string;
}

export type SessionTab = 'results' | 'laps' | 'tyres' | 'pits' | 'control';

export type ControlFilter = 'all' | 'flags' | 'incidents' | 'safety';

export interface WeatherSummary {
  air: number;
  trackMin: number;
  trackMax: number;
  humidity: number;
  wind: number;
  rain: boolean;
}

export interface ResultRow {
  position: number | null;
  driver: DriverLabel;
  driverName: string;
  team: string;
  laps: number;
  time: string;
  gap: string;
  grid: number | null;
  gained: number | null;
  points: number | null;
  status: 'DNF' | 'DNS' | 'DSQ' | null;
}

export interface PitRow {
  lap: number;
  driver: DriverLabel;
  driverName: string;
  team: string;
  lane: number | null;
  stop: number | null;
}

export interface SectorRow {
  driver: DriverLabel;
  driverName: string;
  best: number | null;
  s1: number | null;
  s2: number | null;
  s3: number | null;
  ideal: number | null;
  speed: number | null;
}

export type SectorKey = 'best' | 's1' | 's2' | 's3' | 'ideal';

export interface LapPoint {
  lap: number;
  time: number;
  x: number;
  y: number;
}

export interface LapSeries {
  driver: DriverLabel;
  path: string;
  points: LapPoint[];
}

export interface StintBar {
  x: number;
  width: number;
  fill: string;
  ink: string;
  letter: string;
  title: string;
}

export interface StintRow {
  driver: DriverLabel;
  y: number;
  bars: StintBar[];
}
