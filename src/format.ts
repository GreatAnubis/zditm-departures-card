import type { Departure } from './types';

export type LineKind = 'tram' | 'bus';

export function classifyLine(line: string, tramLines: string[]): LineKind {
  return tramLines.map(String).includes(String(line)) ? 'tram' : 'bus';
}

export interface DepartureFilter {
  lines?: (string | number)[];
  directions?: string[];
}

export function filterDepartures(departures: Departure[], filter: DepartureFilter): Departure[] {
  const lines = filter.lines?.map(String);
  const dirs = filter.directions?.map(d => d.toLowerCase());
  return departures.filter(d => {
    if (lines && lines.length && !lines.includes(String(d.line_number))) return false;
    if (dirs && dirs.length && !dirs.some(dir => d.direction.toLowerCase().includes(dir))) return false;
    return true;
  });
}

export interface FormattedTime {
  live: boolean;
  text: string;
}

export function formatDeparture(dep: Departure): FormattedTime {
  if (dep.time_real !== null) {
    return { live: true, text: dep.time_real === 0 ? 'teraz' : `za ${dep.time_real} min` };
  }
  if (dep.time_scheduled) return { live: false, text: dep.time_scheduled };
  return { live: false, text: '—' };
}
