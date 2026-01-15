import React, { createContext, useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from './AuthContext'; // ✅ เรียกใช้ Auth

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // ✅ กันเหนียว: ถ้า useAuth() พัง ให้ค่า auth เป็น null (ไม่ให้เว็บล่ม)
  const auth = useAuth();
  const user = auth ? auth.user : null;
  
  // สร้าง Key สำหรับเก็บข้อมูล (ถ้าไม่มี user ให้ใช้ 'cart_guest')
  const getCartKey = () => user ? `cart_user_${user.id}` : 'cart_guest';

  const [cartItems, setCartItems] = useState([]);

  // 1. โหลดข้อมูลเมื่อ User เปลี่ยน (Login/Logout)
  useEffect(() => {
    const key = getCartKey();
    const savedCart = localStorage.getItem(key);
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    } else {
      setCartItems([]);
    }
  }, [user]); // ทำงานเมื่อ user เปลี่ยน

  // 2. บันทึกข้อมูลลงเครื่องเมื่อตะกร้าเปลี่ยน
  useEffect(() => {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user]);

  // ✅ ฟังก์ชันเพิ่มสินค้า (ลบอันที่ซ้ำออกแล้วเหลืออันเดียว)
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
        // เช็คว่ามีสินค้านี้ในตะกร้าหรือยัง
        const existingItem = prevItems.find((item) => item.id === product.id);
        
        if (existingItem) {
            // ✅ ถ้ามีแล้ว: เอาจำนวนเดิม + จำนวนใหม่ (Accumulate)
            return prevItems.map((item) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity } 
                    : item
            );
        
      } else {
        // ถ้ายังไม่มี ให้เพิ่มใหม่พร้อมจำนวนที่ระบุ
        return [...prevItems, { ...product, quantity: quantity }];
      }
    });
  };

  const removeFromCart = (id) => {
    Swal.fire({
      title: 'ลบสินค้า?',
      text: "คุณต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({
          icon: 'success', title: 'ลบแล้ว!', showConfirmButton: false, timer: 800
        });
      }
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // ✅ แก้ไข: ลบ key ตาม User ปัจจุบัน (ไม่ใช่ลบมั่ว)
  const clearCart = () => {
    setCartItems([]);
    const key = getCartKey();
    localStorage.removeItem(key);
  };

  // ✅ Selection State (New)
  const [selectedItems, setSelectedItems] = useState([]);

  // Reset selection when cart changes (optional, but safer to keep selected if ID exists)
  useEffect(() => {
    setSelectedItems(prev => prev.filter(id => cartItems.some(item => item.id === id)));
  }, [cartItems]);

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const getSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        // New Selection Props
        selectedItems,
        toggleSelection,
        selectAll,
        getSelectedTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};