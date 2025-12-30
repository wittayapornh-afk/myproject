import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Menu, X, ChevronDown, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl, getUserAvatar } from '../utils/formatUtils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const API_BASE_URL = "http://localhost:8000";

  // ✅ Rule 12: เช็ค Admin/Seller Check
  const userRole = (user?.role || user?.role_code || '').toLowerCase();
  const isAdmin = ['admin', 'super_admin'].includes(userRole);
  const isRestricted = ['admin', 'super_admin', 'seller'].includes(userRole); // ✅ New Flag for Storefront Restriction
  const hasAdminPanelAccess = isAdmin || userRole === 'seller';

  // ✅ Rule 4: ปิดเมนูอัตโนมัติเมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);


  // ปิด Dropdown เมื่อคลิกข้างนอก (Rule 60)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
  };

  return (
    // ✅ Rule 2, 5: Fixed และ Z-Index สูงสุด พร้อมเอฟเฟกต์เบลอ
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-[999] top-0 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* ✅ Rule 1, 9: Logo พร้อม Hover Animation */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#1a4d2e] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
            <Sparkles size={20} className="group-hover:animate-pulse" />
          </div>
          <span className="text-2xl font-black text-[#1a4d2e] tracking-tighter uppercase">Shop.</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {/* ✅ Rule 3: Active State ขีดเส้นใต้เมนูปัจจุบัน */}
          <Link to="/shop" className={`font-black text-sm uppercase tracking-widest transition-all relative py-2 ${location.pathname === '/shop' ? 'text-[#1a4d2e]' : 'text-gray-400 hover:text-[#1a4d2e]'}`}>
            สินค้าทั้งหมด
            {location.pathname === '/shop' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a4d2e] rounded-full animate-in fade-in slide-in-from-left-2" />}
          </Link>

          {/* ✅ Rule 16: ซ่อนปุ่มตะกร้า/Wishlist สำหรับ Admin & Seller */}
          {!isRestricted && (
            <div className="flex items-center gap-3 border-r border-gray-100 pr-6 mr-2">
              <Link to="/wishlist" className="relative p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300">
                <Heart size={22} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative p-2.5 text-gray-400 hover:text-[#1a4d2e] hover:bg-green-50 rounded-2xl transition-all duration-300">
                <ShoppingCart size={22} />
                {cartItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-[#1a4d2e] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* User Section */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-[#1a4d2e]/30 bg-white transition-all duration-300 group"
              >
                {/* ... Profile Icon ... */}
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative shadow-inner">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <User size={20} />
                  </div>
                  <img
                    src={getUserAvatar(user.avatar)}
                    className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                  />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-black text-gray-800 leading-tight uppercase tracking-tighter">{user.username}</p>
                  <p className="text-[9px] text-[#1a4d2e] font-black uppercase tracking-widest opacity-70">{user.role}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ✅ Rule 27: Dropdown Menu พร้อม Fade/Zoom Animation */}
              {isProfileOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white border border-gray-100 shadow-2xl rounded-[2rem] z-50 overflow-hidden py-3 animate-in fade-in zoom-in-95 duration-200 origin-top-right">

                  {/* ✅ Rule 20: ปุ่ม Dashboard สำหรับ Admin */}
                  {hasAdminPanelAccess && (
                    <Link to="/admin/dashboard" className="flex items-center gap-4 px-5 py-3.5 text-sm font-black text-[#1a4d2e] hover:bg-green-50 transition-colors">
                      <div className="p-2 bg-green-100 rounded-xl"><LayoutDashboard size={18} /></div>
                      {user.role === 'seller' ? 'DASHBOARD' : 'ADMIN PANEL'}
                    </Link>
                  )}

                  <Link to="/profile" className="flex items-center gap-4 px-5 py-3.5 text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-gray-100 rounded-xl text-gray-400"><User size={18} /></div>
                    โปรไฟล์ของฉัน
                  </Link>

                  {!isRestricted && (
                    <Link to="/order-history" className="flex items-center gap-4 px-5 py-3.5 text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors">
                      <div className="p-2 bg-gray-100 rounded-xl text-gray-400"><span className="text-lg">📦</span></div>
                      ประวัติการสั่งซื้อ
                    </Link>
                  )}

                  <div className="h-px bg-gray-100 my-2 mx-5 opacity-50"></div>

                  <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3.5 text-sm font-black text-red-500 hover:bg-red-50 transition-colors text-left">
                    <div className="p-2 bg-red-100 rounded-xl"><LogOut size={18} /></div>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-6 py-2.5 text-sm font-black text-gray-500 hover:text-[#1a4d2e] transition-all">เข้าสู่ระบบ</Link>
              <Link to="/register" className="px-8 py-2.5 text-sm font-black text-white bg-[#1a4d2e] hover:bg-[#143d24] rounded-2xl shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1 active:scale-95">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ✅ Rule 4, 80: Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-6 px-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <Link to="/shop" className="block text-lg font-black text-gray-800 px-4 py-2 hover:bg-gray-50 rounded-xl">สินค้าทั้งหมด</Link>
          {user && (
            <>
              <div className="h-px bg-gray-100 mx-4" />
              <Link to="/profile" className="block text-lg font-black text-[#1a4d2e] px-4 py-2">โปรไฟล์ของฉัน</Link>
              {!isAdmin && <Link to="/cart" className="block text-lg font-black text-gray-800 px-4 py-2">ตะกร้าสินค้า ({cartItems.length})</Link>}
              <button onClick={handleLogout} className="w-full text-left text-lg font-black text-red-500 px-4 py-2">ออกจากระบบ</button>
            </>
          )}
          {!user && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link to="/login" className="text-center py-3 font-black text-gray-600 bg-gray-100 rounded-2xl">LOGIN</Link>
              <Link to="/register" className="text-center py-3 font-black text-white bg-[#1a4d2e] rounded-2xl shadow-lg">SIGN UP</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}