import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom'; // ✅ เพิ่ม Link
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [logs, setLogs] = useState([]); // ✅ 1. เพิ่ม State สำหรับ Logs
  const [loading, setLoading] = useState(true);

  // 1. Fetch Stats
  useEffect(() => {
    fetch('http://localhost:8000/api/admin-stats/')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  // 2. Fetch Users & Logs (Super Admin Only)
  useEffect(() => {
      const token = localStorage.getItem('token');
      if (user && (user.role_code === 'super_admin' || user.role_code === 'admin')) { // ให้ Admin เห็น Users ได้บ้าง หรือจะจำกัดแค่ Super Admin ก็ได้
          // ... (Fetch Users code if needed) ...
      }

      if (user && user.role_code === 'super_admin') {
          // Fetch Users
          fetch('http://localhost:8000/api/admin/users/', {
              headers: { 'Authorization': `Token ${token}` }
          })
          .then(res => res.json())
          .then(data => setUsersList(data));

          // ✅ 2. Fetch Logs
          fetch('http://localhost:8000/api/admin-logs/', {
              headers: { 'Authorization': `Token ${token}` }
          })
          .then(res => res.json())
          .then(data => setLogs(data));
      }
  }, [user]);

  const updateStatus = async (orderId, newStatus) => {
    // ... (Code เดิม) ...
    try {
        await fetch(`http://localhost:8000/api/orders/${orderId}/update/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        window.location.reload(); 
    } catch (err) {
        alert('Update failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">กำลังโหลดข้อมูล...</div>;
  if (!stats) return <div className="text-center py-20 text-red-500">Error Loading Data</div>;

  // ... (Chart Data เดิม) ...
  const salesChartData = {
    labels: stats.graph_sales?.map(d => d.name) || [],
    datasets: [{
      label: 'ยอดขาย',
      data: stats.graph_sales?.map(d => d.total) || [],
      borderColor: '#305949',
      backgroundColor: 'rgba(48, 89, 73, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const categoryChartData = {
    labels: stats.graph_category?.map(d => d.name) || [],
    datasets: [{
      data: stats.graph_category?.map(d => d.value) || [],
      backgroundColor: ['#305949', '#Eab308', '#EF4444', '#3B82F6', '#9CA3AF'],
      borderWidth: 0
    }]
  };

  return (
    <div className="min-h-screen bg-[#F2F0E4] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-[#263A33] flex items-center gap-3">
                📊 แดชบอร์ด <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{user?.role || 'Admin'} View</span>
            </h1>
            {/* ✅ 3. ปุ่มเพิ่มสินค้า */}
            <Link to="/product/add" className="bg-[#305949] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#234236] transition flex items-center gap-2">
                + เพิ่มสินค้าใหม่
            </Link>
        </div>

        {/* ... (Stat Cards เดิม) ... */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">ยอดขายรวม</p>
                <h3 className="text-3xl font-black text-[#305949]">฿{stats.total_sales?.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">ออเดอร์</p>
                <h3 className="text-3xl font-black text-[#263A33]">{stats.total_orders}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">สินค้า</p>
                <h3 className="text-3xl font-black text-[#263A33]">{stats.total_products}</h3>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">ผู้ใช้งาน</p>
                <h3 className="text-3xl font-black text-blue-600">{stats.total_users || 0}</h3>
            </div>
        </div>

        {/* ... (Charts เดิม) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl text-[#263A33] mb-6">📈 ยอดขาย 7 วันล่าสุด</h3>
                <div className="h-64"><Line data={salesChartData} options={{maintainAspectRatio: false, plugins: {legend: {display: false}}}} /></div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl text-[#263A33] mb-6 text-center">🏆 หมวดหมู่ยอดฮิต</h3>
                <div className="h-64 flex justify-center"><Doughnut data={categoryChartData} options={{maintainAspectRatio: false}} /></div>
            </div>
        </div>

        {/* ... (Orders Table เดิม) ... */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-bold text-xl text-[#263A33]">🛒 จัดการออเดอร์</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100/50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="p-6">Order ID</th>
                            <th className="p-6">ลูกค้า</th>
                            <th className="p-6">ยอดรวม</th>
                            <th className="p-6">สถานะ</th>
                            <th className="p-6">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {stats.recent_orders?.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="p-6 font-bold text-[#305949]">#{order.id}</td>
                                <td className="p-6">{order.customer_name}</td>
                                <td className="p-6 font-bold">฿{order.total_price.toLocaleString()}</td>
                                <td className="p-6"><span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{order.status}</span></td>
                                <td className="p-6">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-3 py-2 cursor-pointer hover:border-[#305949]"
                                    >
                                        <option value="Pending">รอโอน</option>
                                        <option value="Paid">จ่ายแล้ว</option>
                                        <option value="Shipped">ส่งแล้ว</option>
                                        <option value="Completed">สำเร็จ</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* ✅ 4. Admin Logs Table (เฉพาะ Super Admin) */}
        {user?.role_code === 'super_admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* ตาราง Users */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-indigo-100 overflow-hidden">
                    <div className="p-8 border-b border-indigo-50 bg-indigo-50/30">
                        <h3 className="font-bold text-xl text-indigo-900">👥 รายชื่อผู้ใช้งาน</h3>
                    </div>
                    <div className="overflow-x-auto h-96 scrollbar-thin">
                        <table className="w-full text-left">
                            <thead className="bg-indigo-50/50 text-indigo-900 text-sm uppercase sticky top-0 bg-white">
                                <tr>
                                    <th className="p-6">User</th>
                                    <th className="p-6">Role</th>
                                    <th className="p-6">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50">
                                {usersList.map(u => (
                                    <tr key={u.id} className="hover:bg-indigo-50/20 transition">
                                        <td className="p-6 font-bold text-gray-700">{u.username}</td>
                                        <td className="p-6"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{u.role}</span></td>
                                        <td className="p-6 text-gray-400 text-xs">{u.date_joined}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ตาราง Audit Logs */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100 overflow-hidden">
                    <div className="p-8 border-b border-orange-50 bg-orange-50/30">
                        <h3 className="font-bold text-xl text-orange-900">📜 ประวัติการทำงาน (Audit Logs)</h3>
                    </div>
                    <div className="overflow-x-auto h-96 scrollbar-thin">
                        <table className="w-full text-left">
                            <thead className="bg-orange-50/50 text-orange-900 text-sm uppercase sticky top-0 bg-white">
                                <tr>
                                    <th className="p-6">Admin</th>
                                    <th className="p-6">Action</th>
                                    <th className="p-6">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-50">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-orange-50/20 transition">
                                        <td className="p-6 font-bold text-gray-700">
                                            {log.admin} <br/>
                                            <span className="text-[10px] text-gray-400 font-normal">{log.role}</span>
                                        </td>
                                        <td className="p-6 text-sm text-gray-600">{log.action}</td>
                                        <td className="p-6 text-gray-400 text-xs">{log.date}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr><td colSpan="3" className="p-6 text-center text-gray-400">ยังไม่มีประวัติการทำงาน</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;