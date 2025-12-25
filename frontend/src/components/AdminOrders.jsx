import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Package, Eye } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/formatUtils';
import Swal from 'sweetalert2';

export default function AdminOrderList() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await fetch(`http://localhost:8000/api/admin/orders/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    const data = await res.json();
    setOrders(data);
  };

  // ✅ Rule 7: ฟังก์ชันเปลี่ยนสถานะออเดอร์ (Update Status)
  const updateStatus = async (orderId, newStatus) => {
    const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      Swal.fire({ icon: 'success', title: 'อัปเดตสถานะแล้ว', toast: true, position: 'top-right', timer: 1500, showConfirmButton: false });
      fetchOrders();
    }
  };

  // ✅ Rule 39: Filter & Search
  const filteredOrders = orders.filter(o => 
    (filterStatus === 'all' || o.status.toLowerCase() === filterStatus.toLowerCase()) &&
    (o.id.toString().includes(searchTerm) || o.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <Package size={32} className="text-[#1a4d2e]"/> การจัดการคำสั่งซื้อ
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหา Order ID หรือ ชื่อลูกค้า..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white px-6 py-3 rounded-2xl border-none shadow-sm font-bold text-gray-600 outline-none"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">รอตรวจสอบ</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="shipped">จัดส่งแล้ว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">ลูกค้า</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">ยอดรวม</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-black">#{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{order.user_name}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4 font-black text-[#1a4d2e]">{formatPrice(order.total_price)}</td>
                  <td className="px-6 py-4">
                    {/* ✅ Rule 7: Dropdown เปลี่ยนสถานะพร้อมสี */}
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-black outline-none border-none ${
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' : 
                        order.status === 'Paid' ? 'bg-green-50 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      <option value="Pending">รอตรวจสอบ</option>
                      <option value="Paid">ชำระแล้ว</option>
                      <option value="Shipped">จัดส่งแล้ว</option>
                      <option value="Cancelled">ยกเลิก</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 bg-gray-100 rounded-xl text-gray-600 hover:bg-[#1a4d2e] hover:text-white transition-all">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}