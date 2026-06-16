import { describe, it, expect } from 'vitest';
import { classifyLine } from '../src/format';
import { DEFAULT_TRAM_LINES } from '../src/types';

describe('classifyLine', () => {
  it('classifies a default tram line as tram', () => {
    expect(classifyLine('3', DEFAULT_TRAM_LINES)).toBe('tram');
  });
  it('classifies a bus line as bus', () => {
    expect(classifyLine('75', DEFAULT_TRAM_LINES)).toBe('bus');
  });
  it('classifies night/letter lines as bus', () => {
    expect(classifyLine('521', DEFAULT_TRAM_LINES)).toBe('bus');
    expect(classifyLine('B', DEFAULT_TRAM_LINES)).toBe('bus');
  });
  it('respects an override list', () => {
    expect(classifyLine('75', ['75'])).toBe('tram');
  });
});

import { filterDepartures } from '../src/format';
import type { Departure } from '../src/types';

const deps: Departure[] = [
  { line_number: '75', direction: 'Osiedle Zawadzkiego', time_real: 3, time_scheduled: null },
  { line_number: '521', direction: 'Osiedle Zawadzkiego', time_real: null, time_scheduled: '23:58' },
  { line_number: '3', direction: 'Pomorzany', time_real: 7, time_scheduled: null },
];

describe('filterDepartures', () => {
  it('returns all when no filters', () => {
    expect(filterDepartures(deps, {}).length).toBe(3);
  });
  it('filters by line (string or number)', () => {
    expect(filterDepartures(deps, { lines: [75] }).map(d => d.line_number)).toEqual(['75']);
    expect(filterDepartures(deps, { lines: ['3', '75'] }).length).toBe(2);
  });
  it('filters by direction substring, case-insensitive', () => {
    expect(filterDepartures(deps, { directions: ['pomorz'] }).map(d => d.line_number)).toEqual(['3']);
  });
  it('combines line and direction filters', () => {
    expect(filterDepartures(deps, { lines: [75, 3], directions: ['zawadz'] }).map(d => d.line_number)).toEqual(['75']);
  });
});

import { formatDeparture } from '../src/format';

describe('formatDeparture', () => {
  it('formats live minutes with live=true', () => {
    expect(formatDeparture({ line_number: '75', direction: 'X', time_real: 3, time_scheduled: null }))
      .toEqual({ live: true, text: 'za 3 min' });
  });
  it('formats time_real 0 as "teraz"', () => {
    expect(formatDeparture({ line_number: '75', direction: 'X', time_real: 0, time_scheduled: null }))
      .toEqual({ live: true, text: 'teraz' });
  });
  it('formats scheduled time with live=false', () => {
    expect(formatDeparture({ line_number: '75', direction: 'X', time_real: null, time_scheduled: '21:48' }))
      .toEqual({ live: false, text: '21:48' });
  });
  it('falls back to "—" when both null', () => {
    expect(formatDeparture({ line_number: '75', direction: 'X', time_real: null, time_scheduled: null }))
      .toEqual({ live: false, text: '—' });
  });
});

import { selectDepartures } from '../src/format';

const many: Departure[] = Array.from({ length: 6 }, (_, i) => ({
  line_number: '75', direction: 'X', time_real: i, time_scheduled: null,
}));

describe('selectDepartures', () => {
  it('list mode takes first `count`', () => {
    expect(selectDepartures(many, 'list', 3).length).toBe(3);
  });
  it('compact mode takes first 3 (big + 2)', () => {
    expect(selectDepartures(many, 'compact', 99).length).toBe(3);
  });
  it('never returns more than available', () => {
    expect(selectDepartures(many.slice(0, 2), 'list', 5).length).toBe(2);
  });
});

import { isLive, departureClock, departureRelative } from '../src/format';

describe('isLive', () => {
  it('true when time_real present, false otherwise', () => {
    expect(isLive({ line_number: '75', direction: 'X', time_real: 3, time_scheduled: null })).toBe(true);
    expect(isLive({ line_number: '75', direction: 'X', time_real: null, time_scheduled: '21:48' })).toBe(false);
  });
});

describe('departureClock', () => {
  const now = new Date(2026, 5, 16, 22, 15, 0);
  it('live: now + minutes formatted HH:MM', () => {
    expect(departureClock({ line_number: '75', direction: 'X', time_real: 16, time_scheduled: null }, now)).toBe('22:31');
  });
  it('live: zero-pads', () => {
    expect(departureClock({ line_number: '75', direction: 'X', time_real: 50, time_scheduled: null }, new Date(2026, 5, 16, 9, 5, 0))).toBe('09:55');
  });
  it('scheduled: returns the timetable time as-is', () => {
    expect(departureClock({ line_number: '75', direction: 'X', time_real: null, time_scheduled: '22:35' }, now)).toBe('22:35');
  });
});

describe('departureRelative', () => {
  const now = new Date(2026, 5, 16, 22, 15, 0);
  it('live: "za X min"', () => {
    expect(departureRelative({ line_number: '75', direction: 'X', time_real: 16, time_scheduled: null }, now)).toBe('za 16 min');
  });
  it('live zero: "teraz"', () => {
    expect(departureRelative({ line_number: '75', direction: 'X', time_real: 0, time_scheduled: null }, now)).toBe('teraz');
  });
  it('scheduled: minutes until the timetable time', () => {
    expect(departureRelative({ line_number: '75', direction: 'X', time_real: null, time_scheduled: '22:35' }, now)).toBe('za 20 min');
  });
  it('scheduled past midnight rolls to next day', () => {
    const late = new Date(2026, 5, 16, 23, 58, 0);
    expect(departureRelative({ line_number: '75', direction: 'X', time_real: null, time_scheduled: '00:58' }, late)).toBe('za 60 min');
  });
});

import { categorize } from '../src/format';
import type { LineInfo } from '../src/types';
import { DEFAULT_TRAM_LINES as TRAMS } from '../src/types';

const li = (over: Partial<LineInfo>): LineInfo =>
  ({ number: '0', vehicle_type: 'bus', type: 'day', subtype: 'normal', ...over });

describe('categorize (with API info)', () => {
  it('tram by vehicle_type', () => { expect(categorize('4', li({ vehicle_type: 'tram' }), TRAMS)).toBe('tram'); });
  it('night bus by type', () => { expect(categorize('521', li({ type: 'night' }), TRAMS)).toBe('night'); });
  it('fast bus by subtype', () => { expect(categorize('A', li({ subtype: 'fast' }), TRAMS)).toBe('fast'); });
  it('replacement bus by subtype', () => { expect(categorize('811', li({ subtype: 'replacement' }), TRAMS)).toBe('replacement'); });
  it('normal bus otherwise', () => { expect(categorize('75', li({}), TRAMS)).toBe('bus'); });
});

describe('categorize (fallback, no API info)', () => {
  it('tram from tramLines list', () => { expect(categorize('4', undefined, TRAMS)).toBe('tram'); });
  it('letter line to fast', () => { expect(categorize('A', undefined, TRAMS)).toBe('fast'); });
  it('5xx to night', () => { expect(categorize('521', undefined, TRAMS)).toBe('night'); });
  it('8xx to replacement', () => { expect(categorize('811', undefined, TRAMS)).toBe('replacement'); });
  it('plain number to bus', () => { expect(categorize('75', undefined, TRAMS)).toBe('bus'); });
});
