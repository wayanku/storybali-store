
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Jika deploy ke GitHub Pages, ganti '/' menjadi '/nama-repo-anda/'
  base: './',
  plugins: [react()],
  define: {
    'process.env': process.env
  }
});
