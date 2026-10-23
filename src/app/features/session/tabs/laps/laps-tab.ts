import { Component, computed, inject, input, linkedSignal, resource, signal } from '@angular/core';
import { SHEEP_CHIP, SHEEP_TABLE, SheepBadgeComponent, SheepButtonComponent } from '@sheep-ng/ui';
import { FASTEST_COLOR, Lap, OpenF1Service, formatLapTime } from '@core';
import { extent, groupBy, linearScale, niceTicks } from '@shared';
import { LAP_CHART, SECTOR_COLUMNS } from '../../session.constants';
import { DriverLabel, LapSeries, SectorKey, SectorRow, SessionContext } from '../../session.models';
import { driverLabel } from '../../session.utils';

const { width: W, height: H, margin: M } = LAP_CHART;

@Component({
  selector: 'app-laps-tab',
  imports: [SHEEP_CHIP, SHEEP_TABLE, SheepBadgeComponent, SheepButtonComponent],
  templateUrl: './laps-tab.html',
  styleUrl: './laps-tab.scss',
})
export class LapsTab {
  private readonly api = inject(OpenF1Service);
  readonly ctx = input.required<SessionContext>();

  protected readonly W = W;
  protected readonly H = H;
  protected readonly M = M;
  protected readonly fastest = FASTEST_COLOR;
  protected readonly fmt = formatLapTime;
  protected readonly emptySet = new Set<number>();
  protected readonly sectorCols = SECTOR_COLUMNS;

  protected readonly clean = signal(true);
  protected readonly hoverLap = signal<number | null>(null);

  protected readonly data = resource({
    params: () => this.ctx().session.session_key,
    loader: ({ params }) => this.api.laps(params),
  });

  protected readonly byDriver = computed(() => {
    const map = groupBy(this.data.value() ?? [], (l) => l.driver_number);
    for (const list of map.values()) list.sort((a, b) => a.lap_number - b.lap_number);
    return map;
  });

  protected readonly sectors = computed<SectorRow[]>(() => {
    const ctx = this.ctx();
    const rows: SectorRow[] = [];
    for (const [number, laps] of this.byDriver()) {
      const min = (pick: (l: Lap) => number | null) => {
        const values = laps.map(pick).filter((v): v is number => v !== null && v > 0);
        return values.length ? Math.min(...values) : null;
      };
      const s1 = min((l) => l.duration_sector_1);
      const s2 = min((l) => l.duration_sector_2);
      const s3 = min((l) => l.duration_sector_3);
      const speeds = laps.map((l) => l.st_speed).filter((v): v is number => v !== null);
      const driver = driverLabel(ctx, number);
      rows.push({
        driver,
        driverName: driver.name,
        best: min((l) => l.lap_duration),
        s1,
        s2,
        s3,
        ideal: s1 !== null && s2 !== null && s3 !== null ? s1 + s2 + s3 : null,
        speed: speeds.length ? Math.max(...speeds) : null,
      });
    }
    return rows.sort((a, b) => (a.best ?? Infinity) - (b.best ?? Infinity));
  });

  /** Session-best value per sector column, for the purple highlight. */
  protected readonly bests = computed(() => {
    const rows = this.sectors();
    const min = (key: SectorKey) => {
      const values = rows.map((r) => r[key]).filter((v): v is number => v !== null);
      return values.length ? Math.min(...values) : null;
    };
    return Object.fromEntries(SECTOR_COLUMNS.map((c) => [c.key, min(c.key)])) as Record<SectorKey, number | null>;
  });

  /** Drivers in order of best lap, for the picker. */
  protected readonly drivers = computed(() => this.sectors().map((r) => r.driver));

  /** Defaults to the fastest drivers; resets when the session changes. */
  protected readonly selected = linkedSignal<Set<number>>(
    () => new Set(this.drivers().slice(0, LAP_CHART.defaultDrivers).map((d) => d.number)),
  );

  protected toggle(driver: number): void {
    const next = new Set(this.selected());
    if (next.has(driver)) next.delete(driver);
    else next.add(driver);
    this.selected.set(next);
  }

  /** Laps shown on the chart: clean mode drops lap 1, pit in/out and slow laps. */
  private readonly visible = computed(() => {
    const selected = this.selected();
    const clean = this.clean();
    const limit = clean ? (this.bests().best ?? Infinity) * LAP_CHART.slowLapFactor : Infinity;
    const out = new Map<number, { lap: number; time: number }[]>();
    for (const [number, laps] of this.byDriver()) {
      if (!selected.has(number)) continue;
      const pitIn = new Set(laps.filter((l) => l.is_pit_out_lap).map((l) => l.lap_number - 1));
      out.set(
        number,
        laps
          .filter((l) => l.lap_duration !== null && l.lap_duration <= limit)
          .filter((l) => !clean || (l.lap_number > 1 && !l.is_pit_out_lap && !pitIn.has(l.lap_number)))
          .map((l) => ({ lap: l.lap_number, time: l.lap_duration as number })),
      );
    }
    return out;
  });

  protected readonly scales = computed(() => {
    const all = [...this.visible().values()].flat();
    const [lapMin, lapMax] = extent(all.map((p) => p.lap)) ?? [1, 2];
    const [tMin, tMax] = extent(all.map((p) => p.time)) ?? [0, 1];
    const pad = Math.max(0.2, (tMax - tMin) * 0.06);
    return {
      lapDomain: [lapMin, lapMax] as const,
      timeDomain: [tMin - pad, tMax + pad] as const,
      x: linearScale([lapMin, Math.max(lapMax, lapMin + 1)], [M.left, W - M.right]),
      // Faster laps sit higher on the chart.
      y: linearScale([tMin - pad, tMax + pad], [H - M.bottom, M.top]),
    };
  });

  protected readonly yTicks = computed(() => {
    const [lo, hi] = this.scales().timeDomain;
    return niceTicks(lo, hi, 5);
  });

  protected readonly xTicks = computed(() => {
    const [lo, hi] = this.scales().lapDomain;
    return niceTicks(lo, hi, 10).filter((t) => Number.isInteger(t));
  });

  protected readonly series = computed<LapSeries[]>(() => {
    const { x, y } = this.scales();
    const ctx = this.ctx();
    return [...this.visible()].map(([number, laps]) => {
      const points = laps.map((p) => ({ ...p, x: x(p.lap), y: y(p.time) }));
      let path = '';
      points.forEach((p, i) => {
        // Break the line across removed laps so gaps read as gaps.
        const joined = i > 0 && p.lap === points[i - 1].lap + 1;
        path += `${joined ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      });
      return { driver: driverLabel(ctx, number), path, points };
    });
  });

  protected readonly readout = computed(() => {
    const lap = this.hoverLap();
    if (lap === null) return null;
    const rows = this.series()
      .map((s) => ({ driver: s.driver, time: s.points.find((p) => p.lap === lap)?.time }))
      .filter((r): r is { driver: DriverLabel; time: number } => r.time !== undefined)
      .sort((a, b) => a.time - b.time);
    if (!rows.length) return null;
    const [lo, hi] = this.scales().lapDomain;
    return { lap, rows, flip: lap > (lo + hi) / 2 };
  });

  protected hover(event: PointerEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    const box = svg.getBoundingClientRect();
    const vx = ((event.clientX - box.left) / box.width) * W;
    const [lo, hi] = this.scales().lapDomain;
    const span = Math.max(hi - lo, 1);
    const lap = Math.round(lo + ((vx - M.left) / (W - M.left - M.right)) * span);
    this.hoverLap.set(lap >= lo && lap <= hi ? lap : null);
  }
}
