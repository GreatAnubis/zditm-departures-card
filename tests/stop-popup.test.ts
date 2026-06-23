import { describe, it, expect, vi } from 'vitest';
import { createStopPopup } from '../src/stop-popup';
import type { MarkerDatum } from '../src/stop-map-data';

const datum: MarkerDatum = { number: '10001', name: 'Brama Portowa', lat: 53.4, lng: 14.5 };
const flush = () => new Promise(r => setTimeout(r, 0));

describe('createStopPopup', () => {
  it('renders the stop name and post number', () => {
    const el = createStopPopup(datum, { onPick: () => {} });
    expect(el.textContent).toContain('Brama Portowa');
    expect(el.textContent).toContain('10001');
  });

  it('calls onPick with number and name when the button is clicked', () => {
    const onPick = vi.fn();
    const el = createStopPopup(datum, { onPick });
    el.querySelector('button')!.click();
    expect(onPick).toHaveBeenCalledWith({ number: '10001', name: 'Brama Portowa' });
  });

  it('fills served directions from loadDirections', async () => {
    const el = createStopPopup(datum, { onPick: () => {}, loadDirections: () => Promise.resolve(['3 → Pomorzany']) });
    await flush();
    expect(el.textContent).toContain('3 → Pomorzany');
  });

  it('shows a no-data note when loadDirections resolves empty', async () => {
    const el = createStopPopup(datum, { onPick: () => {}, loadDirections: () => Promise.resolve([]) });
    await flush();
    expect(el.textContent).toContain('brak danych podglądu');
  });

  it('shows a no-data note when loadDirections rejects', async () => {
    const el = createStopPopup(datum, { onPick: () => {}, loadDirections: () => Promise.reject(new Error('429')) });
    await flush();
    expect(el.textContent).toContain('brak danych podglądu');
  });
});
