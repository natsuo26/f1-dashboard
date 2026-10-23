import { Injectable, inject } from '@angular/core';
import { OpenF1Client } from '../api/openf1-client';
import { byDate, currentYear } from '../utils/session.utils';
import {
  ChampionshipDriver,
  ChampionshipTeam,
  Driver,
  Lap,
  LocationSample,
  Meeting,
  PitStop,
  PositionSample,
  RaceControlMessage,
  Session,
  SessionResult,
  StartingGridEntry,
  Stint,
  Weather,
} from '../models/openf1.models';

/** Domain-level access to OpenF1. Everything session-scoped is immutable once the session ends. */
@Injectable({ providedIn: 'root' })
export class OpenF1Service {
  private readonly client = inject(OpenF1Client);

  meetings(year: number): Promise<Meeting[]> {
    return this.client
      .get<Meeting>('meetings', { year }, { persist: year < currentYear() })
      .then((rows) => rows.sort(byDate((m) => m.date_start)));
  }

  sessionsForYear(year: number): Promise<Session[]> {
    return this.client
      .get<Session>('sessions', { year }, { persist: year < currentYear() })
      .then((rows) => rows.sort(byDate((s) => s.date_start)));
  }

  async session(sessionKey: number): Promise<Session | undefined> {
    const [session] = await this.client.get<Session>('sessions', { session_key: sessionKey }, { persist: true });
    return session;
  }

  meetingSessions(meetingKey: number): Promise<Session[]> {
    return this.client
      .get<Session>('sessions', { meeting_key: meetingKey })
      .then((rows) => rows.sort(byDate((s) => s.date_start)));
  }

  async meeting(meetingKey: number): Promise<Meeting | undefined> {
    const [meeting] = await this.client.get<Meeting>('meetings', { meeting_key: meetingKey }, { persist: true });
    return meeting;
  }

  drivers(sessionKey: number): Promise<Driver[]> {
    return this.client.get<Driver>('drivers', { session_key: sessionKey }, { persist: true });
  }

  championshipDrivers(sessionKey: number): Promise<ChampionshipDriver[]> {
    return this.client.get<ChampionshipDriver>('championship_drivers', { session_key: sessionKey }, { persist: true });
  }

  championshipTeams(sessionKey: number): Promise<ChampionshipTeam[]> {
    return this.client.get<ChampionshipTeam>('championship_teams', { session_key: sessionKey }, { persist: true });
  }

  results(sessionKey: number): Promise<SessionResult[]> {
    return this.client.get<SessionResult>('session_result', { session_key: sessionKey }, { persist: true });
  }

  /** Starting grids are keyed by the qualifying session that set them. */
  startingGrid(qualifyingSessionKey: number): Promise<StartingGridEntry[]> {
    return this.client.get<StartingGridEntry>('starting_grid', { session_key: qualifyingSessionKey }, { persist: true });
  }

  laps(sessionKey: number): Promise<Lap[]> {
    return this.client.get<Lap>('laps', { session_key: sessionKey });
  }

  stints(sessionKey: number): Promise<Stint[]> {
    return this.client.get<Stint>('stints', { session_key: sessionKey }, { persist: true });
  }

  pits(sessionKey: number): Promise<PitStop[]> {
    return this.client.get<PitStop>('pit', { session_key: sessionKey }, { persist: true });
  }

  raceControl(sessionKey: number): Promise<RaceControlMessage[]> {
    return this.client.get<RaceControlMessage>('race_control', { session_key: sessionKey }, { persist: true });
  }

  weather(sessionKey: number): Promise<Weather[]> {
    return this.client.get<Weather>('weather', { session_key: sessionKey }, { persist: true });
  }

  positions(sessionKey: number): Promise<PositionSample[]> {
    return this.client.get<PositionSample>('position', { session_key: sessionKey }, { persist: true });
  }

  /** Car locations for every driver (or one) between two ISO timestamps. */
  location(sessionKey: number, from: string, to: string, driverNumber?: number): Promise<LocationSample[]> {
    return this.client.get<LocationSample>(
      'location',
      {
        session_key: sessionKey,
        driver_number: driverNumber,
        date: [
          { op: '>=', value: from },
          { op: '<', value: to },
        ],
      },
      { cache: false },
    );
  }
}
