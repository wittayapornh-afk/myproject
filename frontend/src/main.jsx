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
    // 🧹 Clean Error Logging (Concise)
    const url = error.config?.url;
    const status = error.response?.status || 'Unknown';
    let message = error.response?.data || error.message;

    // Fix: Avoid dumping large HTML
    if (typeof message === 'string' && message.includes('<!DOCTYPE html>')) {
        message = 'Server returned HTML Page (likely 500/404 Error)';
    }

    console.groupCollapsed(`%c🚨 API Error: ${status} @ ${url}`, 'color: red; font-weight: bold;');
    console.log(`Method: ${error.config?.method?.toUpperCase()}`);
    console.log(`Message:`, message);
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