import type { DisplayResponse, Stop, LineInfo } from './types';

const BASE = 'https://www.zditm.szczecin.pl/api/v1';

export class StopNotFoundError extends Error {
  constructor(stop: string) { super(`Nie znaleziono przystanku ${stop}`); this.name = 'StopNotFoundError'; }
}
export class RateLimitError extends Error {
  constructor(public retryAfterMs: number) { super('Przekroczono limit zapytań — spróbuj za chwilę'); this.name = 'RateLimitError'; }
}

export interface ApiOptions {
  fetchFn?: typeof fetch;
  now?: () => number;
  baseUrl?: string;
}

export class ZditmApi {
  constructor(private opts: ApiOptions = {}) {}
  private get fetchFn() { return this.opts.fetchFn ?? fetch.bind(globalThis); }
  private get now() { return this.opts.now ?? Date.now; }
  private get base() { return this.opts.baseUrl ?? BASE; }

  private displayCache = new Map<string, { data: DisplayResponse; ts: number }>();
  private inflight = new Map<string, Promise<DisplayResponse>>();
  private backoffUntil = 0;

  async fetchDisplay(stop: string, ttlMs = 15000): Promise<DisplayResponse> {
    const t = this.now();
    const cached = this.displayCache.get(stop);
    if (cached && t - cached.ts < ttlMs) return cached.data;
    if (t < this.backoffUntil && cached) return cached.data;

    const existing = this.inflight.get(stop);
    if (existing) return existing;

    const p = this.doFetchDisplay(stop, cached?.data).finally(() => this.inflight.delete(stop));
    this.inflight.set(stop, p);
    return p;
  }

  private async doFetchDisplay(stop: string, stale?: DisplayResponse): Promise<DisplayResponse> {
    const res = await this.fetchFn(`${this.base}/displays/${stop}`);
    if (res.status === 404) throw new StopNotFoundError(stop);
    if (res.status === 429) {
      const retry = Number(res.headers.get('Retry-After') ?? '30');
      this.backoffUntil = this.now() + retry * 1000;
      if (stale) return stale;
      throw new RateLimitError(retry * 1000);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Clone before reading: a Response body is single-use, and reusing the same
    // Response instance (e.g. a shared test mock) would otherwise throw on a
    // second read. Cloning keeps the original body intact for later reads.
    const data = (await res.clone().json()) as DisplayResponse;
    this.displayCache.set(stop, { data, ts: this.now() });
    return data;
  }

  private stopsCache?: Stop[];
  private stopsInflight?: Promise<Stop[]>;

  async fetchStops(): Promise<Stop[]> {
    if (this.stopsCache) return this.stopsCache;
    if (this.stopsInflight) return this.stopsInflight;
    this.stopsInflight = (async () => {
      const res = await this.fetchFn(`${this.base}/stops`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.clone().json()) as { data: Stop[] };
      this.stopsCache = body.data;
      return body.data;
    })().finally(() => { this.stopsInflight = undefined; });
    return this.stopsInflight;
  }

  private linesCache?: LineInfo[];
  private linesInflight?: Promise<LineInfo[]>;

  async fetchLines(): Promise<LineInfo[]> {
    if (this.linesCache) return this.linesCache;
    if (this.linesInflight) return this.linesInflight;
    this.linesInflight = (async () => {
      const res = await this.fetchFn(`${this.base}/lines`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.clone().json()) as { data: LineInfo[] };
      this.linesCache = body.data;
      return body.data;
    })().finally(() => { this.linesInflight = undefined; });
    return this.linesInflight;
  }

  async searchStops(query: string, limit = 25): Promise<Stop[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = await this.fetchStops();
    return all.filter(s => s.name.toLowerCase().includes(q)).slice(0, limit);
  }
}

export const zditmApi = new ZditmApi();
