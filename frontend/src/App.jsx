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
// import LoginPage from './components/LoginPage';     <-- ❌ ปิด
// import RegisterPage from './components/RegisterPage';  <-- ❌ ปิด

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F2F0E4] font-sans text-[#263A33]">
      <Navbar />
      <div className="flex-grow pt-24">
        <Routes>
          <Route path="/" element={
            <>
              <HeroSection />
              <ProductList />
            </>
          } />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/success" element={<SuccessModal />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/product/add" element={<ProductAdd />} />
          <Route path="/product/edit/:id" element={<ProductEdit />} />

          {/* Auth Routes - ปิดชั่วคราว */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;