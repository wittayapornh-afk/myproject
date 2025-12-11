import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function OrderHistory() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!token) return;
    fetch('http://localhost:8000/api/my-orders/', {
        headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => res.json())
    .then(data => { setOrders(data); setLoading(false); })
    .catch(err => setLoading(false));
  }, [token]);

  if (loading) return <div className="py-20 text-center">กำลังโหลด...</div>;
  if (orders.length === 0) return <div className="py-20 text-center text-gray-400">คุณยังไม่มีประวัติการสั่งซื้อ</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#263A33] mb-8">📜 ประวัติการสั่งซื้อ</h1>
        <div className="space-y-6">
            {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                        <div>
                            <span className="font-bold text-[#305949] text-lg">Order #{order.id}</span>
                            <p className="text-xs text-gray-400">{order.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                    {/* Items List */}
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                                <img src={item.thumbnail} className="w-12 h-12 rounded-lg bg-gray-50 object-contain" />
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-gray-800">{item.title}</p>
                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                </div>
                                <p className="font-bold text-sm">฿{item.price.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 text-right">
                        <span className="text-sm text-gray-400 mr-2">ยอดรวมสุทธิ</span>
                        <span className="text-xl font-black text-[#263A33]">฿{order.total_price.toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;