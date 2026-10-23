import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SHEEP_CHIP, SHEEP_LIST, SheepButtonComponent, SheepTooltipDirective } from '@sheep-ng/ui';
import { OpenF1Service, driverMap, formatElapsed, readableOn, teamColor } from '@core';
import { groupBy } from '@shared';
import {
  DEFAULT_SPEED,
  FAST_SPEED,
  LOCATION_WINDOW_MS,
  MAX_SAMPLE_GAP_MS,
  MIN_OUTLINE_SAMPLES,
  PLAYBACK_SPEEDS,
  PREFETCH_WINDOWS,
  SCRUB_STEP_MS,
  TRACK_PADDING,
  TRACK_SIZE,
} from './replay.constants';
import { Car, OrderRow, ReplayRange } from './replay.models';
import { Fit, TimedPoint, fitTransform, interpolate, mergeSorted, toPath, windowIndex } from './utils/track-geometry';
import { lapEnd, pickOutlineLap, positionAt, replayRange } from './utils/replay.utils';

@Component({
  selector: 'app-replay-page',
  imports: [DatePipe, RouterLink, SHEEP_CHIP, SHEEP_LIST, SheepButtonComponent, SheepTooltipDirective],
  templateUrl: './replay.page.html',
  styleUrl: './replay.page.scss',
})
export class ReplayPage {
  private readonly api = inject(OpenF1Service);

  readonly sessionKey = input.required({ transform: numberAttribute });

  protected readonly speeds = PLAYBACK_SPEEDS;
  protected readonly scrubStep = SCRUB_STEP_MS;
  protected readonly speed = signal<number>(DEFAULT_SPEED);
  protected readonly playing = signal(false);
  protected readonly focus = signal<number | null>(null);
  protected readonly time = signal(0);

  /** Merged, time-sorted location samples per driver for the windows loaded so far. */
  private readonly tracks = signal(new Map<number, TimedPoint[]>());
  private readonly loaded = signal(new Set<number>());
  private readonly requested = new Set<number>();

  protected readonly data = resource({
    params: () => this.sessionKey(),
    loader: async ({ params: key }) => {
      const session = await this.api.session(key);
      if (!session) throw new Error(`Session ${key} not found`);
      const [drivers, laps, positions] = await Promise.all([
        this.api.drivers(key),
        this.api.laps(key),
        this.api.positions(key),
      ]);
      const outlineLap = pickOutlineLap(laps);
      const outline = outlineLap
        ? await this.api.location(key, outlineLap.date_start as string, lapEnd(outlineLap), outlineLap.driver_number)
        : [];
      return { session, drivers, laps, positions, outline };
    },
  });

  protected readonly fit = computed<Fit | null>(() => {
    const outline = this.data.value()?.outline ?? [];
    return outline.length > MIN_OUTLINE_SAMPLES ? fitTransform(outline, TRACK_SIZE, TRACK_PADDING) : null;
  });

  protected readonly outline = computed(() => {
    const fit = this.fit();
    return fit ? toPath((this.data.value()?.outline ?? []).map(fit.project)) : '';
  });

  protected readonly range = computed<ReplayRange>(() => {
    const v = this.data.value();
    return v ? replayRange(v.session, v.laps) : { start: 0, end: 0 };
  });

  protected readonly elapsed = computed(() => formatElapsed(this.time() - this.range().start));

  protected readonly buffering = computed(() => {
    const idx = windowIndex(this.time(), this.range().start, LOCATION_WINDOW_MS);
    return !this.loaded().has(idx);
  });

  private readonly roster = computed(() => driverMap(this.data.value()?.drivers ?? []));

