import type { MarkerDatum } from './stop-map-data';

export interface StopPopupOptions {
  onPick: (picked: { number: string; name: string }) => void;
  loadDirections?: (number: string) => Promise<string[]>;
}

export function createStopPopup(datum: MarkerDatum, opts: StopPopupOptions): HTMLElement {
  const root = document.createElement('div');
  root.className = 'zditm-stop-popup';

  const title = document.createElement('div');
  title.className = 'zsp-title';
  title.textContent = datum.name;

  const sub = document.createElement('div');
  sub.className = 'zsp-sub';
  sub.textContent = `słupek ${datum.number}`;

  const dirs = document.createElement('div');
  dirs.className = 'zsp-dirs';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'zsp-btn';
  btn.textContent = 'Wybierz ten słupek';
  btn.addEventListener('click', () => opts.onPick({ number: datum.number, name: datum.name }));

  root.append(title, sub, dirs, btn);

  if (opts.loadDirections) {
    dirs.textContent = 'Ładuję…';
    opts.loadDirections(datum.number)
      .then(list => {
        dirs.textContent = '';
        if (!list.length) { dirs.textContent = 'brak danych podglądu'; return; }
        for (const d of list) {
          const row = document.createElement('div');
          row.className = 'zsp-dir';
          row.textContent = d;
          dirs.appendChild(row);
        }
      })
      .catch(() => { dirs.textContent = 'brak danych podglądu'; });
  }

  return root;
}
