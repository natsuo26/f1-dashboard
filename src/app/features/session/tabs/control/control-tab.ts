import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { SHEEP_CHIP, SHEEP_LIST, SheepBadgeComponent } from '@sheep-ng/ui';
import { FLAG_COLORS, OpenF1Service, RaceControlMessage } from '@core';
import { Tone } from '@shared';
import { CATEGORY_TONE, CONTROL_FILTERS, PENALTY_PATTERN } from '../../session.constants';
import { ControlFilter, SessionContext } from '../../session.models';
import { matchesControlFilter } from '../../session.utils';

@Component({
  selector: 'app-control-tab',
  imports: [DatePipe, SHEEP_CHIP, SHEEP_LIST, SheepBadgeComponent],
  templateUrl: './control-tab.html',
  styleUrl: './control-tab.scss',
})
export class ControlTab {
  private readonly api = inject(OpenF1Service);
  readonly ctx = input.required<SessionContext>();

  protected readonly filters = CONTROL_FILTERS;
  protected readonly filter = signal<ControlFilter>('all');

  protected readonly data = resource({
    params: () => this.ctx().session.session_key,
    loader: ({ params }) => this.api.raceControl(params),
  });

  protected readonly counts = computed(() => {
    const all = this.data.value() ?? [];
    return Object.fromEntries(
      CONTROL_FILTERS.map((f) => [f.id, all.filter((m) => matchesControlFilter(m, f.id)).length]),
    ) as Record<ControlFilter, number>;
  });

  protected readonly messages = computed(() =>
    (this.data.value() ?? []).filter((m) => matchesControlFilter(m, this.filter())),
  );

  protected flagColor(flag: string) {
    return FLAG_COLORS[flag] ?? null;
  }

  protected tone(m: RaceControlMessage): Tone {
    if (PENALTY_PATTERN.test(m.message)) return 'danger';
    return CATEGORY_TONE[m.category] ?? 'neutral';
  }
}
