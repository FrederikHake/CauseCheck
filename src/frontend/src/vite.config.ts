import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {  // Matches all requests starting with '/api'
        target: 'http://127.0.0.1:5000',  // URL of the Flask API
        changeOrigin: true,  // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false  // If you're using https
      }
    }
  }
});