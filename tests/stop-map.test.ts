import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mocks so vi.mock factories can reference them (vitest hoists vi.mock calls).
const { marker, map, tileLayer, L } = vi.hoisted(() => {
  const marker = { on: vi.fn(), addTo: vi.fn(), bindPopup: vi.fn(), openPopup: vi.fn(), setStyle: vi.fn() };
  marker.on.mockReturnValue(marker); marker.addTo.mockReturnValue(marker); marker.bindPopup.mockReturnValue(marker);
  const map = { setView: vi.fn(), remove: vi.fn(), addLayer: vi.fn() };
  // map.setView must be chainable (implementation calls L.map(container).setView(...))
  map.setView.mockReturnValue(map);
  const tileLayer = { addTo: vi.fn() };
  const L = {
    map: vi.fn(() => map),
    tileLayer: vi.fn(() => tileLayer),
    canvas: vi.fn(() => ({})),
    circleMarker: vi.fn(() => marker),
  };
  return { marker, map, tileLayer, L };
});

vi.mock('leaflet', () => ({ default: L }));
vi.mock('leaflet/dist/leaflet.css?inline', () => ({ default: '/* css */' }));

import { mountStopMap } from '../src/stop-map';
import type { Stop } from '../src/types';

const stop = (over: Partial<Stop>): Stop => ({
  id: 1, number: '1', name: 'A', latitude: 53.4, longitude: 14.5, ...over,
});

beforeEach(() => { vi.clearAllMocks(); });

describe('mountStopMap', () => {
  it('creates a map, tile layer, and one circleMarker per valid stop', () => {
    const container = document.createElement('div');
    mountStopMap(container, [stop({ number: '1' }), stop({ number: '2' }), stop({ latitude: NaN })], {
      onPick: () => {},
    });
    expect(L.map).toHaveBeenCalledWith(container);
    expect(L.tileLayer).toHaveBeenCalledTimes(1);
    expect(L.circleMarker).toHaveBeenCalledTimes(2); // NaN stop dropped
  });

  it('sets the initial view to the selected stop', () => {
    const container = document.createElement('div');
    mountStopMap(container, [stop({ number: '7', latitude: 53.1, longitude: 14.9 })], {
      selectedNumber: '7', onPick: () => {},
    });
    expect(map.setView).toHaveBeenCalledWith([53.1, 14.9], 16);
  });

  it('returns a handle whose destroy() removes the map', () => {
    const container = document.createElement('div');
    const handle = mountStopMap(container, [stop({})], { onPick: () => {} });
    handle.destroy();
    expect(map.remove).toHaveBeenCalledTimes(1);
  });
});
