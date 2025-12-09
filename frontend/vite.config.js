import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // เปิดให้ Docker เข้าถึงได้ (0.0.0.0)
    port: 80,   // ต้องตรงกับ docker-compose
    watch: {
      usePolling: true, // แก้ปัญหา Windows Docker ไม่เห็นการแก้ไฟล์
    },
  },
  resolve: {
    // บังคับให้ใช้ React ตัวเดียวกัน เพื่อแก้ปัญหา useState Error
    dedupe: ['react', 'react-dom'],
  },
})