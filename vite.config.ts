import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { xmlProxyDevPlugin } from './src/plugins/xmlProxyDev';

export default defineConfig({
  plugins: [react(), xmlProxyDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
