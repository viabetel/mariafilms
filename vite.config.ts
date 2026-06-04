import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // `ogl` (WebGL) só é usada pelo brilho da EssenceSection, via import
            // dinâmico. Deixamos ela FORA do vendor para seguir esse split e cair
            // num chunk próprio carregado sob demanda (não pesa o load inicial).
            if (id.includes('ogl')) return;
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
