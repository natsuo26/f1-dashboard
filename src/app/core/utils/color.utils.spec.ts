import { FALLBACK_TEAM_COLOR } from '../constants/f1.constants';
import { compoundColor, readableOn, teamColor } from './color.utils';

describe('color.utils', () => {
  it('handles team colours', () => {
    expect(teamColor({ team_colour: 'F47600' })).toBe('#F47600');
    expect(teamColor({ team_colour: null })).toBe(FALLBACK_TEAM_COLOR);
  });

  it('picks readable text colours', () => {
    expect(readableOn('#ffffff')).toBe('#111111');
    expect(readableOn('#000000')).toBe('#ffffff');
  });

  it('maps compounds', () => {
    expect(compoundColor('SOFT')).toBe('#e8002d');
    expect(compoundColor(null)).toBe('#9a9a9a');
  });
});
