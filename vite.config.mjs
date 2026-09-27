import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo (`npm run dev`) las llamadas a /api van al servidor local (`npm start`, puerto 3000).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
  build: { target: 'es2020', cssCodeSplit: false },
});
