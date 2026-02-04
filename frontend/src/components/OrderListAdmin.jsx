import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, CheckCircle, Clock, Truck, RefreshCw, Filter, Calendar, XCircle, ChevronLeft, ChevronRight, Package, DollarSign, User, MapPin, Trash2 } from 'lucide-react';


import { useAuth } from '../context/AuthContext';
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import { thai_provinces } from '../data/thai_provinces';
import { API_BASE_URL } from '../config';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

const DatePickerStyles = () => (
    <style>{`
        .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 1.5rem;
            border: none;
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1), 0 10px 10px -5px rgba(79, 70, 229, 0.04);
            background: white;
            overflow: hidden;
            border: 1px solid rgba(79, 70, 229, 0.1);
        }
        .react-datepicker__header {
            background: #f8fafc;
            border-bottom: 1px solid #f1f5f9;
            padding: 1rem 0;
        }
        .react-datepicker__current-month {
            color: #1e293b;
            font-weight: 800;
            font-size: 0.9rem;
        }
        .react-datepicker__day-name {
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.7rem;
        }
        .react-datepicker__day {
            color: #475569;
            font-weight: 600;
            transition: all 0.2s;
        }
        .react-datepicker__day:hover {
            background-color: #f5f3ff !important;
            color: #4f46e5 !important;
            border-radius: 0.5rem;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
            background: #4f46e5 !important;
            color: white !important;
            border-radius: 0.5rem;
        }
        .react-datepicker__day--today {
            color: #4f46e5;
            font-weight: 800;
        }
    `}</style>
);

// Register Thai Locale
registerLocale("th", th);

