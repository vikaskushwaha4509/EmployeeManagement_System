import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/summary': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/employees': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/departments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/attendance': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/leaves': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/payrolls': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
