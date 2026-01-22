import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Tag, Clock, Plus, Trash2, X, Info, Percent, 
    ChevronRight, Calendar, Users, Check, AlertCircle 
} from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { th } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

registerLocale('th', th);

/* ✅ Premium SaaS Calendar Styles */
const DatePickerStyles = () => (
    <style>{`
        .react-datepicker {
            font-family: 'Inter', 'Sarabun', sans-serif;
            border: none;
            border-radius: 1.5rem;
            box-shadow: 0 20px 50px -12px rgba(79, 70, 229, 0.25); /* Purple shadow */
            font-size: 0.85rem;
            background-color: white;
            padding: 1rem;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .react-datepicker__header {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            border-bottom: none;
            padding: 1.2rem 0 0.8rem 0;
            border-radius: 1rem 1rem 0 0;
            margin: -1rem -1rem 1rem -1rem; /* Pull to edges */
        }
        .react-datepicker__current-month {
            color: white;
            font-weight: 800;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .react-datepicker__day-name {
            color: rgba(255, 255, 255, 0.8);
            font-weight: 700;
            width: 2.2rem;
            line-height: 2.2rem;
            margin: 0.1rem;
            font-size: 0.75rem;
        }
        .react-datepicker__day {
            color: #334155;
            width: 2.2rem;
            line-height: 2.2rem;
            margin: 0.1rem;
            border-radius: 50%; /* Circle days */
            font-weight: 600;
            transition: all 0.2s;
        }
        .react-datepicker__day:hover {
            background-color: #e0e7ff;
            color: #4f46e5;
            transform: scale(1.1);
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
            background-color: #4f46e5 !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }
        .react-datepicker__day--today {
            color: #4f46e5;
            font-weight: 900;
            position: relative;
        }
        .react-datepicker__day--today::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background: #4f46e5;
            border-radius: 50%;
        }
        .react-datepicker__day--selected::after {
             background: white;
        }
        .react-datepicker__navigation {
            top: 15px;
        }
        .react-datepicker__navigation-icon::before {
            border-color: white;
            border-width: 3px 3px 0 0;
            width: 8px;
            height: 8px;
        }
        .react-datepicker__triangle {
            display: none;
        }
        
        /* ✅ Popup Positioning - Floating Right */
        .react-datepicker-popper {
            z-index: 9999 !important;
        }
        /* Target the specific classes we add */
        .start-date-popper[data-placement^="right"],
        .end-date-popper[data-placement^="right"] {
            margin-left: 24px !important; /* Spacing from modal */
        }
        
        /* Time Select */
        .react-datepicker__time-container {
            border-left: 1px solid #f1f5f9;
            width: 80px;
        }
        .react-datepicker__header--time {
            padding-left: 0;
            padding-right: 0;
        }
        .react-datepicker__time-box {
            width: 80px !important;
            border-radius: 0 0 1rem 0;
        }
    `}</style>
);

