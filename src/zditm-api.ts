import type { DisplayResponse, Stop } from './types';

const BASE = 'https://www.zditm.szczecin.pl/api/v1';

export class StopNotFoundError extends Error {
  constructor(stop: string) { super(`Nie znaleziono przystanku ${stop}`); this.name = 'StopNotFoundError'; }
}
export class RateLimitError extends Error {
  constructor(public retryAfterMs: number) { super('Rate limited'); this.name = 'RateLimitError'; }
}

export interface ApiOptions {
  fetchFn?: typeof fetch;
  now?: () => number;
  baseUrl?: string;
}

export class ZditmApi {
  constructor(private opts: ApiOptions = {}) {}
  private get fetchFn() { return this.opts.fetchFn ?? fetch.bind(globalThis); }
  private get base() { return this.opts.baseUrl ?? BASE; }

  async fetchDisplay(stop: string): Promise<DisplayResponse> {
    const res = await this.fetchFn(`${this.base}/displays/${stop}`);
    if (res.status === 404) throw new StopNotFoundError(stop);
    if (res.status === 429) {
      const retry = Number(res.headers.get('Retry-After') ?? '30');
      throw new RateLimitError(retry * 1000);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as DisplayResponse;
  }
}
