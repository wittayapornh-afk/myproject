import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getImageUrl } from '../utils/formatUtils';
// ✅ รวมไอคอนทุกตัวที่ต้องใช้ไว้ที่นี่ที่เดียว ห้าม import ซ้ำด้านล่างอีก
import { 
    Package, 
    Calendar, 
    CalendarDays, 
    Clock, 
    ChevronRight, 
    ShoppingBag, 
    ChevronLeft,
    AlertCircle
} from 'lucide-react';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            // 🚩 ตรวจสอบ Token ก่อนเรียก API
            if (!token) {
                console.log("Waiting for token...");
                return;
            }

            try {
                const response = await axios.get('http://localhost:8000/api/orders/', {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                setOrders(response.data);
            } catch (error) {
                console.error("Fetch Orders Error:", error.response?.data || error.message);
                // ถ้า 401 Unauthorized อาจเป็นเพราะ Token หมดอายุ
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 md:px-8 pt-28 font-sans">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate('/')} 
                    className="flex items-center gap-2 text-gray-500 hover:text-[#1a4d2e] transition-colors mb-8 font-bold"
                >
                    <ChevronLeft size={20} /> กลับสู่หน้าหลัก
                </button>

                <h1 className="text-3xl font-black text-[#263A33] mb-8 flex items-center gap-3">
                    <ShoppingBag className="text-[#1a4d2e]" /> ประวัติการสั่งซื้อ
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2.5rem] text-center shadow-sm border border-gray-100">
                        <Package size={64} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">ยังไม่มีรายการสั่งซื้อ</h3>
                        <button 
                            onClick={() => navigate('/shop')} 
                            className="mt-6 bg-[#1a4d2e] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#263A33] transition-all"
                        >
                            เริ่มช้อปปิ้งเลย
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                        <p className="font-bold text-[#1a4d2e]">#{order.id}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">วันที่สั่งซื้อ</p>
                                            <div className="flex items-center gap-1 text-gray-700 font-bold text-sm">
                                                <CalendarDays size={14} className="text-gray-400" /> {order.date}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สถานะ</p>
                                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                                                order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-50 pt-6 space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={getImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-800 truncate">{item.title}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold">จำนวน: {item.quantity} x {formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-500">ยอดสุทธิ</p>
                                    <p className="text-xl font-black text-[#1a4d2e]">{formatPrice(order.total_price)}</p>
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