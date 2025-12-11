import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function CheckoutPage() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', tel: '', address: ''
  });

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToPayment = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return Swal.fire('ตะกร้าว่างเปล่า', '', 'warning');
    
    // ส่งข้อมูลลูกค้าและตะกร้าไปยังหน้า Payment
    navigate('/payment', { state: { customerInfo: formData, cartItems } });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-[#263A33] mb-8 text-center">🚚 ที่อยู่จัดส่ง</h1>
        
        <form onSubmit={goToPayment} className="space-y-6 max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="ชื่อ-นามสกุล" required className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#305949]/20" onChange={handleChange} />
                <input type="tel" name="tel" placeholder="เบอร์โทรศัพท์" required className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#305949]/20" onChange={handleChange} />
            </div>
            <input type="email" name="email" placeholder="อีเมล" required className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#305949]/20" onChange={handleChange} />
            <textarea name="address" placeholder="ที่อยู่จัดส่ง (บ้านเลขที่, ถนน, แขวง/เขต, จังหวัด, รหัสไปรษณีย์)" required rows="4" className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#305949]/20" onChange={handleChange}></textarea>
            
            <button type="submit" className="w-full py-4 bg-[#305949] text-white font-bold rounded-full shadow-lg hover:bg-[#234236] transition hover:-translate-y-1">
                ไปหน้าชำระเงิน (฿{totalPrice.toLocaleString()}) →
            </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;