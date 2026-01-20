import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Tag, Clock, Plus, Trash2, X, Info, Percent, 
    ChevronRight, Calendar, Users, Check, AlertCircle 
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';

const DatePickerStyles = () => (
    <style>{`
        #coupon-root .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 2rem;
            border: none;
            box-shadow: 0 20px 40px -10px rgba(79, 70, 229, 0.3);
            background: white;
            font-size: 0.85rem;
        }
        #coupon-root .react-datepicker__header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-bottom: none;
            padding: 1rem 0;
        }
        #coupon-root .react-datepicker__current-month, #coupon-root .react-datepicker__day-name {
            color: white;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.8rem;
        }
        #coupon-root .react-datepicker__day {
            color: #4b5563;
            font-weight: 600;
            margin: 0.3rem;
            width: 2.2rem;
            line-height: 2.2rem;
            transition: all 0.2s;
        }
        #coupon-root .react-datepicker__day:hover {
            background-color: #f5f3ff !important;
            color: #4f46e5 !important;
            border-radius: 0.8rem;
            transform: scale(1.1);
        }
        #coupon-root .react-datepicker__day--selected, #coupon-root .react-datepicker__day--keyboard-selected {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
            color: white !important;
            border-radius: 0.8rem;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        #coupon-root .react-datepicker__day--today {
            color: #4f46e5;
            font-weight: 900;
            position: relative;
        }
        #coupon-root .react-datepicker__day--today::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background: #4f46e5;
            border-radius: 9999px; /* full */
        }
        #coupon-root .react-datepicker__time-container {
            border-left: 1px solid #f5f3ff !important;
            width: 100px !important;
        }
        #coupon-root .react-datepicker__time-header {
            color: #4f46e5 !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
        }
        #coupon-root .react-datepicker__time-list-item--selected {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
            font-weight: bold !important;
        }
        #coupon-root .react-datepicker__navigation {
            top: 1.5rem;
        }
        #coupon-root .react-datepicker__input-container input:focus {
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
            border-color: #4f46e5 !important;
        }
        #coupon-root .react-datepicker__day--outside-month {
            color: #e5e7eb !important;
        }
    `}</style>
);

