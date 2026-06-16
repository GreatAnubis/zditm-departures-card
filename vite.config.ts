import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'zditm-departures-card.js',
    },
    rollupOptions: { output: { dir: 'dist' } },
    target: 'es2021',
    minify: 'terser',
  },
});
