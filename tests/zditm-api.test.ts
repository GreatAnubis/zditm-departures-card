import { describe, it, expect, vi } from 'vitest';
import { ZditmApi, StopNotFoundError, RateLimitError } from '../src/zditm-api';
import type { DisplayResponse, Stop } from '../src/types';

const sample: DisplayResponse = {
  stop_name: 'Turzyn Dworzec', stop_number: '10111',
  departures: [{ line_number: '75', direction: 'Os. Zawadzkiego', time_real: 3, time_scheduled: null }],
  message: null, updated_at: '2026-06-16T19:20:54Z',
};

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers });
}

describe('ZditmApi.fetchDisplay', () => {
  it('fetches and parses a display', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(sample));
    const api = new ZditmApi({ fetchFn });
    const res = await api.fetchDisplay('10111');
    expect(res.stop_name).toBe('Turzyn Dworzec');
    expect(fetchFn).toHaveBeenCalledWith('https://www.zditm.szczecin.pl/api/v1/displays/10111');
  });

  it('throws StopNotFoundError on 404', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({}, 404));
    const api = new ZditmApi({ fetchFn });
    await expect(api.fetchDisplay('999999')).rejects.toBeInstanceOf(StopNotFoundError);
  });

  it('throws RateLimitError on 429', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({}, 429, { 'Retry-After': '5' }));
    const api = new ZditmApi({ fetchFn });
    await expect(api.fetchDisplay('10111')).rejects.toBeInstanceOf(RateLimitError);
  });
});

describe('ZditmApi caching & backoff', () => {
  it('serves cached data within TTL (one network call for two reads)', async () => {
    let t = 1000;
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(sample));
    const api = new ZditmApi({ fetchFn, now: () => t });
    await api.fetchDisplay('10111', 15000);
    t = 5000; // within 15s TTL
    await api.fetchDisplay('10111', 15000);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('re-fetches after TTL expires', async () => {
    let t = 1000;
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(sample));
    const api = new ZditmApi({ fetchFn, now: () => t });
    await api.fetchDisplay('10111', 15000);
    t = 20000; // past TTL
    await api.fetchDisplay('10111', 15000);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('after 429, serves stale cache during backoff window', async () => {
    let t = 1000;
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(jsonResponse(sample))
      .mockResolvedValueOnce(jsonResponse({}, 429, { 'Retry-After': '5' }));
    const api = new ZditmApi({ fetchFn, now: () => t });
    await api.fetchDisplay('10111', 1);
    t = 100;
    const res = await api.fetchDisplay('10111', 1);
    expect(res.stop_name).toBe('Turzyn Dworzec');
  });
});

const stops: Stop[] = [
  { id: 1, number: '10111', name: 'Turzyn Dworzec', latitude: 53.42, longitude: 14.52 },
  { id: 2, number: '10112', name: 'Turzyn Dworzec', latitude: 53.42, longitude: 14.52 },
];

describe('ZditmApi.fetchStops', () => {
  it('fetches and caches the stop list (one network call)', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ data: stops }));
    const api = new ZditmApi({ fetchFn });
    const a = await api.fetchStops();
    const b = await api.fetchStops();
    expect(a.length).toBe(2);
    expect(b).toBe(a);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('searchStops matches name case-insensitively', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ data: stops }));
    const api = new ZditmApi({ fetchFn });
    const results = await api.searchStops('turzyn');
    expect(results.map(s => s.number)).toEqual(['10111', '10112']);
    expect(await api.searchStops('nieistnieje')).toEqual([]);
  });
});
