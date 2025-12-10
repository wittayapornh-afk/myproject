import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // สำคัญสำหรับ Docker
    proxy: {
      '/api': {
        target: 'http://backend:8000', // 'backend' คือชื่อ service ใน docker-compose
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
