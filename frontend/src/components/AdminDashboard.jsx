import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // เช็คก่อนว่าเป็น Admin ไหม (ถ้าไม่ใช่ ดีดออกไปหน้าแรก)
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_superuser) {
        navigate('/');
        return;
    }

    fetch('http://localhost:8000/api/admin/stats/')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div className="text-center py-20">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-[#F2F0E4] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#305949] mb-8">📊 แดชบอร์ดผู้ดูแลระบบ</h1>

        {/* --- 1. สรุปยอดรวม (Stats Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase">ยอดขายรวม</p>
                <p className="text-3xl font-bold text-[#305949] mt-2">฿{stats.total_sales.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase">ออเดอร์ทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_orders}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase">สินค้าในระบบ</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total_products}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase">สินค้าใกล้หมด</p>
                <p className="text-3xl font-bold text-red-500 mt-2">{stats.low_stock_products.length}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* --- 2. ออเดอร์ล่าสุด --- */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">📦 ออเดอร์ล่าสุด</h3>
                <div className="space-y-4">
                    {stats.recent_orders.map(order => (
                        <div key={order.id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0">
                            <div>
                                <p className="font-bold text-gray-700">Order #{order.id} - {order.customer_name}</p>
                                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.status}
                                </span>
                                <p className="text-[#305949] font-bold mt-1">฿{order.total_price.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 3. สินค้าต้องเติมสต็อก --- */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">⚠️ สินค้าต้องเติมสต็อก</h3>
                {stats.low_stock_products.length === 0 ? (
                    <p className="text-green-500 font-bold">✅ สต็อกสินค้าปกติทุกรายการ</p>
                ) : (
                    <ul className="space-y-3">
                        {stats.low_stock_products.map(p => (
                            <li key={p.id} className="flex justify-between items-center bg-red-50 p-3 rounded-xl border border-red-100">
                                <span className="text-gray-700 font-medium">{p.title}</span>
                                <span className="text-red-600 font-bold bg-white px-3 py-1 rounded-lg shadow-sm">เหลือ {p.stock}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;