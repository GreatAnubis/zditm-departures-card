import type { Stop } from './types';

export interface MarkerDatum { number: string; name: string; lat: number; lng: number; }
export interface MapView { center: [number, number]; zoom: number; }

// Szczecin city centre (Brama Portowa area). Used as the default map view.
export const SZCZECIN_CENTER: [number, number] = [53.4285, 14.5528];
export const CITY_ZOOM = 12;
export const STOP_ZOOM = 16;

export function toMarkerData(stops: Stop[]): MarkerDatum[] {
  const out: MarkerDatum[] = [];
  for (const s of stops) {
    const lat = s.latitude, lng = s.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (lat === 0 && lng === 0) continue;
    out.push({ number: s.number, name: s.name, lat, lng });
  }
  return out;
}

export function initialView(markers: MarkerDatum[], selectedNumber?: string): MapView {
  if (selectedNumber) {
    const m = markers.find(d => d.number === selectedNumber);
    if (m) return { center: [m.lat, m.lng], zoom: STOP_ZOOM };
  }
  return { center: SZCZECIN_CENTER, zoom: CITY_ZOOM };
}

export async function loadMapResources<T>(
  importStopMap: () => Promise<T>,
  fetchStops: () => Promise<Stop[]>,
): Promise<{ mod: T; stops: Stop[] }> {
  const [mod, stops] = await Promise.all([importStopMap(), fetchStops()]);
  return { mod, stops };
}
