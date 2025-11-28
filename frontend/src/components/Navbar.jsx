import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    // เปลี่ยน bg-white เป็น bg-primary (สีเข้ม) และ text-white
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* โลโก้ */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold hover:text-secondary transition duration-300">
          <span className="text-3xl">🥦</span> My Shop
        </Link>
        
        {/* ปุ่มตะกร้า */}
        <Link to="/cart" className="relative group bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
          <span className="text-2xl">🛒</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-primary shadow-sm">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;