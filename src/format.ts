import type { Departure, CardMode, LineInfo, LineCategory, DisplayResponse } from './types';

export type LineKind = 'tram' | 'bus';

// Build a DisplayResponse from a Home Assistant sensor state (the integration's
// "next departure" stop sensor). Maps the entity's `departures` attribute
// (keys: line, direction, time_real, time_scheduled, category) onto the card's
// Departure shape. Returns undefined when the entity/attributes are absent.
export function displayFromEntity(
  stateObj: { state?: string; attributes?: Record<string, any> } | undefined,
): DisplayResponse | undefined {
  if (!stateObj || !stateObj.attributes) return undefined;
  const a = stateObj.attributes;
  const raw = Array.isArray(a.departures) ? a.departures : [];
  const departures: Departure[] = raw.map((d: any) => ({
    line_number: String(d.line ?? d.line_number ?? ''),
    direction: String(d.direction ?? ''),
    // Prefer raw time_real; for older integration data that omits it, fall back to
    // the computed `minutes` for live departures (scheduled ones use time_scheduled).
    time_real: d.time_real ?? (d.is_live ? (d.minutes ?? null) : null),
    time_scheduled: d.time_scheduled ?? null,
    category: d.category as LineCategory | undefined,
  }));
  return {
    stop_name: a.stop_name ?? a.friendly_name ?? '',
    stop_number: String(a.stop_number ?? ''),
    departures,
    message: a.message ?? null,
    updated_at: a.updated_at ?? '',
  };
}

export function classifyLine(line: string, tramLines: string[]): LineKind {
  return tramLines.map(String).includes(String(line)) ? 'tram' : 'bus';
}

export function categorize(
  lineNumber: string,
  info: LineInfo | undefined,
  tramLines: string[],
): LineCategory {
  if (info) {
    if (info.vehicle_type === 'tram') return 'tram';
    if (info.type === 'night') return 'night';
    if (info.subtype === 'fast') return 'fast';
    if (info.subtype === 'replacement') return 'replacement';
    return 'bus';
  }
  // Fallback heuristic before /lines has loaded
  const s = String(lineNumber);
  if (tramLines.map(String).includes(s)) return 'tram';
  if (/^[A-Za-z]/.test(s)) return 'fast';
  if (/^5\d{2}$/.test(s)) return 'night';
  if (/^8\d{2}$/.test(s)) return 'replacement';
  return 'bus';
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
