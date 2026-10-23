import { buildQuery } from './query-builder';

describe('buildQuery', () => {
  it('encodes equality and comparison filters', () => {
    expect(
      buildQuery({
        session_key: 11388,
        driver_number: undefined,
        date: [
          { op: '>=', value: '2026-10-11T12:30:00' },
          { op: '<', value: '2026-10-11T12:31:00' },
        ],
      }),
    ).toBe('?session_key=11388&date>=2026-10-11T12%3A30%3A00&date<2026-10-11T12%3A31%3A00');
  });

  it('returns an empty string without filters', () => {
    expect(buildQuery({})).toBe('');
  });
});
