// Polyfill crypto.getRandomValues for Node 16 (added as a top-level node:crypto
// export in Node 17.4). Vite reads it during config resolution, so this must run
// before defineConfig is evaluated. Loaded synchronously via createRequire.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cryptoModule = require('crypto') as typeof import('crypto');
const webcrypto = cryptoModule.webcrypto as Crypto;
if (typeof (cryptoModule as { getRandomValues?: unknown }).getRandomValues !== 'function') {
  (cryptoModule as { getRandomValues?: unknown }).getRandomValues =
    webcrypto.getRandomValues.bind(webcrypto);
}
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as { crypto?: Crypto }).crypto = webcrypto;
} else if (typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
}

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    // Polyfill the Fetch API (Response/Headers/fetch) for Node 16, which predates
    // global fetch (added in Node 18). Tests construct `new Response(...)` and the
    // API client uses these globals. Runs inside the test runtime via setupFiles.
    setupFiles: ['./tests/setup.ts'],
  },
});
