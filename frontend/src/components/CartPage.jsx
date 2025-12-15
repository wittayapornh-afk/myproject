import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire('ตะกร้าว่างเปล่า', 'กรุณาเลือกสินค้าก่อนชำระเงิน', 'warning');
      return;
    }
    navigate('/checkout');
  };

  const confirmRemove = (id) => {
    Swal.fire({
      title: 'ลบสินค้านี้?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบเลย',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(id);
      }
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F9F9F7] font-sans p-4">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-sm text-center max-w-lg border border-gray-100 animate-fade-in">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner text-gray-400">
            <ShoppingCart size={48} />
          </div>
          <h2 className="text-3xl font-black text-[#263A33] mb-3">ตะกร้าของคุณว่างเปล่า</h2>
          <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-[#305949] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#234236] transition-all shadow-lg">
            <ArrowLeft size={18} /> กลับไปเลือกสินค้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#263A33] mb-8 flex items-center gap-3">
          <span className="bg-[#305949] text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md"><ShoppingCart size={20} /></span>
          ตะกร้าสินค้าของคุณ <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">({cartItems.length} รายการ)</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-all">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#F9F9F7] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                   {/* ใช้ logic ง่ายๆ ถ้าไม่มีรูปใช้ placeholder */}
                   <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 w-full text-center sm:text-left">
                  <h3 className="font-bold text-[#263A33] text-lg mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">{item.category}</p>
                  <div className="font-extrabold text-[#305949] text-xl">฿{Number(item.price).toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  
                  {/* ✅ ปุ่มเพิ่มลดจำนวนที่แก้ไขแล้ว */}
                  <div className="flex items-center gap-1 bg-[#F5F5F0] rounded-full p-1 border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-600 hover:bg-[#305949] hover:text-white transition-all shadow-sm">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-[#263A33]">{item.quantity}</span>
                    <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-600 hover:bg-[#305949] hover:text-white transition-all shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button onClick={() => confirmRemove(item.id)} className="text-gray-400 text-xs hover:text-red-500 transition-colors flex items-center gap-1 py-1 px-2 rounded-md hover:bg-red-50">
                    <Trash2 size={14} /> ลบรายการ
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-2">
                <button onClick={() => Swal.fire({ title: 'ล้างตะกร้า?', showCancelButton:true, confirmButtonColor:'#d33' }).then(r => r.isConfirmed && clearCart())} className="text-red-500 text-sm font-bold hover:underline">ล้างตะกร้าทั้งหมด</button>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-28">
              <h3 className="text-xl font-black text-[#263A33] mb-6">สรุปคำสั่งซื้อ</h3>
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex justify-between"><span>ยอดรวมสินค้า</span><span className="font-bold">฿{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span>ค่าจัดส่ง</span>{shipping === 0 ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold">ส่งฟรี</span> : <span className="font-bold">฿{shipping.toLocaleString()}</span>}</div>
              </div>
              <div className="border-t-2 border-dashed border-gray-100 my-6"></div>
              <div className="flex justify-between items-end mb-8"><span className="font-bold text-gray-500">ยอดสุทธิ</span><span className="text-3xl font-black text-[#305949]">฿{total.toLocaleString()}</span></div>
              <button onClick={handleCheckout} className="w-full bg-[#305949] text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-[#234236] transition-all flex items-center justify-center gap-2">ดำเนินการชำระเงิน <ArrowRight size={20} /></button>
              <p className="text-center text-xs text-gray-400 mt-4 flex justify-center items-center gap-1"><ShieldCheck size={14} /> ข้อมูลของคุณปลอดภัย 100%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;