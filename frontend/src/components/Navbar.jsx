import React, { useState, useEffect } from 'react';
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
  
  // State สำหรับ User
 const [user, setUser] = useState(null);
  useEffect(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // โหลดข้อมูล User เมื่อเปิดเว็บ
  useEffect(() => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
          setUser(JSON.parse(savedUser));
      }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
      window.location.reload(); // รีโหลดเพื่อเคลียร์สถานะ
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearch(false);
    if (location.pathname !== '/') navigate('/');
  };

  const menuItems = [
    { name: "หน้าแรก", path: "/" },
    { name: "สินค้าทั้งหมด", path: "/" },
    { name: "ติดตามสถานะ", path: "/order-history" }, 
  ];

  // ถ้าเป็น Admin ให้เพิ่มเมนู "ลงขายสินค้า"
  if (user && user.is_superuser) {
      menuItems.push({ name: "ลงขายสินค้า", path: "/product/add" });
  }

  return (
    <nav className="bg-primary sticky top-0 z-50 h-20 flex items-center shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center relative">
        
        {/* --- 1. LOGO --- */}
        <Link key={item.name} to={item.path} className="...">
              {item.name}
            </Link>
        
        {/* --- 2. MENU LINKS (Desktop) --- */}
        <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-white/90">
          {menuItems.map((item) => (
            <Link key={item.name} to={item.path} className={`hover:text-white transition relative py-2 ${location.pathname === item.path ? 'text-white border-b-2 border-accent' : ''}`}>
              {item.name}
            </Link>
          ))}
        </div>

        {/* --- 3. ICONS & USER ACTIONS --- */}
        <div className="flex items-center gap-4 text-white">
          
          {/* ปุ่มค้นหา */}
          <button onClick={() => setShowSearch(!showSearch)} className="hover:text-accent transition transform hover:scale-110 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          
          {/* ปุ่มตะกร้า */}
          <Link to="/cart" className="relative hover:text-accent transition transform hover:scale-110 group p-2 mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md border border-primary animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>

          {/* ปุ่ม User / Login */}
          <div className="pl-4 border-l border-white/20 flex items-center gap-3">
              {user ? (
                  <>
                      {/* ✅ แสดงปุ่ม Dashboard ถ้าเป็น Admin */}
                      {user.is_superuser && (
                          <Link to="/admin" className="hidden lg:flex items-center gap-1 text-xs font-bold bg-yellow-400 text-black px-3 py-1.5 rounded-full shadow-md hover:bg-yellow-300 transition">
                              <span>👑</span> Dashboard
                          </Link>
                      )}

                      <div className="text-right hidden lg:block">
                          <p className="text-[10px] text-accent uppercase tracking-wider font-bold">Welcome</p>
                          <p className="text-sm font-bold truncate max-w-[100px] leading-tight">{user.first_name || user.username}</p>
                      </div>
                      
                      <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500 hover:text-white text-white p-2 rounded-full transition shadow-sm" title="Logout">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      </button>
                  </>
              ) : (
                  <Link to="/login" className="text-sm font-bold bg-white text-primary hover:bg-accent hover:text-white px-5 py-2 rounded-full transition shadow-md">
                      Login
                  </Link>
              )}
          </div>
        </div>

        {/* --- 4. FLOATING SEARCH BAR --- */}
        <div className={`absolute top-full left-0 w-full bg-white/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl border-t border-gray-100 ${showSearch ? 'scale-y-100 opacity-100 visible' : 'scale-y-0 opacity-0 invisible origin-top'}`}>
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center bg-gray-100 rounded-full px-4 py-2 border-2 border-transparent focus-within:border-primary focus-within:bg-white transition-all">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    type="text" 
                    placeholder="ค้นหาสินค้าที่คุณต้องการ..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400 text-sm md:text-base" 
                    autoFocus={showSearch} 
                />
                <button type="submit" className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary hover:text-white transition">ค้นหา</button>
            </form>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;