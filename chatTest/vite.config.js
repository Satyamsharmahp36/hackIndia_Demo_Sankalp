import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', 
  optimizeDeps: {
    include: ["@google/generative-ai"], 
  },
  build: {
    rollupOptions: {
      external: [], 
    },
  },
  define: {
    'process.env': {}, 
  },
});
