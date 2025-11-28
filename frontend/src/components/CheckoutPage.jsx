import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

function CheckoutPage() {
  const { cartItems, clearCart } = useCart(); // ดึง clearCart มาใช้ด้วย
  const navigate = useNavigate();
  
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
        // 1. ส่งข้อมูลไป Backend
        const response = await fetch('http://localhost:8000/api/checkout/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items: cartItems, // ส่งรายการในตะกร้าไป
                customer: form    // ส่งชื่อที่อยู่ไป (เผื่อเก็บลง DB ในอนาคต)
            })
        });

        const result = await response.json();

        // 2. ถ้ามีปัญหา (เช่น ของหมด) ให้แจ้งเตือน
        if (!response.ok) {
            throw new Error(result.error || "เกิดข้อผิดพลาดในการสั่งซื้อ");
        }

        // 3. ถ้าสำเร็จ
        alert(`🎉 สั่งซื้อสำเร็จ!\nขอบคุณคุณ ${form.name}\nเราได้ตัดสต็อกสินค้าเรียบร้อยแล้ว`);
        clearCart(); // ล้างตะกร้า
        navigate('/'); // กลับหน้าแรก

    } catch (err) {
        alert(`❌ ไม่สามารถสั่งซื้อได้: ${err.message}`);
    }
  };
  if (cartItems.length === 0) return <div className="text-center mt-20">ไม่มีสินค้าในตะกร้า <Link to="/" className="text-primary underline">กลับไปเลือกของ</Link></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">📦 ยืนยันคำสั่งซื้อ</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* ฝั่งซ้าย: ฟอร์มที่อยู่ */}
        <div className="flex-1 bg-card p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-secondary">ที่อยู่จัดส่ง</h3>
            <form onSubmit={handleConfirmOrder} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                    <input required type="text" name="name" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" placeholder="สมชาย ใจดี" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                    <input required type="tel" name="tel" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" placeholder="081-234-5678" />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">ที่อยู่จัดส่ง</label>
                    <textarea required name="address" rows="3" onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" placeholder="บ้านเลขที่, ถนน, แขวง/เขต..."></textarea>
                </div>
                
                <button type="submit" className="w-full bg-secondary hover:bg-green-600 text-white py-3 rounded-xl font-bold shadow-md transition mt-4">
                    ยืนยันการสั่งซื้อ
                </button>
            </form>
        </div>

        {/* ฝั่งขวา: สรุปรายการ */}
        <div className="md:w-80">
            <div className="bg-[#F2F0E4] p-6 rounded-2xl border border-primary/10">
                <h3 className="text-lg font-bold mb-4 text-primary">สรุปรายการสินค้า</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4 scrollbar-thin">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.title} (x{item.quantity})</span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-700">ยอดรวมสุทธิ</span>
                    <span className="text-2xl font-bold text-secondary">${totalPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;