import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

function CheckoutPage() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [form, setForm] = useState({
    name: '',
    address: '',
    tel: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    // ✅ ส่งข้อมูล State ไปหน้า Payment แทนการยิง API
    navigate('/payment', { 
        state: { 
            customer: form, 
            cartItems: cartItems,
            totalPrice: totalPrice 
        } 
    });
  };

  if (cartItems.length === 0) return (
    <div className="h-[70vh] flex flex-col items-center justify-center bg-background text-center px-4">
        <span className="text-6xl opacity-30 mb-4 grayscale">🛍️</span>
        <h2 className="text-2xl font-bold text-gray-400 mb-2">ไม่มีสินค้าในตะกร้า</h2>
        <Link to="/" className="text-primary font-bold hover:underline">กลับไปเลือกซื้อสินค้า</Link>
    </div>
  );

  // Styles
  const styles = {
    label: "block text-sm font-bold text-gray-600 mb-2 ml-1",
    input: "w-full bg-white text-gray-800 font-medium px-6 py-4 rounded-2xl outline-none border border-gray-300 focus:border-[#305949] focus:ring-2 focus:ring-[#305949]/20 transition-all placeholder-gray-400 shadow-sm"
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
            <Link to="/cart" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-md transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">ที่อยู่จัดส่ง</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
            {/* Form */}
            <div className="flex-1">
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-soft border border-white">
                    <form id="checkout-form" onSubmit={handleProceedToPayment} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={styles.label}>ชื่อ-นามสกุล</label>
                                <input required type="text" name="name" onChange={handleChange} className={styles.input} placeholder="เช่น สมชาย ใจดี" />
                            </div>
                            <div>
                                <label className={styles.label}>เบอร์โทรศัพท์ (ใช้สำหรับตรวจสอบสถานะ)</label>
                                <input required type="tel" name="tel" onChange={handleChange} className={styles.input} placeholder="081-xxxxxxx" />
                            </div>
                        </div>
                        <div>
                            <label className={styles.label}>ที่อยู่จัดส่ง</label>
                            <textarea required name="address" rows="3" onChange={handleChange} className={`${styles.input} resize-none`} placeholder="บ้านเลขที่, ถนน, แขวง/เขต, จังหวัด..."></textarea>
                        </div>
                    </form>
                </div>
            </div>

            {/* Summary */}
            <div className="lg:w-[400px]">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-white sticky top-24">
                    <h3 className="text-xl font-bold text-primary mb-6">สรุปรายการ</h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-6 scrollbar-thin">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-[#FAFAF8] rounded-xl flex items-center justify-center p-2 border border-gray-200 flex-shrink-0">
                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                                    <p className="text-xs text-gray-400">x {item.quantity}</p>
                                </div>
                                <div className="text-sm font-bold text-secondary">฿{(item.price * item.quantity).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
                        <div className="flex justify-between font-bold text-xl text-primary pt-3 mt-2 border-t border-gray-100">
                            <span>ยอดรวมสุทธิ</span><span>฿{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                    <button type="submit" form="checkout-form" className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#234236] transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 mt-8">
                        ไปหน้าชำระเงิน →
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;