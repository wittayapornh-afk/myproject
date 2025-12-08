import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartPage() {
  const { cartItems, removeFromCart, decreaseItem, addToCart } = useCart();
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cartItems.length === 0) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-4 bg-background">
        <span className="text-6xl opacity-30">🌿</span>
        <h2 className="text-2xl font-bold text-textMuted">ตะกร้าของคุณว่างเปล่า</h2>
        <Link to="/" className="btn-primary mt-4">เลือกซื้อสินค้า</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-textMain mb-8 flex items-center gap-3">
            Shopping Cart <span className="text-base font-normal text-white bg-secondary px-3 py-0.5 rounded-full">{cartItems.length}</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* List */}
            <div className="flex-1 space-y-4">
                {cartItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-soft flex items-center gap-6">
                        <div className="w-24 h-24 bg-background rounded-xl flex items-center justify-center p-2 border border-gray-100">
                            <img src={item.thumbnail} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-textMain">{item.title}</h3>
                            <p className="text-sm text-textMuted">{item.category}</p>
                            <p className="text-secondary font-bold text-lg mt-1">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1 border border-gray-200">
                            <button onClick={() => decreaseItem(item.id)} className="w-8 h-8 rounded-full bg-white text-textMain hover:bg-secondary hover:text-white shadow-sm flex items-center justify-center transition">-</button>
                            <span className="font-bold text-sm w-6 text-center text-textMain">{item.quantity}</span>
                            <button onClick={() => addToCart(item, 1)} className="w-8 h-8 rounded-full bg-white text-textMain hover:bg-secondary hover:text-white shadow-sm flex items-center justify-center transition">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-danger">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="lg:w-96">
                <div className="bg-white p-8 rounded-3xl shadow-soft sticky top-24 border border-white">
                    <h3 className="font-bold text-xl mb-6 text-textMain border-b border-gray-100 pb-4">สรุปยอดรวม</h3>
                    <div className="flex justify-between mb-4 text-textMuted"><span>ค่าสินค้า</span><span>${totalPrice.toLocaleString()}</span></div>
                    <div className="flex justify-between mb-8 text-textMuted"><span>ค่าจัดส่ง</span><span className="text-secondary">ฟรี</span></div>
                    <div className="flex justify-between font-bold text-2xl text-textMain mb-8 pt-4 border-t border-gray-100"><span>ยอดรวมสุทธิ</span><span>${totalPrice.toLocaleString()}</span></div>
                    <Link to="/checkout" className="btn-primary w-full block text-center py-4 text-sm">ชำระเงิน</Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;