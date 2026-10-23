import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, resource } from '@angular/core';
import { SHEEP_TABLE } from '@sheep-ng/ui';
import { OpenF1Service } from '@core';
import { minBy } from '@shared';
import { PitRow, SessionContext } from '../../session.models';
import { driverLabel } from '../../session.utils';

@Component({
  selector: 'app-pits-tab',
  imports: [DecimalPipe, SHEEP_TABLE],
  templateUrl: './pits-tab.html',
  styleUrl: './pits-tab.scss',
})
export class PitsTab {
  private readonly api = inject(OpenF1Service);
  readonly ctx = input.required<SessionContext>();

  protected readonly data = resource({
    params: () => this.ctx().session.session_key,
    loader: ({ params }) => this.api.pits(params),
  });

  protected readonly rows = computed<PitRow[]>(() => {
    const ctx = this.ctx();
    return (this.data.value() ?? [])
      .map((p) => {
        const driver = driverLabel(ctx, p.driver_number);
        return {
          lap: p.lap_number,
          driver,
          driverName: driver.name,
          team: driver.team,
          lane: p.lane_duration,
          stop: p.stop_duration,
        };
      })
      .sort((a, b) => a.lap - b.lap);
  });

  protected readonly fastest = computed(() => minBy(this.rows(), (r) => r.lane));
  protected readonly fastestStop = computed(() => minBy(this.rows(), (r) => r.stop));
}
