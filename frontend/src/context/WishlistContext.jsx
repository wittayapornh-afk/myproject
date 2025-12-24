import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const getWishlistKey = () => user ? `wishlist_user_${user.id}` : 'wishlist_guest';

  const [wishlistItems, setWishlistItems] = useState([]);

  // โหลดข้อมูลเมื่อ User เปลี่ยน
  useEffect(() => {
    const key = getWishlistKey();
    const saved = localStorage.getItem(key);
    setWishlistItems(saved ? JSON.parse(saved) : []);
  }, [user]);

  // บันทึกข้อมูล
  useEffect(() => {
    const key = getWishlistKey();
    localStorage.setItem(key, JSON.stringify(wishlistItems));
  }, [wishlistItems, user]);

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        Swal.fire({
            icon: 'info', title: 'นำออกจากรายการโปรด', toast: true, position: 'top-end', showConfirmButton: false, timer: 800,
            background: '#fff', color: '#333'
        });
        return prev.filter((item) => item.id !== product.id);
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้าไป
        Swal.fire({
            icon: 'success', title: 'เพิ่มในรายการโปรด', toast: true, position: 'top-end', showConfirmButton: false, timer: 800,
            background: '#ff4d4f', color: '#fff', iconColor: '#fff'
        });
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};