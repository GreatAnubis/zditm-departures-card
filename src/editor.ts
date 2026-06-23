import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ref, createRef, type Ref } from 'lit/directives/ref.js';
import type { CardConfig, Stop, DisplayResponse } from './types';
import { zditmApi } from './zditm-api';
import { loadMapResources } from './stop-map-data';
import type { StopMapHandle } from './stop-map';

interface HassLike {
  states?: Record<string, { state?: string; attributes?: Record<string, any> }>;
}

export class ZditmDeparturesCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HassLike;
  @state() private config!: CardConfig;
  @state() private query = '';
  @state() private results: Stop[] = [];
  @state() private preview?: DisplayResponse;
  @state() private mapOpen = false;
  @state() private mapLoading = false;
  @state() private mapError?: string;
  private mapContainerRef: Ref<HTMLDivElement> = createRef();
  private mapHandle?: StopMapHandle;
  private mapStops: Stop[] = [];
  private mountMap?: (
    container: HTMLElement, stops: Stop[], opts: {
      selectedNumber?: string;
      onPick: (p: { number: string; name: string }) => void;
      loadDirections?: (n: string) => Promise<string[]>;
    },
  ) => StopMapHandle;

  public setConfig(config: CardConfig): void {
    this.config = { ...config };
    if (config.stop) void this.loadPreview(config.stop);
  }

  private emit(patch: Partial<CardConfig>): void {
    this.config = { ...this.config, ...patch };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }, bubbles: true, composed: true,
    }));
  }

  private async onSearch(e: Event): Promise<void> {
    this.query = (e.target as HTMLInputElement).value;
    this.results = await zditmApi.searchStops(this.query);
  }

  private async pickStop(stop: Stop): Promise<void> {
    this.emit({ stop: stop.number, entity: undefined, title: undefined });
    this.results = [];
    this.query = stop.name;
    await this.loadPreview(stop.number);
  }

  private async loadPreview(stop: string): Promise<void> {
    try { this.preview = await zditmApi.fetchDisplay(stop); }
    catch { this.preview = undefined; }
  }

  private async toggleMap(): Promise<void> {
    if (this.mapOpen) { this.closeMap(); return; }
    this.mapError = undefined;
    this.mapLoading = true;
    try {
      const { mod, stops } = await loadMapResources(
        () => import('./stop-map'),
        () => zditmApi.fetchStops(),
      );
      this.mountMap = mod.mountStopMap;
      this.mapStops = stops;
      this.mapOpen = true;
    } catch {
      this.mapError = 'Nie udało się załadować mapy przystanków';
    } finally {
      this.mapLoading = false;
    }
  }

  private closeMap(): void {
    this.mapHandle?.destroy();
    this.mapHandle = undefined;
    this.mapOpen = false;
  }

  private selectStopFromMap(picked: { number: string; name: string }): void {
    this.emit({ stop: picked.number, entity: undefined, title: undefined });
    this.results = [];
    this.query = picked.name;
    this.mapHandle?.setSelected(picked.number);
    void this.loadPreview(picked.number);
  }

  private async loadStopDirections(stop: string): Promise<string[]> {
    try {
      const display = await zditmApi.fetchDisplay(stop);
      return [...new Set(display.departures.map(d => `${d.line_number} → ${d.direction}`))].slice(0, 5);
    } catch {
      return [];
    }
  }

  protected updated(): void {
    const el = this.mapContainerRef.value;
    if (this.mapOpen && el && !this.mapHandle && this.mountMap) {
      this.mapHandle = this.mountMap(el, this.mapStops, {
        selectedNumber: this.config.stop,
        onPick: (p) => this.selectStopFromMap(p),
        loadDirections: (n) => this.loadStopDirections(n),
      });
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mapHandle?.destroy();
    this.mapHandle = undefined;
  }

  // ZDiTM integration "next departure" stop sensors carry a `departures` attribute.
  private integrationSensors(): { id: string; name: string }[] {
    const states = this.hass?.states ?? {};
    return Object.keys(states)
      .filter((id) => id.startsWith('sensor.') && Array.isArray(states[id].attributes?.departures))
      .map((id) => ({
        id,
        name: states[id].attributes?.friendly_name ?? states[id].attributes?.stop_name ?? id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private entityDirections(entityId: string): string[] {
    const deps = this.hass?.states?.[entityId]?.attributes?.departures;
    if (!Array.isArray(deps)) return [];
    return [...new Set(deps.map((d: any) => `${d.line} → ${d.direction}`))].slice(0, 5);
  }

  private onSource(e: Event): void {
    const source = (e.target as HTMLSelectElement).value;
    if (source === 'entity') {
      const first = this.integrationSensors()[0]?.id;
      this.emit({ stop: undefined, entity: first });
    } else {
      this.emit({ entity: undefined });
    }
  }

  private linesValue(): string {
    return (this.config.lines ?? []).join(', ');
  }
  private onLines(e: Event): void {
    const raw = (e.target as HTMLInputElement).value;
    const lines = raw.split(',').map(s => s.trim()).filter(Boolean);
    this.emit({ lines: lines.length ? lines : undefined });
  }
  private onDirections(e: Event): void {
    const raw = (e.target as HTMLInputElement).value;
    const dirs = raw.split(',').map(s => s.trim()).filter(Boolean);
    this.emit({ directions: dirs.length ? dirs : undefined });
  }

  render(): TemplateResult {
    if (!this.config) return html``;
    const source: 'stop' | 'entity' = this.config.entity ? 'entity' : 'stop';
    const sensors = this.integrationSensors();
    const directions = source === 'entity'
      ? (this.config.entity ? this.entityDirections(this.config.entity) : [])
      : (this.preview
          ? [...new Set(this.preview.departures.map(d => `${d.line_number} → ${d.direction}`))].slice(0, 5)
          : []);

    return html`
      <div class="form">
        <label>Źródło danych</label>
        <select class="ctrl" @change=${(e: Event) => this.onSource(e)}>
          <option value="stop" ?selected=${source === 'stop'}>API ZDiTM (numer przystanku)</option>
          <option value="entity" ?selected=${source === 'entity'}>Integracja Home Assistant (encja)</option>
        </select>

        ${source === 'entity' ? html`
          <label>Encja przystanku *</label>
          ${sensors.length ? html`
            <select class="ctrl" @change=${(e: Event) => this.emit({ entity: (e.target as HTMLSelectElement).value })}>
              ${sensors.map(s => html`
                <option value=${s.id} ?selected=${this.config.entity === s.id}>${s.name}</option>`)}
            </select>` : html`
            <div class="pl muted">Brak encji integracji ZDiTM. Zainstaluj integrację hass-zditm-szczecin i dodaj przystanek.</div>`}
        ` : html`
          <label>Przystanek *</label>
          <input class="ctrl" .value=${this.query} placeholder="Szukaj po nazwie…"
                 @input=${(e: Event) => void this.onSearch(e)} />
          ${this.results.length ? html`<div class="results">
            ${this.results.map(s => html`
              <div class="res" @click=${() => void this.pickStop(s)}>
                <span class="nr">${s.number}</span>${s.name}
              </div>`)}
          </div>` : nothing}
          <div class="hint">Nie znajdujesz? W Szczecinie przystanki przy danej ulicy bywają nazwane od placów,
            a ta sama nazwa (np. „Wojska Polskiego”) jest też w Policach/Tanowie. Numer słupka znajdziesz na
            <a href="https://www.zditm.szczecin.pl/pl/pasazer/rozklady-jazdy/mapa-przystankow-i-pojazdow" target="_blank" rel="noopener noreferrer">mapie przystanków ZDiTM</a>.</div>
          <button type="button" class="ctrl mapbtn" @click=${() => void this.toggleMap()}>
            🗺️ ${this.mapOpen ? 'Ukryj mapę' : 'Wybierz na mapie'}
          </button>
          ${this.mapLoading ? html`<div class="pl muted">Ładuję mapę…</div>` : nothing}
          ${this.mapError ? html`<div class="pl muted">${this.mapError}</div>` : nothing}
          ${this.mapOpen ? html`<div class="mapwrap" ${ref(this.mapContainerRef)}></div>` : nothing}
        `}

        ${(this.config.stop || this.config.entity) ? html`<div class="preview">
          <div class="ptitle">${source === 'entity' ? 'Encja obsługuje:' : `Słupek ${this.config.stop} obsługuje:`}</div>
          ${directions.length ? directions.map(d => html`<div class="pl">${d}</div>`)
                              : html`<div class="pl muted">brak danych podglądu</div>`}
        </div>` : nothing}

        <label>Linie (po przecinku; puste = wszystkie)</label>
        <input class="ctrl" .value=${this.linesValue()} placeholder="np. 75, 521"
               @change=${(e: Event) => this.onLines(e)} />

        <label>Kierunek (opcjonalnie; fragment nazwy)</label>
        <input class="ctrl" .value=${(this.config.directions ?? []).join(', ')} placeholder="np. Zawadzkiego"
               @change=${(e: Event) => this.onDirections(e)} />

        <label>Tryb</label>
        <select class="ctrl" @change=${(e: Event) => this.emit({ mode: (e.target as HTMLSelectElement).value as CardConfig['mode'] })}>
          <option value="list" ?selected=${(this.config.mode ?? 'list') === 'list'}>Lista odjazdów</option>
          <option value="compact" ?selected=${this.config.mode === 'compact'}>Najbliższy duży + kolejne</option>
        </select>

        <label>Liczba odjazdów (tryb lista)</label>
        <input class="ctrl" type="number" min="1" .value=${String(this.config.count ?? 3)}
               @change=${(e: Event) => { const n = Number((e.target as HTMLInputElement).value); this.emit({ count: Number.isFinite(n) && n > 0 ? n : undefined }); }} />

        ${source === 'stop' ? html`
          <label>Odświeżanie</label>
          <select class="ctrl" @change=${(e: Event) => this.emit({ refresh: Number((e.target as HTMLSelectElement).value) })}>
            ${[{ v: 30, l: '30 s' }, { v: 60, l: '1 min' }, { v: 90, l: '90 s' }, { v: 120, l: '2 min' }, { v: 300, l: '5 min' }].map(o => html`
              <option value=${o.v} ?selected=${(this.config.refresh ?? 30) === o.v}>${o.l}</option>`)}
          </select>` : nothing}
      </div>`;
  }

  static styles = css`
    .form { display:flex; flex-direction:column; gap:4px; }
    label { font-size:.78rem; color: var(--secondary-text-color); margin-top:8px; }
    .ctrl { padding:8px 10px; border-radius:6px; border:1px solid var(--divider-color);
            background: var(--card-background-color); color: var(--primary-text-color); }
    .results { border:1px solid var(--divider-color); border-radius:6px; max-height:180px; overflow:auto; }
    .res { padding:7px 10px; cursor:pointer; }
    .res:hover { background: var(--secondary-background-color); }
    .nr { display:inline-block; background: var(--secondary-background-color); border-radius:4px;
          padding:1px 6px; margin-right:6px; font-size:.75rem; }
    .preview { margin-top:8px; padding:8px 10px; border-radius:6px; background: var(--secondary-background-color); }
    .ptitle { font-size:.72rem; text-transform:uppercase; color: var(--secondary-text-color); margin-bottom:4px; }
    .pl { font-size:.85rem; padding:2px 0; }
    .pl.muted { color: var(--secondary-text-color); }
    .hint { margin-top:6px; font-size:.78rem; color: var(--secondary-text-color); line-height:1.35; }
    .hint a { color: var(--primary-color); text-decoration: underline; }
    .mapbtn { margin-top:8px; cursor:pointer; text-align:left; }
    .mapwrap { margin-top:8px; height:320px; border-radius:6px; overflow:hidden;
               border:1px solid var(--divider-color); }
    .zditm-stop-popup .zsp-title { font-weight:600; }
    .zditm-stop-popup .zsp-sub { font-size:.78rem; color: var(--secondary-text-color); margin:2px 0 6px; }
    .zditm-stop-popup .zsp-dir { font-size:.82rem; padding:1px 0; }
    .zditm-stop-popup .zsp-btn { margin-top:6px; padding:6px 10px; border-radius:6px;
               border:1px solid var(--primary-color); background:var(--primary-color);
               color:#fff; cursor:pointer; }
  `;
}
