import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // ✅ ต้อง import useAuth
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { CreditCard, MapPin, Truck, CheckCircle } from 'lucide-react';

function CheckoutPage() {
    const { cartItems, getTotalPrice, clearCart } = useCart();
    // 🔴 จุดที่ Error เดิม: const { token } = useAuth();
    // ✅ แก้เป็นบรรทัดนี้ (เพิ่ม user เข้าไป):
    const { token, user } = useAuth(); 
    
    const navigate = useNavigate();

    // State สำหรับเก็บข้อมูลฟอร์ม
    const [formData, setFormData] = useState({
        name: '',
        tel: '',
        email: '',
        address: ''
    });
    
    const [paymentMethod, setPaymentMethod] = useState('Transfer');

    // ✅ ใช้ useEffect เพื่อดึงข้อมูล User มาใส่ฟอร์มอัตโนมัติเมื่อโหลดหน้าเสร็จ
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.username || '',
                tel: user.phone || '',
                email: user.email || '',
                address: user.address || '' // ถ้ามีที่อยู่เก่าก็ดึงมาแสดง
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. เช็คว่า Login หรือยัง
        if (!token) {
            Swal.fire('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'warning');
            navigate('/login');
            return;
        }

        try {
            Swal.showLoading();
            
            // 2. ส่งข้อมูลไป Backend
            const res = await fetch('/api/checkout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}` // ✅ ต้องมีบรรทัดนี้
                },
                body: JSON.stringify({
                    items: cartItems,
                    customer: formData,
                    paymentMethod: paymentMethod,
                    totalPrice: getTotalPrice() // ส่งราคารวมไปด้วย
                })
            });

            const result = await res.json();

            if (res.ok) {
                clearCart();
                await Swal.fire({
                    icon: 'success',
                    title: 'สั่งซื้อสำเร็จ!',
                    text: 'ระบบได้ตัดสต็อกสินค้าเรียบร้อยแล้ว',
                    confirmButtonColor: '#305949'
                });
                navigate('/order-history'); // ไปหน้าประวัติ
            } else {
                throw new Error(result.error || 'สั่งซื้อไม่สำเร็จ');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
        }
    };

    if (cartItems.length === 0) {
        return <div className="p-10 text-center text-gray-500">ไม่มีสินค้าในตะกร้า</div>;
    }

    return (
        <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 md:px-8 font-sans">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* ฝั่งซ้าย: ฟอร์มข้อมูล */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm">
                    <h2 className="text-2xl font-bold text-[#263A33] mb-6 flex items-center gap-2">
                        <MapPin className="text-[#305949]" /> ที่อยู่จัดส่ง
                    </h2>
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">ชื่อผู้รับ</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#305949]/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">เบอร์โทร</label>
                                <input type="tel" name="tel" value={formData.tel} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#305949]/20" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">อีเมล</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#305949]/20" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">ที่อยู่จัดส่ง</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#305949]/20"></textarea>
                        </div>

                        <div className="pt-6">
                            <h3 className="text-lg font-bold text-[#263A33] mb-4 flex items-center gap-2">
                                <CreditCard className="text-[#305949]" /> วิธีชำระเงิน
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'Transfer' ? 'border-[#305949] bg-[#305949]/5' : 'border-gray-100'}`}>
                                    <input type="radio" name="payment" value="Transfer" checked={paymentMethod === 'Transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                    <div className="flex flex-col items-center gap-2">
                                        <Truck size={24} className={paymentMethod === 'Transfer' ? 'text-[#305949]' : 'text-gray-400'} />
                                        <span className={`font-bold ${paymentMethod === 'Transfer' ? 'text-[#305949]' : 'text-gray-500'}`}>โอนเงิน</span>
                                    </div>
                                </label>
                                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#305949] bg-[#305949]/5' : 'border-gray-100'}`}>
                                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle size={24} className={paymentMethod === 'COD' ? 'text-[#305949]' : 'text-gray-400'} />
                                        <span className={`font-bold ${paymentMethod === 'COD' ? 'text-[#305949]' : 'text-gray-500'}`}>เก็บเงินปลายทาง</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ฝั่งขวา: สรุปรายการ */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm">
                        <h2 className="text-2xl font-bold text-[#263A33] mb-6">สรุปคำสั่งซื้อ</h2>
                        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <img src={item.thumbnail} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[#263A33] text-sm line-clamp-1">{item.title}</h4>
                                        <p className="text-xs text-gray-500">จำนวน: {item.quantity} ชิ้น</p>
                                    </div>
                                    <p className="font-bold text-[#305949]">฿{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-gray-500">
                                <span>ยอดรวมสินค้า</span>
                                <span>฿{getTotalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>ค่าจัดส่ง</span>
                                <span>ฟรี</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-[#263A33] pt-2">
                                <span>ยอดสุทธิ</span>
                                <span>฿{getTotalPrice().toLocaleString()}</span>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            form="checkout-form"
                            className="w-full mt-6 py-4 bg-[#305949] text-white font-bold rounded-2xl shadow-lg hover:bg-[#234236] transition-all"
                        >
                            ยืนยันการสั่งซื้อ
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CheckoutPage;