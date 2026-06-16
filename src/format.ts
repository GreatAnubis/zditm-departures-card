export type LineKind = 'tram' | 'bus';

export function classifyLine(line: string, tramLines: string[]): LineKind {
  return tramLines.map(String).includes(String(line)) ? 'tram' : 'bus';
}
