import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';

function Navbar() {
  const { cartItems } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ตรวจจับการ Scroll เพื่อเปลี่ยนสี Navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ซ่อน Search bar ในหน้า Shop เพราะมี Filter แล้ว
  const showSearchBar = location.pathname !== '/shop';

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-[#F2F0E4] py-5 border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#305949] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:rotate-12 transition-transform">S</div>
          <span className="text-2xl font-black tracking-tighter text-[#263A33]">SHOP<span className="text-[#305949]">.</span></span>
        </Link>

        {/* Global Search (Show only on non-shop pages) */}
        {showSearchBar && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full group">
                    <input 
                        type="text" 
                        placeholder="ค้นหาสินค้า..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100/50 border-2 border-transparent focus:bg-white focus:border-[#305949]/30 pl-12 pr-4 py-2.5 rounded-full outline-none transition-all"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#305949]">🔍</span>
                </div>
            </div>
        )}

        {/* Menu Right */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/shop" className="hidden sm:block px-4 py-2 text-sm font-bold text-gray-600 hover:text-[#305949] transition">สินค้าทั้งหมด</Link>
          
          <Link to="/admin" className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition" title="Admin Dashboard">📊</Link>

          <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-[#305949]/10 text-[#305949] transition group">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform group-hover:scale-110 transition">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;