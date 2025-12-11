import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext'; // นำเข้า Auth
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]); // List สำหรับ Super Admin
  const [loading, setLoading] = useState(true);

  // 1. Fetch Stats (Admin & Super Admin)
  useEffect(() => {
    fetch('http://localhost:8000/api/admin-stats/')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  // 2. Fetch Users (Super Admin Only)
  useEffect(() => {
      if (user && user.role_code === 'super_admin') {
          fetch('http://localhost:8000/api/admin/users/', {
              headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
          })
          .then(res => res.json())
          .then(data => setUsersList(data));
      }
  }, [user]);

  const updateStatus = async (orderId, newStatus) => {
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

  // Chart Data
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
        <h1 className="text-3xl font-extrabold text-[#263A33] mb-8 flex items-center gap-3">
            📊 แดชบอร์ด <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{user?.role || 'Admin'} View</span>
        </h1>

        {/* 1. Stat Cards */}
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

        {/* 2. Charts */}
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

        {/* 3. Orders Table (Admin & Super Admin) */}
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

        {/* 4. Users Table (Super Admin Only) */}
        {user?.role_code === 'super_admin' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-indigo-100 overflow-hidden mt-10">
                <div className="p-8 border-b border-indigo-50 bg-indigo-50/30">
                    <h3 className="font-bold text-xl text-indigo-900">👥 รายชื่อผู้ใช้งาน (Super Admin Only)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-indigo-50/50 text-indigo-900 text-sm uppercase">
                            <tr>
                                <th className="p-6">ID</th>
                                <th className="p-6">Username</th>
                                <th className="p-6">Email</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">วันที่สมัคร</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-50">
                            {usersList.map(u => (
                                <tr key={u.id} className="hover:bg-indigo-50/20 transition">
                                    <td className="p-6 text-gray-400">#{u.id}</td>
                                    <td className="p-6 font-bold text-gray-700">{u.username}</td>
                                    <td className="p-6 text-gray-500">{u.email}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            u.role_code === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                            u.role_code === 'admin' ? 'bg-yellow-100 text-yellow-700' :
                                            u.role_code === 'customer' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-gray-400 text-xs">{u.date_joined}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;