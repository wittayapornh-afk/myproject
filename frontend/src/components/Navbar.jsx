import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { cartItems } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user } = useAuth(); 
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ ซ่อนช่องค้นหา ถ้าอยู่ที่หน้าแรก (Home)
  const showSearchBar = location.pathname !== '/';
  
  const isAdmin = user && (user.role_code === 'admin' || user.role_code === 'super_admin');

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-[#F9F9F7] py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#305949] to-[#234236] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transform group-hover:rotate-6 transition-transform">S</div>
          <span className="text-2xl font-black tracking-tight text-[#263A33]">SHOP.</span>
        </Link>

        {/* ✅ แสดงช่องค้นหาเฉพาะหน้าอื่นๆ ที่ไม่ใช่หน้าแรก */}
        {showSearchBar && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8 animate-fade-in">
                <div className="relative w-full group">
                    <input 
                      type="text" 
                      placeholder="ค้นหาสินค้า..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full bg-white border border-gray-200 focus:border-[#305949] pl-12 pr-4 py-2.5 rounded-full outline-none transition-all shadow-sm group-hover:shadow-md text-sm" 
                    />
                    <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#305949] transition-colors"></i>
                </div>
            </div>
        )}

        <div className="flex items-center gap-3 sm:gap-5">
          <Link to="/shop" className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#305949] transition-colors">
            <i className="bi bi-grid"></i> สินค้าทั้งหมด
          </Link>
          
          {isAdmin && (
             <Link to="/admin" className="px-4 py-2 bg-[#FFD700] text-[#5c4d00] rounded-full text-xs font-bold shadow-sm hover:bg-[#ffdf33] transition flex items-center gap-2">
                <i className="bi bi-speedometer2"></i> แดชบอร์ด
             </Link>
          )}

          {!isAdmin && (
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-[#305949] transition group">
                <i className="bi bi-bag-heart text-2xl"></i>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff4d4f] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
          )}

          {user ? (
            <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition">
                <div className="text-right hidden lg:block">
                    <p className="text-xs font-bold text-[#263A33] truncate max-w-[100px]">{user.username}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{user.role || 'Member'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#305949] to-[#1a332a] text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                    {user.username?.charAt(0).toUpperCase()}
                </div>
            </Link>
          ) : (
            <Link to="/login" className="px-6 py-2.5 bg-[#263A33] text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#1d2d27] transition hover:-translate-y-0.5">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;