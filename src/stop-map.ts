import L from 'leaflet';
import leafletCss from 'leaflet/dist/leaflet.css?inline';
import type { Stop } from './types';
import { toMarkerData, initialView } from './stop-map-data';
import { createStopPopup } from './stop-popup';

export interface StopMapOptions {
  selectedNumber?: string;
  onPick: (picked: { number: string; name: string }) => void;
  loadDirections?: (number: string) => Promise<string[]>;
}
export interface StopMapHandle {
  setSelected(number: string): void;
  destroy(): void;
}

const DOT = { radius: 5, color: '#1565c0', weight: 1, fillColor: '#1565c0', fillOpacity: 0.85 };
const DOT_SELECTED = { radius: 8, color: '#c62828', weight: 2, fillColor: '#c62828', fillOpacity: 1 };

// Leaflet's stylesheet must live inside the editor's shadow root, not document head.
function injectLeafletCss(root: Node): void {
  const host = root instanceof ShadowRoot ? root : document.head;
  if ((host as Element).querySelector?.('style[data-zditm-leaflet]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-zditm-leaflet', '');
  style.textContent = leafletCss;
  host.appendChild(style);
}

export function mountStopMap(container: HTMLElement, stops: Stop[], opts: StopMapOptions): StopMapHandle {
  injectLeafletCss(container.getRootNode());

  const data = toMarkerData(stops);
  const view = initialView(data, opts.selectedNumber);

  const map = L.map(container).setView(view.center, view.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19,
  }).addTo(map);

  const renderer = L.canvas();
  const markers = new Map<string, L.CircleMarker>();

  for (const d of data) {
    const m = L.circleMarker([d.lat, d.lng], { renderer, ...DOT });
    m.on('click', () => {
      const popup = createStopPopup(d, { onPick: opts.onPick, loadDirections: opts.loadDirections });
      m.bindPopup(popup).openPopup();
    });
    m.addTo(map);
    markers.set(d.number, m);
  }

  let selected = opts.selectedNumber;
  const applySelected = (num?: string) => {
    if (selected) markers.get(selected)?.setStyle(DOT);
    selected = num;
    if (num) markers.get(num)?.setStyle(DOT_SELECTED);
  };
  applySelected(opts.selectedNumber);

  return {
    setSelected: (num: string) => applySelected(num),
    destroy: () => { map.remove(); markers.clear(); },
  };
}
