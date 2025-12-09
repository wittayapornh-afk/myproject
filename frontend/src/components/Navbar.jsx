import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';

function Navbar() {
  const { cartItems } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();

  // นับจำนวนสินค้าในตะกร้า
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#F2F0E4]/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tighter text-[#305949] flex items-center gap-2 hover:opacity-80 transition">
          <span className="bg-[#305949] text-[#F2F0E4] w-10 h-10 flex items-center justify-center rounded-xl text-xl">S</span>
          SHOP
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-12 pr-4 py-3 rounded-full border border-transparent outline-none focus:border-[#305949] focus:ring-2 focus:ring-[#305949]/20 transition-all shadow-sm group-hover:shadow-md"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#305949] transition">🔍</span>
          </div>
        </div>

        {/* Menu Right */}
        <div className="flex items-center gap-3">
          {/* ปุ่ม Admin Dashboard (แสดงตลอดไปก่อนในช่วงทดสอบ) */}
          <Link to="/admin" className="p-3 rounded-full hover:bg-white/50 text-gray-600 transition" title="Admin Dashboard">
            📊
          </Link>

          {/* Cart Button */}
          <Link to="/cart" className="relative p-3 rounded-full bg-white hover:bg-[#305949] hover:text-white text-[#305949] shadow-sm transition-all duration-300 group">
            <span className="text-xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#F2F0E4]">
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