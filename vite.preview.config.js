/**
 * Build config for the single-file shareable preview (hash routing, one JS bundle).
 * Usage: npm run build:preview  → preview/ (then scripts/inline-preview.mjs makes one HTML file)
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: { 'import.meta.env.VITE_HASH_ROUTER': JSON.stringify('1') },
  build: {
    outDir: 'preview-build',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
