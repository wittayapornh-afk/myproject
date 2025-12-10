import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    proxy: {
      // 1. แก้ไขชื่อ service ให้ตรงกับ Docker (shop_backend)
      '/api': {
        target: 'http://shop_backend:8000', 
        changeOrigin: true,
        secure: false,
      },
      // 2. เพิ่มส่วนนี้เพื่อให้ดึงรูปจาก Backend ได้
      '/media': {
        target: 'http://shop_backend:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})