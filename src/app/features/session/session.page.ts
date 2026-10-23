import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SHEEP_CHIP, SheepBadgeComponent, SheepButtonComponent } from '@sheep-ng/ui';
import { OpenF1Service, driverMap } from '@core';
import { DEFAULT_SESSION_TAB, SESSION_TABS } from './session.constants';
import { SessionContext, SessionTab } from './session.models';
import { summarizeWeather } from './session.utils';
import { ControlTab } from './tabs/control/control-tab';
import { LapsTab } from './tabs/laps/laps-tab';
import { PitsTab } from './tabs/pits/pits-tab';
import { ResultsTab } from './tabs/results/results-tab';
import { TyresTab } from './tabs/tyres/tyres-tab';

@Component({
  selector: 'app-session-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    SHEEP_CHIP,
    SheepBadgeComponent,
    SheepButtonComponent,
    ResultsTab,
    LapsTab,
    TyresTab,
    PitsTab,
    ControlTab,
  ],
  templateUrl: './session.page.html',
  styleUrl: './session.page.scss',
})
export class SessionPage {
  private readonly api = inject(OpenF1Service);
  private readonly router = inject(Router);

  readonly sessionKey = input.required({ transform: numberAttribute });
  /** `?tab=` query param. */
  readonly tab = input<string>();

  protected readonly tabs = SESSION_TABS;
  protected readonly activeTab = computed<SessionTab>(
    () => SESSION_TABS.find((t) => t.id === this.tab())?.id ?? DEFAULT_SESSION_TAB,
  );

  protected readonly data = resource({
    params: () => this.sessionKey(),
    loader: async ({ params: key }) => {
      const session = await this.api.session(key);
      if (!session) throw new Error(`Session ${key} not found`);
      const [meeting, weekend, drivers, weather] = await Promise.all([
        this.api.meeting(session.meeting_key),
        this.api.meetingSessions(session.meeting_key),
        this.api.drivers(key),
        this.api.weather(key),
      ]);
      return { session, meeting, weekend, drivers, weather };
    },
  });

  protected readonly ctx = computed<SessionContext | undefined>(() => {
    const v = this.data.value();
    if (!v) return undefined;
    return { session: v.session, meeting: v.meeting, weekend: v.weekend, drivers: driverMap(v.drivers) };
  });

  protected readonly weather = computed(() => summarizeWeather(this.data.value()?.weather ?? []));

  protected openReplay(): void {
    void this.router.navigate(['/session', this.sessionKey(), 'replay']);
  }
}
