import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, CheckCircle, Clock, XCircle, Truck, RefreshCw, Filter, Edit } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, startDate, endDate, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (statusFilter !== 'ทั้งหมด') params.append('status', statusFilter);

      const response = await axios.get(`http://localhost:8000/api/admin/orders/?${params.toString()}`, {
        headers: { Authorization: `Token ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // 1. ถามยืนยัน
    if (!window.confirm(`ยืนยันเปลี่ยนสถานะเป็น "${newStatus}" ?`)) return;

    try {
        const token = localStorage.getItem('token');
        // 2. ส่งค่าไป Backend
        await axios.post(`http://localhost:8000/api/admin/order_status/${orderId}/`, 
            { status: newStatus },
            { headers: { Authorization: `Token ${token}` } }
        );
        // 3. โหลดข้อมูลใหม่
        fetchOrders();
        // alert(`✅ เปลี่ยนสถานะเรียบร้อย`);
    } catch (e) {
        alert("❌ เกิดข้อผิดพลาด");
        console.error(e);
    }
  };

  const handleReset = () => {
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
      setStatusFilter('ทั้งหมด');
  };

  // Function เลือกสีพื้นหลังตามสถานะ
  const getStatusColor = (status) => {
      switch(status) {
          case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
          case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Toolbar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 items-end xl:items-center">
        <div className="flex-1 w-full">
            <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">ค้นหา</label>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                <input type="text" placeholder="ชื่อ / เบอร์ / ID..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <div className="flex gap-2 w-full xl:w-auto">
            <div className="flex-1"><label className="text-xs font-bold text-gray-500 mb-1 block ml-1">เริ่ม</label><input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a4d2e]" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div className="flex-1"><label className="text-xs font-bold text-gray-500 mb-1 block ml-1">ถึง</label><input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a4d2e]" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
        </div>
        <div className="w-full xl:w-48">
            <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">สถานะ</label>
            <div className="relative">
                <select className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none bg-white cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="ทั้งหมด">ทั้งหมด</option>
                    <option value="Pending">รอตรวจสอบ</option>
                    <option value="Paid">ชำระแล้ว</option>
                    <option value="Shipped">จัดส่งแล้ว</option>
                    <option value="Cancelled">ยกเลิก</option>
                </select>
                <Filter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
            </div>
        </div>
        <button onClick={handleReset} className="w-full xl:w-auto h-[42px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors mt-auto"><RefreshCw size={18}/></button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 text-sm">
                    <tr>
                        <th className="p-4 w-20">#ID</th>
                        <th className="p-4 w-32">วันที่</th>
                        <th className="p-4">ลูกค้า</th>
                        <th className="p-4">รายการสินค้า</th>
                        <th className="p-4 text-right">ยอดรวม</th>
                        <th className="p-4 text-center w-48">จัดการสถานะ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="6" className="p-12 text-center text-gray-500">กำลังโหลด...</td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="6" className="p-12 text-center text-gray-400">ไม่พบออเดอร์</td></tr>
                    ) : (
                        orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-sm font-bold text-[#1a4d2e]">#{order.id}</td>
                            <td className="p-4 text-sm text-gray-600">
                                <div className="text-xs">{order.created_at.split(' ')[0]}</div>
                                <div className="text-[10px] text-gray-400">{order.created_at.split(' ')[1]}</div>
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-gray-800 text-sm">{order.customer}</div>
                                <div className="text-xs text-gray-500">{order.tel || '-'}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                                <div className="flex flex-col gap-1">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-2 items-center text-xs">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                            <span className="font-medium text-gray-700 truncate max-w-[150px]">{item.product}</span> 
                                            <span className="text-gray-400">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4 text-right font-bold text-[#1a4d2e]">฿{Number(order.total_price).toLocaleString()}</td>
                            
                            {/* ✅ ช่องจัดการ (เปลี่ยนสถานะได้เลย) */}
                            <td className="p-4 text-center">
                                <div className="relative">
                                    <select 
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className={`w-full appearance-none px-3 py-2 pr-8 text-xs font-bold rounded-lg border cursor-pointer outline-none transition-all shadow-sm focus:ring-2 focus:ring-offset-1 ${getStatusColor(order.status)}`}
                                    >
                                        <option value="Pending">⏳ รอตรวจสอบ</option>
                                        <option value="Paid">✅ ชำระแล้ว</option>
                                        <option value="Shipped">🚚 จัดส่งแล้ว</option>
                                        <option value="Cancelled">❌ ยกเลิก</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <Edit size={14} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}