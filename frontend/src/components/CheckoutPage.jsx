// frontend/src/components/CheckoutPage.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // ✅ 1. ใช้ SweetAlert แทน Modal เดิม

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  // const [showModal, setShowModal] = useState(false); ❌ ลบอันนี้ออกได้เลย ไม่ได้ใช้แล้ว
  
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

        // ✅ 2. แสดงแจ้งเตือนสำเร็จสวยๆ
        Swal.fire({
            title: 'สั่งซื้อเรียบร้อย!',
            text: `ขอบคุณคุณ ${form.name} เราได้รับคำสั่งซื้อแล้ว และจะจัดส่งให้โดยเร็วที่สุด 🚚`,
            icon: 'success',
            confirmButtonText: 'กลับไปหน้าแรก',
            confirmButtonColor: '#305949',
            padding: '2em',
            backdrop: `rgba(0,0,0,0.4)`
        }).then(() => {
            clearCart();
            navigate('/');
        });

    } catch (err) {
        // ❌ 3. แจ้งเตือน Error
        Swal.fire({
            title: 'สั่งซื้อไม่สำเร็จ',
            text: err.message,
            icon: 'error',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#d33'
        });
    }
  };

  if (cartItems.length === 0) return (
    <div className="h-[70vh] flex flex-col items-center justify-center bg-background text-center px-4">
        <span className="text-6xl opacity-30 mb-4 grayscale">🛍️</span>
        <h2 className="text-2xl font-bold text-gray-400 mb-2">ไม่มีสินค้าในตะกร้า</h2>
        <Link to="/" className="text-primary font-bold hover:underline">กลับไปเลือกซื้อสินค้า</Link>
    </div>
  );

  const styles = {
    label: "block text-sm font-bold text-gray-600 mb-2 ml-1",
    input: "w-full bg-white text-gray-800 font-medium px-6 py-4 rounded-2xl outline-none border border-gray-300 focus:border-[#305949] focus:ring-2 focus:ring-[#305949]/20 transition-all placeholder-gray-400 shadow-sm"
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      
      {/* ❌ ลบ SuccessModal เดิมออก */}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
            <Link to="/cart" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-md transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">ยืนยันการสั่งซื้อ</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-soft border border-white">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-primary">ที่อยู่จัดส่ง</h2>
                    </div>

                    <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={styles.label}>ชื่อ-นามสกุล</label>
                                <input required type="text" name="name" onChange={handleChange} className={styles.input} placeholder="เช่น สมชาย ใจดี" />
                            </div>
                            <div>
                                <label className={styles.label}>เบอร์โทรศัพท์</label>
                                <input required type="tel" name="tel" onChange={handleChange} className={styles.input} placeholder="081-234-5678" />
                            </div>
                        </div>
                        <div>
                            <label className={styles.label}>ที่อยู่จัดส่ง</label>
                            <textarea required name="address" rows="3" onChange={handleChange} className={`${styles.input} resize-none`} placeholder="บ้านเลขที่, ถนน, แขวง/เขต, จังหวัด..."></textarea>
                        </div>
                    </form>
                </div>
            </div>

            <div className="lg:w-[400px]">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-white sticky top-24">
                    <h3 className="text-xl font-bold text-primary mb-6 flex justify-between items-center">
                        สรุปรายการ <span className="text-sm font-normal text-white bg-secondary px-3 py-1 rounded-full">{cartItems.length} ชิ้น</span>
                    </h3>
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
                        <div className="flex justify-between text-sm text-gray-500"><span>ยอดรวมสินค้าย่อย</span><span>฿{totalPrice.toLocaleString()}</span></div>
                        <div className="flex justify-between text-sm text-gray-500"><span>ค่าจัดส่ง</span><span className="text-secondary font-medium">ฟรี</span></div>
                        <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
                            <span className="font-bold text-lg text-primary">ยอดรวมสุทธิ</span>
                            <span className="text-3xl font-bold text-primary">฿{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                    <button type="submit" form="checkout-form" className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#234236] transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 mt-8 flex items-center justify-center gap-3">
                        <span>ยืนยันการสั่งซื้อ</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;