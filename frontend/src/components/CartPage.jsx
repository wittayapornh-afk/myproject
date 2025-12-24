import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft, ShieldCheck, Info } from 'lucide-react';
// ✅ Rule 59: เรียกใช้ Utility สำหรับจัดการราคาและรูปภาพ
import { formatPrice, getImageUrl } from '../utils/formatUtils';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  // ✅ Rule 10, 44, 64: ปรับปรุงหน้า Empty State ให้ดูเป็นมืออาชีพ
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center p-6 pt-24">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-gray-200/50 border border-gray-50">
          <ShoppingBag size={56} className="text-gray-200" />
        </div>
        <h2 className="text-3xl font-black text-[#263A33] mb-3">ตะกร้าของคุณยังว่างเปล่า</h2>
        <p className="text-gray-400 font-bold mb-10 text-center max-w-sm">
            ดูเหมือนว่าคุณยังไม่ได้เลือกสินค้าที่ถูกใจใส่ลงในตะกร้าเลย ลองไปเลือกดูสินค้าใหม่ๆ ของเราไหม?
        </p>
        <Link to="/shop" className="px-12 py-4 bg-[#1a4d2e] text-white rounded-2xl font-black hover:bg-[#143d24] transition-all shadow-xl hover:shadow-green-100 flex items-center gap-3 transform hover:-translate-y-1">
          ไปหน้าร้านค้า <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 md:px-8 pt-28 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-[#263A33] mb-10 flex items-center gap-4">
          <div className="p-3 bg-[#1a4d2e] rounded-2xl text-white shadow-lg">
            <ShoppingBag size={28} /> 
          </div>
          My Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center transition-all hover:shadow-md group">
                {/* ✅ Rule 31: จัดการรูปภาพผ่าน Utility */}
                <div className="w-32 h-32 bg-gray-50 rounded-[2rem] overflow-hidden flex-shrink-0 border border-gray-50">
                  <img 
                    src={getImageUrl(item.thumbnail || item.image)} 
                    alt={item.title} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{item.category}</p>
                  <h3 className="font-black text-[#263A33] text-xl mb-1 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <span className="font-black text-[#1a4d2e] text-2xl">{formatPrice(item.price)}</span>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                    {/* ✅ Rule 42: ปุ่มลดจำนวน */}
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all shadow-sm active:scale-90 text-gray-500 hover:text-red-500"
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={18} />
                    </button>
                    
                    <span className="w-10 text-center font-black text-lg text-gray-800">{item.quantity}</span>
                    
                    {/* ✅ Rule 42: ปุ่มเพิ่มจำนวน (ดักสต็อกไม่ให้เกินจริง) */}
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        disabled={item.quantity >= (item.stock || 99)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all shadow-sm active:scale-90 text-gray-500 hover:text-[#1a4d2e] disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <Plus size={18} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all ml-auto sm:ml-0"
                    title="ลบสินค้า"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))}

            <Link to="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1a4d2e] font-bold mt-4 transition-all group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> เลือกซื้อสินค้าเพิ่มเติม
            </Link>
          </div>

          {/* ✅ Rule 43: สรุปยอดเงิน (Order Summary Sidebar) */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 sticky top-28">
              <h2 className="text-2xl font-black text-[#263A33] mb-8">Summary</h2>
              
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
                <div className="flex justify-between font-bold text-gray-400 uppercase text-xs tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-600">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-400 uppercase text-xs tracking-widest">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="font-black text-gray-400 text-xs uppercase tracking-widest mb-1">Total Amount</span>
                <span className="text-4xl font-black text-[#1a4d2e]">{formatPrice(getTotalPrice())}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl mb-8 flex items-start gap-3">
                <Info size={16} className="text-gray-400 mt-0.5" />
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase">
                    ราคาสินค้าทั้งหมดรวมภาษีมูลค่าเพิ่ม (VAT) เรียบร้อยแล้ว บริษัทฯ สงวนสิทธิ์ในการเปลี่ยนแปลงสต็อกโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
                </p>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full py-5 bg-[#1a4d2e] text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-green-100 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
              >
                PROCEED TO CHECKOUT <ArrowRight size={22} />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <ShieldCheck size={16} className="text-[#1a4d2e] opacity-50" /> Secure Payments Powered by Bank
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;