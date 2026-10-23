import { RaceControlMessage, Weather } from '@core';
import { matchesControlFilter, summarizeWeather } from './session.utils';

describe('session.utils', () => {
  const msg = (category: string, message: string) => ({ category, message }) as RaceControlMessage;

  it('filters race control messages', () => {
    expect(matchesControlFilter(msg('Flag', 'GREEN LIGHT'), 'flags')).toBe(true);
    expect(matchesControlFilter(msg('Other', 'SAFETY CAR DEPLOYED'), 'safety')).toBe(true);
    expect(matchesControlFilter(msg('Other', 'CAR 4 TIME 1:32 DELETED'), 'incidents')).toBe(true);
    expect(matchesControlFilter(msg('Drs', 'DRS ENABLED'), 'incidents')).toBe(false);
  });

  it('summarizes weather, ignoring 0 °C track readings', () => {
    const w = (track: number, rain = 0) =>
      ({ air_temperature: 30, track_temperature: track, humidity: 70, wind_speed: 1, rainfall: rain }) as Weather;
    const summary = summarizeWeather([w(0), w(40), w(45, 1)]);
    expect(summary).toMatchObject({ trackMin: 40, trackMax: 45, rain: true, air: 30 });
    expect(summarizeWeather([])).toBeNull();
  });
});
