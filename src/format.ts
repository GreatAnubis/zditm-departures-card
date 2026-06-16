import type { Departure, CardMode } from './types';

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

export function selectDepartures(departures: Departure[], mode: CardMode, count: number): Departure[] {
  const limit = mode === 'compact' ? 3 : Math.max(1, count);
  return departures.slice(0, limit);
}

export function isLive(dep: Departure): boolean {
  return dep.time_real !== null;
}

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

// Absolute clock time "HH:MM". For live departures: now + time_real minutes.
export function departureClock(dep: Departure, now: Date): string {
  if (dep.time_real !== null) {
    const d = new Date(now.getTime() + dep.time_real * 60000);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  if (dep.time_scheduled) return dep.time_scheduled;
  return '—';
}

// Relative "za X min" / "teraz". For scheduled departures: parse HH:MM and diff from now (handles day rollover).
export function departureRelative(dep: Departure, now: Date): string {
  if (dep.time_real !== null) {
    return dep.time_real === 0 ? 'teraz' : `za ${dep.time_real} min`;
  }
  if (dep.time_scheduled) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(dep.time_scheduled.trim());
    if (!m) return dep.time_scheduled;
    const target = new Date(now);
    target.setHours(Number(m[1]), Number(m[2]), 0, 0);
    if (target.getTime() < now.getTime() - 60000) target.setDate(target.getDate() + 1);
    const diff = Math.round((target.getTime() - now.getTime()) / 60000);
    return diff <= 0 ? 'teraz' : `za ${diff} min`;
  }
  return '—';
}
