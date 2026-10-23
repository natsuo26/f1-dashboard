import { Session } from '../models/openf1.models';
import { gridSessionFor } from './session.utils';

describe('gridSessionFor', () => {
  const s = (key: number, type: string, start: string) =>
    ({ session_key: key, session_type: type, date_start: start }) as Session;
  const weekend = [
    s(1, 'Practice', '2026-10-09T08:00:00Z'),
    s(2, 'Qualifying', '2026-10-09T12:00:00Z'),
    s(3, 'Race', '2026-10-10T08:00:00Z'),
    s(4, 'Qualifying', '2026-10-10T12:00:00Z'),
    s(5, 'Race', '2026-10-11T12:00:00Z'),
  ];

  it('picks sprint qualifying for the sprint and qualifying for the race', () => {
    expect(gridSessionFor(weekend[2], weekend)?.session_key).toBe(2);
    expect(gridSessionFor(weekend[4], weekend)?.session_key).toBe(4);
  });
});
