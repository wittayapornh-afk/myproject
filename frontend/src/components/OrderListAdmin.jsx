import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2
import { Search, CheckCircle, Clock, XCircle, Truck, RefreshCw, Filter, Edit, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";

// ✅ Register Thai Locale
registerLocale("th", th);

export default function AdminOrders() {
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearch, setDisplaySearch] = useState(''); // ✅ UI State

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

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, startDate, endDate, statusFilter]);

  const fetchOrders = async () => {
    try {
      const activeToken = token || localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      // ✅ Format to YYYY-MM-DD for API
      if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);
      
      if (statusFilter !== 'ทั้งหมด') params.append('status', statusFilter);

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
      setEndDate(null);
      setStatusFilter('ทั้งหมด');
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
                <select className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none bg-white cursor-pointer text-sm font-bold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="ทั้งหมด">ทั้งหมด</option>
                    <option value="Pending">รอตรวจสอบ</option>
                    <option value="Paid">ชำระแล้ว</option>
                    <option value="Shipped">จัดส่งแล้ว</option>
                    <option value="Cancelled">ยกเลิก</option>
                </select>
                <Filter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
            </div>
        </div>
        <button onClick={handleReset} className="w-full xl:w-auto h-[42px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center gap-2 transition-colors mt-auto font-bold text-sm"><RefreshCw size={18}/> ล้างค่า</button>
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
                                <div className="text-xs">{order.date.split(' ')[0]}</div>
                                <div className="text-[10px] text-gray-400">{order.date.split(' ')[1]}</div>
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
                                            ['Pending', 'Paid', 'Shipped'].includes(order.status) ? 'bg-amber-400' : 'bg-gray-200'
                                        } ${order.status === 'Cancelled' && 'bg-gray-200'}`}></div>
                                        
                                        {/* Step 2: Paid */}
                                        <div className={`h-1.5 w-8 rounded-full transition-all ${
                                            ['Paid', 'Shipped'].includes(order.status) ? 'bg-emerald-500' : 'bg-gray-200'
                                        } ${order.status === 'Cancelled' && 'bg-gray-200'}`}></div>
                                        
                                        {/* Step 3: Shipped */}
                                        <div className={`h-1.5 w-8 rounded-full transition-all ${
                                            order.status === 'Shipped' ? 'bg-blue-500' : 'bg-gray-200'
                                        } ${order.status === 'Cancelled' && 'bg-gray-200'}`}></div>
                                    </div>

                                    {/* Status Control Panel */}
                                    <div className="relative">
                                        <div className={`absolute top-1/2 left-3 -translate-y-1/2 w-2 h-2 rounded-full ${
                                            order.status === 'Paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                            order.status === 'Shipped' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                                            order.status === 'Cancelled' ? 'bg-red-500' :
                                            'bg-amber-400 animate-pulse'
                                        }`}></div>
                                        <select 
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`w-full pl-7 pr-8 py-2 text-xs font-bold rounded-lg border-2 cursor-pointer outline-none transition-all ${
                                                order.status === 'Paid' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 
                                                order.status === 'Shipped' ? 'border-blue-100 bg-blue-50 text-blue-700' :
                                                order.status === 'Cancelled' ? 'border-red-100 bg-red-50 text-red-700' :
                                                'border-amber-100 bg-amber-50 text-amber-700'
                                            } hover:border-gray-300 focus:ring-2 focus:ring-gray-200`}
                                        >
                                            <option value="Pending">1. รอตรวจสอบ</option>
                                            <option value="Paid">2. ชำระแล้ว</option>
                                            <option value="Shipped">3. จัดส่งแล้ว</option>
                                            <option className="text-red-500" value="Cancelled">❌ ยกเลิก</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                                            <Edit size={12} />
                                        </div>
                                    </div>

                                    {/* Check Slip Button (Compact) */}
                                    {order.slip_image && (
                                        <button 
                                            onClick={() => handleViewSlip(order)}
                                            className="w-full py-1.5 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
                                        >
                                            <Search size={12} className="text-indigo-500"/> ตรวจสอบสลิป
                                        </button>
                                    )}
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