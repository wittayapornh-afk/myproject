import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Clock } from 'lucide-react';

function OrderHistory() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (token) {
            axios.get('/api/my-orders/', {
                headers: { Authorization: `Token ${token}` }
            }).then(res => setOrders(res.data));
        }
    }, [token]);

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150";
        if (path.startsWith("http")) return path;
        return `${path}`;
    };

    return (
        <div className="min-h-screen bg-[#F9F9F7] p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#263A33] mb-6 flex items-center gap-2">
                    <Package /> ประวัติการสั่งซื้อ
                </h1>
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between mb-4 border-b pb-2">
                                <div>
                                    <span className="font-bold text-lg">Order #{order.id}</span>
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {order.date}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Shipped' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <img src={getImageUrl(item.thumbnail)} className="w-12 h-12 rounded object-cover border"/>
                                        <div className="flex-1 flex justify-between text-sm text-gray-600">
                                            <span>{item.title} x {item.quantity}</span>
                                            <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-2 border-t flex justify-between font-bold text-[#305949]">
                                <span>ยอดรวม</span>
                                <span>฿{order.total_price.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default OrderHistory;