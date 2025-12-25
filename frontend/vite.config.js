import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://shop-backend:8000',
        changeOrigin: true,
        secure: false,
      },
      // ✅ ตั้งค่า Proxy สำหรับรูปภาพให้ชัดเจนขึ้น
      '/media': {
        target: 'http://shop-backend:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // ส่ง path ไปตรงๆ ไม่ต้องแก้
      }
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})