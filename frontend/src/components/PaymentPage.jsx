import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { customer, cartItems, totalPrice } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('qrcode');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!location.state) { navigate('/'); return null; }

  const handlePayment = async () => {
    setIsProcessing(true);
    const user = JSON.parse(localStorage.getItem('user'));

    setTimeout(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/checkout/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    items: cartItems, customer: customer,
                    user_id: user ? user.id : null
                })
            });
            const result = await response.json();

            if (response.ok) {
                Swal.fire({ title: 'ชำระเงินสำเร็จ!', text: `Order #${result.order_id} Confirmed`, icon: 'success', confirmButtonColor: '#305949' })
                .then(() => { clearCart(); navigate('/order-history'); });
            } else { throw new Error(result.error); }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
            setIsProcessing(false);
        }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 bg-gray-50 p-8 border-r border-gray-100">
            <h3 className="text-xl font-bold text-primary mb-6">สรุปยอดชำระ</h3>
            <div className="space-y-3 text-sm text-gray-500 mb-8">
                <div className="flex justify-between"><span>สินค้า ({cartItems.length})</span><span>฿{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>ค่าจัดส่ง</span><span>ฟรี</span></div>
                <div className="flex justify-between text-lg font-bold text-primary border-t border-gray-200 pt-3"><span>ยอดรวม</span><span>฿{totalPrice.toLocaleString()}</span></div>
            </div>
        </div>
        <div className="flex-1 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-8">เลือกวิธีการชำระเงิน</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setPaymentMethod('qrcode')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'qrcode' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-100 text-gray-400'}`}>
                    <span className="text-3xl">📱</span><span className="font-bold text-sm">QR PromptPay</span>
                </button>
                <button onClick={() => setPaymentMethod('credit')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'credit' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-100 text-gray-400'}`}>
                    <span className="text-3xl">💳</span><span className="font-bold text-sm">บัตรเครดิต</span>
                </button>
            </div>
            <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#234236] transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {isProcessing ? 'กำลังดำเนินการ...' : `ยืนยันการชำระเงิน ฿${totalPrice.toLocaleString()}`}
            </button>
        </div>
      </div>
    </div>
  );
}
export default PaymentPage;