import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // โหลดข้อมูลจาก LocalStorage (ถ้ามี) เพื่อให้รีเฟรชแล้วของไม่หาย
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // บันทึกลง LocalStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. เพิ่มสินค้า
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  // 2. ลดจำนวนสินค้า (Function ใหม่)
  const decreaseItem = (productId) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        // ถ้าเหลือ 1 ชิ้น ให้คงไว้ที่ 1 (ถ้าจะลบต้องกดปุ่มลบแยก)
        return { ...item, quantity: Math.max(1, item.quantity - 1) };
      }
      return item;
    }));
  };

  // 3. ลบสินค้าออก
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // 4. ล้างตะกร้า
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, decreaseItem, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);