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
