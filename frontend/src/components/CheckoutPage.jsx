import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MapPin, Truck, CreditCard, Smartphone, ChevronLeft, ArrowRight, ShieldCheck, Mail, Phone, User } from 'lucide-react';
// ✅ Rule 59: เรียกใช้ Utility สำหรับราคาและรูปภาพ
import { formatPrice, getImageUrl } from '../utils/formatUtils';

function CheckoutPage() {
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', tel: '', email: '', address: '' });
    const [paymentMethod, setPaymentMethod] = useState('Transfer');
    const [loading, setLoading] = useState(false);

    // ✅ Rule 45: ดึงข้อมูลอัตโนมัติจาก Profile (Auto-fill)
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.username || '',
                tel: user.phone || '',
                email: user.email || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // ✅ เตรียมข้อมูล Payload ให้ตรงกับที่ Backend (views.py) รอรับ
        const payload = {
            items: cartItems.map(item => ({
                id: item.id,       // ตรวจสอบว่าใน cartItems เก็บเป็น id
                quantity: item.quantity
            })),
            customer: {
                name: formData.name,
                tel: formData.tel,
                email: formData.email,
                address: formData.address
            },
            paymentMethod: paymentMethod
        };

        const response = await fetch('http://localhost:8000/api/login/', { // ตรวจสอบ URL ตรงนี้
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
});
        

        if (response.ok) {
            const data = await response.json();
            clearCart();
            await Swal.fire({ 
                icon: 'success', 
                title: 'สั่งซื้อสำเร็จ', 
                text: data.message, 
                confirmButtonColor: '#1a4d2e' 
            });
            navigate('/order-history');
        } else {
            const errorData = await response.json();
            // แจ้ง Error จาก Backend ให้ผู้ใช้ทราบ
            throw new Error(errorData.error || 'การสั่งซื้อล้มเหลว');
        }
    } catch (error) {
        console.error("Checkout Error:", error);
        Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
    } finally {
        setLoading(false);
    }
};
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F9F9F7]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="text-gray-300" size={40} />
                </div>
                <h2 className="text-xl font-black text-gray-800">ไม่มีสินค้าที่ต้องชำระเงิน</h2>
                <button onClick={() => navigate('/shop')} className="mt-4 text-[#1a4d2e] font-bold underline">กลับไปช้อปปิ้ง</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 md:px-8 pt-28 font-sans">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-400 font-bold mb-8 hover:text-[#1a4d2e] transition-all group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> กลับไปแก้ไขตะกร้าสินค้า
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* ฝั่งซ้าย: ฟอร์มข้อมูล (3 ส่วนจาก 5) */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-[#263A33] mb-8 flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-[#1a4d2e] rounded-xl"><MapPin size={24} /></div>
                                ข้อมูลจัดส่งสินค้า
                            </h2>
                            
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ชื่อผู้รับสินค้า</label>
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:border-[#1a4d2e] transition-all">
                                        <User size={18} className="text-gray-400"/>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm font-bold text-gray-700" placeholder="ระบุชื่อ-นามสกุล" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์ติดต่อ</label>
                                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:border-[#1a4d2e] transition-all">
                                            <Phone size={18} className="text-gray-400"/>
                                            <input type="tel" name="tel" value={formData.tel} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm font-bold text-gray-700" placeholder="08XXXXXXXX" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">อีเมล</label>
                                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:border-[#1a4d2e] transition-all">
                                            <Mail size={18} className="text-gray-400"/>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm font-bold text-gray-700" placeholder="example@mail.com" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ที่อยู่สำหรับการจัดส่ง</label>
                                    <div className="flex gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 focus-within:border-[#1a4d2e] transition-all">
                                        <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0"/>
                                        <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 resize-none" placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด..."></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* ✅ Rule 47: วิธีชำระเงินแบบ Card Selection */}
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-[#263A33] mb-8 flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-[#1a4d2e] rounded-xl"><CreditCard size={24} /></div>
                                วิธีชำระเงิน
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`group relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'Transfer' ? 'border-[#1a4d2e] bg-green-50/50 shadow-lg shadow-green-100' : 'border-gray-50 hover:border-gray-200'}`}>
                                    <input type="radio" name="payment" value="Transfer" checked={paymentMethod === 'Transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl transition-colors ${paymentMethod === 'Transfer' ? 'bg-[#1a4d2e] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm ${paymentMethod === 'Transfer' ? 'text-[#1a4d2e]' : 'text-gray-600'}`}>โอนเงินธนาคาร</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ยืนยันยอดภายใน 24 ชม.</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`group relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'qr' ? 'border-[#1a4d2e] bg-green-50/50 shadow-lg shadow-green-100' : 'border-gray-50 hover:border-gray-200'}`}>
                                    <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl transition-colors ${paymentMethod === 'qr' ? 'bg-[#1a4d2e] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Smartphone size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm ${paymentMethod === 'qr' ? 'text-[#1a4d2e]' : 'text-gray-600'}`}>สแกน QR Code</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ชำระทันทีผ่านแอป</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ฝั่งขวา: สรุปรายการ (2 ส่วนจาก 5) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#1a4d2e] p-8 md:p-10 rounded-[3rem] text-white shadow-2xl sticky top-28">
                            <h2 className="text-2xl font-black mb-8 border-b border-white/10 pb-4">สรุปคำสั่งซื้อ</h2>
                            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center group">
                                        {/* ✅ Rule 31: รูปภาพสินค้า */}
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white/10 p-1">
                                            <img src={getImageUrl(item.thumbnail || item.image)} alt={item.title} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{item.title}</h4>
                                            <p className="text-[10px] text-white/50 font-black">จำนวน: {item.quantity} x {formatPrice(item.price)}</p>
                                        </div>
                                        <p className="font-black text-sm">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between text-sm font-bold text-white/60 uppercase tracking-widest">
                                    <span>ยอดรวมสินค้า</span>
                                    <span>{formatPrice(getTotalPrice())}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-white/60 uppercase tracking-widest">
                                    <span>ค่าจัดส่ง</span>
                                    <span className="text-green-400">FREE</span>
                                </div>
                                <div className="pt-4 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Grand Total</p>
                                        <span className="text-3xl font-black">ยอดสุทธิ</span>
                                    </div>
                                    <span className="text-4xl font-black">{formatPrice(getTotalPrice())}</span>
                                </div>
                                {/* ✅ Rule 50: หมายเหตุภาษี */}
                                <p className="text-[9px] text-center text-white/30 font-bold uppercase tracking-widest pt-2">
                                    * ราคานี้รวมภาษีมูลค่าเพิ่ม 7% แล้ว
                                </p>
                            </div>

                            {/* ✅ Rule 13: ปุ่มสถานะการทำงาน */}
                            <button 
                                type="submit" 
                                form="checkout-form" 
                                disabled={loading} 
                                className={`w-full mt-10 py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 transform active:scale-95 ${loading ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-[#1a4d2e] hover:shadow-green-900/20 hover:-translate-y-1'}`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        ยืนยันการสั่งซื้อ <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                <ShieldCheck size={14} /> 100% Secure & Encrypted Payment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;