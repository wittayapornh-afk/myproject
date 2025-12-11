import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Context & Guard
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/ProtectedRoute'; // 👈 นำเข้าตัวคุมประตู

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <div className="flex flex-col min-h-screen bg-[#F2F0E4] font-sans text-[#263A33]">
            <Navbar />
            <div className="flex-grow pt-24">
              <Routes>
                
                {/* 🌍 1. Public Routes (ใครก็เข้าได้: User/Customer/Guest) */}
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* 🔒 2. Customer Routes (ต้องล็อกอิน: User/Customer) */}
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

                {/* 🛡️ 3. Admin & Super Admin Routes */}
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