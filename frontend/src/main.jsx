import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
// เช็คบรรทัด import ดีๆ นะครับ ต้องมีครบ
import { CartProvider } from './context/CartContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx' 

// ✅ [ระบบ Error ใหม่] Import Error Boundary
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { setupAxiosInterceptors } from './utils/axiosInterceptors.js'

// ✅ [ระบบ Error ใหม่] เริ่มทำงาน Interceptor (ดักจับ Error API)
setupAxiosInterceptors();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ [ระบบ Error ใหม่] ครอบ App ทั้งหมดเพื่อดักจับ Error ที่จอขาว */}
    <ErrorBoundary>
      {/* ✅ แก้ Warning โดยเพิ่ม future flags ใส่ลงไปใน BrowserRouter ตรงนี้ครับ */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CartProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </CartProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)