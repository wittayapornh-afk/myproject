import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
// นำเข้าไอคอนสำหรับแต่ละ Step และปุ่ม
import { MapPin, CreditCard, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle, Truck, Wallet, FileText } from 'lucide-react';

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ✅ Step State: 1 = ที่อยู่, 2 = ชำระเงิน, 3 = สรุปรายการ
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'credit_card'
  });

  // ✅ ดึงข้อมูล User มาใส่ฟอร์มอัตโนมัติ (Auto-fill)
  useEffect(() => {
    if (user && token) {
        fetch('http://localhost:8000/api/profile/', {
            headers: { 'Authorization': `Token ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setFormData(prev => ({
                ...prev,
                name: data.username || user.username || '',
                email: data.email || '',
                phone: data.phone || '',     // ถ้าในโปรไฟล์มีเบอร์ก็จะใส่ให้
                address: data.address || ''  // ถ้าในโปรไฟล์มีที่อยู่ก็จะใส่ให้
            }));
        })
        .catch(err => console.log("Failed to fetch profile", err));
    }
  }, [user, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ปุ่มถัดไป (ตรวจสอบข้อมูลก่อนไปต่อ)
  const handleNext = () => {
      if (currentStep === 1) {
          if (!formData.name || !formData.phone || !formData.address) {
              Swal.fire('กรุณากรอกข้อมูล', 'ชื่อ, เบอร์โทร และที่อยู่ จำเป็นต้องกรอกให้ครบถ้วน', 'warning');
              return;
          }
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
  };

  const handleBack = () => {
      setCurrentStep(prev => prev - 1);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'กำลังยืนยันคำสั่งซื้อ...',
      didOpen: () => Swal.showLoading()
    });

    // จำลองการส่ง API
    setTimeout(() => {
        Swal.fire({
            icon: 'success',
            title: 'สั่งซื้อสำเร็จ!',
            text: 'ขอบคุณที่ใช้บริการ สินค้าจะจัดส่งถึงคุณเร็วๆ นี้',
            confirmButtonColor: '#305949'
        }).then(() => {
            clearCart();
            navigate('/shop');
        });
    }, 1500);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + shipping;

  // Components สำหรับ Progress Bar ด้านบน
  const StepIndicator = () => (
      <div className="flex justify-center items-center mb-10 text-sm font-bold">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-[#305949]' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'bg-[#305949] text-white border-[#305949]' : 'border-gray-300'}`}>1</div>
              <span>ที่อยู่จัดส่ง</span>
          </div>
          <div className={`w-12 h-1 bg-gray-200 mx-4 rounded-full ${currentStep >= 2 ? 'bg-[#305949]' : ''}`}></div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-[#305949]' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'bg-[#305949] text-white border-[#305949]' : 'border-gray-300'}`}>2</div>
              <span>ชำระเงิน</span>
          </div>
          <div className={`w-12 h-1 bg-gray-200 mx-4 rounded-full ${currentStep >= 3 ? 'bg-[#305949]' : ''}`}></div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-[#305949]' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'bg-[#305949] text-white border-[#305949]' : 'border-gray-300'}`}>3</div>
              <span>ยืนยัน</span>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <StepIndicator />

        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100">
            
            {/* ================= STEP 1: ที่อยู่จัดส่ง ================= */}
            {currentStep === 1 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-black text-[#263A33] mb-6 flex items-center gap-3">
                        <MapPin className="text-[#305949]" size={28} /> ที่อยู่สำหรับจัดส่ง
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">ชื่อผู้รับ</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305949] focus:bg-white outline-none transition" placeholder="ชื่อ-นามสกุล" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305949] focus:bg-white outline-none transition" placeholder="08x-xxx-xxxx" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">อีเมล (สำหรับรับใบเสร็จ)</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305949] focus:bg-white outline-none transition" placeholder="example@mail.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">ที่อยู่จัดส่ง</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows="4" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305949] focus:bg-white outline-none transition" placeholder="บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"></textarea>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= STEP 2: วิธีการชำระเงิน ================= */}
            {currentStep === 2 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-black text-[#263A33] mb-6 flex items-center gap-3">
                        <Wallet className="text-[#305949]" size={28} /> เลือกวิธีการชำระเงิน
                    </h2>
                    <div className="space-y-3">
                        {[
                            { id: 'credit_card', label: 'บัตรเครดิต / เดบิต', icon: <CreditCard size={20} /> },
                            { id: 'bank_transfer', label: 'โอนเงินผ่านธนาคาร (QR Code)', icon: <FileText size={20} /> },
                            { id: 'cod', label: 'เก็บเงินปลายทาง (Cash on Delivery)', icon: <Truck size={20} /> }
                        ].map((method) => (
                            <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method.id ? 'border-[#305949] bg-[#305949]/5' : 'border-gray-100 hover:border-gray-300'}`}>
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value={method.id} 
                                    checked={formData.paymentMethod === method.id} 
                                    onChange={handleChange}
                                    className="w-5 h-5 text-[#305949] focus:ring-[#305949]" 
                                />
                                <div className="flex items-center gap-3 text-[#263A33] font-bold">
                                    {method.icon}
                                    {method.label}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= STEP 3: สรุปและยืนยัน ================= */}
            {currentStep === 3 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-black text-[#263A33] mb-6 flex items-center gap-3">
                        <ShoppingBag className="text-[#305949]" size={28} /> สรุปรายการคำสั่งซื้อ
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-2xl mb-6 text-sm text-gray-600">
                        <p className="mb-1"><strong className="text-[#263A33]">ส่งไปที่:</strong> {formData.name}</p>
                        <p className="mb-1"><strong className="text-[#263A33]">เบอร์โทร:</strong> {formData.phone}</p>
                        <p className="mb-4"><strong className="text-[#263A33]">ที่อยู่:</strong> {formData.address}</p>
                        <div className="border-t border-gray-200 my-3 pt-3"></div>
                        <p className="mb-1 flex items-center gap-2"><strong className="text-[#263A33]">ชำระโดย:</strong> {formData.paymentMethod === 'cod' ? 'เก็บเงินปลายทาง' : formData.paymentMethod === 'credit_card' ? 'บัตรเครดิต' : 'โอนเงิน'}</p>
                    </div>

                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 p-1"><img src={item.thumbnail} className="w-full h-full object-contain" /></div>
                                    <div>
                                        <p className="font-bold text-[#263A33] line-clamp-1">{item.title}</p>
                                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-xl font-black text-[#305949] border-t-2 border-dashed border-gray-200 pt-4">
                        <span>ยอดสุทธิ</span>
                        <span>฿{total.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* ปุ่มควบคุม (Next / Back) */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                {currentStep > 1 ? (
                    <button onClick={handleBack} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition flex items-center gap-2">
                        <ArrowLeft size={20} /> ย้อนกลับ
                    </button>
                ) : <div></div>}

                {currentStep < 3 ? (
                    <button onClick={handleNext} className="px-8 py-3 bg-[#305949] text-white rounded-xl font-bold hover:bg-[#234236] transition shadow-lg hover:-translate-y-1 flex items-center gap-2">
                        ถัดไป <ArrowRight size={20} />
                    </button>
                ) : (
                    <button onClick={handleSubmitOrder} className="px-8 py-3 bg-[#305949] text-white rounded-xl font-bold hover:bg-[#234236] transition shadow-lg hover:-translate-y-1 flex items-center gap-2 animate-bounce-slow">
                        <CheckCircle size={20} /> ยืนยันการสั่งซื้อ
                    </button>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;