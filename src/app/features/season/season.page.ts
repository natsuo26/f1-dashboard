import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SHEEP_LIST, SheepBadgeComponent } from '@sheep-ng/ui';
import { OpenF1Service, Session } from '@core';
import { YearPicker } from '@shared';
import { MeetingCard } from './season.models';

@Component({
  selector: 'app-season-page',
  imports: [DatePipe, RouterLink, SHEEP_LIST, SheepBadgeComponent, YearPicker],
  templateUrl: './season.page.html',
  styleUrl: './season.page.scss',
})
export class SeasonPage {
  private readonly api = inject(OpenF1Service);

  /** Bound from the `:year` route param. */
  readonly year = input.required({ transform: numberAttribute });

  protected readonly placeholders = [1, 2, 3, 4, 5, 6];

  protected readonly data = resource({
    params: () => this.year(),
    loader: async ({ params: year }) => {
      const [meetings, sessions] = await Promise.all([this.api.meetings(year), this.api.sessionsForYear(year)]);
      return { meetings, sessions };
    },
  });

  protected readonly cards = computed<MeetingCard[]>(() => {
    const value = this.data.value();
    if (!value) return [];
    const now = Date.now();
    let nextFound = false;
    return value.meetings.map((meeting) => {
      const sessions = value.sessions.filter((s) => s.meeting_key === meeting.meeting_key);
      const end = Date.parse(meeting.date_end ?? sessions.at(-1)?.date_end ?? meeting.date_start);
      let status: MeetingCard['status'] = 'done';
      if (end > now) {
        status = nextFound ? 'upcoming' : 'next';
        nextFound = true;
      }
      return {
        meeting,
        sessions,
        testing: /testing/i.test(meeting.meeting_name),
        sprint: sessions.some((s) => s.session_name === 'Sprint'),
        status,
      };
    });
  });

  protected isPast(s: Session): boolean {
    return Date.parse(s.date_end) < Date.now();
  }
}
