import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, resource } from '@angular/core';
import { SHEEP_TABLE, SheepBadgeComponent, SheepTooltipDirective } from '@sheep-ng/ui';
import {
  OpenF1Service,
  formatDuration,
  formatGap,
  formatLapTime,
  gridSessionFor,
  isRaceLike,
  lastPhase,
} from '@core';
import { RESULT_STATUS_TEXT } from '../../session.constants';
import { ResultRow, SessionContext } from '../../session.models';
import { driverLabel } from '../../session.utils';

@Component({
  selector: 'app-results-tab',
  imports: [DecimalPipe, SHEEP_TABLE, SheepBadgeComponent, SheepTooltipDirective],
  templateUrl: './results-tab.html',
  styleUrl: './results-tab.scss',
})
export class ResultsTab {
  private readonly api = inject(OpenF1Service);
  readonly ctx = input.required<SessionContext>();

  protected readonly race = computed(() => isRaceLike(this.ctx().session));
  protected readonly statusText = RESULT_STATUS_TEXT;

  protected readonly data = resource({
    params: () => this.ctx(),
    loader: async ({ params: ctx }) => {
      const gridSession = isRaceLike(ctx.session) ? gridSessionFor(ctx.session, ctx.weekend) : undefined;
      const [results, grid] = await Promise.all([
        this.api.results(ctx.session.session_key),
        gridSession ? this.api.startingGrid(gridSession.session_key) : Promise.resolve([]),
      ]);
      return { results, grid };
    },
  });

  protected readonly rows = computed<ResultRow[]>(() => {
    const v = this.data.value();
    if (!v) return [];
    const ctx = this.ctx();
    const race = this.race();
    const grid = new Map(v.grid.map((g) => [g.driver_number, g.position]));
    return v.results
      .map((r) => {
        const driver = driverLabel(ctx, r.driver_number);
        const gridPos = grid.get(r.driver_number) ?? null;
        const time = lastPhase(r.duration);
        return {
          position: r.position,
          driver,
          driverName: driver.name,
          team: driver.team,
          laps: r.number_of_laps,
          time: race ? (r.position === 1 ? formatDuration(time) : '') : formatLapTime(time),
          gap: formatGap(lastPhase(r.gap_to_leader)),
          grid: gridPos,
          gained: gridPos && r.position ? gridPos - r.position : null,
          points: r.points ?? null,
          status: r.dsq ? 'DSQ' : r.dns ? 'DNS' : r.dnf ? 'DNF' : null,
        } satisfies ResultRow;
      })
      .sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  });
}
