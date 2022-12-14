import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    hmr: false,
  },

  build: {
    sourcemap: true,
    target: 'chrome110',
    minify:false
  },
})
