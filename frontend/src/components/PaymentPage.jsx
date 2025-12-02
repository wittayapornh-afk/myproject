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

  if (!location.state) {
      navigate('/');
      return null;
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // จำลองเวลาประมวลผลธนาคาร 2 วินาที
    setTimeout(async () => {
        try {
            const response = await fetch('http://localhost:8000/api/checkout/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cartItems, customer: customer })
            });
            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: 'ชำระเงินสำเร็จ!',
                    text: `คำสั่งซื้อ #${result.order_id} ได้รับการยืนยันแล้ว`,
                    icon: 'success',
                    confirmButtonText: 'ดูประวัติการสั่งซื้อ',
                    confirmButtonColor: '#305949'
                }).then(() => {
                    clearCart();
                    navigate('/order-history'); // ไปหน้าประวัติ
                });
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
            setIsProcessing(false);
        }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Summary */}
        <div className="w-full md:w-1/3 bg-gray-50 p-8 border-r border-gray-100">
            <h3 className="text-xl font-bold text-primary mb-6">สรุปยอดชำระ</h3>
            <div className="space-y-3 text-sm text-gray-500 mb-8">
                <div className="flex justify-between"><span>สินค้า ({cartItems.length})</span><span>฿{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>ค่าจัดส่ง</span><span>ฟรี</span></div>
                <div className="flex justify-between text-lg font-bold text-primary border-t border-gray-200 pt-3">
                    <span>ยอดรวม</span><span>฿{totalPrice.toLocaleString()}</span>
                </div>
            </div>
            <div className="text-xs text-gray-400">
                <p className="font-bold mb-1">ส่งไปที่:</p>
                <p>{customer.name}</p>
                <p>{customer.address}</p>
                <p>{customer.tel}</p>
            </div>
        </div>

        {/* Right: Payment Method */}
        <div className="flex-1 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary mb-8">เลือกวิธีการชำระเงิน</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={() => setPaymentMethod('qrcode')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'qrcode' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                    <span className="text-3xl">📱</span>
                    <span className="font-bold text-sm">QR PromptPay</span>
                </button>
                <button 
                    onClick={() => setPaymentMethod('credit')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'credit' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                    <span className="text-3xl">💳</span>
                    <span className="font-bold text-sm">บัตรเครดิต</span>
                </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 flex items-center justify-center h-64">
                {paymentMethod === 'qrcode' ? (
                    <div className="text-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR" className="w-40 h-40 mix-blend-multiply opacity-80 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">สแกนเพื่อจ่ายเงิน (จำลอง)</p>
                    </div>
                ) : (
                    <div className="w-full space-y-4">
                        <input type="text" placeholder="หมายเลขบัตร" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-secondary" disabled />
                        <div className="flex gap-4">
                            <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-secondary" disabled />
                            <input type="text" placeholder="CVV" className="w-1/2 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-secondary" disabled />
                        </div>
                        <p className="text-xs text-red-400 text-center">*ระบบจำลอง ไม่ต้องกรอกจริง</p>
                    </div>
                )}
            </div>

            <button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#234236] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? 'กำลังดำเนินการ...' : `ยืนยันการชำระเงิน ฿${totalPrice.toLocaleString()}`}
            </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;