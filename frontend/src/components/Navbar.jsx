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
    { name: "Home", path: "/" },
    { name: "Shop", path: "/" },
    { name: "Collection", path: "/" },
    { name: "New Look", path: "/product/add" },
  ];

  return (
    // เปลี่ยน bg เป็น primary (เขียวเข้ม)
    <nav className="bg-primary sticky top-0 z-50 h-20 flex items-center shadow-lg">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center relative">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl filter drop-shadow-md">🥦</span>
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-accent transition-colors">My Shop</span>
        </Link>
        
        {/* MENU */}
        <div className="hidden md:flex gap-10 text-[13px] font-bold uppercase tracking-widest text-white/80">
          {menuItems.map((item) => (
            <Link key={item.name} to={item.path} className={`hover:text-white transition relative py-2 ${location.pathname === item.path ? 'text-white border-b-2 border-accent' : ''}`}>
              {item.name}
            </Link>
          ))}
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-6 text-white">
          <button onClick={() => setShowSearch(!showSearch)} className="hover:text-accent transition transform hover:scale-110">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          
          <Link to="/cart" className="relative hover:text-accent transition transform hover:scale-110 group">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-md border border-primary">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* SEARCH BAR (Floating) */}
        <div className={`absolute top-full left-0 w-full bg-white p-6 transition-all duration-300 shadow-xl ${showSearch ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible'}`}>
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center border-b-2 border-primary pb-2">
                <input type="text" placeholder="ค้นหาสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 outline-none text-xl placeholder-gray-300 text-textMain font-medium" autoFocus={showSearch} />
                <button type="submit" className="text-primary hover:text-secondary transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
            </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;