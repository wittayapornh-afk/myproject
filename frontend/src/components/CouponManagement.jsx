import React, { useState, useEffect, useRef, forwardRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Tag, Clock, Plus, Trash2, X, Info, Percent, 
    ChevronRight, Calendar, Users, Check, AlertCircle, Search, Filter, 
    Truck, Settings, Copy, ChevronDown, ChevronUp, ChevronLeft, Edit2, Star,
    UserPlus, Crown, HelpCircle 
} from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { th } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

registerLocale('th', th);

/* ✅ Premium Calendar Styles (Indigo Theme) */
const DatePickerStyles = () => (
    <style>{`
        .react-datepicker {
            font-family: 'Inter', 'Sarabun', sans-serif;
            border: none;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border-radius: 1.5rem;
            padding: 1rem;
            background-color: #ffffff !important;
            width: 100%;
        }
        .react-datepicker__header {
            background-color: #ffffff !important;
            border-bottom: none;
            padding-bottom: 1rem;
        }
        .react-datepicker__month-container {
            width: 100%;
            background-color: #ffffff !important;
        }
        .react-datepicker__month {
            background-color: #ffffff !important;
            margin: 0;
        }
        .react-datepicker__day-names, .react-datepicker__week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            justify-items: center;
        }
        .react-datepicker__day-name, .react-datepicker__day {
            width: 2.5rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            border-radius: 9999px;
            font-weight: 700;
        }
        .react-datepicker__day-name {
            color: #9ca3af;
            text-transform: uppercase;
            font-size: 0.75rem;
            font-weight: 900;
            letter-spacing: 0.1em;
        }
        .react-datepicker__day {
            color: #374151;
            font-size: 0.875rem;
            transition: all 0.2s;
        }
        .react-datepicker__day:hover {
            background-color: #f3f4f6;
        }
        .react-datepicker__day--selected, .react-datepicker__day--selected:hover {
            background-color: #4f46e5; /* Indigo-600 */
            color: white;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }
        .react-datepicker__day--keyboard-selected {
            background-color: transparent;
            color: #374151;
        }
        .react-datepicker__day--disabled {
            color: #e5e7eb !important;
            opacity: 0.3 !important;
            pointer-events: none !important;
        }
        .react-datepicker__day--outside-month {
            opacity: 0;
            pointer-events: none;
        }
        .react-datepicker-popper {
            z-index: 99999 !important;
        }
    `}</style>
);

// ✅ Custom Date Input (Indigo Theme)
const CustomDateInput = forwardRef(({ value, onClick, label, icon: Icon, onQuickSelect }, ref) => (
    <div className="flex flex-col gap-2 w-full group">
        {label && (
            <div className="flex justify-between items-center mb-0.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 ml-1 opacity-70">
                    {Icon && <Icon size={12} />} {label}
                </label>
                <div className="flex gap-1">
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickSelect(new Date()); }}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 uppercase tracking-wider"
                    >
                        Today
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            onQuickSelect(tomorrow);
                        }}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 uppercase tracking-wider"
                    >
                        Tmrw
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            onQuickSelect(nextWeek);
                        }}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 uppercase tracking-wider"
                    >
                        +7D
                    </button>
                </div>
            </div>
        )}
        <button
            type="button"
            className="w-full bg-white border border-gray-200 text-gray-800 font-black text-lg rounded-[1.5rem] px-5 py-4 hover:border-indigo-500 focus:border-indigo-500 focus:ring-[6px] focus:ring-indigo-100 transition-all flex items-center justify-between gap-3 shadow-sm active:scale-[0.98] group-hover:bg-indigo-50/20 overflow-hidden relative"
            onClick={onClick}
            ref={ref}
        >
            <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl group-hover:rotate-12 transition-transform">
                    <Calendar size={22} />
                </div>
                <span>{value || "Select Date"}</span>
            </div>
            <ChevronDown size={18} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-y-0.5 transition-all" />
        </button>
    </div>
));

