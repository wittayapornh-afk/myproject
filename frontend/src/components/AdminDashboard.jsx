import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid 
} from 'recharts';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.is_superuser) {
        navigate('/');
        return;
    }

    fetch('http://localhost:8000/api/admin/stats/')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, [navigate]);

  if (!stats) return <div className="text-center py-20 text-gray-400">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-[#F2F0E4] py-10 px-6 min-w-0">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#305949] mb-8">📊 แดชบอร์ดผู้ดูแลระบบ</h1>

        {/* --- 1. สรุปยอดรวม --- */}
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

        {/* --- 2. กราฟแสดงผล (ใช้เทคนิค Absolute Position เพื่อแก้บั๊ก 100%) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 min-w-0">
            {/* กราฟยอดขาย 7 วัน */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col min-w-0">
                <h3 className="text-xl font-bold text-gray-800 mb-6">📈 แนวโน้มยอดขาย (7 วันล่าสุด)</h3>
                
                {stats.graph_sales && stats.graph_sales.length > 0 ? (
                    // ✅ FIX: สร้างกล่อง relative และเอา chart ใส่ absolute inset-0
                    // วิธีนี้จะตัดปัญหาเรื่อง Grid บีบกราฟจน width เป็น -1 ทันที
                    <div className="w-full h-[300px] relative">
                        <div className="absolute inset-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.graph_sales}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#305949" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#305949" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value}`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="total" stroke="#305949" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        ไม่มีข้อมูลยอดขาย
                    </div>
                )}
            </div>

            {/* กราฟสินค้าขายดีตามหมวด */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm flex flex-col min-w-0">
                <h3 className="text-xl font-bold text-gray-800 mb-6">🏆 หมวดหมู่ขายดี</h3>
                
                {stats.graph_category && stats.graph_category.length > 0 ? (
                    // ✅ FIX: ใช้เทคนิคเดียวกันกับกราฟแรก
                    <div className="w-full h-[300px] relative">
                        <div className="absolute inset-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.graph_category} layout="vertical" margin={{ left: 0, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={80} 
                                        stroke="#888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                    />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" fill="#749B6B" radius={[0, 6, 6, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        ไม่มีข้อมูลหมวดหมู่
                    </div>
                )}
            </div>
        </div>

        {/* --- 3. ตารางข้อมูล (ออเดอร์ & สต็อก) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">📦 ออเดอร์ล่าสุด</h3>
                <div className="space-y-4">
                    {stats.recent_orders.length === 0 ? <p className="text-gray-400 text-center">ไม่มีรายการสั่งซื้อ</p> : stats.recent_orders.map(order => (
                        <div key={order.id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition">
                            <div>
                                <p className="font-bold text-gray-700">Order #{order.id} - {order.customer_name}</p>
                                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.status}
                                </span>
                                <p className="text-[#305949] font-bold mt-1">฿{order.total_price.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">⚠️ สินค้าต้องเติมสต็อก</h3>
                {stats.low_stock_products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-green-600 bg-green-50 rounded-2xl">
                        <span className="text-4xl mb-2">✅</span>
                        <p className="font-bold">สต็อกสินค้าปกติทุกรายการ</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {stats.low_stock_products.map(p => (
                            <li key={p.id} className="flex justify-between items-center bg-red-50 p-4 rounded-xl border border-red-100 hover:shadow-sm transition">
                                <span className="text-gray-700 font-medium">{p.title}</span>
                                <span className="text-red-600 font-bold bg-white px-3 py-1 rounded-lg shadow-sm text-sm">เหลือ {p.stock}</span>
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