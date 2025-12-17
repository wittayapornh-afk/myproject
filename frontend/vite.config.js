import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        // 1. แก้ไขชื่อ service ให้ตรงกับ Docker (shop-backend) หรือ Local (localhost)
        '/api': {
          target: env.VITE_API_TARGET || process.env.VITE_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        // 2. เพิ่มส่วนนี้เพื่อให้ดึงรูปจาก Backend ได้
        '/media': {
          target: env.VITE_API_TARGET || process.env.VITE_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})