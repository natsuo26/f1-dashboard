import { Component, computed, inject, input, resource } from '@angular/core';
import { COMPOUNDS, OpenF1Service, compoundColor, readableOn } from '@core';
import { groupBy, linearScale, niceTicks } from '@shared';
import { STINT_CHART } from '../../session.constants';
import { SessionContext, StintRow } from '../../session.models';
import { driverLabel } from '../../session.utils';

const { width: W, rowHeight: ROW, rowGap: GAP, margin: M } = STINT_CHART;

@Component({
  selector: 'app-tyres-tab',
  templateUrl: './tyres-tab.html',
  styleUrl: './tyres-tab.scss',
})
export class TyresTab {
  private readonly api = inject(OpenF1Service);
  readonly ctx = input.required<SessionContext>();

  protected readonly W = W;
  protected readonly ROW = ROW;
  protected readonly M = M;
  protected readonly minLabelWidth = STINT_CHART.minLabelWidth;
  protected readonly compounds = COMPOUNDS;
  protected readonly color = compoundColor;

  protected readonly data = resource({
    params: () => this.ctx().session.session_key,
    loader: async ({ params }) => {
      const [stints, results] = await Promise.all([this.api.stints(params), this.api.results(params)]);
      return { stints, results };
    },
  });

  private readonly maxLap = computed(() => Math.max(1, ...(this.data.value()?.stints ?? []).map((s) => s.lap_end ?? 0)));

  protected readonly x = computed(() => linearScale([0, this.maxLap()], [M.left, W - M.right]));
  protected readonly ticks = computed(() => niceTicks(0, this.maxLap(), 10).filter(Number.isInteger));

  protected readonly rows = computed<StintRow[]>(() => {
    const v = this.data.value();
    if (!v) return [];
    const ctx = this.ctx();
    const x = this.x();
    const order = new Map(v.results.map((r) => [r.driver_number, r.position ?? 99]));
    return [...groupBy(v.stints, (s) => s.driver_number).entries()]
      .sort(([a], [b]) => (order.get(a) ?? 99) - (order.get(b) ?? 99) || a - b)
      .map(([number, stints], i) => {
        const driver = driverLabel(ctx, number);
        return {
          driver,
          y: M.top + i * (ROW + GAP),
          bars: [...stints]
            .sort((a, b) => a.stint_number - b.stint_number)
            .map((s) => {
              const start = x(s.lap_start - 1);
              const compound = s.compound ?? 'UNKNOWN';
              const fill = compoundColor(s.compound);
              const laps = s.lap_end - s.lap_start + 1;
              const age = s.tyre_age_at_start ?? 0;
              return {
                x: start,
                width: Math.max(2, x(s.lap_end) - start),
                fill,
                ink: readableOn(fill),
                letter: `${compound.charAt(0)}${age ? ' ' + age : ''}`,
                title: `${driver.acronym}: ${compound} laps ${s.lap_start}–${s.lap_end} (${laps} laps, ${age} old when fitted)`,
              };
            }),
        };
      });
  });

  protected readonly height = computed(() => M.top + this.rows().length * (ROW + GAP) + M.bottom);
}
