
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Gunakan './' agar path file relatif, aman untuk GitHub Pages maupun Vercel
  base: './',
  plugins: [react()],
  define: {
    // Memastikan process.env tersedia di sisi client (penting untuk API_KEY)
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
