// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';

function Navbar() {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showSearch, setShowSearch] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearch(false);
    if (location.pathname !== '/') navigate('/');
  };

  const menuItems = [
    { name: "หน้าแรก", path: "/" },
    { name: "สินค้าทั้งหมด", path: "/" },
    { name: "ติดตามสถานะ", path: "/order-history" }, // ✅ เมนูใหม่
    { name: "ลงขายสินค้า", path: "/product/add" },
];
  return (
    <nav className="bg-primary sticky top-0 z-50 h-20 flex items-center shadow-lg">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center relative">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl filter drop-shadow-md">🥦</span>
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-accent transition-colors">My Shop</span>
        </Link>
        
        {/* MENU */}
        <div className="hidden md:flex gap-10 text-sm font-bold tracking-wide text-white/90">
          {menuItems.map((item) => (
            <Link key={item.name} to={item.path} className={`hover:text-white transition relative py-2 ${location.pathname === item.path ? 'text-white border-b-2 border-accent' : ''}`}>
              {item.name}
            </Link>
          ))}
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-6 text-white">
          <button onClick={() => setShowSearch(!showSearch)} className="hover:text-accent transition transform hover:scale-110">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          
          <Link to="/cart" className="relative hover:text-accent transition transform hover:scale-110 group">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md border border-primary">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* SEARCH BAR (Floating) */}
        <div className={`absolute top-full left-0 w-full bg-white p-6 transition-all duration-300 shadow-xl ${showSearch ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible'}`}>
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center border-2 border-gray-200 rounded-full px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-gray-50">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    type="text" 
                    placeholder="ค้นหาสินค้าที่คุณต้องการ..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-1 outline-none text-lg text-gray-700 bg-transparent placeholder-gray-400" 
                    autoFocus={showSearch} 
                />
            </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;