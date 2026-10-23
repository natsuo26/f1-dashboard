import { formatElapsed, formatGap, formatLapTime, lastPhase } from './format.utils';

describe('format.utils', () => {
  it('formats lap times', () => {
    expect(formatLapTime(97.51)).toBe('1:37.510');
    expect(formatLapTime(61.005)).toBe('1:01.005');
    expect(formatLapTime(9.4)).toBe('9.400');
    expect(formatLapTime(null)).toBe('—');
  });

  it('formats gaps', () => {
    expect(formatGap(0)).toBe('Leader');
    expect(formatGap(7.335)).toBe('+7.335');
    expect(formatGap('+1 LAP')).toBe('+1 LAP');
  });

  it('formats elapsed time', () => {
    expect(formatElapsed(125_000)).toBe('2:05');
    expect(formatElapsed(3_725_000)).toBe('1:02:05');
    expect(formatElapsed(-5)).toBe('0:00');
  });

  it('takes the last set qualifying phase', () => {
    expect(lastPhase([93.2, 91.6, null])).toBe(91.6);
    expect(lastPhase(12)).toBe(12);
    expect(lastPhase([null, null])).toBeNull();
  });
});
