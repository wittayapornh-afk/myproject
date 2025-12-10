import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderHistory from './components/OrderHistory';
import AdminDashboard from './components/AdminDashboard';
import ProductAdd from './components/ProductAdd';
import ProductEdit from './components/ProductEdit';
import SuccessModal from './components/SuccessModal';
import CategoryRow from './components/CategoryRow'; // ✅ 1. นำเข้า

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-textMain">
      <Navbar />
      <div className="flex-grow pt-24">
        <Routes>
          
          {/* ✅ 2. หน้าแรก (Home) จัดเรียงแบบใหม่: Hero -> หมวดหมู่ต่างๆ */}
          <Route path="/" element={
            <>
              <HeroSection />
              
              <div className="flex flex-col w-full bg-white rounded-t-[3rem] -mt-10 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-hidden">
                
                {/* หมวดที่ 1: IT & Electronics */}
                <CategoryRow 
                    title="📱 ไฮเทค & แก็ดเจ็ต" 
                    categorySlug="smartphones" 
                    bgColor="#FFFFFF"
                />
                
                {/* หมวดที่ 2: Furniture */}
                <CategoryRow 
                    title="🛋️ แต่งบ้านมินิมอล" 
                    categorySlug="furniture" 
                    bgColor="#FAFAF8" // สลับสีพื้นหลังให้อ่อนๆ
                />

                {/* หมวดที่ 3: Beauty */}
                <CategoryRow 
                    title="✨ ความงาม & สกินแคร์" 
                    categorySlug="beauty" 
                    bgColor="#FFFFFF"
                />

                {/* ปุ่มดูทั้งหมดด้านล่างสุด */}
                <div className="py-16 text-center bg-white">
                    <a href="/shop" className="inline-block px-10 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#234236] transition hover:-translate-y-1">
                        ดูสินค้าทั้งหมด 🛍️
                    </a>
                </div>
              </div>
            </>
          } />

          {/* ✅ 3. แยกหน้ารวมสินค้าไปไว้ที่ /shop */}
          <Route path="/shop" element={<ProductList />} />

          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/success" element={<SuccessModal />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/product/add" element={<ProductAdd />} />
          <Route path="/product/edit/:id" element={<ProductEdit />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;