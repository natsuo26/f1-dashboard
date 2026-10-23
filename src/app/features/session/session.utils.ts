import { RaceControlMessage, Weather, teamColor } from '@core';
import { INCIDENT_PATTERN, SAFETY_CAR_PATTERN } from './session.constants';
import { ControlFilter, DriverLabel, SessionContext, WeatherSummary } from './session.models';

export function driverLabel(ctx: SessionContext, driverNumber: number): DriverLabel {
  const d = ctx.drivers.get(driverNumber);
  return {
    number: driverNumber,
    acronym: d?.name_acronym ?? String(driverNumber),
    name: d?.full_name ?? `#${driverNumber}`,
    team: d?.team_name ?? '—',
    color: teamColor(d),
  };
}

export function matchesControlFilter(m: RaceControlMessage, filter: ControlFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'flags':
      return m.category === 'Flag';
    case 'safety':
      return m.category === 'SafetyCar' || SAFETY_CAR_PATTERN.test(m.message);
    case 'incidents':
      return INCIDENT_PATTERN.test(m.message);
  }
}

/** Averages over the session; track range ignores the 0 °C sensor dropouts. */
export function summarizeWeather(samples: readonly Weather[]): WeatherSummary | null {
  if (!samples.length) return null;
  const avg = (pick: (x: Weather) => number) => samples.reduce((s, x) => s + pick(x), 0) / samples.length;
  const track = samples.map((x) => x.track_temperature).filter((t) => t > 0);
  return {
    air: avg((x) => x.air_temperature),
    trackMin: track.length ? Math.min(...track) : NaN,
    trackMax: track.length ? Math.max(...track) : NaN,
    humidity: avg((x) => x.humidity),
    wind: avg((x) => x.wind_speed),
    rain: samples.some((x) => x.rainfall > 0),
  };
}
