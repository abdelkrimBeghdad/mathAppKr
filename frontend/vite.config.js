import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Each lab component gets its own chunk (loaded on-demand via lazy())
          if (id.includes('/components/lesson/') && id.endsWith('.jsx')) {
            const name = id.split('/').pop().replace('.jsx', '');
            return `lab-${name}`;
          }
          // Separate heavy vendor libraries from main bundle
          if (id.includes('node_modules/framer-motion')) return 'vendor-framer';
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
        }
      }
    }
  }
})
