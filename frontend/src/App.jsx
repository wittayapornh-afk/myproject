import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import PaymentPage from './components/PaymentPage';
import OrderHistory from './components/OrderHistory';
import UserProfile from './components/UserProfile';
import WishlistPage from './components/WishlistPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SuccessModal from './components/SuccessModal';
import CategoryRow from './components/CategoryRow';

// Admin Components
import AdminDashboard from './components/AdminDashboard';
import ProductAdd from './components/ProductAdd';
import ProductEdit from './components/ProductEdit';
import OrderListAdmin from './components/OrderListAdmin';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';

// ✅ Rule 20: ฟังก์ชันช่วย Redirect ถ้า Login แล้วไม่ต้องเข้าหน้า Login อีก
const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // รอให้โหลด User เสร็จก่อน
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <SearchProvider>
            <div className="flex flex-col min-h-screen bg-[#F9F9F7] font-sans text-[#263A33]">

              {/* ✅ Rule 2, 5: Navbar ต้องอยู่บนสุดและ Fixed */}
              <Navbar />

              {/* เนื้อหาหลัก - pt-24 เพื่อให้พ้นระยะความสูงของ Navbar */}
              <main className="flex-grow pt-20 md:pt-24">
                <Routes>

                  {/* --- 🏠 Public Routes --- */}
                  <Route path="/" element={
                    <>
                      <HeroSection />
                      {/* ✅ Rule 26: ส่วนแสดงหมวดหมู่หน้าแรก */}
                      <div className="flex flex-col w-full bg-white rounded-t-[3rem] -mt-10 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] overflow-hidden pb-16">
                        <CategoryRow title="📱 ไฮเทค & แก็ดเจ็ต" categorySlug="smartphones" />
                        <CategoryRow title="🛋️ แต่งบ้านมินิมอล" categorySlug="furniture" bgColor="#FAFAF8" />
                        <CategoryRow title="✨ ความงาม & สกินแคร์" categorySlug="beauty" />
                      </div>
                    </>
                  } />

                  <Route path="/shop" element={<ProductList />} />

                  {/* ✅ จุดสำคัญ: เส้นทางต้องตรงกับ Link ใน ProductList */}
                  <Route path="/product/:id" element={<ProductDetail />} />

                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />

                  {/* --- 🔐 Auth Routes (ยังไม่ Login เท่านั้น) --- */}
                  <Route path="/login" element={
                    <RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>
                  } />
                  <Route path="/register" element={
                    <RedirectIfAuthenticated><RegisterPage /></RedirectIfAuthenticated>
                  } />

                  {/* --- 👤 Customer Routes (ต้อง Login) --- */}
                  {/* ✅ Rule 12: allowedRoles รองรับหลายรูปแบบ */}
                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['user', 'customer', 'admin', 'super_admin', 'seller']}>
                      <UserProfile />
                    </ProtectedRoute>
                  } />

                  <Route path="/order-history" element={
                    <ProtectedRoute allowedRoles={['user', 'customer', 'admin', 'super_admin', 'seller']}>
                      <OrderHistory />
                    </ProtectedRoute>
                  } />

                  <Route path="/checkout" element={
                    <ProtectedRoute allowedRoles={['user', 'customer', 'admin', 'super_admin', 'seller']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/payment" element={
                    <ProtectedRoute allowedRoles={['user', 'customer', 'admin', 'super_admin', 'seller']}>
                      <PaymentPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/success" element={<SuccessModal />} />

                  {/* --- 👮 Admin Routes (เฉพาะ Admin) --- */}
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                  <Route path="/admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'seller']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  {/* ✅ ปรับ Path ให้เป็นมาตรฐานแอดมิน */}
                  <Route path="/admin/product/add" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'seller']}>
                      <ProductAdd />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin/product/edit/:id" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'seller']}>
                      <ProductEdit />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin/orders" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'seller']}>
                      <OrderListAdmin />
                    </ProtectedRoute>
                  } />

                  {/* --- 🏜️ 404 Route (Rule 29) --- */}
                  <Route path="*" element={
                    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 pt-20">
                      <div className="text-9xl font-black text-gray-100 mb-4">404</div>
                      <h1 className="text-3xl font-black text-[#263A33] mb-4 uppercase tracking-tighter">Oops! Page Not Found</h1>
                      <p className="text-gray-400 font-bold mb-10 max-w-md">ขออภัย ไม่พบหน้าที่คุณต้องการ อาจเป็นเพราะลิงก์เสียหรือหน้านี้ถูกลบไปแล้ว</p>
                      <Link to="/" className="px-10 py-4 bg-[#1a4d2e] text-white rounded-2xl font-black shadow-xl hover:bg-[#143d24] transition-all transform hover:-translate-y-1">
                        กลับสู่หน้าหลัก
                      </Link>
                    </div>
                  } />

                </Routes>
              </main>

              <Footer />
            </div>
          </SearchProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;