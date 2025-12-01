import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import SuccessModal from './SuccessModal'; // นำเข้า Modal

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State ควบคุม Modal
  
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const [form, setForm] = useState({ name: '', address: '', tel: '' });

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

        if (!response.ok) throw new Error(result.error || "เกิดข้อผิดพลาด");

        // สำเร็จ: แสดง Modal แทน alert
        setShowModal(true);
        // หมายเหตุ: การล้างตะกร้า (clearCart) จะทำตอนกดปิด Modal หรือกดตกลงใน Modal ก็ได้
        
    } catch (err) {
        alert(`❌ ไม่สามารถสั่งซื้อได้: ${err.message}`);
    }
  };

  const handleCloseModal = () => {
      setShowModal(false);
      clearCart();     // ล้างตะกร้าเมื่อกดตกลง
      navigate('/');   // กลับหน้าแรก
  };

  if (cartItems.length === 0) return <div className="text-center mt-20 text-gray-500">ไม่มีสินค้าในตะกร้า <Link to="/" className="text-primary font-bold hover:underline">กลับไปเลือกของ</Link></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* เรียกใช้ Modal */}
      <SuccessModal 
        isOpen={showModal}
        onClose={handleCloseModal} // เมื่อกดปิด ให้ทำงานฟังก์ชันนี้
        title="สั่งซื้อสำเร็จ!"
        message={`ขอบคุณคุณ ${form.name} เราได้รับคำสั่งซื้อของคุณแล้ว และได้ทำการตัดสต็อกเรียบร้อย`}
        // กรณีนี้เราไม่ใช้ linkTo เพราะเราอยากให้มันรันฟังก์ชัน handleCloseModal เพื่อ clearCart ก่อน
      />
      <div className="inline-flex items-center gap-2 mb-8">
            <Link to="/cart" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-primary hover:border-primary transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-3xl font-bold text-secondary">ยืนยันคำสั่งซื้อ</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ฝั่งซ้าย: ฟอร์ม */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <span className="bg-primary/10 text-primary p-2 rounded-lg">📍</span>
                <h3 className="text-xl font-bold text-gray-800">ที่อยู่จัดส่ง</h3>
            </div>
            
            <form onSubmit={handleConfirmOrder} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">ชื่อ-นามสกุล</label>
                        <input required type="text" name="name" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" placeholder="เช่น สมชาย ใจดี" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">เบอร์โทรศัพท์</label>
                        <input required type="tel" name="tel" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" placeholder="เช่น 081-234-5678" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">ที่อยู่จัดส่ง</label>
                    <textarea required name="address" rows="3" onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" placeholder="บ้านเลขที่, ถนน, แขวง/เขต..."></textarea>
                </div>
                
                <button type="submit" className="w-full bg-secondary hover:bg-gray-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-gray-300/50 transition transform active:scale-95 mt-4 flex justify-center items-center gap-2">
                    <span>ยืนยันและชำระเงิน</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </form>
        </div>

        {/* ฝั่งขวา: สรุป */}
        <div className="lg:w-96">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex justify-between items-center">
                    <span>สรุปรายการ</span>
                    <span className="text-sm font-normal text-gray-500">{cartItems.length} รายการ</span>
                </h3>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6 scrollbar-thin">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                                <p className="text-xs text-gray-500">จำนวน: {item.quantity}</p>
                            </div>
                            <div className="font-bold text-gray-700 text-sm">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>ค่าสินค้า</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>ค่าจัดส่ง</span>
                        <span className="text-green-600 font-medium">ฟรี</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                        <span className="font-bold text-gray-800">ยอดรวมสุทธิ</span>
                        <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;