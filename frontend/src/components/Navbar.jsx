import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { cartItems } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, logout } = useAuth(); 
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // คำนวณจำนวนสินค้าในตะกร้า
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSearchBar = location.pathname !== '/shop';
  
  // ✅ ตรวจสอบสิทธิ์ (ถ้าไม่มี user ให้เป็น false)
  const isAdmin = user && (user.role_code === 'admin' || user.role_code === 'super_admin');

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-[#F2F0E4] py-5 border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#305949] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">S</div>
          <span className="text-2xl font-black tracking-tighter text-[#263A33]">SHOP.</span>
        </Link>

        {showSearchBar && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                    <input 
                      type="text" 
                      placeholder="ค้นหาสินค้า..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full bg-white/50 border-2 border-transparent focus:bg-white focus:border-[#305949]/30 pl-12 pr-4 py-2.5 rounded-full outline-none transition-all" 
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
            </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/shop" className="hidden sm:block px-4 py-2 text-sm font-bold text-gray-600 hover:text-[#305949]">สินค้าทั้งหมด</Link>
          
          {/* 🛡️ ปุ่ม Dashboard (เฉพาะ Admin/Super Admin) */}
          {isAdmin && (
             <Link to="/admin" className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold shadow-sm hover:bg-yellow-300 transition">
                👑 แดชบอร์ด
             </Link>
          )}

          {/* 🛒 ตะกร้าสินค้า (ซ่อนถ้าเป็น Admin/Super Admin) */}
          {!isAdmin && (
              <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-[#305949]/10 text-[#305949] transition group">
                <span className="text-2xl">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
          )}

          {/* 👤 User Menu */}
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <Link to="/profile" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#305949] text-white flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-xs font-bold text-[#263A33]">{user.username}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{user.role || 'User'}</p>
                    </div>
                </Link>
            </div>
          ) : (
            <Link to="/login" className="px-5 py-2.5 bg-[#263A33] text-white rounded-full text-sm font-bold shadow-lg hover:bg-[#1d2d27] transition">เข้าสู่ระบบ</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;