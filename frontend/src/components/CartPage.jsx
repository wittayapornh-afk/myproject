import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartPage() {
  const { cartItems, removeFromCart, decreaseItem, addToCart } = useCart();
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // ถ้าตะกร้าว่าง
  if (cartItems.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-[#F9F9F7]">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm text-4xl mb-2">🛒</div>
        <h2 className="text-2xl font-bold text-[#263A33]">ตะกร้าของคุณว่างเปล่า</h2>
        <p className="text-gray-500">ยังไม่มีสินค้าในตะกร้า ลองเลือกดูสินค้าที่น่าสนใจได้เลย</p>
        <Link to="/shop" className="px-8 py-3 bg-[#305949] text-white font-bold rounded-full hover:bg-[#234236] transition shadow-lg hover:-translate-y-1">
            เลือกซื้อสินค้า
        </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">
                    <Link to="/" className="hover:text-[#305949]">หน้าหลัก</Link> / <span>ตะกร้าสินค้า</span>
                </p>
                <h1 className="text-3xl font-extrabold text-[#263A33] flex items-center gap-3">
                    ตะกร้าสินค้า <span className="bg-[#305949] text-white text-xs px-2.5 py-1 rounded-full font-bold align-middle">{cartItems.length}</span>
                </h1>
            </div>
            <Link to="/shop" className="text-[#305949] font-bold text-sm hover:underline">
                ← ซื้อสินค้าต่อ
            </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* 🛒 Cart Items List */}
            <div className="flex-1 space-y-4">
                {cartItems.map(item => (
                    <div key={item.id} className="group bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-all duration-300">
                        {/* Image */}
                        <div className="w-full sm:w-28 h-28 bg-[#F4F4F2] rounded-2xl flex-shrink-0 flex items-center justify-center p-2 relative overflow-hidden">
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full text-center sm:text-left">
                            <div className="mb-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.category}</span>
                            </div>
                            <h3 className="font-bold text-lg text-[#263A33] leading-tight mb-1">{item.title}</h3>
                            <p className="text-[#305949] font-extrabold text-xl">฿{item.price?.toLocaleString()}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 bg-gray-50 p-2 rounded-2xl border border-gray-100 sm:bg-transparent sm:border-0 sm:p-0">
                            {/* Quantity Buttons */}
                            <div className="flex items-center gap-3 bg-white sm:bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200 shadow-sm">
                                <button onClick={() => decreaseItem(item.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition font-bold text-lg leading-none pb-1">-</button>
                                <span className="font-bold text-[#263A33] w-6 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart(item, 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-[#305949] hover:bg-[#305949] hover:text-white transition font-bold text-lg leading-none pb-1">+</button>
                            </div>

                            {/* Delete Button */}
                            <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition shadow-sm" title="ลบสินค้า">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🧾 Order Summary */}
            <div className="lg:w-96 flex-shrink-0">
                <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-gray-100 border border-gray-100 sticky top-28">
                    <h3 className="font-bold text-xl text-[#263A33] mb-6 flex items-center gap-2">
                        <span>🧾</span> สรุปยอดสั่งซื้อ
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>ยอดรวมสินค้า</span>
                            <span className="font-medium">฿{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>ส่วนลด</span>
                            <span className="text-green-500 font-medium">-฿0</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-sm pb-4 border-b border-dashed border-gray-200">
                            <span>ค่าจัดส่ง</span>
                            <span className="text-[#305949] font-medium bg-[#305949]/10 px-2 py-0.5 rounded text-xs">ส่งฟรี</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-[#263A33]">ยอดสุทธิ</span>
                            <span className="text-3xl font-extrabold text-[#305949]">฿{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <Link to="/checkout" className="group w-full py-4 bg-[#305949] text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-[#234236] transition flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-1">
                        ดำเนินการชำระเงิน <span className="group-hover:translate-x-1 transition">→</span>
                    </Link>
                    
                    <p className="text-center text-[10px] text-gray-400 mt-4 flex items-center justify-center gap-2">
                        🔒 ปลอดภัย 100% • 📦 ส่งฟรีทั่วไทย
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;