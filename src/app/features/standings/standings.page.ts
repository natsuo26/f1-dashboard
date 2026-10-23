import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SHEEP_TABLE, SheepBadgeComponent } from '@sheep-ng/ui';
import { Driver, OpenF1Service, teamColor } from '@core';
import { YearPicker } from '@shared';
import { DriverRow, TeamRow } from './standings.models';

@Component({
  selector: 'app-standings-page',
  imports: [DatePipe, DecimalPipe, RouterLink, SHEEP_TABLE, SheepBadgeComponent, YearPicker],
  templateUrl: './standings.page.html',
  styleUrl: './standings.page.scss',
})
export class StandingsPage {
  private readonly api = inject(OpenF1Service);

  readonly year = input.required({ transform: numberAttribute });

  protected readonly data = resource({
    params: () => this.year(),
    loader: async ({ params: year }) => {
      const sessions = await this.api.sessionsForYear(year);
      const now = Date.now();
      const race = sessions.filter((s) => s.session_name === 'Race' && Date.parse(s.date_end) < now).at(-1);
      if (!race) return { race: undefined, drivers: [], teams: [], roster: [] as Driver[] };
      const [drivers, teams, roster] = await Promise.all([
        this.api.championshipDrivers(race.session_key),
        this.api.championshipTeams(race.session_key),
        this.api.drivers(race.session_key),
      ]);
      return { race, drivers, teams, roster };
    },
  });

  protected readonly drivers = computed<DriverRow[]>(() => {
    const v = this.data.value();
    if (!v) return [];
    const roster = new Map(v.roster.map((d) => [d.driver_number, d]));
    return v.drivers
      .map((c) => {
        const d = roster.get(c.driver_number);
        return {
          position: c.position_current,
          number: c.driver_number,
          name: d?.full_name ?? `#${c.driver_number}`,
          acronym: d?.name_acronym ?? '',
          team: d?.team_name ?? '—',
          color: teamColor(d),
          points: c.points_current,
          gained: c.points_current - (c.points_start ?? 0),
          moved: c.position_start ? c.position_start - c.position_current : 0,
        };
      })
      .sort((a, b) => a.position - b.position);
  });

  protected readonly teams = computed<TeamRow[]>(() => {
    const v = this.data.value();
    if (!v) return [];
    const colors = new Map(v.roster.map((d) => [d.team_name, teamColor(d)]));
    return v.teams
      .map((t) => ({
        position: t.position_current,
        team: t.team_name,
        color: colors.get(t.team_name) ?? teamColor(undefined),
        points: t.points_current,
        gained: t.points_current - (t.points_start ?? 0),
        moved: t.position_start ? t.position_start - t.position_current : 0,
      }))
      .sort((a, b) => a.position - b.position);
  });
}
