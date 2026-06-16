import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { CardConfig, Stop, DisplayResponse } from './types';
import { zditmApi } from './zditm-api';

export class ZditmDeparturesCardEditor extends LitElement {
  @state() private config!: CardConfig;
  @state() private query = '';
  @state() private results: Stop[] = [];
  @state() private preview?: DisplayResponse;

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
    this.emit({ stop: stop.number, title: undefined });
    this.results = [];
    this.query = stop.name;
    await this.loadPreview(stop.number);
  }

  private async loadPreview(stop: string): Promise<void> {
    try { this.preview = await zditmApi.fetchDisplay(stop); }
    catch { this.preview = undefined; }
  }

  private linesValue(): string {
    return (this.config.lines ?? []).join(', ');
  }
  private onLines(e: Event): void {
    const raw = (e.target as HTMLInputElement).value;
    const lines = raw.split(',').map(s => s.trim()).filter(Boolean);
    this.emit({ lines: lines.length ? lines : undefined });
  }

  render(): TemplateResult {
    if (!this.config) return html``;
    const directions = this.preview
      ? [...new Set(this.preview.departures.map(d => `${d.line_number} → ${d.direction}`))].slice(0, 5)
      : [];
    return html`
      <div class="form">
        <label>Przystanek *</label>
        <input class="ctrl" .value=${this.query} placeholder="Szukaj po nazwie…"
               @input=${(e: Event) => void this.onSearch(e)} />
        ${this.results.length ? html`<div class="results">
          ${this.results.map(s => html`
            <div class="res" @click=${() => void this.pickStop(s)}>
              <span class="nr">${s.number}</span>${s.name}
            </div>`)}
        </div>` : nothing}

        ${this.config.stop ? html`<div class="preview">
          <div class="ptitle">Słupek ${this.config.stop} obsługuje:</div>
          ${directions.length ? directions.map(d => html`<div class="pl">${d}</div>`)
                              : html`<div class="pl muted">brak danych podglądu</div>`}
        </div>` : nothing}

        <label>Linie (po przecinku; puste = wszystkie)</label>
        <input class="ctrl" .value=${this.linesValue()} placeholder="np. 75, 521"
               @change=${(e: Event) => this.onLines(e)} />

        <label>Tryb</label>
        <select class="ctrl" @change=${(e: Event) => this.emit({ mode: (e.target as HTMLSelectElement).value as CardConfig['mode'] })}>
          <option value="list" ?selected=${(this.config.mode ?? 'list') === 'list'}>Lista odjazdów</option>
          <option value="compact" ?selected=${this.config.mode === 'compact'}>Najbliższy duży + kolejne</option>
        </select>

        <label>Liczba odjazdów (tryb lista)</label>
        <input class="ctrl" type="number" min="1" .value=${String(this.config.count ?? 3)}
               @change=${(e: Event) => this.emit({ count: Number((e.target as HTMLInputElement).value) })} />
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
  `;
}