export default function GenAdminOrders() {
  const { token, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearch, setDisplaySearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Filters
  const [viewMode, setViewMode] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [provinceFilter, setProvinceFilter] = useState('ทั้งหมด');

  // Pagination (Frontend Logic for now to match other components)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce Search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        setSearchTerm(displaySearch);
    }, 500); 
    return () => clearTimeout(timeoutId);
  }, [displaySearch]);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, viewMode, selectedDate, statusFilter, provinceFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode, selectedDate, statusFilter, provinceFilter]);

  const fetchOrders = async () => {
    // setLoading(true); // Optional: Loading state on every filter might be annoying if fast
    try {
      const activeToken = token || localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      // Calculate Start/End Date based on View Mode
      let start, end;
      if (viewMode === 'daily') {
          start = startOfDay(selectedDate);
          end = endOfDay(selectedDate);
      } else if (viewMode === 'monthly') {
          start = startOfMonth(selectedDate);
          end = endOfMonth(selectedDate);
      } else if (viewMode === 'yearly') {
          start = startOfYear(selectedDate);
          end = endOfYear(selectedDate);
      }
      
      if (start && end) {
          // Adjust for timezone if needed, but usually formatting as YYYY-MM-DD is safe enough for date-only filters
          // Using date-fns format to ensure correct local string
          params.append('start_date', format(start, 'yyyy-MM-dd'));
          params.append('end_date', format(end, 'yyyy-MM-dd'));
      }

      if (statusFilter !== 'ทั้งหมด') params.append('status', statusFilter);
      if (provinceFilter !== 'ทั้งหมด') params.append('province', provinceFilter);

      const response = await axios.get(`${API_BASE_URL}/api/admin/orders_v2/?${params.toString()}`, {
        headers: { Authorization: `Token ${activeToken}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response && error.response.status === 401) {
          // logout(); // ❌ Don't auto-logout, allow retry/manual handling
          console.warn("Unauthorized access to orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
      const result = await Swal.fire({
          title: 'ลบรายการ?',
          text: "รายการนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'ลบถาวร',
          cancelButtonText: 'ยกเลิก',
          customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
      });

      if (result.isConfirmed) {
          try {
              const activeToken = token || localStorage.getItem('token');
              console.log(`Deleting order: ${API_BASE_URL}/api/admin/order/${orderId}/delete/`);
              await axios.delete(`${API_BASE_URL}/api/admin/order/${orderId}/delete/`, {
                  headers: { Authorization: `Token ${activeToken}` }
              });
              
              const Toast = Swal.mixin({
                  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
              });
              Toast.fire({ icon: 'success', title: 'ลบรายการเรียบร้อยแล้ว' });
              
              fetchOrders();
          } catch (error) {
              console.error(error);
              Swal.fire('Error', 'เกิดข้อผิดพลาดในการลบ', 'error');
          }
      }
  };

  const handleBulkUpdate = async (status) => {
    if (selectedOrders.length === 0) return;
    const result = await Swal.fire({
        title: 'ยืนยันอัปเดตสถานะ?',
        text: `คุณต้องการเปลี่ยนสถานะ ${selectedOrders.length} รายการที่เลือก เป็น "${getStatusLabel(status)}" ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1a4d2e',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
    });

    if (result.isConfirmed) {
        try {
            const activeToken = token || localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/admin/orders/bulk-update/`, 
                { order_ids: selectedOrders, status: status }, 
                { headers: { Authorization: `Token ${activeToken}` } }
            );
            Swal.fire({
                 title: 'สำเร็จ!', text: 'อัปเดตสถานะเรียบร้อยแล้ว', icon: 'success', 
                 confirmButtonColor: '#1a4d2e', customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl' }
            });
            setSelectedOrders([]);
            fetchOrders();
        } catch (error) {
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัปเดต', 'error');
        }
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // 🚚 Shipping Logic (Inputs for Tracking)
    if (newStatus === 'Shipped') {
        const result = await Swal.fire({
            title: `<span class="text-[#1a4d2e] font-black text-2xl">จัดส่งสินค้า</span>`,
            html: `
                <div class="space-y-4 text-left p-2">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">เลขพัสดุ (Tracking No.)</label>
                        <input id="tracking-input" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-gray-700" placeholder="เช่น TH0123456789" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">บริษัทขนส่ง (Courier)</label>
                        <select id="courier-input" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-gray-700">
                            <option value="Kerry Express">Kerry Express</option>
                            <option value="J&T Express">J&T Express</option>
                            <option value="Flash Express">Flash Express</option>
                            <option value="Thai Post">ไปรษณีย์ไทย</option>
                            <option value="Other">อื่นๆ</option>
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '✅ ยืนยันจัดส่ง',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#1a4d2e',
            customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' },
            preConfirm: () => {
                const tracking = document.getElementById('tracking-input').value;
                const courier = document.getElementById('courier-input').value;
                if (!tracking) {
                    Swal.showValidationMessage('กรุณากรอกเลขพัสดุ');
                }
                return { tracking, courier };
            }
        });

        if (result.isConfirmed) {
            try {
                const activeToken = token || localStorage.getItem('token');
                await axios.post(`${API_BASE_URL}/api/admin/order_status/${orderId}/`, 
                    { 
                        status: newStatus,
                        tracking_number: result.value.tracking,
                        courier_name: result.value.courier
                    },
                    { headers: { Authorization: `Token ${activeToken}` } }
                );
                fetchOrders();
                Swal.fire({
                    icon: 'success', 
                    title: 'บันทึกจัดส่งสำเร็จ',
                    text: `Tracking: ${result.value.tracking}`,
                    showConfirmButton: false,
                    timer: 2000
                });
            } catch (e) {
                console.error(e);
                Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        }
        return;
    }

    // Default Logic for Other Statuses
    const result = await Swal.fire({
        title: 'เปลี่ยนสถานะ?',
        text: `ต้องการเปลี่ยนเป็น "${getStatusLabel(newStatus)}" ใช่หรือไม่`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1a4d2e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, เปลี่ยนเลย',
        cancelButtonText: 'ยกเลิก',
        customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl', cancelButton: 'rounded-xl' }
    });

    if (!result.isConfirmed) return;

    try {
        const activeToken = token || localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/api/admin/order_status/${orderId}/`, 
            { status: newStatus },
            { headers: { Authorization: `Token ${activeToken}` } }
        );
        fetchOrders();
        const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
            didOpen: (toast) => { toast.onmouseenter = Swal.stopTimer; toast.onmouseleave = Swal.resumeTimer; }
        });
        Toast.fire({ icon: 'success', title: `สถานะอัปเดตเป็น: ${getStatusLabel(newStatus)}` });
    } catch (e) {
        console.error(e);
        Swal.fire('Error', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
    }
  };

  const handleViewSlip = (order) => {
    const isAmountMatch = parseFloat(order.total_price) === parseFloat(order.transfer_amount || 0);
    const slipUrl = order.slip_image?.startsWith('http') ? order.slip_image : `${API_BASE_URL}${order.slip_image}`;
    
    Swal.fire({
        title: `<div class="text-2xl font-black text-[#1a4d2e]">ตรวจสอบสลิป #${order.id}</div>`,
        html: `
            <div class="flex flex-col md:flex-row gap-6 text-left">
                <div class="w-full md:w-1/2">
                    <div class="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 h-[400px] flex items-center justify-center cursor-zoom-in" onclick="window.open('${slipUrl}', '_blank')">
                        <img src="${slipUrl}" class="max-h-full max-w-full object-contain" />
                        <div class="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-md">🔍 คลิกเพื่อดูภาพขยาย</span>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-1/2 space-y-4">
                     <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">ข้อมูลยอดเงิน</h4>
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-sm font-bold text-gray-600">ยอดสั่งซื้อ:</span>
                            <span class="text-xl font-black text-gray-800">฿${Number(order.total_price).toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between items-end border-t border-gray-100 pt-2">
                            <span class="text-sm font-bold text-gray-600">ยอดโอนจริง:</span>
                            <span class="text-xl font-black ${isAmountMatch ? 'text-green-600' : 'text-red-500'}">฿${Number(order.transfer_amount || 0).toLocaleString()}</span>
                        </div>
                        ${!isAmountMatch ? '<div class="mt-2 text-center bg-red-50 text-red-600 text-xs font-bold py-1 rounded-lg">⚠️ ยอดเงินไม่ตรงกัน</div>' : '<div class="mt-2 text-center bg-green-50 text-green-600 text-xs font-bold py-1 rounded-lg">✅ ยอดเงินถูกต้อง</div>'}
                     </div>
                     
                     <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                        <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">บัญชีธนาคาร</h4>
                        <p class="text-sm font-bold text-gray-800">${order.bank_name || '-'}</p>
                        <p class="text-lg font-black tracking-wider text-[#1a4d2e]">${order.transfer_account_number || '-'}</p>
                        <p class="text-xs text-gray-500 mt-1">เวลาโอน: ${order.transfer_date || '-'}</p>
                     </div>
                </div>
            </div>
        `,
        width: 800,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '✅ อนุมัติ (ชำระแล้ว)',
        denyButtonText: '❌ ปฏิเสธ/ยกเลิก',
        cancelButtonText: 'ปิด',
        confirmButtonColor: '#10B981',
        denyButtonColor: '#EF4444',
        cancelButtonColor: '#94A3B8',
        customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl', denyButton: 'rounded-xl text-white', cancelButton: 'rounded-xl' },
        preConfirm: () => handleStatusChange(order.id, 'Paid'),
        preDeny: () => handleStatusChange(order.id, 'Cancelled')
    });
  };

  const handleReset = () => {
      setDisplaySearch(''); setSearchTerm('');
      setViewMode('all');
      setStatusFilter('ทั้งหมด'); setProvinceFilter('ทั้งหมด');
  };

  // Helper Translation
  const getStatusLabel = (status) => {
      switch(status) {
          case 'Pending': return 'รอตรวจสอบ';
          case 'Paid': return 'ที่ต้องจัดส่ง';
          case 'Shipped': return 'จัดส่งแล้ว';
          case 'Completed': return 'สำเร็จ';
          case 'Cancelled': return 'ยกเลิก';
          default: return status;
      }
  };

  const getStatusBadge = (status) => {
      const label = getStatusLabel(status);
      let colorClass = 'bg-gray-100 text-gray-600 border-gray-200';
      if (status === 'Pending') colorClass = 'bg-orange-50 text-orange-600 border-orange-100';
      if (status === 'Paid') colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
      if (status === 'Shipped') colorClass = 'bg-purple-50 text-purple-600 border-purple-100';
      if (status === 'Completed') colorClass = 'bg-green-50 text-green-600 border-green-100';
      if (status === 'Cancelled') colorClass = 'bg-red-50 text-red-600 border-red-100';

      return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClass} inline-flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('bg-', 'bg-opacity-100 bg-').split(' ')[0].replace('-50', '-500')}`}></span>
            {label}
        </span>
      );
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in relative">
        <DatePickerStyles />
      
      {/* 🟢 Toolbar */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
        {/* Top Row: Search & Date */}
        <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#1a4d2e] transition-colors" size={20}/>
                <input 
                    type="text" 
                    placeholder="ค้นหา: เลขคำสั่งซื้อ, ชื่อลูกค้า, เบอร์โทร..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-sm" 
                    value={displaySearch} 
                    onChange={(e) => setDisplaySearch(e.target.value)} 
                />
            </div>
            
            <div className="flex gap-4 items-center">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                    <button onClick={() => setViewMode('all')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === 'all' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>ทั้งหมด</button>
                    <div className="w-[1px] bg-gray-200 my-2"></div>
                    <button onClick={() => setViewMode('daily')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === 'daily' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>รายวัน</button>
                    <button onClick={() => setViewMode('monthly')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === 'monthly' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>รายเดือน</button>
                    <button onClick={() => setViewMode('yearly')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === 'yearly' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>รายปี</button>
                </div>

                {/* Date Picker (Only show if NOT 'all') */}
                {viewMode !== 'all' && (
                    <div className="flex items-center gap-2 bg-white border px-4 py-2 rounded-2xl shadow-sm border-gray-100 min-w-[140px] relative animate-fade-in">
                        <Calendar size={14} className="text-[#1a4d2e] pointer-events-none absolute left-4 z-10" />
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat={viewMode === 'yearly' ? "yyyy" : viewMode === 'monthly' ? "MM/yyyy" : "dd/MM/yyyy"}
                            showMonthYearPicker={viewMode === 'monthly'}
                            showYearPicker={viewMode === 'yearly'}
                            locale="th"
                            className="text-xs font-black outline-none w-full pl-6 text-center text-gray-600 bg-transparent cursor-pointer"
                            popperClassName="z-50"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Bottom Row: Filters & Reset */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center border-t border-gray-50 pt-4">
             <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                <div className="relative">
                    <select className="pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#1a4d2e] appearance-none cursor-pointer font-bold text-xs text-gray-600 shadow-sm"
                        value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="ทั้งหมด">สถานะทั้งหมด</option>
                        <option value="Pending">รอตรวจสอบ</option>
                        <option value="Paid">ที่ต้องจัดส่ง</option>
                        <option value="Shipped">จัดส่งแล้ว</option>
                        <option value="Completed">สำเร็จ</option>
                        <option value="Cancelled">ยกเลิก</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                </div>
                <div className="relative">
                    <select className="pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#1a4d2e] appearance-none cursor-pointer font-bold text-xs text-gray-600 shadow-sm"
                        value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)}>
                        <option value="ทั้งหมด">จังหวัดทั้งหมด</option>
                        {thai_provinces.map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                </div>
             </div>
             
             <button onClick={handleReset} className="text-gray-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                 <RefreshCw size={14} /> ล้างค่าค้นหา
             </button>
        </div>
      </div>

      {/* 🔴 Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-[#1a4d2e] text-white p-3 px-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-up-fade">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">{selectedOrders.length}</div>
                <span className="font-bold text-sm">รายการที่เลือก</span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleBulkUpdate('Paid')} className="px-4 py-2 bg-white text-[#1a4d2e] hover:bg-gray-100 rounded-xl text-xs font-black transition-all shadow-md">ยืนยันชำระเงิน</button>
                <button onClick={() => handleBulkUpdate('Shipped')} className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-xl text-xs font-black transition-all shadow-md">ยืนยันจัดส่ง</button>
                <button onClick={() => handleBulkUpdate('Cancelled')} className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl text-xs font-black transition-all shadow-md">ยกเลิกรายการ</button>
            </div>
        </div>
      )}

      {/* 🟡 Orders Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 min-h-[400px]">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8fafc] text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <tr>
                        <th className="p-6 pl-8 w-10">
                            <input type="checkbox" 
                                className="w-4 h-4 rounded text-[#1a4d2e] focus:ring-[#1a4d2e] cursor-pointer"
                                onChange={(e) => setSelectedOrders(e.target.checked ? orders.map(o => o.id) : [])}
                                checked={orders.length > 0 && selectedOrders.length === orders.length}
                            />
                        </th>
                        <th className="p-6 w-24">รหัสคำสั่งซื้อ</th>
                        <th className="p-6">ข้อมูลลูกค้า</th>
                        <th className="p-6">รายการที่สั่ง</th>
                        <th className="p-6 text-right">ยอดรวม</th>
                        <th className="p-6 text-center">สถานะ</th>
                        <th className="p-6 text-center w-32">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                         <tr><td colSpan="7" className="p-12 text-center text-gray-400">กำลังโหลด...</td></tr>
                    ) : currentItems.length === 0 ? (
                         <tr><td colSpan="7" className="p-12 text-center text-gray-400">ไม่พบคำสั่งซื้อ</td></tr>
                    ) : (
                        currentItems.map((order) => (
                        <tr key={order.id} className={`hover:bg-[#fcfdfc] transition-colors group ${selectedOrders.includes(order.id) ? 'bg-green-50/30' : ''}`}>
                            <td className="p-4 pl-8">
                                <input type="checkbox" 
                                    className="w-4 h-4 rounded text-[#1a4d2e] focus:ring-[#1a4d2e] cursor-pointer"
                                    checked={selectedOrders.includes(order.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedOrders([...selectedOrders, order.id]);
                                        else setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                    }}
                                />
                            </td>
                            <td className="p-4 align-top">
                                <div className="font-mono font-bold text-[#1a4d2e] text-sm">#{order.id}</div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                    <Clock size={10}/> {order.date.split(' ')[0]}
                                </div>
                            </td>
                            <td className="p-4 align-top">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User size={16}/>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">{order.customer}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{order.tel || '-'}</div>
                                        {order.province && <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 font-bold border border-gray-200">{order.province}</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 align-top">
                                <div className="space-y-1">
                                    {/* Debug: Check items data */}
                                    {console.log(`Order ${order.id} items:`, order.items)}
                                    {order.items && order.items.length > 0 ? (
                                        <>
                                            {order.items.slice(0, 2).map((item, i) => {
                                                let name = typeof item === 'object' ? item.product : item;
                                                // Legacy String Cleanup: "Coffee (x1)" -> "Coffee"
                                                if (typeof name === 'string' && name.includes(' (x')) {
                                                    name = name.split(' (x')[0];
                                                }
                                                return (
                                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                                        <span className="truncate font-medium text-gray-700">{name}</span>
                                                    </div>
                                                );
                                            })}
                                            {order.items.length > 2 && <div className="text-[10px] text-gray-400 font-bold italic">+ อีก {order.items.length - 2} รายการ</div>}
                                        </>
                                    ) : (
                                        <span className="text-gray-300 text-xs italic">- ไม่มีสินค้า -</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-right align-top">
                                <span className="font-black text-[#1a4d2e] text-sm">฿{Number(order.total_price).toLocaleString()}</span>
                            </td>
                            <td className="p-4 text-center align-top">
                                {getStatusBadge(order.status)}
                            </td>
                            <td className="p-4 text-center align-top">
                                <div className="flex flex-col gap-2">
                                    {order.status === 'Pending' && (
                                        <button onClick={() => handleViewSlip(order)} className="w-full py-1.5 rounded-lg text-xs font-bold bg-[#1a4d2e] text-white hover:bg-[#143d24] shadow-sm shadow-green-900/20 transition-all">ตรวจสอบสลิป</button>
                                    )}
                                    {order.status === 'Paid' && (
                                        <button onClick={() => handleStatusChange(order.id, 'Shipped')} className="w-full py-1.5 rounded-lg text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition-all">ส่งสินค้า</button>
                                    )}
                                    {order.status === 'Shipped' && (
                                        <button onClick={() => handleStatusChange(order.id, 'Completed')} className="w-full py-1.5 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 shadow-sm transition-all">สำเร็จ</button>
                                    )}
                                    {(order.status === 'Pending' || order.status === 'Paid') && (
                                        <button onClick={() => handleStatusChange(order.id, 'Cancelled')} className="w-full py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all">ยกเลิก</button>
                                    )}
                                    {order.status === 'Cancelled' && (
                                        <button onClick={() => handleDelete(order.id)} className="w-full py-1.5 rounded-lg text-xs font-bold text-gray-400 bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-1"><Trash2 size={12}/> ลบรายการ</button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )))}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
            <div className="flex justify-between items-center p-6 border-t border-gray-50 bg-[#fcfcfc]">
                 <div className="text-xs font-bold text-gray-400">
                     แสดง {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, orders.length)} จาก {orders.length}
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={() => setCurrentPage(c => Math.max(1, c - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30"><ChevronLeft size={16}/></button>
                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                         <button key={p} onClick={()=>setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-black ${currentPage === p ? 'bg-[#1a4d2e] text-white' : 'hover:bg-gray-100 text-gray-500'}`}>{p}</button>
                     ))}
                     <button onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30"><ChevronRight size={16}/></button>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
}