import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
// เช็คบรรทัด import ดีๆ นะครับ ต้องมีครบ
import { CartProvider } from './context/CartContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ แก้ Warning โดยเพิ่ม future flags ใส่ลงไปใน BrowserRouter ตรงนี้ครับ */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
    </BrowserRouter>
  </React.StrictMode>,
)