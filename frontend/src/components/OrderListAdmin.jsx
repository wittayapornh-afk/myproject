import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2
import { Search, CheckCircle, Clock, XCircle, Truck, RefreshCw, Filter, Edit, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";

import { thai_provinces } from '../data/thai_provinces'; // ✅ Import Provinces

// ✅ Register Thai Locale
registerLocale("th", th);

export default function AdminOrders() {
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearch, setDisplaySearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]); // ✅ Selection State

  // ✅ Bulk Update Function
  const handleBulkUpdate = async (status) => {
    if (selectedOrders.length === 0) return;

    const result = await Swal.fire({
        title: 'ยืนยันอัปเดตหลายรายการ?',
        text: `ต้องการเปลี่ยนสถานะ ${selectedOrders.length} ออเดอร์เป็น "${status}" ใช่หรือไม่`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1a4d2e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, เปลี่ยนเลย',
        cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
        try {
            const activeToken = token || localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/admin/orders/bulk-update/', 
                { order_ids: selectedOrders, status: status }, 
                { headers: { Authorization: `Token ${activeToken}` } }
            );
            
            Swal.fire('สำเร็จ!', 'อัปเดตสถานะเรียบร้อยแล้ว', 'success');
            setSelectedOrders([]); // Clear selection
            fetchOrders(); // Refresh
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัปเดต', 'error');
        }
    }
  };

  // ✅ Debounce Search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        setSearchTerm(displaySearch);
    }, 500); // 0.5s Delay
    return () => clearTimeout(timeoutId);
  }, [displaySearch]);
  
  // ✅ Change to Date Object for DatePicker
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [provinceFilter, setProvinceFilter] = useState('ทั้งหมด'); // ✅ Province Filter

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, startDate, endDate, statusFilter, provinceFilter]);

  const fetchOrders = async () => {
    try {
      const activeToken = token || localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      // ✅ Format to YYYY-MM-DD for API
      if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);
      
      if (statusFilter !== 'ทั้งหมด') params.append('status', statusFilter);
      if (provinceFilter !== 'ทั้งหมด') params.append('province', provinceFilter); // ✅ Add param

      const response = await axios.get(`http://localhost:8000/api/admin/orders_v2/?${params.toString()}`, {
        headers: { Authorization: `Token ${activeToken}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response && error.response.status === 401) {
          logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Import Swal (Ensure it is imported at top file, found at line 7 in other files but checked imports here)
  // Check imports: line 1-7. Swal is NOT imported in OrderListAdmin.jsx yet?
  // Wait, I viewed the file. I don't see `import Swal from 'sweetalert2'`.
  // I need to ADD the import first or ensure it's there?
  // Checking file content from Step 3350... No, that was AdminSidebar.
  // Step 3406 OrderListAdmin.jsx: lines 1-8. NO 'sweetalert2' import.
  // I MUST ADD IMPORT FIRST.
  
  const handleStatusChange = async (orderId, newStatus) => {
    // ใช้ SweetAlert2 แทน window.confirm
    const result = await Swal.fire({
        title: 'ยืนยันเปลี่ยนสถานะ?',
        text: `ต้องการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1a4d2e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, เปลี่ยนเลย',
        cancelButtonText: 'ยกเลิก',
        background: '#fff',
        customClass: {
            title: 'font-black text-[#1a4d2e]',
            popup: 'rounded-3xl shadow-xl'
        }
    });

    if (!result.isConfirmed) return;

    try {
        const activeToken = token || localStorage.getItem('token');
        await axios.post(`http://localhost:8000/api/admin/order_status/${orderId}/`, 
            { status: newStatus },
            { headers: { Authorization: `Token ${activeToken}` } }
        );
        
        // Show success
        Swal.fire({
            icon: 'success',
            title: 'เรียบร้อย!',
            text: `เปลี่ยนสถานะเป็น ${newStatus} แล้ว`,
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#1a4d2e'
        });

        fetchOrders();
    } catch (e) {
        console.error(e);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเปลี่ยนสถานะได้',
            confirmButtonColor: '#1a4d2e'
        });
        
        if (e.response && e.response.status === 401) {
             logout();
        }
    }
  };

  // ✅ New Function: View Slip & Verify (Enhanced UI)
  const handleViewSlip = (order) => {
      const isAmountMatch = parseFloat(order.total_price) === parseFloat(order.transfer_amount);
      const amountColor = isAmountMatch ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200';
      const amountIcon = isAmountMatch ? 'check-circle' : 'alert-circle';
      const statusBadge = isAmountMatch 
          ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">ยอดตรงกัน</span>' 
          : '<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200">ยอดไม่ตรง</span>';

      Swal.fire({
          title: `<div class="flex flex-col items-center mb-1">
                    <span class="text-2xl font-black text-gray-800 tracking-tight">ตรวจสอบสลิป #${order.id}</span>
                    <span class="text-sm font-medium text-gray-400 mt-1">ลูกค้า: <span class="text-gray-600">${order.customer}</span></span>
                  </div>`,
          html: `
            <div class="flex flex-col md:flex-row gap-8 text-left mt-2">
                <!-- 🖼️ Slip Image (Left) -->
                <div class="w-full md:w-5/12">
                    <div class="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group relative cursor-zoom-in h-[400px] flex items-center justify-center" onclick="window.open('http://localhost:8000${order.slip_image}', '_blank')">
                        <img src="http://localhost:8000${order.slip_image}" alt="Slip" class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                            <span class="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">🔍 กดเพื่อดูภาพใหญ่</span>
                        </div>
                    </div>
                </div>

                <!-- 📝 Details (Right) -->
                <div class="w-full md:w-7/12 space-y-5">
                    
                    <!-- 1. Comparison Card -->
                    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-1 h-full ${isAmountMatch ? 'bg-emerald-500' : 'bg-rose-500'}"></div>
                        
                        <div class="flex justify-between items-end border-b border-gray-100 pb-3">
                            <div>
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">ยอดคำสั่งซื้อ</p>
                                <p class="text-xl font-black text-gray-800">฿${Number(order.total_price).toLocaleString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 justify-end">ยอดโอนจริง ${statusBadge}</p>
                                <p class="text-2xl font-black ${isAmountMatch ? 'text-emerald-600' : 'text-rose-600'}">฿${Number(order.transfer_amount || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 pt-1">
                            <div>
                                <p class="text-[10px] font-bold text-gray-400">วันที่สั่งซื้อ</p>
                                <p class="text-sm font-bold text-gray-700">${order.date}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-gray-400">เวลาโอนเงิน</p>
                                <p class="text-sm font-bold text-gray-700">${/*order.transfer_date ||*/ '-'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Bank Details -->
                    <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> ข้อมูลบัญชีที่โอนเข้า
                        </h4>
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl border border-gray-100">
                                🏦
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">ธนาคาร: <span class="font-bold text-gray-800">${order.bank_name || '-'}</span></p>
                                <p class="text-sm font-black text-gray-800 tracking-wider">${order.transfer_account_number || '-'}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          `,
          width: 900,
          padding: '2rem',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: '✅ อนุมัติ (Paid)',
          denyButtonText: '❌ ปฏิเสธ (Cancel)',
          cancelButtonText: 'ปิดหน้าต่าง',
          confirmButtonColor: '#10B981', // Emerald 500
          denyButtonColor: '#EF4444',   // Red 500
          cancelButtonColor: '#94A3B8', // Slate 400
          
          customClass: {
              popup: 'rounded-[2rem] shadow-2xl',
              confirmButton: 'rounded-xl font-bold text-sm px-6 py-3 shadow-lg shadow-emerald-200',
              denyButton: 'rounded-xl font-bold text-sm px-6 py-3 shadow-lg shadow-rose-200',
              cancelButton: 'rounded-xl font-bold text-sm px-4 py-3 bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none'
          },
          
          showLoaderOnConfirm: true,
          preConfirm: () => {
              return handleStatusChange(order.id, 'Paid');
          },
          preDeny: () => {
              return handleStatusChange(order.id, 'Cancelled');
          }
      });
  };

  const handleReset = () => {
      setSearchTerm('');
      setStartDate(null);
      setStartDate(null);
      setEndDate(null);
      setStatusFilter('ทั้งหมด');
      setProvinceFilter('ทั้งหมด');
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
          case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-amber-100 text-amber-800 border-amber-200';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 items-end xl:items-center">
        <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">ค้นหา</label>
            <div className="relative group">
                <Search className="absolute left-3 top-2.5 text-gray-400 group-hover:text-[#1a4d2e] transition-colors" size={18}/>
                <input 
                    type="text" 
                    placeholder="ค้นหา: ชื่อ / เบอร์โทร / รหัสออเดอร์..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-transparent group-hover:border-gray-200 focus:border-[#1a4d2e] rounded-full outline-none transition-all shadow-sm text-sm font-bold text-gray-700 placeholder-gray-400" 
                    value={displaySearch} 
                    onChange={(e) => setDisplaySearch(e.target.value)} 
                />
            </div>
        </div>
        
        {/* ✅ Styled Date Picker Section */}
        <div className="flex gap-2 w-full xl:w-auto">
            <div className="flex-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">เริ่ม</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-[#1a4d2e] z-10 pointer-events-none" size={16} />
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale="th"
                        placeholderText="วันที่เริ่ม"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#1a4d2e] cursor-pointer"
                    />
                </div>
            </div>
            <div className="flex-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">ถึง</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-[#1a4d2e] z-10 pointer-events-none" size={16} />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale="th"
                        placeholderText="วันสิ้นสุด"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#1a4d2e] cursor-pointer"
                    />
                </div>
            </div>
        </div>

        <div className="w-full xl:w-48">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">สถานะ</label>
            <div className="relative">
                <select className="w-full pl-3 pr-8 py-2 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none cursor-pointer text-sm font-bold text-gray-700 hover:bg-white transition-colors" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="ทั้งหมด">ทั้งหมด</option>
                    <option value="Pending">รอตรวจสอบ</option>
                    <option value="Paid">ชำระแล้ว</option>
                    <option value="Shipped">จัดส่งแล้ว</option>
                    <option value="Cancelled">ยกเลิก</option>
                </select>
                <Filter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
            </div>
        </div>

        {/* ✅ Province Filter */}
        <div className="w-full xl:w-48">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">จังหวัด</label>
            <div className="relative">
                <select className="w-full pl-3 pr-8 py-2 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none cursor-pointer text-sm font-bold text-gray-700 hover:bg-white transition-colors" value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)}>
                    <option value="ทั้งหมด">ทั้งหมด</option>
                    {thai_provinces.map((p, i) => (
                        <option key={i} value={p}>{p}</option>
                    ))}
                </select>
                <Filter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
            </div>
        </div>
        <button onClick={handleReset} className="w-full xl:w-auto h-[42px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center gap-2 transition-colors mt-auto font-bold text-sm shadow-sm hover:shadow-md"><RefreshCw size={18}/> ล้างค่า</button>
      </div>

      {/* ✅ Bulk Action Bar (Shows when items selected) */}
      {selectedOrders.length > 0 && (
        <div className="bg-[#1a4d2e] text-white p-4 rounded-xl shadow-lg flex justify-between items-center animate-fade-in mb-4">
            <span className="font-bold text-sm">เลือกอยู่ {selectedOrders.length} รายการ</span>
            <div className="flex gap-2">
                <button onClick={() => handleBulkUpdate('Paid')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all border border-white/10">
                    ยืนยันชำระเงิน
                </button>
                <button onClick={() => handleBulkUpdate('Shipped')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all border border-white/10">
                    ยืนยันจัดส่ง
                </button>
                <button onClick={() => handleBulkUpdate('Completed')} className="px-4 py-2 bg-white text-[#1a4d2e] hover:bg-gray-100 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2">
                    <CheckCircle size={14} /> ออเดอร์สำเร็จ
                </button>
            </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8F9FA] text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <tr>
                        {/* ✅ Checkbox Column */}
                        <th className="p-6 w-10 pl-8">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded text-[#1a4d2e] focus:ring-[#1a4d2e] cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedOrders(orders.map(o => o.id));
                                    } else {
                                        setSelectedOrders([]);
                                    }
                                }}
                                checked={orders.length > 0 && selectedOrders.length === orders.length}
                            />
                        </th>
                        <th className="p-6 w-20">#ID</th>
                        <th className="p-6 w-32">วันที่</th>
                        <th className="p-6">จังหวัด</th> {/* ✅ New Header */}
                        <th className="p-6">ลูกค้า</th>
                        <th className="p-6">รายการสินค้า</th>
                        <th className="p-6 text-right">ยอดรวม</th>
                        <th className="p-6 text-center w-48">จัดการสถานะ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="7" className="p-12 text-center text-gray-500">กำลังโหลด...</td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="7" className="p-12 text-center text-gray-400">ไม่พบออเดอร์</td></tr>
                    ) : (
                        orders.map((order) => (
                        <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${selectedOrders.includes(order.id) ? 'bg-green-50' : ''}`}>
                            {/* ✅ Row Checkbox */}
                            <td className="p-4">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-[#1a4d2e] focus:ring-[#1a4d2e] cursor-pointer border-gray-300"
                                    checked={selectedOrders.includes(order.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedOrders([...selectedOrders, order.id]);
                                        } else {
                                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                        }
                                    }}
                                />
                            </td>
                            <td className="p-4 font-mono text-sm font-bold text-[#1a4d2e]">#{order.id}</td>
                            <td className="p-4 text-sm text-gray-600">
                                <div className="text-xs">{order.date.split(' ')[0]}</div>
                                <div className="text-[10px] text-gray-400">{order.date.split(' ')[1]}</div>
                            </td>
                            {/* ✅ Province Column */}
                            <td className="p-4">
                                <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                    {order.province || '-'}
                                </span>
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
                            <td className="p-4 text-center align-top">
                                <div className="space-y-3">
                                    {/* Systematic Process Indicator */}
                                    <div className="flex justify-center items-center gap-1 mb-1">
                                        {/* Step 1: Pending */}
                                        <div className={`h-1.5 w-8 rounded-full transition-all ${
                                            ['Pending', 'Paid', 'Shipped', 'Completed'].includes(order.status) ? 'bg-amber-400' : 'bg-gray-200'
                                        } ${order.status === 'Cancelled' && 'bg-gray-200'}`}></div>
                                        
                                        {/* Step 2: Paid */}
                                        <div className={`h-1.5 w-8 rounded-full transition-all ${
                                            ['Paid', 'Shipped', 'Completed'].includes(order.status) ? 'bg-emerald-500' : 'bg-gray-200'
                                        } ${order.status === 'Cancelled' && 'bg-gray-200'}`}></div>
                                        
                                        {/* Step 3: Shipped */}
                                        <div className={`h-1.5 w-8 rounded-full transition-all ${
                                            ['Shipped', 'Completed'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-200'
                                        } ${order.status === 'Cancelled' && 'bg-gray-200'}`}></div>

                                        {/* Step 4: Completed */}
                                        <div className={`h-1.5 w-8 rounded-full transition-all ${
                                            order.status === 'Completed' ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        {order.status === 'Pending' && (
                                            <button 
                                                onClick={() => handleViewSlip(order)}
                                                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:shadow-sm transition-all border border-emerald-200"
                                            >
                                                ยืนยันชำระเงิน
                                            </button>
                                        )}
                                        
                                        {order.status === 'Paid' && (
                                            <button 
                                                onClick={() => handleStatusChange(order.id, 'Shipped')}
                                                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-sm transition-all border border-blue-200 flex items-center justify-center gap-1"
                                            >
                                                <Truck size={12} /> ยืนยันจัดส่ง
                                            </button>
                                        )}

                                        {order.status === 'Shipped' && (
                                            <button 
                                                onClick={() => handleStatusChange(order.id, 'Completed')}
                                                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm transition-all border border-green-200 flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle size={12} /> ออเดอร์สำเร็จ
                                            </button>
                                        )}

                                        {/* ❌ Cancel Button (Available for Pending/Paid) */}
                                        {['Pending', 'Paid'].includes(order.status) && (
                                            <button 
                                                onClick={() => handleStatusChange(order.id, 'Cancelled')}
                                                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:shadow-sm transition-all border border-rose-200"
                                            >
                                                ยกเลิก
                                            </button>
                                        )}

                                        {/* Status Layout for Final States */}
                                        {order.status === 'Completed' && (
                                            <span className="block w-full py-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-lg border border-green-100 shadow-sm text-center">
                                                ✅ สำเร็จ
                                            </span>
                                        )}
                                        {order.status === 'Cancelled' && (
                                            <span className="block w-full py-1.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg border border-gray-200 text-center">
                                                ❌ ยกเลิกแล้ว
                                            </span>
                                        )}
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