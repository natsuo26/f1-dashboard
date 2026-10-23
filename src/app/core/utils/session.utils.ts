import { FIRST_YEAR } from '../constants/f1.constants';
import { Driver, Session } from '../models/openf1.models';

export function currentYear(): number {
  return new Date().getUTCFullYear();
}

/** Seasons with data, newest first. */
export function yearsAvailable(): number[] {
  const years: number[] = [];
  for (let y = currentYear(); y >= FIRST_YEAR; y--) years.push(y);
  return years;
}

export function isRaceLike(session: Session): boolean {
  return session.session_type === 'Race';
}

/**
 * The qualifying session that set a race's grid: the last qualifying-type
 * session that started before it (Sprint Qualifying for a Sprint, Qualifying for the Race).
 */
export function gridSessionFor(race: Session, meetingSessions: readonly Session[]): Session | undefined {
  return meetingSessions
    .filter((s) => s.session_type === 'Qualifying' && s.date_start < race.date_start)
    .sort(byDate((s) => s.date_start))
    .at(-1);
}

export function driverMap(drivers: readonly Driver[]): Map<number, Driver> {
  return new Map(drivers.map((d) => [d.driver_number, d]));
}

/** Comparator for rows by an ISO date field. */
export function byDate<T>(pick: (row: T) => string): (a: T, b: T) => number {
  return (a, b) => Date.parse(pick(a)) - Date.parse(pick(b));
}
