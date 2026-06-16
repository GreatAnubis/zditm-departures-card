import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { CardConfig, DisplayResponse, Departure } from './types';
import { DEFAULTS, DEFAULT_TRAM_LINES } from './types';
import { zditmApi } from './zditm-api';
import { classifyLine, filterDepartures, formatDeparture, selectDepartures } from './format';

export class ZditmDeparturesCard extends LitElement {
  @property({ attribute: false }) public hass?: unknown;
  @state() private config!: CardConfig;
  @state() private data?: DisplayResponse;
  @state() private error?: string;
  @state() private stale = false;
  private timer?: number;

  static getConfigElement() {
    return document.createElement('zditm-departures-card-editor');
  }
  static getStubConfig(): Partial<CardConfig> {
    return { stop: '', mode: 'list', count: 3 };
  }

  public setConfig(config: CardConfig): void {
    if (!config.stop) throw new Error('Podaj numer przystanku (stop).');
    this.config = config;
    this.restart();
  }

  public getCardSize(): number {
    return (this.config?.mode === 'compact') ? 2 : 1 + (this.config?.count ?? DEFAULTS.count);
  }

  connectedCallback(): void { super.connectedCallback(); this.restart(); }
  disconnectedCallback(): void { super.disconnectedCallback(); this.stop(); }

  private restart(): void {
    this.stop();
    if (!this.config?.stop) return;
    const seconds = Math.max(DEFAULTS.minRefresh, this.config.refresh ?? DEFAULTS.refresh);
    void this.poll();
    this.timer = window.setInterval(() => void this.poll(), seconds * 1000);
  }
  private stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = undefined; }
  }

  private async poll(): Promise<void> {
    try {
      const ttl = Math.max(DEFAULTS.minRefresh, this.config.refresh ?? DEFAULTS.refresh) * 1000;
      this.data = await zditmApi.fetchDisplay(this.config.stop, ttl);
      this.error = undefined;
      this.stale = false;
    } catch (e) {
      if (this.data) { this.stale = true; }
      else { this.error = e instanceof Error ? e.message : 'Błąd pobierania danych'; }
    }
  }

  render(): TemplateResult {
    if (this.error) return html`<ha-card><div class="msg error">${this.error}</div></ha-card>`;
    if (!this.data) return html`<ha-card><div class="msg">Ładowanie…</div></ha-card>`;

    const cfg = this.config;
    const tramLines = (cfg.tram_lines ?? DEFAULT_TRAM_LINES).map(String);
    const filtered = filterDepartures(this.data.departures, { lines: cfg.lines, directions: cfg.directions });
    const mode = cfg.mode ?? DEFAULTS.mode;
    const shown = selectDepartures(filtered, mode, cfg.count ?? DEFAULTS.count);
    const title = cfg.title ?? this.data.stop_name;
    const showHeader = cfg.show_header ?? DEFAULTS.show_header;

    return html`
      <ha-card>
        ${showHeader ? html`<div class="head">
          <span class="stop">${title}</span>
          ${this.stale ? html`<span class="stale" title="Dane nieaktualne">⚠ nieaktualne</span>` : nothing}
        </div>` : nothing}
        ${this.data.message ? html`<div class="banner">${this.data.message}</div>` : nothing}
        ${shown.length === 0
          ? html`<div class="msg">${(cfg.lines?.length) ? 'Brak odjazdów dla wybranych linii' : 'Brak odjazdów'}</div>`
          : (mode === 'compact' ? this.renderCompact(shown, tramLines) : this.renderList(shown, tramLines))}
      </ha-card>`;
  }

  private badge(line: string, tramLines: string[]): TemplateResult {
    return html`<span class="badge ${classifyLine(line, tramLines)}">${line}</span>`;
  }

  private renderList(deps: Departure[], tramLines: string[]): TemplateResult {
    return html`<div class="list">
      ${deps.map(d => {
        const f = formatDeparture(d);
        return html`<div class="row">
          ${this.badge(d.line_number, tramLines)}
          <span class="dir">${d.direction}</span>
          <span class="when ${f.live ? 'live' : 'sched'}">${f.live ? html`<span class="dot"></span>` : nothing}${f.text}</span>
        </div>`;
      })}
    </div>`;
  }

  private renderCompact(deps: Departure[], tramLines: string[]): TemplateResult {
    const [first, ...rest] = deps;
    const f = formatDeparture(first);
    return html`<div class="compact">
      <div class="chead">${this.badge(first.line_number, tramLines)}<span class="dir">${first.direction}</span></div>
      <div class="big ${f.live ? 'live' : 'sched'}">${f.live ? html`<span class="dot"></span>` : nothing}${f.text}</div>
      ${rest.length ? html`<div class="sub">potem: ${rest.map(d => html`<strong>${formatDeparture(d).text}</strong>`)}</div>` : nothing}
    </div>`;
  }

  static styles = css`
    ha-card { padding: 12px 16px; }
    .head { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .head .stop { font-weight:600; font-size:1.05rem; }
    .stale { margin-left:auto; font-size:.72rem; color: var(--warning-color, #e0a030); }
    .banner { font-size:.8rem; background: var(--secondary-background-color); border-radius:6px; padding:6px 8px; margin-bottom:8px; }
    .msg { padding:8px 0; color: var(--secondary-text-color); }
    .msg.error { color: var(--error-color, #db4437); }
    .row { display:flex; align-items:center; gap:12px; padding:7px 0; border-top:1px solid var(--divider-color); }
    .row:first-child { border-top:none; }
    .badge { min-width:34px; padding:2px 8px; border-radius:7px; color:#fff; font-weight:700; text-align:center; font-size:.9rem; }
    .badge.tram { background:#c62828; }
    .badge.bus { background:#1565c0; }
    .dir { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .when { font-weight:600; text-align:right; white-space:nowrap; }
    .when.live { color: var(--success-color, #43a047); }
    .when.sched { color: var(--secondary-text-color); }
    .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background: currentColor; margin-right:5px; animation:pulse 1.4s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    .compact .chead { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .compact .big { font-size:2.2rem; font-weight:700; line-height:1; }
    .compact .sub { margin-top:8px; font-size:.85rem; color: var(--secondary-text-color); display:flex; gap:14px; }
  `;
}
