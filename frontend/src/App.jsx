import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // เพิ่ม Navigate
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import PaymentPage from './components/PaymentPage';
import OrderHistory from './components/OrderHistory';
import AdminDashboard from './components/AdminDashboard';
import ProductAdd from './components/ProductAdd';
import ProductEdit from './components/ProductEdit';
import SuccessModal from './components/SuccessModal';
import CategoryRow from './components/CategoryRow';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import UserProfile from './components/UserProfile';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/ProtectedRoute';

// Component สำหรับป้องกัน Login ซ้ำ
const RedirectIfAuthenticated = ({ children }) => {
    const { user } = useAuth();
    if (user) return <Navigate to="/" replace />;
    return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <div className="flex flex-col min-h-screen bg-[#F2F0E4] font-sans text-[#263A33]">
            <Navbar />
            <div className="flex-grow pt-24">
              <Routes>
                
                {/* Public Routes */}
                <Route path="/" element={
                  <>
                    <HeroSection />
                    <div className="flex flex-col w-full bg-white rounded-t-[3rem] -mt-10 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-hidden">
                      <CategoryRow title="📱 ไฮเทค & แก็ดเจ็ต" categorySlug="smartphones" />
                      <CategoryRow title="🛋️ แต่งบ้านมินิมอล" categorySlug="furniture" bgColor="#FAFAF8" />
                      <CategoryRow title="✨ ความงาม & สกินแคร์" categorySlug="beauty" />
                    </div>
                  </>
                } />
                <Route path="/shop" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                
                {/* Auth Routes (ห้ามเข้าถ้า Login แล้ว) */}
                <Route path="/login" element={
                    <RedirectIfAuthenticated>
                        <LoginPage />
                    </RedirectIfAuthenticated>
                } />
                <Route path="/register" element={
                    <RedirectIfAuthenticated>
                        <RegisterPage />
                    </RedirectIfAuthenticated>
                } />

                {/* Customer Routes */}
                <Route path="/checkout" element={
                    <ProtectedRoute allowedRoles={['user', 'customer', 'admin', 'super_admin']}>
                        <CheckoutPage />
                    </ProtectedRoute>
                } />
                <Route path="/payment" element={
                    <ProtectedRoute allowedRoles={['user', 'customer', 'admin', 'super_admin']}>
                        <PaymentPage />
                    </ProtectedRoute>
                } />
                <Route path="/success" element={<SuccessModal />} />
                <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['user', 'customer', 'admin', 'super_admin']}>
                        <UserProfile />
                    </ProtectedRoute>
                } />
                <Route path="/order-history" element={
                    <ProtectedRoute allowedRoles={['customer', 'admin', 'super_admin']}>
                        <OrderHistory />
                    </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/product/add" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <ProductAdd />
                    </ProtectedRoute>
                } />
                <Route path="/product/edit/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                        <ProductEdit />
                    </ProtectedRoute>
                } />

                {/* 404 Route */}
                <Route path="*" element={<div className="text-center mt-20 text-xl">ไม่พบหน้าที่ต้องการ (404)</div>} />

              </Routes>
            </div>
            <Footer />
          </div>
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;