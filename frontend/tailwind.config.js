// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'], // ใช้ฟอนต์ Inter ให้ดูทันสมัย
      },
      colors: {
        primary: '#4F46E5',    // Indigo-600 (สีหลัก: ปุ่ม, หัวข้อสำคัญ)
        primaryHover: '#4338CA', // Indigo-700
        secondary: '#1E293B',  // Slate-800 (สีรอง: ตัวหนังสือเข้ม)
        accent: '#F59E0B',     // Amber-500 (สีเน้น: ดาว, แจ้งเตือน)
        background: '#F8FAFC', // Slate-50 (พื้นหลังเว็บ: เทาอ่อนสบายตา)
        card: '#FFFFFF',       // ขาว (พื้นหลังการ์ด)
        textMain: '#0F172A',   // Slate-900
        textMuted: '#64748B',  // Slate-500
      }
    },
  },
  plugins: [],
}