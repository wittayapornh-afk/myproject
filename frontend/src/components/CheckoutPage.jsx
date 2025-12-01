import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import SuccessModal from './SuccessModal'; // อย่าลืมว่าต้องมีไฟล์ SuccessModal.jsx ที่เราเคยสร้างไว้นะครับ

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [form, setForm] = useState({
    name: '',
    address: '',
    tel: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:8000/api/checkout/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems, customer: form })
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "เกิดข้อผิดพลาดในการสั่งซื้อ");
        }

        // สำเร็จ: แสดง Modal
        setShowModal(true);

    } catch (err) {
        alert(`❌ ไม่สามารถสั่งซื้อได้: ${err.message}`);
    }
  };

  const handleCloseModal = () => {
      setShowModal(false);
      clearCart();
      navigate('/');
  };

  if (cartItems.length === 0) return (
    <div className="h-[70vh] flex flex-col items-center justify-center bg-background text-center px-4">
        <span className="text-6xl opacity-30 mb-4">🛍️</span>
        <h2 className="text-2xl font-bold text-gray-400 mb-2">ไม่มีสินค้าในตะกร้า</h2>
        <Link to="/" className="text-primary font-bold hover:underline">กลับไปเลือกซื้อสินค้า</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      
      {/* Modal แจ้งเตือนเมื่อสำเร็จ */}
      <SuccessModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        title="สั่งซื้อเรียบร้อย!"
        message={`ขอบคุณคุณ ${form.name} เราได้รับคำสั่งซื้อของคุณแล้ว และกำลังเตรียมจัดส่งให้ทันที 🌿`}
      />

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
            <Link to="/cart" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-md transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
            
            {/* --- Left Column: Shipping Form --- */}
            <div className="flex-1">
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-soft border border-white/60">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-primary">ที่อยู่จัดส่ง</h2>
                    </div>

                    <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">ชื่อ-นามสกุล</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="name" 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FAFAF8] text-primary font-medium px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all border border-transparent focus:bg-white"
                                    placeholder="เช่น สมชาย ใจดี" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">เบอร์โทรศัพท์</label>
                                <input 
                                    required 
                                    type="tel" 
                                    name="tel" 
                                    onChange={handleChange} 
                                    className="w-full bg-[#FAFAF8] text-primary font-medium px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all border border-transparent focus:bg-white"
                                    placeholder="081-234-5678" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">ที่อยู่</label>
                            <textarea 
                                required 
                                name="address" 
                                rows="3" 
                                onChange={handleChange} 
                                className="w-full bg-[#FAFAF8] text-primary font-medium px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all border border-transparent focus:bg-white resize-none"
                                placeholder="บ้านเลขที่, ถนน, แขวง/เขต, จังหวัด..."
                            ></textarea>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- Right Column: Order Summary --- */}
            <div className="lg:w-[400px]">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-white/60 sticky top-24">
                    <h3 className="text-xl font-bold text-primary mb-6 flex justify-between items-center">
                        สรุปรายการ
                        <span className="text-sm font-normal text-white bg-secondary px-3 py-1 rounded-full">{cartItems.length} ชิ้น</span>
                    </h3>
                    
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 mb-6 scrollbar-thin">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-[#FAFAF8] rounded-xl flex items-center justify-center p-2 border border-gray-50 flex-shrink-0">
                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-primary truncate">{item.title}</p>
                                    <p className="text-xs text-gray-400">x {item.quantity}</p>
                                </div>
                                <div className="text-sm font-bold text-secondary">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>ยอดรวมสินค้าย่อย</span>
                            <span>${totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>ค่าจัดส่ง</span>
                            <span className="text-secondary font-medium">ฟรี</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
                            <span className="font-bold text-lg text-primary">ยอดรวมสุทธิ</span>
                            <span className="text-3xl font-bold text-primary">${totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* ปุ่มยืนยัน (กดแล้วจะไป Trigger form ด้านซ้าย) */}
                    <button 
                        type="submit" 
                        form="checkout-form"
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#234236] transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 mt-8 flex items-center justify-center gap-3 text-sm"
                    >
                        <span>Confirm Order</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;