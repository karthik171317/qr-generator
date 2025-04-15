import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  base: '/qr-generator',
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@modules': path.resolve(__dirname, './modules'),
    },
},
}) 
