import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["@google/generative-ai"], 
  },
  build: {
    rollupOptions: {
      external: ["@google/generative-ai"], 
    },
  },
  define: {
    'process.env': process.env, 
  },
});
