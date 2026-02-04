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
  const [isInitialized, setIsInitialized] = useState(false); // ✅ ป้องกัน Save ทับข้อมูลตอนโหลด

  // 1. โหลดข้อมูลเมื่อ User เปลี่ยน (Login/Logout) และ Merge Guest Cart
  useEffect(() => {
    setIsInitialized(false); // Reset ก่อนโหลดใหม่
    const key = getCartKey();
    const savedCart = localStorage.getItem(key);
    console.log(`🛍️ [CartContext] Loading cart for key: ${key}`);
    
    let loadedItems = [];

    if (savedCart) {
      try {
          loadedItems = JSON.parse(savedCart);
          console.log(`✅ [CartContext] Restored ${loadedItems.length} items from localStorage`);
      } catch (e) {
          console.error("❌ Link Cart Parse Error", e);
      }
    } else {
      console.warn(`⚠️ [CartContext] No saved cart found for key: ${key}`);
    }

    // ✅ Merge Guest Cart Logic (ย้ายของจากตะกร้า Guest เข้า User)
    if (user) {
        const guestCartJSON = localStorage.getItem('cart_guest');
        if (guestCartJSON) {
            try {
                const guestItems = JSON.parse(guestCartJSON);
                if (guestItems.length > 0) {
                    console.log(`🔀 [CartContext] Merging ${guestItems.length} guest items into user cart...`);
                    
                    // Merge Strategy: Accumulate quantities
                    guestItems.forEach(gItem => {
                        const existingIndex = loadedItems.findIndex(i => i.id === gItem.id);
                        if (existingIndex > -1) {
                            loadedItems[existingIndex].quantity += gItem.quantity;
                        } else {
                            loadedItems.push(gItem);
                        }
                    });

                    // 🗑️ Clear guest cart after merge
                    localStorage.removeItem('cart_guest');
                    
                    // 💾 Save immediately so we don't lose the merge if refresh happens fast
                    localStorage.setItem(key, JSON.stringify(loadedItems));
                }
            } catch (e) {
                console.error("❌ Guest Cart Merge Error", e);
            }
        }
    }

    setCartItems(loadedItems);
    setIsInitialized(true); // ✅ โหลดเสร็จแล้ว อนุญาตให้บันทึกได้
  }, [user]); // ทำงานเมื่อ user เปลี่ยน

  // 2. บันทึกข้อมูลลงเครื่องเมื่อตะกร้าเปลี่ยน
  useEffect(() => {
    if (!isInitialized) return; // 🛑 ถ้ายังโหลดไม่เสร็จ ห้ามบันทึก (ป้องกัน Bug ตะกร้าหาย)

    const key = getCartKey();
    console.log(`💾 [CartContext] Saving ${cartItems.length} items to localStorage`);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user, isInitialized]);

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
    console.warn(`🛡️ [CartContext] clearCart() called - removing all items`);
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