const CouponManagement = () => {
    const { token: authContextToken } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'fixed',
        discount_value: '',
        min_spend: 0,
        usage_limit: 100,
        max_use_per_user: 1,
        start_date: '',
        end_date: '',
        active: true
    });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    // Refs for DatePickers
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    const API_BASE_URL = "http://localhost:8000";

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const token = authContextToken || localStorage.getItem('token');
            if (!token) {
                console.warn("No token found, redirecting to login.");
                 Swal.fire({
                    title: 'Session หมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่',
                    icon: 'warning',
                    confirmButtonText: 'ไปหน้า Login'
                }).then(() => {
                    window.location.href = '/admin/login';
                });
                return;
            }
            const res = await axios.get(`${API_BASE_URL}/api/admin/coupons/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setCoupons(res.data);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                Swal.fire({
                    title: 'Session หมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่',
                    icon: 'warning',
                    confirmButtonText: 'ไปหน้า Login'
                }).then(() => {
                    window.location.href = '/admin/login';
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = authContextToken || localStorage.getItem('token');
            if (!token) {
                 Swal.fire({
                    title: 'ข้อผิดพลาด',
                    text: 'ไม่พบ Token กรุณาเข้าสู่ระบบใหม่',
                    icon: 'error',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    window.location.href = '/admin/login';
                });
                return;
            }

            // ✅ Fix: Backend uses POST for both Create and Update (checks 'id' in body)
            // Also URL for update usually doesn't need ID if body has it, BUT if backend view requires ID in URL for 'PUT', we must match.
            // However, looking at backend code: cid = request.data.get('id') handles update in POST.
            // So we use POST always, and base URL.
            
            const url = `${API_BASE_URL}/api/admin/coupons/`; 
            const method = 'post';
            
            await axios[method](url, formData, {
                headers: { Authorization: `Token ${token}` }
            });
            
            Swal.fire({
                title: 'สำเร็จ!',
                text: isEditing ? 'อัปเดตคูปองเรียบร้อยแล้ว' : 'สร้างคูปองใหม่สำเร็จ',
                icon: 'success',
                confirmButtonColor: '#4f46e5'
            });
            setShowModal(false);
            fetchCoupons();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                Swal.fire({
                    title: 'Session หมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่เพื่อบันทึกข้อมูล',
                    icon: 'warning',
                    confirmButtonText: 'ไปหน้า Login'
                }).then(() => {
                    window.location.href = '/admin/login';
                });
            } else {
                Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ 
            title: 'ยืนยันการลบ?', 
            text: "คูปองนี้จะไม่สามารถกู้คืนได้",
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบทันที'
        });
        if (result.isConfirmed) {
            try {
                const token = authContextToken || localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/admin/coupons/${id}/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                fetchCoupons();
                Swal.fire('ลบสำเร็จ!', '', 'success');
            } catch (error) { Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบได้', 'error'); }
        }
    };

    const openEdit = (coupon) => {
        setFormData(coupon);
        setSelectedCoupon(coupon); // Set selected coupon for update
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discount_type: 'fixed',
            discount_value: '',
            min_spend: 0,
            usage_limit: 100,
            max_use_per_user: 1,
            start_date: new Date().toISOString().slice(0, 16),
            end_date: new Date().toISOString().slice(0, 16),
            active: true,
            allowed_roles: []
        });
        setSelectedCoupon(null);
        setIsEditing(false);
    };

    return (
        <div id="coupon-root" className="p-8 bg-gray-50/50 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
             <div className="max-w-7xl mx-auto flex flex-col items-center mb-16 text-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-2xl shadow-indigo-200 rotate-3">
                            <Ticket size={36} />
                        </div>
                        Coupon <span className="text-indigo-600">Vault</span>
                    </h1>
                    <p className="text-gray-500 font-bold text-lg max-w-xl">สร้างและจัดการคูปองส่วนลด เพื่อดึงดูดลูกค้าและกระตุ้นยอดขายของคุณ</p>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        resetForm();
                        setIsEditing(false);
                        setShowModal(true);
                    }}
                    className="mt-8 group bg-indigo-600 text-white pl-8 pr-10 py-5 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-300 transition-all flex items-center gap-4 font-black text-xl"
                >
                    <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>สร้างคูปองใหม่</span>
                </motion.button>
            </div>
            <DatePickerStyles />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {coupons.map((coupon) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        key={coupon.id} 
                        className="relative group h-full"
                    >
                        {/* Ticket Style Card */}
                        <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-indigo-100 transition-all relative overflow-hidden h-full flex flex-col">
                            
                            {/* Notches for Ticket Effect */}
                            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gray-50 rounded-full border border-gray-100 -translate-y-1/2" />
                            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gray-50 rounded-full border border-gray-100 -translate-y-1/2" />

                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.active ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200'}`}>
                                    {coupon.active ? 'Available' : 'Disabled'}
                                </div>
                                <div className="text-indigo-600 font-black text-xs uppercase flex items-center gap-1 opacity-50">
                                    <Tag size={12} />
                                    Promo
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center mb-6 text-center">
                                <span className="text-indigo-600 font-black text-5xl mb-2 tracking-tighter">
                                    {coupon.discount_type === 'percent' ? `${parseInt(coupon.discount_value)}%` : `฿${parseInt(coupon.discount_value)}`}
                                    <span className="text-xl ml-1 text-gray-400">OFF</span>
                                </span>
                                <div className="bg-gray-50 px-6 py-2 rounded-xl border border-gray-200 flex items-center gap-3 group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-colors">
                                    <span className="font-black text-gray-800 tracking-wider text-lg uppercase select-all">{coupon.code}</span>
                                    <Info size={16} className="text-gray-300" />
                                </div>
                            </div>

                            <div className="space-y-4 text-sm font-bold text-gray-500 mb-8 border-t-2 border-dotted border-gray-100 pt-6">
                                 <div className="flex justify-between items-center px-2">
                                    <span className="uppercase text-[10px] tracking-widest opacity-60">Min Spend</span>
                                    <span className="text-gray-800 tracking-tight">฿{parseInt(coupon.min_spend).toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between items-center px-2">
                                    <span className="uppercase text-[10px] tracking-widest opacity-60">Redemptions</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${(coupon.used_count/coupon.usage_limit)*100}%` }} />
                                        </div>
                                        <span className="text-gray-800">{coupon.used_count}/{coupon.usage_limit}</span>
                                    </div>
                                 </div>
                                 <div className="flex justify-between items-center px-2">
                                    <span className="uppercase text-[10px] tracking-widest opacity-60">Expires On</span>
                                    <span className="text-indigo-500">{new Date(coupon.end_date).toLocaleDateString('th-TH')}</span>
                                 </div>
                            </div>

                            <div className="flex gap-3 mt-auto relative z-10">
                                <button onClick={() => openEdit(coupon)} className="flex-[2] bg-indigo-50 text-indigo-700 py-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-sm font-black uppercase tracking-widest shadow-sm">Manage</button>
                                <button onClick={() => handleDelete(coupon.id)} className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-sm font-black uppercase flex items-center justify-center">
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:bg-indigo-100 transition-colors pointer-events-none" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-indigo-950/20 backdrop-blur-md" 
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-[1001] border border-white"
                        >
                            <div className="p-10 bg-indigo-600 text-white flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                                <div className="relative">
                                    <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <Ticket size={32} />
                                        {isEditing ? 'Update' : 'Generate'} <span className="text-indigo-200">Coupon</span>
                                    </h2>
                                    <p className="text-indigo-100 font-bold text-sm mt-1 opacity-80 uppercase tracking-widest">ตั้งค่าเงื่อนไข</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto bg-white custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">รหัสคูปอง (A-Z, 0-9 เท่านั้น)</label>
                                        <input 
                                            type="text" 
                                            value={formData.code} 
                                            onChange={e => {
                                                const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                                                setFormData({...formData, code: val});
                                            }}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-black transition-all outline-none"
                                            placeholder="SUMMER2026"
                                            required 
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">ประเภทส่วนลด</label>
                                        <select 
                                            value={formData.discount_type} 
                                            onChange={e => setFormData({...formData, discount_type: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none appearance-none"
                                        >
                                            <option value="fixed">บาท (฿)</option>
                                            <option value="percent">เปอร์เซ็นต์ (%)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">มูลค่าส่วนลด</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="0"
                                                onKeyDown={(e) => ["-", "+", "e", "."].includes(e.key) && e.preventDefault()}
                                                value={formData.discount_value} 
                                                onChange={e => setFormData({...formData, discount_value: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none"
                                                required 
                                            />
                                            {formData.discount_type === 'percent' ? <Percent className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} /> : <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">฿</span>}
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">ยอดซื้อขั้นต่ำ</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            onKeyDown={(e) => ["-", "+", "e", "."].includes(e.key) && e.preventDefault()}
                                            value={formData.min_spend} 
                                            onChange={e => setFormData({...formData, min_spend: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">จำนวนสิทธิ์ทั้งหมด</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="1"
                                                onKeyDown={(e) => ["-", "+", "e", "."].includes(e.key) && e.preventDefault()}
                                                value={formData.usage_limit} 
                                                onChange={e => setFormData({...formData, usage_limit: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none"
                                            />
                                            <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">จำกัดการใช้ต่อคน</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="1"
                                                onKeyDown={(e) => ["-", "+", "e", "."].includes(e.key) && e.preventDefault()}
                                                value={formData.max_use_per_user} 
                                                onChange={e => setFormData({...formData, max_use_per_user: e.target.value})}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none"
                                            />
                                            <Users className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        </div>
                                    </div>
                                </div>

                                 <div className="grid grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">เริ่มใช้งานได้ตั้งแต่</label>
                                        <div className="relative">
                                            <DatePicker 
                                                ref={startDateRef}
                                                selected={formData.start_date ? new Date(formData.start_date) : null}
                                                onChange={date => setFormData({...formData, start_date: date})}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none block w-full"
                                                required 
                                            />
                                            <Calendar 
                                                size={20} 
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-300 cursor-pointer hover:text-indigo-500 transition-colors"
                                                onClick={() => startDateRef.current.setFocus()}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">หมดเขต</label>
                                        <div className="relative">
                                            <DatePicker 
                                                ref={endDateRef}
                                                selected={formData.end_date ? new Date(formData.end_date) : null}
                                                onChange={date => setFormData({...formData, end_date: date})}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl px-6 py-4 font-bold outline-none block w-full"
                                                required 
                                            />
                                            <Calendar 
                                                size={20} 
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-300 cursor-pointer hover:text-indigo-500 transition-colors"
                                                onClick={() => endDateRef.current.setFocus()}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 ml-4">จำกัดสิทธิ์เฉพาะกลุ่ม (Roles)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {/* All Users Button */}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, allowed_roles: [] })}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border-2 ${
                                                (formData.allowed_roles || []).length === 0
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 shadow-lg'
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                                            }`}
                                        >
                                            ไม่จำกัด (All)
                                        </button>

                                        {/* Specific Roles */}
                                        {['customer', 'new_user'].map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => {
                                                    const currentRoles = formData.allowed_roles || [];
                                                    const newRoles = currentRoles.includes(role)
                                                        ? currentRoles.filter(r => r !== role)
                                                        : [...currentRoles, role];
                                                    setFormData({ ...formData, allowed_roles: newRoles });
                                                }}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border-2 ${
                                                    (formData.allowed_roles || []).includes(role)
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200 shadow-lg'
                                                        : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                        <p className="text-[9px] text-gray-400 w-full mt-1 ml-2">
                                            * ไม่เลือก = ใช้ได้ทุกคน
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="p-6 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100/50">
                                    <label className="flex items-center gap-4 cursor-pointer mb-2">
                                         <div className="relative w-14 h-8">
                                             <input 
                                                type="checkbox"
                                                checked={formData.active}
                                                onChange={e => setFormData({...formData, active: e.target.checked})}
                                                className="sr-only peer"
                                             />
                                             <div className="w-full h-full bg-gray-200 peer-checked:bg-indigo-600 rounded-full transition-colors" />
                                             <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md" />
                                         </div>
                                         <span className="font-black text-indigo-900 uppercase tracking-widest text-xs">เปิดใช้งานคูปอง (Active)</span>
                                    </label>
                                    <p className="text-[10px] text-indigo-400 pl-[4.5rem] leading-relaxed">
                                        หากเปิดใช้งาน ลูกค้าจะสามารถใช้โค้ดนี้เพื่อรับส่วนลดได้ทันที <br/>
                                        (ในอนาคต: จะแสดงในหน้า "รวมคูปอง" สำหรับลูกค้าทั่วไป)
                                    </p>
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-indigo-100/50 hover:bg-indigo-700 transition-all mt-4 mb-4"
                                >
                                    {isEditing ? 'บันทึกการแก้ไข' : 'สร้างคูปอง'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CouponManagement;
