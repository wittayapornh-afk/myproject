import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 1. โหลดข้อมูลตะกร้าจาก LocalStorage (ถ้ามี)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  // 2. บันทึกลง LocalStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // ฟังก์ชันเพิ่มสินค้า
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // ฟังก์ชันลบสินค้า
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // ฟังก์ชันอัปเดตจำนวน
  const updateQuantity = (productId, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  // ฟังก์ชันล้างตะกร้า
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  // ✅ ฟังก์ชันคำนวณราคารวม (ตัวที่ Error หาไม่เจอ)
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getTotalPrice // ✅ ต้องส่งค่านี้ออกมาด้วย ไม่งั้น CheckoutPage จะ Error
    }}>
      {children}
    </CartContext.Provider>
  );
};