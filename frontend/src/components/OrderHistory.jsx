import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, ChevronLeft, CalendarDays, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
// ✅ Rule 59: เรียกใช้ Utility ฟังก์ชันเพื่อความเป็นสากล
import { formatPrice, formatDate, getImageUrl } from '../utils/formatUtils';

function OrderHistory() {
    const { token, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = "http://localhost:8000";

    useEffect(() => {
        if (token) {
            axios.get(`${API_BASE_URL}/api/my-orders/`, {
                headers: { Authorization: `Token ${token}` }
            })
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                // ✅ Rule 15: ตรวจสอบ Token หมดอายุ (401)
                if (err.response && err.response.status === 401) {
                    logout();
                }
                console.error("Fetch Orders Error:", err);
                setLoading(false);
            });
        }
    }, [token, logout]);

    /**
     * ✅ Rule 8, 11: แสดง Loading ธีมเขียวที่คุณให้มา
     */
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F2F0E4]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
                    <p className="text-[#1a4d2e] font-black animate-pulse uppercase tracking-widest text-xs">ดึงข้อมูลคำสั่งซื้อ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F9F7] p-4 md:p-10 pt-28 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* ✅ Rule 6: ปุ่มย้อนกลับ */}
                <Link to="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1a4d2e] mb-8 font-bold transition-all group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> ย้อนกลับไปหน้าร้านค้า
                </Link>

                <h1 className="text-4xl font-black text-[#263A33] mb-10 flex items-center gap-4">
                    <div className="p-3 bg-[#1a4d2e] rounded-2xl text-white shadow-lg shadow-green-100">
                        <Package size={28}/>
                    </div>
                    ประวัติการสั่งซื้อ
                </h1>

                {/* ✅ Rule 10, 44: หน้า Empty State กรณีไม่มีออเดอร์ */}
                {orders.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={48} className="text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">ยังไม่มีประวัติการสั่งซื้อ</h2>
                        <p className="text-gray-400 font-bold mb-8">เริ่มต้นช้อปปิ้งเพื่อรับประสบการณ์สุดพิเศษกับเรา</p>
                        <Link to="/shop" className="px-10 py-4 bg-[#1a4d2e] text-white rounded-2xl font-black hover:bg-[#143d24] transition-all shadow-xl hover:shadow-green-100 inline-block transform hover:-translate-y-1">
                            เริ่มช้อปปิ้งเลย
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 group">
                                {/* ส่วนหัวออเดอร์ - ✅ Rule 52: สีสถานะและ Timeline เบื้องต้น */}
                                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-50/30">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-2xl text-[#1a4d2e] tracking-tighter">Order #{order.id}</span>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                order.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                                                order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                                {order.status === 'Pending' && '⏳ รอตรวจสอบ'}
                                                {order.status === 'Paid' && '✅ ชำระแล้ว'}
                                                {order.status === 'Shipped' && '🚚 จัดส่งแล้ว'}
                                                {order.status === 'Cancelled' && '❌ ยกเลิก'}
                                            </span>
                                        </div>
                                        {/* ✅ Rule 58: วันที่ภาษาไทย */}
                                        <p className="text-xs text-gray-400 flex items-center gap-2 font-bold uppercase tracking-wider">
                                            <CalendarDays size={14} className="text-[#1a4d2e] opacity-50"/> 
                                            ทำรายการเมื่อ {formatDate(order.created_at || order.date)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ยอดรวมสุทธิ</p>
                                        <p className="font-black text-3xl text-[#1a4d2e]">{formatPrice(order.total_price)}</p>
                                    </div>
                                </div>

                                {/* รายการสินค้าในออเดอร์ */}
                                <div className="p-6 md:p-8 space-y-6">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-6 items-center p-3 hover:bg-gray-50/50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                            {/* ✅ Rule 31: จัดการรูปภาพผ่าน Utility */}
                                            <div className="relative">
                                                <img 
                                                    src={getImageUrl(item.thumbnail || item.image)} 
                                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-gray-100"
                                                    alt={item.title}
                                                />
                                                <div className="absolute -top-2 -right-2 bg-[#1a4d2e] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 flex flex-col md:flex-row justify-between md:items-center gap-2">
                                                <div>
                                                    <p className="font-black text-gray-800 text-lg leading-tight mb-1">{item.product || item.title}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                                            {item.category || 'สินค้าทั่วไป'}
                                                        </span>
                                                        <span className="text-xs font-black text-[#1a4d2e]">
                                                            {formatPrice(item.price)} / ชิ้น
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="font-black text-gray-700 text-xl">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ส่วนท้ายออเดอร์ (Address & Summary) */}
                                <div className="px-6 md:px-8 pb-8 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Clock size={12}/> สถานะล่าสุด
                                        </p>
                                        <p className="text-sm font-bold text-gray-600">
                                            {order.status === 'Shipped' ? 'สินค้าของท่านถูกจัดส่งเรียบร้อยแล้ว' : 'กำลังดำเนินการเตรียมสินค้า'}
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-green-50/30 rounded-2xl p-5 border border-green-100 flex flex-col justify-center">
                                        <p className="text-[10px] font-black text-[#1a4d2e] uppercase tracking-widest mb-1 opacity-60">การชำระเงิน</p>
                                        <p className="text-sm font-black text-[#1a4d2e]">โอนเงินผ่านธนาคาร (ตรวจสอบแล้ว)</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderHistory;