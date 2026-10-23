/** Response shapes for the OpenF1 REST API (https://openf1.org/docs). */

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_code: string;
  country_name: string;
  country_flag?: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_image?: string;
  gmt_offset: string;
  date_start: string;
  date_end?: string;
  year: number;
  is_cancelled?: boolean;
}

export type SessionType = 'Practice' | 'Qualifying' | 'Race' | string;

export interface Session {
  session_key: number;
  session_type: SessionType;
  session_name: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  circuit_short_name: string;
  country_code: string;
  country_name: string;
  location: string;
  gmt_offset: string;
  year: number;
  is_cancelled?: boolean;
}

export interface Driver {
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string | null;
  team_colour: string | null;
  first_name: string;
  last_name: string;
  headshot_url: string | null;
}

export interface ChampionshipDriver {
  session_key: number;
  driver_number: number;
  position_start: number | null;
  position_current: number;
  points_start: number | null;
  points_current: number;
}

export interface ChampionshipTeam {
  session_key: number;
  team_name: string;
  position_start: number | null;
  position_current: number;
  points_start: number | null;
  points_current: number;
}

/** Qualifying results carry one value per phase (Q1, Q2, Q3). */
export type PhaseValue = number | null | (number | null)[];

export interface SessionResult {
  session_key: number;
  driver_number: number;
  position: number | null;
  number_of_laps: number;
  points?: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  duration: PhaseValue;
  gap_to_leader: PhaseValue | string;
}

export interface StartingGridEntry {
  session_key: number;
  driver_number: number;
  position: number;
  lap_duration: number | null;
}

export interface Lap {
  driver_number: number;
  lap_number: number;
  date_start: string | null;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
}

export type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | string;

export interface Stint {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: Compound | null;
  tyre_age_at_start: number | null;
}

export interface PitStop {
  date: string;
  driver_number: number;
  lap_number: number;
  lane_duration: number | null;
  stop_duration: number | null;
}

export interface RaceControlMessage {
  date: string;
  driver_number: number | null;
  lap_number: number | null;
  category: string;
  flag: string | null;
  scope: string | null;
  sector: number | null;
  message: string;
}

export interface Weather {
  date: string;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  wind_direction: number;
  wind_speed: number;
}

export interface LocationSample {
  date: string;
  driver_number: number;
  x: number;
  y: number;
  z: number;
}

export interface PositionSample {
  date: string;
  driver_number: number;
  position: number;
}
