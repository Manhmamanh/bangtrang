import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:3000/api'
    ),
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
  },
});