const CouponManagement = () => {
    const { token: authContextToken } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '', 
        description: '', 
        discount_type: 'fixed',
        discount_value: '',
        max_discount_amount: '', 
        min_spend: 0,
        usage_limit: 100,
        limit_per_user: 1, 
        limit_per_user_per_day: 0, 
        start_date: '',
        end_date: '',
        active: true,
        is_public: true, 
        auto_apply: false, 
        is_stackable_with_flash_sale: false 
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

            if (!formData.code || formData.code.length < 3) {
                Swal.fire('ข้อผิดพลาด', 'รหัสคูปองต้องมีอย่างน้อย 3 ตัวอักษร', 'warning');
                return;
            }

            const url = isEditing && selectedCoupon 
                ? `${API_BASE_URL}/api/admin/coupons/${selectedCoupon.id}/` 
                : `${API_BASE_URL}/api/admin/coupons/`;
            
            const method = isEditing && selectedCoupon ? 'put' : 'post';
            
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
            console.error(error); // Log detailed error
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
                Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้: ' + (error.response?.data?.message || error.message), 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        // ... (existing helper) ...
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
        setSelectedCoupon(coupon); 
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            discount_type: 'fixed',
            discount_value: '',
            max_discount_amount: '',
            min_spend: 0,
            usage_limit: 100,
            limit_per_user: 1,
            limit_per_user_per_day: 0,
            active: true,
            is_public: true,
            auto_apply: false,
            is_stackable_with_flash_sale: false,
            start_date: new Date(),
            end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
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
                {coupons.length > 0 ? coupons.map((coupon) => (
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
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                    !coupon.active ? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' : 
                                    (Number(coupon.used_count) >= Number(coupon.usage_limit)) ? 'bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse' : 
                                    'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                                }`}>
                                    {!coupon.active ? 'Disabled' : (Number(coupon.used_count) >= Number(coupon.usage_limit)) ? <><AlertCircle size={10}/> หมด (Sold Out)</> : 'Available'}
                                </div>
                                <div className="text-indigo-600 font-black text-xs uppercase flex items-center gap-1 opacity-50">
                                    <Tag size={12} />
                                    Promo
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center mb-6 text-center">
                                <span className="text-indigo-600 font-black text-5xl mb-2 tracking-tighter">
                                    {coupon.discount_type === 'percent' ? `${Number(coupon.discount_value)}%` : `฿${Number(coupon.discount_value)}`}
                                    <span className="text-xl ml-1 text-gray-400">ส่วนลด</span>
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
                                    <span className="text-indigo-500">{new Date(coupon.end_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                )) : (
                     <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Ticket size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">ยังไม่มีคูปอง</h3>
                        <p className="text-gray-400 mt-2">กดปุ่มสร้างคูปองด้านบนได้เลย</p>
                    </div>
                )}
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
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[420px] overflow-visible relative z-[1001] border border-gray-100" // ✅ Compact 420px
                        >
                            {/* Minimal Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-[2rem]">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                        <Ticket size={18} />
                                    </div>
                                    GENERATE COUPON
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-50 p-1 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                {/* Campaign Info */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ชื่อแคมเปญ (Internal)</label>
                                        <input 
                                            type="text" 
                                            value={formData.name} 
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-medium text-gray-800 outline-none transition-all text-sm"
                                            placeholder="e.g. New Year 2026"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">รหัส (Code)</label>
                                            <input 
                                                type="text" 
                                                value={formData.code} 
                                                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase().slice(0, 15)})} 
                                                className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-indigo-600 outline-none transition-all tracking-wider text-sm text-center"
                                                placeholder="CODE (3-15 chars)"
                                                maxLength={15}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ประเภท (Type)</label>
                                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                                {['fixed', 'percent'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setFormData({...formData, discount_type: type})}
                                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${formData.discount_type === type ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                    >
                                                        {type === 'fixed' ? '฿ บาท' : '% ลด'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">รายละเอียด (Customer View)</label>
                                        <textarea 
                                            value={formData.description} 
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-medium text-gray-600 outline-none transition-all h-16 resize-none text-sm"
                                            placeholder="เงื่อนไขการใช้งาน..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ส่วนลด (Value)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                min="0"
                                                step="0.01"
                                                onKeyDown={(e) => ["-", "e", "+"].includes(e.key) && e.preventDefault()}
                                                value={formData.discount_value} 
                                                onChange={e => setFormData({...formData, discount_value: e.target.value})}
                                                className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-black text-gray-800 outline-none transition-all text-sm"
                                                placeholder="0.00"
                                                required 
                                            />
                                        </div>
                                    </div>
                                    
                                     {formData.discount_type === 'percent' ? (
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ลดสูงสุด (Max)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    placeholder="Unlimited"
                                                    value={formData.max_discount_amount} 
                                                    onChange={e => setFormData({...formData, max_discount_amount: e.target.value})}
                                                    className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                     ) : (
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ยอดซื้อขั้นต่ำ (Min)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={formData.min_spend} 
                                                    onChange={e => setFormData({...formData, min_spend: e.target.value})}
                                                    className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                     )}
                                </div>
                                
                                {formData.discount_type === 'percent' && (
                                     <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ยอดซื้อขั้นต่ำ (Min Spend)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={formData.min_spend} 
                                            onChange={e => setFormData({...formData, min_spend: e.target.value})}
                                            className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none transition-all text-sm"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">รวมจำนวน (Total)</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={formData.usage_limit} 
                                            onChange={e => setFormData({...formData, usage_limit: e.target.value})}
                                            className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ต่อคน (Per User)</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={formData.limit_per_user} 
                                            onChange={e => setFormData({...formData, limit_per_user: e.target.value})}
                                            className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-gray-800 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                     <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">วันเริ่ม (Start)</label>
                                        <div className="relative">
                                            <DatePicker 
                                                ref={startDateRef}
                                                selected={formData.start_date ? new Date(formData.start_date) : new Date()}
                                                onChange={date => setFormData({...formData, start_date: date})}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15} 
                                                minDate={new Date()} 
                                                popperPlacement="right-start"
                                                popperClassName="start-date-popper"
                                                portalId="root"
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                locale="th"
                                                dateFormat="d MMM yy HH:mm"
                                                className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none block w-full text-xs cursor-pointer"
                                                required 
                                            />
                                            <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">วันหมดเขต (End)</label>
                                        <div className="relative">
                                            <DatePicker 
                                                ref={endDateRef}
                                                selected={formData.end_date ? new Date(formData.end_date) : null}
                                                onChange={date => setFormData({...formData, end_date: date})}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15} 
                                                minDate={formData.start_date ? new Date(formData.start_date) : new Date()} 
                                                popperPlacement="right-start" 
                                                popperClassName="end-date-popper"
                                                portalId="root"
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                locale="th"
                                                dateFormat="d MMM yy HH:mm"
                                                className="w-full bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none block w-full text-xs cursor-pointer"
                                                required 
                                            />
                                            <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Roles */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">เฉพาะกลุ่ม (Roles)</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, allowed_roles: [] })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                (formData.allowed_roles || []).length === 0
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            All Users
                                        </button>
                                        {['customer', 'new_user'].map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => {
                                                    const current = formData.allowed_roles || [];
                                                    const newRoles = current.includes(role) ? current.filter(r => r !== role) : [...current, role];
                                                    setFormData({ ...formData, allowed_roles: newRoles });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                    (formData.allowed_roles || []).includes(role)
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Advanced Switches */}
                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">เปิดใช้งาน (Active)</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">แสดงใน Coupon Center</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.is_public} onChange={e => setFormData({...formData, is_public: e.target.checked})} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between">
                                         <span className="text-sm font-medium text-gray-700">Auto Apply (ในตะกร้า)</span>
                                         <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.auto_apply} onChange={e => setFormData({...formData, auto_apply: e.target.checked})} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between opacity-50 pointer-events-none grayscale">
                                         <span className="text-sm font-medium text-gray-700">ใช้ร่วมกับ Flash Sale (Stackable)</span>
                                         <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={formData.is_stackable_with_flash_sale} onChange={e => setFormData({...formData, is_stackable_with_flash_sale: e.target.checked})} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                                        </label>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    <Ticket size={20} />
                                    {isEditing ? 'บันทึกการแก้ไข' : 'สร้างคูปอง'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CouponManagement;
