// Test setup: polyfill the Fetch API (Response/Headers/Request/fetch) for Node 16,
// which predates global fetch (added as a global in Node 18). jsdom does not
// provide these. undici supplies spec-compliant implementations.
import { fetch, Response, Request, Headers } from 'undici';

const globals = { fetch, Response, Request, Headers } as Record<string, unknown>;
for (const [name, impl] of Object.entries(globals)) {
  if (typeof (globalThis as Record<string, unknown>)[name] === 'undefined') {
    (globalThis as Record<string, unknown>)[name] = impl;
  }
}
