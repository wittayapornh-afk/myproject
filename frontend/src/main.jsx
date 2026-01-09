import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
// เช็คบรรทัด import ดีๆ นะครับ ต้องมีครบ
import { CartProvider } from './context/CartContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import axios from 'axios';

// ✅ Global Error Interceptor (ระบบตรวจจับ Error ฝั่ง Frontend)
axios.interceptors.response.use(
  response => response,
  error => {
    // แสดงรายละเอียด Error ลงใน Console ของ Browser
    console.group('%c🚨 API ERROR DETECTED', 'color: red; font-size: 14px; font-weight: bold;');
    console.log(`❌ URL: ${error.config?.url}`);
    console.log(`❌ Method: ${error.config?.method?.toUpperCase()}`);
    console.log(`❌ Status: ${error.response?.status || 'Unknown'}`);
    console.log(`❌ Message:`, error.response?.data || error.message);
    console.groupEnd();
    
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ แก้ Warning โดยเพิ่ม future flags ใส่ลงไปใน BrowserRouter ตรงนี้ครับ */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
    </BrowserRouter>
  </React.StrictMode>,
)