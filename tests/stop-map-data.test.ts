import { describe, it, expect } from 'vitest';
import {
  toMarkerData, initialView, loadMapResources,
  SZCZECIN_CENTER, CITY_ZOOM, STOP_ZOOM,
} from '../src/stop-map-data';
import type { Stop } from '../src/types';

const stop = (over: Partial<Stop>): Stop => ({
  id: 1, number: '10001', name: 'Brama Portowa', latitude: 53.42, longitude: 14.55, ...over,
});

describe('toMarkerData', () => {
  it('maps valid stops to marker data', () => {
    const out = toMarkerData([stop({ number: '10001', name: 'A', latitude: 53.4, longitude: 14.5 })]);
    expect(out).toEqual([{ number: '10001', name: 'A', lat: 53.4, lng: 14.5 }]);
  });
  it('drops stops with non-finite or 0/0 coordinates', () => {
    const out = toMarkerData([
      stop({ number: '1', latitude: NaN, longitude: 14.5 }),
      stop({ number: '2', latitude: 53.4, longitude: Infinity }),
      stop({ number: '3', latitude: 0, longitude: 0 }),
      stop({ number: '4', latitude: 53.4, longitude: 14.5 }),
    ]);
    expect(out.map(m => m.number)).toEqual(['4']);
  });
});

describe('initialView', () => {
  it('centers on the selected stop at stop zoom', () => {
    const markers = toMarkerData([stop({ number: '99', latitude: 53.1, longitude: 14.9 })]);
    expect(initialView(markers, '99')).toEqual({ center: [53.1, 14.9], zoom: STOP_ZOOM });
  });
  it('falls back to Szczecin centre at city zoom when nothing selected', () => {
    expect(initialView([], undefined)).toEqual({ center: SZCZECIN_CENTER, zoom: CITY_ZOOM });
  });
  it('falls back when the selected number is not present', () => {
    const markers = toMarkerData([stop({ number: '1' })]);
    expect(initialView(markers, 'nope')).toEqual({ center: SZCZECIN_CENTER, zoom: CITY_ZOOM });
  });
});

describe('loadMapResources', () => {
  it('resolves with both the module and the stops', async () => {
    const mod = { mountStopMap: () => {} };
    const stops = [stop({ number: '1' })];
    const out = await loadMapResources(() => Promise.resolve(mod), () => Promise.resolve(stops));
    expect(out).toEqual({ mod, stops });
  });
  it('rejects when the module import fails', async () => {
    await expect(loadMapResources(() => Promise.reject(new Error('x')), () => Promise.resolve([])))
      .rejects.toThrow('x');
  });
  it('rejects when the stop fetch fails', async () => {
    await expect(loadMapResources(() => Promise.resolve({}), () => Promise.reject(new Error('net'))))
      .rejects.toThrow('net');
  });
});
