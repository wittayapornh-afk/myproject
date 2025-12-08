<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6

function OrderHistory() {
  const [tel, setTel] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const user = JSON.parse(localStorage.getItem('user')); // ✅ ดึง User

  // ✅ Auto Fetch ถ้าล็อกอินอยู่
  useEffect(() => {
    if (user) {
        fetchOrders(`user_id=${user.id}`);
    }
  }, []);

  const fetchOrders = async (queryParam) => {
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:8000/api/orders/?${queryParam}`);
=======

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:8000/api/orders/?tel=${tel}`);
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
        const data = await res.json();
        setOrders(data.orders || []);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(`tel=${tel}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F0E4] py-16 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#305949] mb-8 text-center">
                {user ? `ประวัติการสั่งซื้อของคุณ ${user.first_name || user.username}` : "ติดตามสถานะคำสั่งซื้อ 📦"}
            </h1>
            
            {/* ✅ ซ่อนช่องค้นหา ถ้าล็อกอินอยู่ (หรือจะโชว์ไว้ก็ได้ถ้าอยากให้ค้นเบอร์อื่นได้) */}
            {!user && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm mb-10 max-w-lg mx-auto">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <input 
                            type="tel" 
                            placeholder="กรอกเบอร์โทรศัพท์..." 
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            className="flex-1 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#305949]/20"
                            required
                        />
                        <button type="submit" className="bg-[#305949] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#234236] transition">
                            ค้นหา
                        </button>
                    </form>
                </div>
            )}

            {/* Results */}
            {loading && <div className="text-center text-gray-400">กำลังโหลดข้อมูล...</div>}
=======
  return (
    <div className="min-h-screen bg-[#F2F0E4] py-16 px-6">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#305949] mb-8 text-center">ติดตามสถานะคำสั่งซื้อ 📦</h1>
            
            {/* Search Box */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm mb-10 max-w-lg mx-auto">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input 
                        type="tel" 
                        placeholder="กรอกเบอร์โทรศัพท์ของคุณ..." 
                        value={tel}
                        onChange={(e) => setTel(e.target.value)}
                        className="flex-1 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#305949]/20"
                        required
                    />
                    <button type="submit" className="bg-[#305949] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#234236] transition">
                        ค้นหา
                    </button>
                </form>
            </div>

            {/* Results */}
            {loading && <div className="text-center text-gray-400">กำลังค้นหา...</div>}
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
            
            {orders && (
                <div className="space-y-6">
                    {orders.length === 0 ? (
<<<<<<< HEAD
                        <div className="text-center text-gray-400 py-10">
                            {user ? "คุณยังไม่มีประวัติการสั่งซื้อ" : "ไม่พบข้อมูลของเบอร์นี้"}
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition">
                                {/* ... (โค้ดแสดงรายการ Order เหมือนเดิม) ... */}
=======
                        <div className="text-center text-gray-400">ไม่พบประวัติการสั่งซื้อของเบอร์นี้</div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition">
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
                                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Order #{order.id}</h3>
                                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                        <p className="font-bold text-[#305949] mt-1">฿{order.total_price.toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center p-1 border border-gray-100">
                                                <img src={item.thumbnail || "https://placehold.co/100"} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex-1 text-sm">
                                                <p className="font-bold text-gray-700">{item.product_title}</p>
                                                <p className="text-xs text-gray-400">x{item.quantity}</p>
                                            </div>
                                            <div className="text-sm font-bold text-gray-600">฿{item.price.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    </div>
  );
}

export default OrderHistory;