import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Leaflet-backed adapter so no real Leaflet/DOM map is needed.
const handle = { setSelected: vi.fn(), destroy: vi.fn() };
const mountStopMap = vi.fn(() => handle);
vi.mock('../src/stop-map', () => ({ mountStopMap }));

// Stub the API singleton: stops for the map, a display for direction preview.
vi.mock('../src/zditm-api', () => ({
  zditmApi: {
    fetchStops: vi.fn(() => Promise.resolve([
      { id: 1, number: '10001', name: 'Brama Portowa', latitude: 53.4, longitude: 14.5 },
    ])),
    fetchDisplay: vi.fn(() => Promise.resolve({
      stop_name: 'Brama Portowa', stop_number: '10001', updated_at: '', message: null,
      departures: [{ line_number: '3', direction: 'Pomorzany', time_real: 2, time_scheduled: null }],
    })),
    searchStops: vi.fn(() => Promise.resolve([])),
  },
}));

import { ZditmDeparturesCardEditor } from '../src/editor';
import type { CardConfig } from '../src/types';

if (!customElements.get('zditm-editor-test')) {
  customElements.define('zditm-editor-test', class extends ZditmDeparturesCardEditor {});
}
const flush = () => new Promise(r => setTimeout(r, 0));
const baseConfig: CardConfig = { type: 'custom:zditm-departures-card', stop: '10001' };

function makeEditor() {
  const el = document.createElement('zditm-editor-test') as ZditmDeparturesCardEditor;
  el.setConfig({ ...baseConfig });
  document.body.appendChild(el);
  return el;
}

beforeEach(() => { vi.clearAllMocks(); document.body.innerHTML = ''; });

describe('editor map integration', () => {
  it('emits config-changed with the picked stop and keeps source = stop', async () => {
    const el = makeEditor();
    await el.updateComplete;
    const events: CardConfig[] = [];
    el.addEventListener('config-changed', (e: any) => events.push(e.detail.config));

    // Drive the pick path directly (UI-independent).
    (el as any).selectStopFromMap({ number: '20002', name: 'Plac Rodła' });

    expect(events.at(-1)).toMatchObject({ stop: '20002', entity: undefined });
  });

  it('lazy-loads the map module and mounts it once on open', async () => {
    const el = makeEditor();
    await el.updateComplete;
    await (el as any).toggleMap();
    await el.updateComplete;
    await flush();
    await el.updateComplete;
    expect(mountStopMap).toHaveBeenCalledTimes(1);
  });

  it('records an error and stops loading when resources fail', async () => {
    const { zditmApi } = await import('../src/zditm-api');
    (zditmApi.fetchStops as any).mockRejectedValueOnce(new Error('net'));
    const el = makeEditor();
    await el.updateComplete;
    await (el as any).toggleMap();
    expect((el as any).mapError).toBeTruthy();
    expect((el as any).mapLoading).toBe(false);
  });

  it('builds best-effort directions for the popup', async () => {
    const el = makeEditor();
    await el.updateComplete;
    const dirs = await (el as any).loadStopDirections('10001');
    expect(dirs).toContain('3 → Pomorzany');
  });

  it('renders the map button (stop source) and the map container after opening', async () => {
    const el = makeEditor();           // baseConfig has stop:'10001' => source 'stop'
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.mapbtn')).toBeTruthy();
    await (el as any).toggleMap();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.mapwrap')).toBeTruthy();
  });
});
