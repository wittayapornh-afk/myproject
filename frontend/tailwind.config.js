/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Prompt"', '"Sarabun"', 'sans-serif'],
      },
      colors: {
        // ชุดสีจากรูปภาพ Nature Green
        primary: '#325343',    // เขียวป่าลึก (Hero Background)
        secondary: '#749B6B',  // เขียวใบไม้ (Buttons)
        accent: '#B5D69E',     // เขียวอ่อน (Highlight Text)
        background: '#F4F4F0', // ครีมไข่ไก่ (Web Background)
        card: '#FFFFFF',       // ขาว
        
        textMain: '#263A33',   // สีตัวหนังสือเขียวเข้มเกือบดำ
        textMuted: '#889F96',  // สีตัวหนังสือรอง
        danger: '#EF4444',     // แดง (Delete)
      },
      boxShadow: {
        'soft': '0 10px 40px rgba(50, 83, 67, 0.08)', // เงาสีเขียวจางๆ
      }
    },
  },
  plugins: [],
}