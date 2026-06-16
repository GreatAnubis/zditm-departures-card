import { describe, it, expect } from 'vitest';
import { classifyLine } from '../src/format';
import { DEFAULT_TRAM_LINES } from '../src/types';

describe('classifyLine', () => {
  it('classifies a default tram line as tram', () => {
    expect(classifyLine('3', DEFAULT_TRAM_LINES)).toBe('tram');
  });
  it('classifies a bus line as bus', () => {
    expect(classifyLine('75', DEFAULT_TRAM_LINES)).toBe('bus');
  });
  it('classifies night/letter lines as bus', () => {
    expect(classifyLine('521', DEFAULT_TRAM_LINES)).toBe('bus');
    expect(classifyLine('B', DEFAULT_TRAM_LINES)).toBe('bus');
  });
  it('respects an override list', () => {
    expect(classifyLine('75', ['75'])).toBe('tram');
  });
});