// ✅ Thai Time Picker with Input & Validation
const ThaiTimePicker = ({ value, onDateChange, minDate }) => {
    const dateValue = value instanceof Date ? value : new Date();
    
    // Adjust Time (Arrows)
    const adjustDate = (type, direction) => {
        const newDate = new Date(dateValue);
        if (type === 'mm') {
            newDate.setMinutes(newDate.getMinutes() + direction);
        } else {
            newDate.setHours(newDate.getHours() + direction);
        }
        
        // ✅ V3 Validation: Allow Future Adjustments, Block Past (Minute Precision)
        const now = new Date();
        const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const targetMinute = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes());

        if (targetMinute < currentMinute) return; // Block strictly past minutes
        
        onDateChange(newDate);
    };

    // Manual Input
    const handleInputChange = (type, val) => {
        let num = parseInt(val, 10);
        if (isNaN(num)) return; // Don't update if not number

        const newDate = new Date(dateValue);
        
        if (type === 'hh') {
            num = Math.max(0, Math.min(23, num)); 
            newDate.setHours(num);
        } else {
            num = Math.max(0, Math.min(59, num)); 
            newDate.setMinutes(num);
        }

        // ✅ V3 Validation: Allow Future Adjustments, Block Past (Minute Precision)
        const now = new Date();
        const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const targetMinute = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes());

        if (targetMinute < currentMinute) {
             onDateChange(new Date(now)); // Snap to now if invalid
        } else {
             onDateChange(newDate);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 mt-2 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time</span>
            </div>
            <div className="flex items-center gap-3">
                {/* Hour */}
                <div className="flex flex-col items-center">
                    <button type="button" onClick={() => adjustDate('hh', 1)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><ChevronUp size={14}/></button>
                    <input 
                        type="number" 
                        value={dateValue.getHours().toString().padStart(2,'0')}
                        onChange={(e) => handleInputChange('hh', e.target.value)}
                        className="text-xl font-black text-indigo-900 w-12 text-center bg-transparent border-none focus:ring-0 p-0 appearance-none"
                    />
                    <button type="button" onClick={() => adjustDate('hh', -1)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><ChevronDown size={14}/></button>
                </div>
                <span className="text-gray-300 font-bold">:</span>
                {/* Minute */}
                <div className="flex flex-col items-center">
                    <button type="button" onClick={() => adjustDate('mm', 1)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><ChevronUp size={14}/></button>
                    <input 
                        type="number" 
                        value={dateValue.getMinutes().toString().padStart(2,'0')}
                        onChange={(e) => handleInputChange('mm', e.target.value)}
                        className="text-xl font-black text-indigo-900 w-12 text-center bg-transparent border-none focus:ring-0 p-0 appearance-none"
                    />
                    <button type="button" onClick={() => adjustDate('mm', -1)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><ChevronDown size={14}/></button>
                </div>
            </div>
        </div>
    );
};

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
        is_stackable_with_flash_sale: false,
        allowed_roles: [], // ✅ Customer Eligibility
        conditions: { applicable_tags: [] } // ✅ Tag Rules
    });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [errors, setErrors] = useState({}); // ✅ Validation Errors State

    // 🔍 Filter States
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterNoMin, setFilterNoMin] = useState(false); // ✅ New Filter
    const [filterNewUser, setFilterNewUser] = useState(false); // ✅ New Filter
    const [searchTerm, setSearchTerm] = useState('');

    // Refs for DatePickers
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    const API_BASE_URL = "http://localhost:8000";

    const [tags, setTags] = useState([]); // ✅ Tags State
    
    useEffect(() => {
        fetchCoupons();
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/tags/`);
            setTags(res.data);
        } catch (err) {
            console.error("Error fetching tags:", err);
        }
    };

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


            // Handle Free Shipping logic (จัดการค่าลดเมื่อเป็นส่งฟรี)
            if (formData.discount_type === 'free_shipping') {
                formData.discount_value = 0;
            }

            const discountVal = parseFloat(formData.discount_value) || 0;
            const maxDiscount = parseFloat(formData.max_discount_amount) || 0;
            const minSpend = parseFloat(formData.min_spend) || 0;

            // ✅ 1. ห้ามแจก 0 บาท (Discount > 0)
            if (formData.discount_type !== 'free_shipping' && discountVal <= 0) {
                setErrors({...errors, discount_value: 'มูลค่าส่วนลดต้องมากกว่า 0 บาท'});
                return;
            }

            // ✅ 2. เปอร์เซ็นต์ห้ามเกินร้อย (Percent <= 100)
            if (formData.discount_type === 'percent' && discountVal > 100) {
                 setErrors({...errors, discount_value: 'ส่วนลดเปอร์เซ็นต์ต้องไม่เกิน 100%'});
                 return;
            }

            // ✅ 3. ห้ามขาดทุน (Fixed Discount < Min Spend)
            if (formData.discount_type === 'fixed') {
                if (minSpend > 0 && discountVal >= minSpend) {
                     setErrors({
                         ...errors, 
                         discount_value: `ส่วนลด (฿${discountVal}) ต้องน้อยกว่ายอดซื้อขั้นต่ำ`,
                         min_spend: `ยอดซื้อขั้นต่ำ (฿${minSpend}) ต้องมากกว่าส่วนลด`
                     });
                     return; 
                }
            } else if (formData.discount_type === 'percent') {
                 if (maxDiscount > 0 && minSpend <= maxDiscount) {
                     setErrors({...errors, min_spend: `ยอดซื้อขั้นต่ำต้องมากกว่าส่วนลดสูงสุด (฿${maxDiscount})`});
                     return;
                 }
            }

            // ✅ 4. เช็ควันเวลา (Start < End)
            if (formData.start_date && formData.end_date) {
                const start = new Date(formData.start_date);
                const end = new Date(formData.end_date);
                if (start >= end) {
                    Swal.fire('ข้อผิดพลาด', 'วันเริ่มต้องมาก่อนวันสิ้นสุด', 'warning');
                    return;
                }
            }

            // ✅ 5. ต้องมีจำนวนจำกัด (Usage Limit > 0) & Limit Per User > 0
            const limit = parseInt(formData.usage_limit) || 0;
            const perUser = parseInt(formData.limit_per_user) || 0;
            
            if (limit <= 0) {
                Swal.fire('ข้อผิดพลาด', 'กรุณาระบุจำนวนสิทธิ์รวม (Usage Limit) ให้ถูกต้อง (ต้องมากกว่า 0)', 'warning');
                return;
            }
            if (perUser <= 0) {
                Swal.fire('ข้อผิดพลาด', 'กรุณาระบุจำนวนสิทธิ์ขต่อคน (Limit Per User) ให้ถูกต้อง (ต้องมากกว่า 0)', 'warning');
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

    // ✅ Toggle Status Function
    const handleStatusToggle = async (id, currentStatus) => {
        try {
            const token = authContextToken || localStorage.getItem('token');
            // Optimistic Update
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
            
            await axios.patch(`${API_BASE_URL}/api/admin/coupons/${id}/`, { active: !currentStatus }, {
                headers: { Authorization: `Token ${token}` }
            });
            
            // Refetch to ensure sync
            // fetchCoupons(); 
        } catch (error) {
            console.error("Failed to toggle status", error);
            // Revert on error
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: currentStatus } : c));
            Swal.fire('Error', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
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
            start_date: new Date(),
            end_date: new Date(new Date().setDate(new Date().getDate() + 7)),
            allowed_roles: [],
            conditions: {}
        });
        setSelectedCoupon(null);
        setIsEditing(false);
    };

    // 🔍 Filter Logic (ตรรกะการกรองข้อมูล)
    const filteredCoupons = coupons.filter(coupon => {
        // 1. Search (ค้นหาจากรหัสหรือชื่อ)
        const searchLower = searchTerm.toLowerCase();
        const codeMatch = coupon.code.toLowerCase().includes(searchLower);
        const nameMatch = coupon.name?.toLowerCase().includes(searchLower);
        if (!codeMatch && !nameMatch) return false;

        // 2. Type Filter (กรองตามประเภทคูปอง)
        if (filterType !== 'all' && coupon.discount_type !== filterType) return false;

        // 3. Status Filter (กรองตามสถานะ)
        const now = new Date();
        const start = new Date(coupon.start_date);
        const end = new Date(coupon.end_date);
        
        // เช็คสถานะต่างๆ
        const isExpired = now > end; // หมดอายุ
        const isUpcoming = now < start; // ยังไม่เริ่ม
        const isSoldOut = parseInt(coupon.usage_limit) > 0 && parseInt(coupon.used_count) >= parseInt(coupon.usage_limit); // สิทธิ์เต็ม
        
        // Active = เปิดใช้งาน + ไม่หมดอายุ + ไม่เต็ม + ถึงเวลาเริ่มแล้ว
        const isActive = coupon.active && !isExpired && !isSoldOut && !isUpcoming;

        if (filterStatus === 'active') return isActive; // แสดงเฉพาะที่ใช้งานได้จริง
        if (filterStatus === 'inactive') return !coupon.active; // ปิดการใช้งาน (Active = False)
        if (filterStatus === 'expired') return isExpired; // หมดอายุแล้ว
        if (filterStatus === 'sold_out') return isSoldOut; // สิทธิ์เต็มแล้ว
        if (filterStatus === 'upcoming') return isUpcoming; // ยังไม่ถึงเวลาเริ่ม

        // 4. Advanced Filters
        if (filterNoMin && Number(coupon.min_spend) > 0) return false;
        if (filterNewUser && !coupon.conditions?.new_user) return false;

        return true;
    });

    return (
        <div id="coupon-root" className="p-12 md:p-20 lg:p-28 bg-gray-50/50 min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
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

            {/* 🔍 Filters Bar */}
            <div className="max-w-7xl mx-auto mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center flex-1">
                    <div className="flex items-center gap-2 text-gray-400 px-2">
                        <Filter size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Filters:</span>
                    </div>
                    
                    {/* Status Tabs */}
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto max-w-full no-scrollbar">
                        {[
                            { id: 'all', label: 'ทั้งหมด' },
                            { id: 'active', label: 'ใช้งานได้' },
                            { id: 'upcoming', label: 'เร็วๆนี้' },
                            { id: 'expired', label: 'หมดอายุ' },
                            { id: 'sold_out', label: 'สิทธิ์เต็ม' },
                            { id: 'inactive', label: 'ปิดใช้งาน' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterStatus(tab.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                    filterStatus === tab.id 
                                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 hidden lg:block mx-2"></div>

                    {/* Type Select */}
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-medium outline-none cursor-pointer hover:bg-white transition-colors"
                    >
                        <option value="all">ทุกประเภท</option>
                        <option value="fixed">ส่วนลดบาท (Fixed)</option>
                        <option value="percent">ส่วนลด % (Percent)</option>
                        <option value="free_shipping">ส่งฟรี (Free Shipping)</option>
                    </select>

                    {/* ✅ New Filters: No Min & New User */}
                    <div className="flex gap-2">
                         <button
                            onClick={() => setFilterNoMin(!filterNoMin)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                                filterNoMin ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                            }`}
                         >
                            {filterNoMin && <Check size={12} />}
                            ไม่มีขั้นต่ำ
                         </button>
                         <button
                            onClick={() => setFilterNewUser(!filterNewUser)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                                filterNewUser ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                            }`}
                         >
                            {filterNewUser && <Check size={12} />}
                            ลูกค้าใหม่
                         </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-72">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 outline-none font-medium placeholder-gray-400 transition-all focus:bg-white" 
                        placeholder="ค้นหารหัส หรือ ชื่อแคมเปญ..." 
                    />
                </div>
            </div>

            {/* 📋 Data Table Layout */}
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                <th className="p-6">รหัส / ชื่อ (Code / Name)</th>
                                <th className="p-6 text-center">ประเภท (Type)</th>
                                <th className="p-6">การใช้งาน (Usage)</th>
                                <th className="p-6 text-center">สถานะ (Status)</th>
                                <th className="p-6 text-right">จัดการ (Manage)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    {/* 1. Code / Name */}
                                    <td className="p-6 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-black text-lg text-gray-800 tracking-wide flex items-center gap-2">
                                                {coupon.code}
                                                <button 
                                                    onClick={() => {navigator.clipboard.writeText(coupon.code); Swal.fire({toast:true, position:'top-end', icon:'success', title:'Copied', showConfirmButton:false, timer:1000})}}
                                                    className="text-gray-300 hover:text-indigo-500 transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </span>
                                            <span className="text-sm text-gray-400 font-medium mt-1">{coupon.name}</span>
                                            <span className="text-xs text-gray-300 mt-0.5 line-clamp-1">{coupon.description}</span>
                                        </div>
                                    </td>

                                    {/* 2. Type */}
                                    <td className="p-6 align-top text-center">
                                        <div className={`inline-flex flex-col items-center justify-center px-4 py-2 rounded-xl border min-w-[100px] ${
                                            coupon.discount_type === 'free_shipping' 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' // Green for Free Shipping
                                            : coupon.discount_type === 'percent'
                                                ? 'bg-purple-50 border-purple-100 text-purple-600'
                                                : 'bg-blue-50 border-blue-100 text-blue-600'
                                        }`}>
                                            <span className="font-black text-lg leading-none">
                                                {coupon.discount_type === 'free_shipping' 
                                                    ? <Truck size={20} />
                                                    : coupon.discount_type === 'percent' 
                                                        ? `${Number(coupon.discount_value)}%` 
                                                        : `฿${Number(coupon.discount_value)}`
                                                }
                                            </span>
                                            <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">
                                                {coupon.discount_type === 'free_shipping' ? 'ส่งฟรี' : coupon.discount_type === 'percent' ? 'ส่วนลด' : 'ลดบาท'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* 3. Usage */}
                                    <td className="p-6 align-middle min-w-[200px]">
                                        <div className="w-full">
                                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                                                <span>{coupon.used_count} Used</span>
                                                <span className="opacity-50">Limit: {coupon.usage_limit}</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        (coupon.used_count/coupon.usage_limit) >= 1 ? 'bg-red-500' 
                                                        : (coupon.used_count/coupon.usage_limit) > 0.8 ? 'bg-amber-400' 
                                                        : 'bg-indigo-500'
                                                    }`} 
                                                    style={{ width: `${Math.min((coupon.used_count/coupon.usage_limit)*100, 100)}%` }} 
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium">
                                                <Clock size={10} />
                                                <span>End: {new Date(coupon.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year:'2-digit' })}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 4. Status */}
                                    <td className="p-6 align-middle text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            {/* Badge */}
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                !coupon.active ? 'bg-gray-50 text-gray-400 border-gray-200' : 
                                                (Number(coupon.used_count) >= Number(coupon.usage_limit)) ? 'bg-red-50 text-red-500 border-red-100' : 
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                                {!coupon.active ? 'Inactive' : (Number(coupon.used_count) >= Number(coupon.usage_limit)) ? 'Sold Out' : 'Active'}
                                            </span>

                                            {/* Toggle */}
                                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                                <input 
                                                    type="checkbox" 
                                                    checked={coupon.active} 
                                                    onChange={() => handleStatusToggle(coupon.id, coupon.active)} 
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 hover:bg-gray-300 peer-checked:hover:bg-emerald-600 transition-colors"></div>
                                            </label>
                                        </div>
                                    </td>

                                    {/* 5. Manage */}
                                    <td className="p-6 align-middle text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button 
                                                onClick={() => openEdit(coupon)}
                                                className="w-10 h-10 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center border border-indigo-100 shadow-sm active:scale-95"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(coupon.id)}
                                                className="w-10 h-10 rounded-xl bg-white text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center border border-red-100 shadow-sm active:scale-95"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Search size={24} className="opacity-50" />
                                            </div>
                                            <p className="font-bold">ไม่พบข้อมูลคูปอง</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🌟 Redesigned Glassmorphism Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:pl-72">
                        {/* Backdrop with Blur */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-indigo-950/20 backdrop-blur-md" 
                            onClick={() => setShowModal(false)}
                        />
                        
                        {/* Modal Content */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden relative z-[1001] border border-white/50"
                        >
                            {/* 🎨 Header Section */}
                            <div className="relative px-8 py-6 bg-gradient-to-br from-indigo-50/50 to-white border-b border-indigo-50/50 flex justify-between items-center overflow-hidden">
                                {/* Decorative Background Elements */}
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-purple-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                                        <span className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                                            <Ticket size={22} />
                                        </span>
                                        {isEditing ? 'Edit Coupon' : 'New Coupon'}
                                    </h2>
                                    <p className="text-xs font-bold text-gray-400 mt-1 ml-1 tracking-wide uppercase">
                                        {isEditing ? 'แก้ไขข้อมูลคูปอง' : 'สร้างคูปองส่วนลดใหม่'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    className="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 border border-gray-100 shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            
                            {/* 📝 Form Content */}
                            <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Identity & Schedule */}
                                    <div className="space-y-6">
                                        {/* 1. Campaign Identity */}
                                        <div className="space-y-4">
                                            {/* Campaign Name */}
                                            <div className="group">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-noto">
                                                    <Tag size={12} /> ชื่อแคมเปญ (Internal)
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={formData.name} 
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                    className="w-full bg-gray-50/50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3 font-semibold text-gray-700 outline-none transition-all placeholder-gray-300"
                                                    placeholder="ตั้งชื่อแคมเปญ (Internal Only)"
                                                />
                                            </div>

                                            {/* Coupon Code */}
                                            <div>
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-noto">
                                                    <Ticket size={12} /> รหัสคูปอง (Code)
                                                </label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        value={formData.code} 
                                                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15)})} 
                                                        className="w-full bg-white border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-4 py-3 font-black text-lg text-indigo-600 outline-none transition-all tracking-widest text-center shadow-sm placeholder-indigo-200 uppercase"
                                                        placeholder="CODE2026"
                                                        maxLength={15}
                                                        required
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 pointer-events-none">
                                                        {formData.code.length}/15
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Schedule (Timeline) */}
                                        <div>
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-noto">
                                                <Clock size={12} /> ระยะเวลาโปรโมชั่น
                                            </label>
                                            <div className="flex flex-col gap-4">
                                                <div className="w-full">
                                                    <DatePicker 
                                                        selected={formData.start_date ? new Date(formData.start_date) : null} 
                                                        onChange={date => setFormData({...formData, start_date: date})}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        timeIntervals={60}
                                                        dateFormat="d MMM yyyy"
                                                        locale="th" 
                                                        minDate={new Date()} 
                                                        customInput={<CustomDateInput label="เริ่มแคมเปญ" icon={Calendar} onQuickSelect={(d) => setFormData({...formData, start_date: d})} />}
                                                        popperPlacement="right-start"
                                                        popperProps={{ strategy: 'fixed' }}
                                                        renderCustomHeader={({
                                                            date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled
                                                        }) => (
                                                            <div className="flex items-center justify-between px-2 py-2">
                                                                <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} className="text-gray-400" /></button>
                                                                <div className="font-black text-gray-700 text-lg">
                                                                    {date.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
                                                                </div>
                                                                <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} className="text-gray-400" /></button>
                                                            </div>
                                                        )}
                                                    >
                                                        <ThaiTimePicker 
                                                            value={formData.start_date ? new Date(formData.start_date) : new Date()} 
                                                            onDateChange={(d) => setFormData({...formData, start_date: d})}
                                                            minDate={new Date()} 
                                                        />
                                                    </DatePicker>
                                                </div>
                                                
                                                <div className="w-full">
                                                    <DatePicker 
                                                        selected={formData.end_date ? new Date(formData.end_date) : null} 
                                                        onChange={date => setFormData({...formData, end_date: date})}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        timeIntervals={60}
                                                        dateFormat="d MMM yyyy"
                                                        locale="th"
                                                        minDate={formData.start_date ? new Date(formData.start_date) : new Date()} 
                                                        customInput={<CustomDateInput label="สิ้นสุดแคมเปญ" icon={Calendar} onQuickSelect={(d) => setFormData({...formData, end_date: d})} />}
                                                        popperPlacement="right-start"
                                                        popperProps={{ strategy: 'fixed' }}
                                                        renderCustomHeader={({
                                                            date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled
                                                        }) => (
                                                            <div className="flex items-center justify-between px-2 py-2">
                                                                <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18} className="text-gray-400" /></button>
                                                                <div className="font-black text-gray-700 text-lg">
                                                                    {date.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
                                                                </div>
                                                                <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={18} className="text-gray-400" /></button>
                                                            </div>
                                                        )}
                                                    >
                                                        <ThaiTimePicker 
                                                            value={formData.end_date ? new Date(formData.end_date) : new Date()} 
                                                            onDateChange={(d) => setFormData({...formData, end_date: d})}
                                                            minDate={formData.start_date ? new Date(formData.start_date) : new Date()}
                                                        />
                                                    </DatePicker>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Rules & Controls */}
                                    <div className="space-y-6">
                                        {/* 2. Discount Rules */}
                                        <div className="bg-gray-50/80 rounded-3xl p-5 border border-gray-100 space-y-4">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 font-noto">
                                                <Settings size={12} /> เงื่อนไขส่วนลด
                                            </label>
                                            
                                            {/* Type Selector */}
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'fixed', label: 'Fixed', sub: 'บาท', icon: '฿', color: 'blue' },
                                                    { id: 'percent', label: 'Percent', sub: '% ลด', icon: '%', color: 'purple' },
                                                    { id: 'free_shipping', label: 'Free Ship', sub: 'ส่งฟรี', icon: <Truck size={14}/>, color: 'emerald' }
                                                ].map(type => (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => {
                                                            // ✅ Auto-reset "No Min Spend" if switching to Fixed/Percent
                                                            const shouldResetMin = formData.min_spend === 0 && type.id !== 'free_shipping';
                                                            setFormData({
                                                                ...formData, 
                                                                discount_type: type.id,
                                                                min_spend: shouldResetMin ? '' : formData.min_spend
                                                            });
                                                        }}
                                                        className={`relative overflow-hidden rounded-2xl p-3 flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2 ${
                                                            formData.discount_type === type.id 
                                                            ? `bg-white border-${type.color}-500 shadow-lg shadow-${type.color}-500/20 scale-105 z-10`
                                                            : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className={`text-base font-black ${formData.discount_type === type.id ? `text-${type.color}-600` : 'text-gray-400'}`}>
                                                            {type.icon}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase">{type.sub}</div>
                                                        {formData.discount_type === type.id && (
                                                            <motion.div layoutId="activeType" className={`absolute inset-0 bg-${type.color}-500/5 mix-blend-multiply`} />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Value Inputs */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {formData.discount_type !== 'free_shipping' && (
                                                    <div className="col-span-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block pl-1 font-noto">มูลค่าส่วนลด</label>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            max={formData.discount_type === 'percent' ? "100" : undefined}
                                                            value={formData.discount_value} 
                                                            onKeyDown={(e) => ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()}
                                                            onChange={e => {
                                                                let val = e.target.value;
                                                                if (formData.discount_type === 'percent') {
                                                                    if (Number(val) > 100) val = "100";
                                                                } else {
                                                                    if (Number(val) > 9999999) val = "9999999"; // Limit to 9,999,999
                                                                }
                                                                
                                                                // ✅ Clear Error on Change
                                                                if (errors.discount_value) setErrors({...errors, discount_value: null});
                                                                
                                                                setFormData({...formData, discount_value: val});
                                                            }}
                                                            className={`w-full bg-white border rounded-xl px-3 py-2.5 font-bold text-gray-800 outline-none focus:ring-2 transition-all ${
                                                                errors.discount_value 
                                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/10' 
                                                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                            }`}
                                                            placeholder={formData.discount_type === 'percent' ? "1-100" : "0.00"}
                                                        />
                                                        {errors.discount_value ? (
                                                            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-red-500 animate-pulse">
                                                                <AlertCircle size={10} /> {errors.discount_value}
                                                            </div>
                                                        ) : (
                                                            <p className="text-[10px] text-gray-400 mt-1 pl-1">
                                                                {formData.discount_type === 'percent' 
                                                                    ? 'ระบุเปอร์เซ็นต์ (สูงสุด 100%)' 
                                                                    : 'ระบุจำนวนเงินที่ต้องการลด (บาท)'}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 font-noto">ยอดซื้อขั้นต่ำ</label>
                                                        <div className="flex items-center gap-2">
                                                            {formData.discount_type === 'free_shipping' && (
                                                                <>
                                                                    <span className="text-[9px] font-bold text-gray-400">ไม่มีขั้นต่ำ</span>
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={formData.min_spend === 0} 
                                                                            onChange={() => setFormData({...formData, min_spend: formData.min_spend === 0 ? '' : 0})} 
                                                                            className="sr-only peer" 
                                                                        />
                                                                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-500 hover:bg-gray-300 peer-checked:hover:bg-indigo-600 transition-colors"></div>
                                                                    </label>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={formData.min_spend} 
                                                        disabled={formData.discount_type === 'free_shipping' && formData.min_spend === 0}
                                                        onKeyDown={(e) => ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()}
                                                        onChange={e => {
                                                            let val = parseInt(e.target.value) || 0;
                                                            val = Math.max(0, Math.min(9999999, val)); // Limit to 9,999,999
                                                            
                                                            // ✅ Clear Error
                                                            if (errors.min_spend) setErrors({...errors, min_spend: null});

                                                            setFormData({...formData, min_spend: val});
                                                        }}
                                                        className={`w-full bg-white border rounded-xl px-3 py-2.5 font-bold text-gray-800 outline-none focus:ring-2 transition-all text-sm ${
                                                            formData.min_spend === 0 ? 'opacity-50 bg-gray-50' : ''
                                                        } ${
                                                            errors.min_spend 
                                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/10' 
                                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
                                                        }`}
                                                        placeholder="0"
                                                    />
                                                    {errors.min_spend ? (
                                                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-red-500 animate-pulse">
                                                            <AlertCircle size={10} /> {errors.min_spend}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-gray-400 mt-1 pl-1">ยอดซื้อขั้นต่ำ (0 = ไม่มีขั้นต่ำ)</p>
                                                    )}
                                                </div>

                                                {formData.discount_type === 'percent' && (
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block pl-1 font-noto">ลดสูงสุด (บาท)</label>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={formData.max_discount_amount} 
                                                            onKeyDown={(e) => ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()}
                                                            onChange={e => {
                                                                let val = e.target.value;
                                                                if (Number(val) > 9999999) val = "9999999";
                                                                setFormData({...formData, max_discount_amount: val});
                                                            }}
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                                                            placeholder="Unlimited"
                                                        />
                                                        <p className="text-[10px] text-gray-400 mt-1 pl-1">จำกัดมูลค่าส่วนลดไม่เกินยอดนี้</p>
                                                    </div>
                                                )}
                                                
                                                {/* 👑 Customer Eligibility (Final UI Design from Mockup) */}
                                                <div className="col-span-2 pt-6 border-t border-gray-100 mt-2">
                                                     
                                                     {/* 1. Master Toggle: Send to Everyone */}
                                                     <div className={`p-4 rounded-3xl border-2 transition-all flex justify-between items-center cursor-pointer ${
                                                         formData.allowed_roles.length === 0 
                                                         ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100' 
                                                         : 'bg-white border-gray-100'
                                                     }`}
                                                     onClick={() => {
                                                         // Toggle Logic
                                                         if (formData.allowed_roles.length === 0) {
                                                             // Currently ON (All) -> Turn OFF (Select Default 'New User')
                                                             setFormData({...formData, allowed_roles: ['new_user']});
                                                         } else {
                                                             // Currently OFF (Specific) -> Turn ON (All)
                                                             setFormData({...formData, allowed_roles: []});
                                                         }
                                                     }}
                                                     >
                                                         <div className="flex items-center gap-4">
                                                             <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500">
                                                                 <Users size={24} />
                                                             </div>
                                                             <div>
                                                                 <h4 className="font-extrabold text-gray-800 text-sm">ส่งให้ทุกคน (Send to Everyone)</h4>
                                                                 <p className="text-xs font-bold text-gray-400 mt-0.5">
                                                                     {formData.allowed_roles.length === 0 
                                                                        ? 'สถานะ: ✅ เปิดใช้งาน (ลูกค้าทุกคนได้รับสิทธิ์)' 
                                                                        : 'สถานะ: ❌ ปิดอยู่ (เลือกกลุ่มด้านล่าง)'}
                                                                 </p>
                                                             </div>
                                                         </div>
                                                         
                                                         {/* Toggle Switch UI */}
                                                         <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${
                                                             formData.allowed_roles.length === 0 ? 'bg-indigo-500' : 'bg-gray-200'
                                                         }`}>
                                                             <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                                                                 formData.allowed_roles.length === 0 ? 'translate-x-6' : 'translate-x-0'
                                                             }`}></div>
                                                         </div>
                                                     </div>

                                                     {/* Separator / Title */}
                                                     <div className="flex items-center gap-4 my-6 opacity-60">
                                                         <div className="h-[1px] bg-gray-200 flex-1"></div>
                                                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">เลือกกลุ่มที่ต้องการ (Select Target)</span>
                                                         <div className="h-[1px] bg-gray-200 flex-1"></div>
                                                     </div>

                                                     {/* 2. Target Group Cards (Animated Slide Down) */}
                                                     <AnimatePresence>
                                                         {formData.allowed_roles.length > 0 && (
                                                             <motion.div 
                                                                 initial={{ height: 0, opacity: 0 }}
                                                                 animate={{ height: "auto", opacity: 1 }}
                                                                 exit={{ height: 0, opacity: 0 }}
                                                                 transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                 className="overflow-hidden"
                                                             >
                                                                 <div className="space-y-3 pt-2 pb-2">
                                                                     {[
                                                                         { id: 'new_user', title: 'ลูกค้าใหม่ (New Users)', desc: 'New Users • ~450 คน', icon: <UserPlus size={20}/>, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'hover:border-blue-300' },
                                                                         { id: 'customer', title: 'สมาชิกทั่วไป (General)', desc: 'Active Members • ~2,500 คน', icon: <Users size={20}/>, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-300' },
                                                                         { id: 'vip', title: 'VIP Member', desc: 'High Value • ~120 คน', icon: <Crown size={20}/>, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'hover:border-amber-300' }
                                                                     ].map(item => {
                                                                         const isSelected = formData.allowed_roles.includes(item.id);
                                                                         return (
                                                                             <div 
                                                                                key={item.id}
                                                                                onClick={() => {
                                                                                    // Must prevent deselecting the last item completely via click if needed, or allow empty to reset to 'Everyone'.
                                                                                    // Current logic: If empty -> effectively becomes "Everyone" (so Toggle flips ON, and this section slides up/hides).
                                                                                    const newRoles = isSelected 
                                                                                       ? formData.allowed_roles.filter(r => r !== item.id)
                                                                                       : [...formData.allowed_roles, item.id];
                                                                                    
                                                                                    setFormData({...formData, allowed_roles: newRoles});
                                                                                }}
                                                                                className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between ${
                                                                                 isSelected 
                                                                                 ? `bg-white border-${item.color}-500 shadow-lg shadow-${item.color}-500/10 z-10` 
                                                                                 : `bg-slate-50 border-transparent ${item.border}`
                                                                             }`}>
                                                                                 <div className="flex items-center gap-4">
                                                                                     <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.text} flex items-center justify-center transition-colors`}>
                                                                                         {item.icon}
                                                                                     </div>
                                                                                     <div>
                                                                                         <h4 className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{item.title}</h4>
                                                                                         <p className="text-xs font-bold text-gray-400 mt-0.5">{item.desc}</p>
                                                                                     </div>
                                                                                 </div>

                                                                                 {/* Selection Circle */}
                                                                                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                                     isSelected 
                                                                                     ? `border-${item.color}-500 bg-${item.color}-500 text-white` 
                                                                                     : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                                                 }`}>
                                                                                     {isSelected && <Check size={14} strokeWidth={4} />}
                                                                                 </div>
                                                                             </div>
                                                                         );
                                                                     })}
                                                                 </div>
                                                             </motion.div>
                                                         )}
                                                     </AnimatePresence>

                                                     {/* 3. Info Footer */}
                                                     <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                         <div className="flex items-center gap-2 mb-2 text-gray-400 cursor-pointer" onClick={() => document.getElementById('info-details').classList.toggle('hidden')}>
                                                            <HelpCircle size={14} /> 
                                                            <span className="text-[10px] font-bold uppercase tracking-widest hover:text-indigo-500 transition-colors">ข้อแตกต่างระหว่าง 2 แบบนี้?</span>
                                                         </div>
                                                         <ul id="info-details" className="space-y-2 text-xs text-gray-500 font-medium pl-1 hidden">
                                                             <li className="flex gap-2">
                                                                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                                                 <span><strong className="text-indigo-600">ส่งให้ทุกคน:</strong> รวมหมดทั้งคนเก่า คนใหม่ และคนในอนาคต</span>
                                                             </li>
                                                             <li className="flex gap-2">
                                                                 <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
                                                                 <span><strong>เลือกกลุ่ม:</strong> เฉพาะคนที่มีสถานะตรงตามที่เลือกเท่านั้น</span>
                                                             </li>
                                                         </ul>
                                                     </div>
                                                </div>

                                                {/* 🏷️ Tag Rules - REDESIGNED */}
                                                <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
                                                    <div className="flex items-center justify-between mb-3 px-1">
                                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <Tag size={12} className="text-indigo-500"/> ใช้ได้เฉพาะสินค้าที่มี Tag (Optional)
                                                        </label>
                                                        {formData.conditions.applicable_tags?.length > 0 && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => setFormData({...formData, conditions: {...formData.conditions, applicable_tags: []}})}
                                                                className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-tight"
                                                            >
                                                                ล้างทั้งหมด (Clear)
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-4">
                                                        {/* Tag Search & Quick Info */}
                                                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                                                            <div className="relative flex-1 w-full group">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={14}/>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="ค้นหา Tag..." 
                                                                    className="w-full bg-white pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                                                                    onChange={(e) => {
                                                                        const term = e.target.value.toLowerCase();
                                                                        const filtered = tags.filter(t => t.name.toLowerCase().includes(term));
                                                                        // Since we can't easily set another state here without more boilerplate, 
                                                                        // we'll just handle display via inline filter in the map below.
                                                                        e.target.dataset.term = term;
                                                                    }}
                                                                    onKeyUp={(e) => {
                                                                        // Trigger re-render if needed or just use standard react pattern
                                                                        setSearchTerm(e.target.value); 
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className={`text-[10px] font-black px-3 py-2 rounded-xl border transition-all whitespace-nowrap ${
                                                                formData.conditions.applicable_tags?.length > 0 
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                                : 'bg-white border-gray-200 text-gray-400'
                                                            }`}>
                                                                เลือกอยู่: {formData.conditions.applicable_tags?.length || 0} รายการ
                                                            </div>
                                                        </div>

                                                        {/* Tags Grid */}
                                                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar p-1">
                                                            {tags
                                                                .filter(tag => !searchTerm || tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                                .map(tag => {
                                                                    const isSelected = formData.conditions.applicable_tags?.includes(tag.id);
                                                                    return (
                                                                        <button
                                                                            key={tag.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const currentTags = formData.conditions.applicable_tags || [];
                                                                                const newTags = isSelected 
                                                                                    ? currentTags.filter(id => id !== tag.id) 
                                                                                    : [...currentTags, tag.id];
                                                                                
                                                                                setFormData({
                                                                                    ...formData, 
                                                                                    conditions: { ...formData.conditions, applicable_tags: newTags }
                                                                                });
                                                                            }}
                                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1.5 ${
                                                                                isSelected 
                                                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-100 scale-[1.02]' 
                                                                                : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200 hover:text-indigo-600'
                                                                            }`}
                                                                        >
                                                                            {isSelected ? <Check size={12} strokeWidth={3}/> : <span className="opacity-40">#</span>}
                                                                            {tag.name}
                                                                        </button>
                                                                    );
                                                                })}
                                                            
                                                            {tags.length === 0 && (
                                                                <div className="w-full py-8 flex flex-col items-center justify-center text-gray-400 opacity-60">
                                                                    <Tag size={24} className="mb-2 stroke-1"/>
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest">ไม่พบข้อมูล Tag ในระบบ</span>
                                                                </div>
                                                            )}
                                                            
                                                            {tags.length > 0 && tags.filter(tag => !searchTerm || tag.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                                                <div className="w-full py-6 text-center text-gray-400 text-[10px] font-bold uppercase">
                                                                    ไม่พบ Tag ที่ค้นหา
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Helper Text */}
                                                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 mt-2">
                                                            <div className="flex gap-2">
                                                                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                                                <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                                                                    {formData.conditions.applicable_tags?.length > 0 
                                                                        ? `คูปองนี้จะใช้ได้ "เฉพาะ" กับสินค้าที่ติดป้ายกำกับที่คุณเลือกไว้เท่านั้น (${formData.conditions.applicable_tags.length} ป้าย)` 
                                                                        : 'หากไม่เลือกเลย คูปองนี้จะสามารถใช้ได้กับสินค้า "ทุกชิ้น" ในร้าน'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block pl-1 font-noto">จำนวนสิทธิ์ทั้งหมด</label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={formData.usage_limit} 
                                                        onKeyDown={(e) => ["-", "+", "e", "E", "."].includes(e.key) && e.preventDefault()}
                                                        onChange={e => setFormData({...formData, usage_limit: Math.max(1, parseInt(e.target.value) || '')})}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                                                        placeholder="100"
                                                    />
                                                    <p className="text-[10px] text-gray-400 mt-1 pl-1">จำนวนคูปองทั้งหมดที่แจก (อย่างน้อย 1)</p>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block pl-1 font-noto">จำกัดต่อคน</label>
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={formData.limit_per_user} 
                                                        onKeyDown={(e) => ["-", "+", "e", "E", "."].includes(e.key) && e.preventDefault()}
                                                        onChange={e => setFormData({...formData, limit_per_user: Math.max(1, parseInt(e.target.value) || '')})}
                                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                                                        placeholder="1"
                                                    />
                                                    <p className="text-[10px] text-gray-400 mt-1 pl-1">1 คนใช้ได้กี่ครั้ง (อย่างน้อย 1)</p>
                                                </div>

                                                {/* ✅ New User Only Toggle */}
                                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100 mt-4 col-span-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                                            <Users size={16} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-700">เฉพาะลูกค้าใหม่ (New User)</span>
                                                            <span className="text-[9px] text-gray-400">ผู้ใช้ที่ไม่เคยมีคำสั่งซื้อมาก่อน</span>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={formData.conditions?.new_user || false} 
                                                            onChange={e => setFormData({
                                                                ...formData, 
                                                                conditions: { ...formData.conditions, new_user: e.target.checked }
                                                            })} 
                                                            className="sr-only peer" 
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500 hover:bg-gray-300 peer-checked:hover:bg-purple-600 transition-colors"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4. Controls */}
                                        <div className="space-y-3 pt-2">
                                            {[
                                                { label: 'เปิดใช้งาน (Active)', checked: formData.active, key: 'active', color: 'bg-emerald-500', desc: 'สถานะพร้อมใช้งานทันทีเมื่อถึงเวลา' },
                                                { label: 'แสดงใน Coupon Center', checked: formData.is_public, key: 'is_public', color: 'bg-indigo-500', desc: 'ลูกค้าทั่วไปจะเห็นและกดรับคูปองได้' },
                                                { label: 'ใช้สิทธิ์อัตโนมัติ (Auto Apply)', checked: formData.auto_apply, key: 'auto_apply', color: 'bg-blue-500', desc: 'ระบบจะเลือกใช้คูปองนี้ให้อัตโนมัติถ้าเงื่อนไขครบ' },
                                                { label: 'Stackable Flash Sale', checked: formData.is_stackable_with_flash_sale, key: 'is_stackable_with_flash_sale', color: 'bg-orange-500', desc: 'ใช้ร่วมกับสินค้า Flash Sale ได้' }
                                            ].map(item => (
                                                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setFormData({...formData, [item.key]: !item.checked})}>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold font-noto ${item.checked ? 'text-gray-800' : 'text-gray-500'}`}>{item.label}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium font-noto group-hover:text-indigo-500 transition-colors">{item.desc}</span>
                                                    </div>
                                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${item.checked ? item.color : 'bg-gray-200'}`}>
                                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${item.checked ? 'translate-x-4' : ''}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6 sticky bottom-0 bg-white/50 backdrop-blur-sm pb-2 z-20">
                                    <button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-300 hover:shadow-indigo-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        <div className="bg-white/20 p-1 rounded-lg">
                                            <Ticket size={18} />
                                        </div>
                                        {isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างคูปองใหม่'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CouponManagement;
