import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ต้องมั่นใจว่า path ถูก
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  // State สำหรับจัดการ Tab และ Data
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, users, logs
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [logs, setLogs] = useState([]);

  // ตั้งค่า Axios instance เพื่อความสะดวก
  const api = axios.create({
      baseURL: 'http://localhost:8000/api', // ต้องตรงกับ Port Backend
      headers: { Authorization: `Token ${token}` }
  });

  // ฟังก์ชันโหลดข้อมูลตาม Tab ที่เลือก
  const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
          if (activeTab === 'overview') {
              const res = await api.get('/admin-stats/');
              setStats(res.data);
          } else if (activeTab === 'products') {
              const res = await api.get('/admin/products/');
              setProducts(res.data);
          } else if (activeTab === 'orders') {
              const res = await api.get('/admin/orders/');
              setOrders(res.data);
          } else if (activeTab === 'users' && user.role_code === 'super_admin') {
              const res = await api.get('/admin/users/');
              setUsersList(res.data);
          } else if (activeTab === 'logs' && user.role_code === 'super_admin') {
              const res = await api.get('/admin-logs/');
              setLogs(res.data);
          }
      } catch (err) {
          console.error("Error loading data:", err);
          // ถ้า Server ดับ จะแจ้งเตือนตรงนี้
          if (err.message === "Network Error") {
              Swal.fire("เชื่อมต่อ Server ไม่ได้", "กรุณาเปิด Backend (python manage.py runserver)", "error");
          }
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchData();
  }, [activeTab, token]);

  // --- ฟังก์ชันจัดการ ---

  const handleRoleChange = async (userId, action) => {
      const title = action === 'promote' ? "ตั้งเป็น Admin" : "ปลดเป็น User";
      const result = await Swal.fire({
          title: `ยืนยัน${title}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#305949',
          confirmButtonText: 'ยืนยัน'
      });

      if (result.isConfirmed) {
          try {
              // ยิง API ไปเปลี่ยน Role
              await api.post('/admin/users/role/', { user_id: userId, action });
              Swal.fire('สำเร็จ', `${title} เรียบร้อยแล้ว`, 'success');
              fetchData(); // โหลดข้อมูลใหม่
          } catch (error) {
              Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขสิทธิ์ได้', 'error');
          }
      }
  };

  const handleDeleteProduct = async (id) => {
      if ((await Swal.fire({ title: 'ยืนยันลบ?', icon: 'warning', showCancelButton: true })).isConfirmed) {
          await api.delete(`/products/${id}/delete/`);
          fetchData();
      }
  };

  const updateOrderStatus = async (id, status) => {
      await api.post(`/orders/${id}/update/`, { status });
      fetchData();
  };

  // --- ส่วนแสดงผล (UI) ---

  const renderContent = () => {
      if (loading) return <div className="p-10 text-center animate-pulse">กำลังโหลดข้อมูล...</div>;

      // 1. หน้าภาพรวม
      if (activeTab === 'overview' && stats) {
          return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow border">
                      <p className="text-gray-500 text-sm">ยอดขายรวม</p>
                      <h3 className="text-3xl font-bold text-[#305949]">฿{stats.total_sales?.toLocaleString()}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow border">
                      <p className="text-gray-500 text-sm">คำสั่งซื้อ</p>
                      <h3 className="text-3xl font-bold">{stats.total_orders}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow border">
                      <p className="text-gray-500 text-sm">สินค้า</p>
                      <h3 className="text-3xl font-bold">{stats.total_products}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow border">
                      <p className="text-gray-500 text-sm">ผู้ใช้งาน</p>
                      <h3 className="text-3xl font-bold text-blue-600">{stats.total_users}</h3>
                  </div>
              </div>
          );
      }

      // 2. หน้าจัดการสินค้า
      if (activeTab === 'products') {
          return (
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg">สินค้าทั้งหมด ({products.length})</h3>
                      <Link to="/product/add" className="bg-[#305949] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#234236]">
                          <Plus size={18}/> เพิ่มสินค้า
                      </Link>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                              <tr>
                                  <th className="p-4">รูป</th>
                                  <th className="p-4">ชื่อสินค้า</th>
                                  <th className="p-4">ราคา</th>
                                  <th className="p-4">คงเหลือ</th>
                                  <th className="p-4">สถานะ</th>
                                  <th className="p-4">จัดการ</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {products.map(p => (
                                  <tr key={p.id} className="hover:bg-gray-50">
                                      <td className="p-4"><img src={p.thumbnail} className="w-12 h-12 object-cover rounded border"/></td>
                                      <td className="p-4 font-medium">{p.title}</td>
                                      <td className="p-4">฿{p.price.toLocaleString()}</td>
                                      <td className="p-4">{p.stock}</td>
                                      <td className="p-4">
                                          {p.is_active ? 
                                            <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">ขายอยู่</span> : 
                                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">ปิดการขาย</span>
                                          }
                                      </td>
                                      <td className="p-4 flex gap-2">
                                          <Link to={`/product/${p.id}/edit`} className="text-yellow-600 bg-yellow-100 p-2 rounded hover:bg-yellow-200"><Edit size={16}/></Link>
                                          <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 bg-red-100 p-2 rounded hover:bg-red-200"><Trash2 size={16}/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          );
      }

      // 3. หน้าจัดการ Users (เฉพาะ Super Admin)
      if (activeTab === 'users') {
          return (
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <div className="p-4 border-b bg-indigo-50"><h3 className="font-bold text-indigo-900">จัดการสิทธิ์ผู้ใช้งาน</h3></div>
                  <table className="w-full text-left">
                      <thead className="bg-indigo-100 text-indigo-900 uppercase text-xs">
                          <tr>
                              <th className="p-4">Username</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Role ปัจจุบัน</th>
                              <th className="p-4">เปลี่ยนสิทธิ์</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-50">
                          {usersList.map(u => (
                              <tr key={u.id} className="hover:bg-indigo-50/30">
                                  <td className="p-4 font-bold">{u.username}</td>
                                  <td className="p-4">{u.email}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs ${u.role_code==='admin'?'bg-purple-100 text-purple-700': u.role_code==='super_admin'?'bg-red-100 text-red-700':'bg-gray-100'}`}>
                                          {u.role}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      {u.role_code !== 'super_admin' && (
                                          <div className="flex gap-2">
                                              {u.role_code === 'user' && (
                                                  <button onClick={() => handleRoleChange(u.id, 'promote')} className="bg-[#305949] text-white px-3 py-1 rounded text-xs hover:bg-[#234236]">
                                                      ตั้งเป็น Admin
                                                  </button>
                                              )}
                                              {u.role_code === 'admin' && (
                                                  <button onClick={() => handleRoleChange(u.id, 'demote')} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-400">
                                                      ปลดเป็น User
                                                  </button>
                                              )}
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          );
      }

      // 4. Logs และ Orders (ใส่แบบย่อๆ เพื่อความกระชับ)
      if (activeTab === 'orders') return (
        <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="font-bold mb-4">รายการสั่งซื้อ</h3>
            {/* Table Code เหมือนเดิม */}
            <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th>ID</th><th>ลูกค้า</th><th>สถานะ</th><th>เปลี่ยนสถานะ</th></tr></thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id} className="border-t">
                            <td className="p-3">#{o.id}</td>
                            <td className="p-3">{o.customer}</td>
                            <td className="p-3"><span className="bg-gray-100 px-2 rounded">{o.status}</span></td>
                            <td className="p-3">
                                <select value={o.status} onChange={(e)=>updateOrderStatus(o.id, e.target.value)} className="border rounded p-1">
                                    <option value="Pending">รอจ่าย</option>
                                    <option value="Paid">จ่ายแล้ว</option>
                                    <option value="Shipped">ส่งแล้ว</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      );

      return null;
  };

  return (
    <div className="min-h-screen bg-[#F2F0E4] p-6 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
            
            {/* Sidebar เมนู */}
            <div className="w-full md:w-64 bg-white rounded-2xl shadow p-4 h-fit">
                <div className="mb-6 text-center">
                    <h2 className="text-xl font-black text-[#263A33]">Admin Panel</h2>
                    <p className="text-xs text-gray-400">สวัสดี, {user?.username}</p>
                </div>
                
                <nav className="space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab==='overview' ? 'bg-[#305949] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <LayoutDashboard size={20}/> ภาพรวม
                    </button>
                    <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab==='products' ? 'bg-[#305949] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Package size={20}/> สินค้า
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab==='orders' ? 'bg-[#305949] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <ShoppingCart size={20}/> ออเดอร์
                    </button>
                    
                    {/* เมนูเฉพาะ Super Admin */}
                    {user?.role_code === 'super_admin' && (
                        <>
                            <div className="border-t my-2"></div>
                            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab==='users' ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'}`}>
                                <Users size={20}/> ผู้ใช้งาน (Admin)
                            </button>
                            <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition ${activeTab==='logs' ? 'bg-orange-500 text-white' : 'text-orange-500 hover:bg-orange-50'}`}>
                                <FileText size={20}/> ประวัติระบบ
                            </button>
                        </>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#263A33] mb-6 capitalize">{activeTab} Dashboard</h1>
                {renderContent()}
            </div>
        </div>
    </div>
  );
}

export default AdminDashboard;