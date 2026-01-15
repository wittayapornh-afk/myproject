import React, { useState, useEffect } from 'react'; // ✅ เพิ่ม useEffect แล้ว
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { token } = useAuth();
  
  const { customerInfo, cartItems } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('qrcode');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cartItems ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

  useEffect(() => {
    if (!location.state || !cartItems) { 
        navigate('/cart'); 
    }
  }, [location.state, cartItems, navigate]);

  useEffect(() => {
    // 🔒 ตรวจสอบ Token ถ้าไม่มีให้เด้งไปหน้า Login
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาเข้าสู่ระบบ',
            text: 'คุณต้องล็อกอินก่อนชำระเงิน',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            navigate('/login', { state: { from: location } });
        });
    }
  }, [token, navigate, location]);

  const handlePayment = async () => {
    if (!token) return; // ป้องกันการกดจ่ายเงินถ้ายังไม่ล็อกอิน

    setIsProcessing(true); // ⏳ เริ่มสถานะกำลังโหลด

    try {
        const response = await fetch('/api/orders/create/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ 
                cart_items: cartItems,
                customer_info: customerInfo
            })
        });

        const result = await response.json();

        // 🟢 ตรวจสอบสถานะ response
        if (response.ok) {
            Swal.fire({ 
                title: 'ชำระเงินสำเร็จ!', 
                text: `Order #${result.order_id} ได้รับการยืนยันแล้ว`, 
                icon: 'success', 
                confirmButtonColor: '#305949' 
            }).then(() => { 
                clearCart(); 
                navigate('/tracking');  // ✅ ไปที่หน้ารออเดอร์ 
            });
        } else { 
            throw new Error(result.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ'); 
        }
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  if (!location.state || !cartItems) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Summary */}
        <div className="w-full md:w-1/3 bg-gray-50 p-8 border-r border-gray-100">
            <h3 className="text-xl font-bold text-[#263A33] mb-6">สรุปยอดชำระ</h3>
            <div className="space-y-3 text-sm text-gray-500 mb-8">
                <div className="flex justify-between"><span>สินค้า ({cartItems.length})</span><span>฿{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>ค่าจัดส่ง</span><span className="text-[#305949]">ฟรี</span></div>
                <div className="flex justify-between text-lg font-bold text-[#263A33] border-t border-gray-200 pt-3"><span>ยอดรวม</span><span>฿{totalPrice.toLocaleString()}</span></div>
            </div>
            <div className="text-xs text-gray-400">
                <p>จัดส่งไปที่:</p>
                <p className="line-clamp-2">{customerInfo?.address}</p>
            </div>
        </div>

        {/* Right: Payment Method */}
        <div className="flex-1 p-8 md:p-12">
            <h2 className="text-2xl font-bold text-[#263A33] mb-8">เลือกวิธีการชำระเงิน</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setPaymentMethod('qrcode')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'qrcode' ? 'border-[#305949] bg-[#305949]/5 text-[#305949]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                    <span className="text-3xl">📱</span><span className="font-bold text-sm">QR PromptPay</span>
                </button>
                <button onClick={() => setPaymentMethod('credit')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'credit' ? 'border-[#305949] bg-[#305949]/5 text-[#305949]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                    <span className="text-3xl">💳</span><span className="font-bold text-sm">บัตรเครดิต</span>
                </button>
            </div>

            {paymentMethod === 'qrcode' && (
                <div className="mb-6 bg-white p-4 rounded-xl border border-dashed border-gray-300 text-center">
                    <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 flex items-center justify-center text-gray-400 text-xs">QR Code</div>
                    <p className="text-sm text-[#305949] font-bold">สแกนเพื่อจ่ายเงิน</p>
                </div>
            )}

            <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-[#305949] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#234236] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessing ? 'กำลังดำเนินการ...' : <><span>🔒</span> ยืนยันการชำระเงิน ฿{totalPrice.toLocaleString()}</>}
            </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;