  protected readonly cars = computed<Car[]>(() => {
    const fit = this.fit();
    if (!fit) return [];
    const t = this.time();
    const roster = this.roster();
    const cars: Car[] = [];
    for (const [number, samples] of this.tracks()) {
      const p = interpolate(samples, t, MAX_SAMPLE_GAP_MS);
      if (!p) continue;
      const { x, y } = fit.project(p);
      const d = roster.get(number);
      const color = teamColor(d);
      cars.push({ number, acronym: d?.name_acronym ?? String(number), color, text: readableOn(color), x, y });
    }
    // Draw the focused car last so it sits on top.
    const focus = this.focus();
    return cars.sort((a, b) => Number(a.number === focus) - Number(b.number === focus));
  });

  private readonly positionsByDriver = computed(() => {
    const map = groupBy(this.data.value()?.positions ?? [], (p) => p.driver_number);
    for (const list of map.values()) list.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    return map;
  });

  protected readonly order = computed<OrderRow[]>(() => {
    const t = this.time();
    const roster = this.roster();
    const rows: OrderRow[] = [];
    for (const [number, samples] of this.positionsByDriver()) {
      const d = roster.get(number);
      rows.push({
        number,
        pos: positionAt(samples, t),
        acronym: d?.name_acronym ?? String(number),
        name: d?.full_name ?? `#${number}`,
        team: d?.team_name ?? '',
        color: teamColor(d),
      });
    }
    return rows.sort((a, b) => a.pos - b.pos);
  });

  protected readonly totalLaps = computed(() => Math.max(0, ...(this.data.value()?.laps ?? []).map((l) => l.lap_number)));

  protected readonly leaderLap = computed(() => {
    const leader = this.order()[0]?.number;
    if (leader === undefined) return 0;
    const t = this.time();
    return (this.data.value()?.laps ?? []).filter(
      (l) => l.driver_number === leader && l.date_start && Date.parse(l.date_start) <= t,
    ).length;
  });

  constructor() {
    // Start at the beginning once the session is known (and whenever the session changes).
    effect(() => {
      const { start, end } = this.range();
      const t = untracked(this.time);
      if (start && (t < start || t > end)) this.time.set(start);
    });

    // Keep the current window and the next ones loaded; faster playback looks further ahead.
    effect(() => {
      const key = this.data.value()?.session.session_key;
      if (!key || !this.fit()) return;
      const { start, end } = this.range();
      const idx = windowIndex(this.time(), start, LOCATION_WINDOW_MS);
      const ahead = this.speed() >= FAST_SPEED ? PREFETCH_WINDOWS.fast : PREFETCH_WINDOWS.normal;
      const last = windowIndex(end, start, LOCATION_WINDOW_MS);
      for (let i = idx; i <= Math.min(idx + ahead, last); i++) this.loadWindow(key, start, i);
    });

    this.startLoop();
  }

  protected toggle(): void {
    this.playing.update((p) => !p);
  }

  protected seek(event: Event): void {
    this.time.set(Number((event.target as HTMLInputElement).value));
  }

  private loadWindow(sessionKey: number, start: number, idx: number): void {
    if (this.requested.has(idx)) return;
    this.requested.add(idx);
    const from = new Date(start + idx * LOCATION_WINDOW_MS).toISOString();
    const to = new Date(start + (idx + 1) * LOCATION_WINDOW_MS).toISOString();
    this.api.location(sessionKey, from, to).then(
      (samples) => {
        const next = new Map(this.tracks());
        for (const [driver, rows] of groupBy(samples, (s) => s.driver_number)) {
          const points = rows.map((s) => ({ t: Date.parse(s.date), x: s.x, y: s.y }));
          next.set(driver, mergeSorted(next.get(driver) ?? [], points));
        }
        this.tracks.set(next);
        this.loaded.update((set) => new Set(set).add(idx));
      },
      () => this.requested.delete(idx),
    );
  }

  private startLoop(): void {
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (this.playing() && !this.buffering()) {
        const { end } = this.range();
        const next = this.time() + dt * this.speed();
        this.time.set(Math.min(next, end));
        if (next >= end) this.playing.set(false);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(frame));
  }
}
