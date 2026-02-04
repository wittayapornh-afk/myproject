import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Menu } from 'lucide-react'; // ✅ Import Menu Icon
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import PaymentPage from './components/PaymentPage';
import OrderHistory from './components/OrderHistory';
import UserProfile from './components/UserProfile';
import LoginPage from './components/LoginPage'; // ✅ Import LoginPage
import RegisterPage from './components/RegisterPage';
import ForgotPassword from './components/ForgotPassword'; // ✅ Import ForgotPassword
import ResetPassword from './components/ResetPassword'; // ✅ Import ResetPassword
import SuccessModal from './components/SuccessModal';
import CategoryRow from './components/CategoryRow';
import PageTransition from './components/PageTransition'; // ✅ Import PageTransition
import TrackingPage from './components/TrackingPage'; // ✅ Import TrackingPage
import OrderTrackingPage from './components/OrderTrackingPage'; // ✅ NEW: Order Tracking Page
// Admin Components
import AdminDashboard from './components/AdminDashboard'; // ✅ Admin Dashboard
import ProductAdd from './components/ProductAdd';
import ProductEdit from './components/ProductEdit';
import OrderListAdmin from './components/OrderListAdmin';
import UserListAdmin from './components/UserListAdmin';
import AdminLayout from './components/AdminLayout'; // ✅ Layout Wrapper
import AdminSidebar from './components/AdminSidebar'; // ✅ Global Sidebar
import CouponCenter from './components/CouponCenter';
import CouponManagement from './components/CouponManagement';
import MarketingPopup from './components/MarketingPopup'; // ✅ Global Popup
// ... existing imports ...
import FlashSaleManagement from './components/FlashSaleManagement'; // ✅ Flash Sale Management
import FlashSalePage from './components/FlashSalePage'; // ✅ Flash Sale Page
import MyCoupons from './components/MyCoupons'; // ✅ My Coupons Page

import TagManagement from './components/TagManagement'; // 🏷️ Tag Management
import TagPage from './components/TagPage'; // 🏷️ Tag Landing Page

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/ProtectedRoute';


// ✅ Rule 20: ฟังก์ชันช่วย Redirect ถ้า Login แล้วไม่ต้องเข้าหน้า Login อีก
const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // รอให้โหลด User เสร็จก่อน
  if (user) return <Navigate to="/" replace />;
  return children;
};

// ✅ Internal Component to handle Global Sidebar Logic
const AppContent = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Show Sidebar for ALL logged in users (Admin/Seller/Customer)
  const showSidebar = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F7] font-sans text-[#263A33] relative">

      {/* ✅ Global Sidebar */}
      {showSidebar && (
        <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      )}

      {/* ✅ Navbar: Show Always (z-index managed via CSS) */}
      <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      {/* ❌ Removed Marketing Popup as requested */}


      {/* Content Wrapper */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${showSidebar && isSidebarOpen ? 'md:ml-[300px]' : 'md:ml-[84px]'} ${showSidebar ? 'px-4 md:px-8' : ''}`}>

        {/* ✅ Toggle Button handled in Sidebar/Navbar now */}


        {/* เนื้อหาหลัก - pt-20 เพื่อให้พ้นระยะความสูงของ Navbar */}
        <main className="flex-grow pt-20 md:pt-24 h-full">
          <PageTransition>
            <Routes>

              {/* --- 🏠 Public Routes --- */}
              <Route path="/" element={<HomePage />} />

              <Route path="/shop" element={<ProductList />} />
              <Route path="/coupons" element={<CouponCenter />} />
              <Route path="/coupon-center" element={<CouponCenter />} /> {/* Alias */}
              <Route path="/my-coupons" element={<ProtectedRoute><MyCoupons /></ProtectedRoute>} /> {/* ✅ Protected */}

              {/* ✅ จุดสำคัญ: เส้นทางต้องตรงกับ Link ใน ProductList */}
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/tag/:slug" element={<TagPage />} />

              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} /> {/* This was previously protected, now public */}
              <Route path="/flash-sale" element={<FlashSalePage />} /> {/* ✅ Flash Sale Page */}

              {/* --- 🔐 Auth Routes (ยังไม่ Login เท่านั้น) --- */}
              <Route path="/login" element={
                <RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>
              } />
              <Route path="/admin/login" element={
                <RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>
              } />
              <Route path="/register" element={
                <RedirectIfAuthenticated><RegisterPage /></RedirectIfAuthenticated>
              } />
              <Route path="/forgot-password" element={
                <RedirectIfAuthenticated><ForgotPassword /></RedirectIfAuthenticated>
              } />
              <Route path="/reset-password" element={
                <RedirectIfAuthenticated><ResetPassword /></RedirectIfAuthenticated>
              } />

              {/* --- 👤 Customer Routes (ต้อง Login) --- */}
              {/* ✅ Rule 12: allowedRoles รองรับหลายรูปแบบ */}
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['user', 'new_user', 'customer', 'admin', 'super_admin', 'seller']}>
                  <UserProfile />
                </ProtectedRoute>
              } />

              <Route path="/order-history" element={
                <ProtectedRoute allowedRoles={['user', 'new_user', 'customer', 'admin', 'super_admin', 'seller']}>
                  <OrderHistory />
                </ProtectedRoute>
              } />

              <Route path="/tracking" element={
                <ProtectedRoute allowedRoles={['user', 'new_user', 'customer', 'admin', 'super_admin', 'seller']}>
                  <TrackingPage />
                </ProtectedRoute>
              } />

              <Route path="/order-tracking/:id" element={
                <ProtectedRoute allowedRoles={['user', 'new_user', 'customer', 'admin', 'super_admin', 'seller']}>
                  <OrderTrackingPage />
                </ProtectedRoute>
              } />

              <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={['user', 'new_user', 'customer', 'admin', 'super_admin', 'seller']}>
                  <CheckoutPage />
                </ProtectedRoute>
              } />

              <Route path="/payment" element={
                <ProtectedRoute allowedRoles={['user', 'new_user', 'customer', 'admin', 'super_admin', 'seller']}>
                  <PaymentPage />
                </ProtectedRoute>
              } />

              <Route path="/success" element={<SuccessModal />} />

              {/* --- 👮 Admin Routes (เฉพาะ Admin) --- */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* ✅ Admin Layout Wrapper (Wrapper for Routes only now) */}
              <Route element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin', 'seller']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/product/add" element={<ProductAdd />} />
                <Route path="/admin/product/edit/:id" element={<ProductEdit />} />
                <Route path="/admin/orders" element={<OrderListAdmin />} />
                <Route path="/admin/users" element={<UserListAdmin />} />
                <Route path="/admin/coupons" element={<CouponManagement />} />
                <Route path="/admin/flash-sales" element={<FlashSaleManagement />} />
                <Route path="/admin/tags" element={<TagManagement />} /> {/* 🏷️ Tag Management */}
              </Route>

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
          </PageTransition>
        </main>

        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;