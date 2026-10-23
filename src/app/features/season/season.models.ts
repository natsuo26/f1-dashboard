import { Meeting, Session } from '@core';

export interface MeetingCard {
  meeting: Meeting;
  sessions: Session[];
  testing: boolean;
  sprint: boolean;
  status: 'done' | 'next' | 'upcoming';
}
