/** A car drawn on the track at the current replay time. */
export interface Car {
  number: number;
  acronym: string;
  color: string;
  /** Text colour that reads on `color`. */
  text: string;
  x: number;
  y: number;
}

/** A row of the running-order panel. */
export interface OrderRow {
  number: number;
  pos: number;
  acronym: string;
  name: string;
  team: string;
  color: string;
}

export interface ReplayRange {
  /** Epoch ms of the first lap's start (0 until loaded). */
  start: number;
  /** Epoch ms of the last lap's end (0 until loaded). */
  end: number;
}
