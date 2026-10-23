export interface DriverRow {
  position: number;
  number: number;
  name: string;
  acronym: string;
  team: string;
  color: string;
  points: number;
  gained: number;
  moved: number;
}

export interface TeamRow {
  position: number;
  team: string;
  color: string;
  points: number;
  gained: number;
  moved: number;
}
