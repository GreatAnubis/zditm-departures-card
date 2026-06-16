// API response types
export interface Departure {
  line_number: string;
  direction: string;
  time_real: number | null;   // minutes until departure (live); 0 = now
  time_scheduled: string | null; // "hh:mm" from timetable
}

export interface DisplayResponse {
  stop_name: string;
  stop_number: string;
  departures: Departure[];
  message: string | null;
  updated_at: string;
}

export interface Stop {
  id: number;
  number: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Card configuration
export type CardMode = 'list' | 'compact';

export interface CardConfig {
  type: string;
  stop: string;                 // required: stop (post) number
  title?: string;               // overrides stop_name from API
  lines?: (string | number)[];  // line filter; empty/absent = all
  directions?: string[];        // direction substring filter
  mode?: CardMode;              // default 'list'
  count?: number;               // list mode departures; default 3
  refresh?: number;             // seconds; default 30, clamped to >= 20
  show_header?: boolean;        // default true
  tram_lines?: (string | number)[]; // override tram classification
  flip_clock_secs?: number;     // seconds showing clock time (default 10)
  flip_rel_secs?: number;       // seconds showing "za X min" (default 5)
}

// Defaults / constants
export const DEFAULTS = {
  mode: 'list' as CardMode,
  count: 3,
  refresh: 30,
  minRefresh: 20,
  show_header: true,
  flipClockSecs: 10,
  flipRelSecs: 5,
};

// Szczecin tram lines (verify during manual testing; overridable via config.tram_lines)
export const DEFAULT_TRAM_LINES = ['1', '2', '3', '5', '6', '7', '8', '9', '10', '11', '12'];
