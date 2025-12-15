import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        // เช็คสต็อก (ถ้ามีข้อมูล stock)
        const currentQty = existingItem.quantity;
        const maxStock = product.stock || 999; // ถ้าไม่มีข้อมูลสต็อก ให้ถือว่ามีเยอะไว้ก่อน

        if (currentQty + quantity > maxStock) {
           // แจ้งเตือนเบาๆ ไม่ต้อง Alert ขัดจังหวะก็ได้ หรือจะใส่ก็ได้
           console.warn("สินค้าหมดสต็อก");
           return prevItems;
        }
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // ✅ แก้ไขฟังก์ชันอัปเดตจำนวน (Fix ปุ่มบวก)
  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          // 1. ห้ามต่ำกว่า 1
          if (newQuantity < 1) return item;
          
          // 2. เช็คสต็อก (ถ้ามี)
          const maxStock = item.stock || 999; 
          if (newQuantity > maxStock) {
            return item; // ถ้าเกินสต็อก ก็ไม่บวกเพิ่ม (ค่าเท่าเดิม)
          }

          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};