import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Clock, Copy, Check, Info, Filter, Gift, Sparkles, LayoutGrid, List
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyCoupons = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active'); // active, used, expired
    const [copiedId, setCopiedId] = useState(null);

    // 🔄 ดึงข้อมูลคูปองเมื่อโหลดหน้า
    useEffect(() => {
        if (token) {
            fetchMyCoupons();
        } else {
             // ถ้ายังไม่ล็อกอิน ให้ redirect ไปหน้า login
             // หรือแสดงหน้า Empty แบบให้ Login
             setLoading(false);
        }
    }, [token]);

    const fetchMyCoupons = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/user-coupons/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setCoupons(res.data);
        } catch (error) {
            console.error("Error fetching my coupons", error);
        } finally {
            setLoading(false);
        }
    };

    // 📋 ฟังก์ชันคัดลอกโค้ด
    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: 'success',
            title: `คัดลอกโค้ด: ${code}`
        });

        setTimeout(() => setCopiedId(null), 3000);
    };

    // 🔍 กรองคูปองตาม Tab ที่เลือก
    const filteredCoupons = coupons.filter(c => {
        if (filter === 'active') return !c.is_used && !c.is_expired;
        if (filter === 'used') return c.is_used;
        if (filter === 'expired') return c.is_expired && !c.is_used;
        return true;
    });

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">กรุณาเข้าสู่ระบบเพื่อดูคูปองของคุณ</h2>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        เข้าสู่ระบบ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20 font-sans">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-xl">
                            <Ticket className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">คูปองของฉัน</h1>
                            <p className="text-xs text-gray-500">จัดการคูปองส่วนลดของคุณ</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/coupon-center')}
                        className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                    >
                        + เก็บโค้ดเพิ่ม
                    </button>
                </div>

                {/* Tabs */}
                <div className="max-w-4xl mx-auto px-4 flex gap-6 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'active', label: 'ใช้งานได้' },
                        { id: 'used', label: 'ใช้แล้ว' },
                        { id: 'expired', label: 'หมดอายุ' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-1 ${
                                filter === tab.id 
                                ? 'border-blue-600 text-blue-600' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                            <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
                                {coupons.filter(c => {
                                    if (tab.id === 'active') return !c.is_used && !c.is_expired;
                                    if (tab.id === 'used') return c.is_used;
                                    if (tab.id === 'expired') return c.is_expired && !c.is_used;
                                    return true;
                                }).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Ticket size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-600">ไม่มีคูปองในรายการนี้</h3>
                        <p className="text-gray-400 text-sm mt-1">ลองเปลี่ยนตัวกรอง หรือ ไปเก็บคูปองเพิ่ม</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                        {filteredCoupons.map((coupon, index) => (
                            <motion.div 
                                key={coupon.user_coupon_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col sm:flex-row relative group hover:shadow-md transition-shadow ${
                                    filter !== 'active' ? 'opacity-70 grayscale' : ''
                                }`}
                            >
                                {/* Left Side: Value */}
                                <div className={`w-full sm:w-32 bg-gradient-to-br p-4 flex flex-col items-center justify-center text-white relative overflow-hidden flex-shrink-0 ${
                                    filter !== 'active' 
                                    ? 'from-gray-500 to-gray-600' 
                                    : coupon.discount_type === 'free_shipping'
                                        ? 'from-emerald-500 to-green-600' // Green for Free Shipping
                                        : coupon.discount_type === 'percent'
                                            ? 'from-purple-500 to-indigo-600' // Purple for Percent
                                            : 'from-blue-500 to-cyan-500' // Blue for Fixed
                                }`}>
                                    <div className="text-2xl font-black">
                                        {coupon.discount_type === 'free_shipping' ? (
                                            <span className="text-xl">ส่งฟรี</span>
                                        ) : (
                                            coupon.discount_type === 'percent' ? `${Number(coupon.discount_value)}%` : `฿${Number(coupon.discount_value)}`
                                        )}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                                        {coupon.discount_type === 'free_shipping' ? 'Free Shipping' : 'ส่วนลด'}
                                    </div>
                                    
                                    {/* Circles */}
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F0F2F5] rounded-full"></div>
                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full sm:bg-[#F0F2F5] sm:hidden"></div>
                                </div>

                                {/* Right Side: Details */}
                                <div className="flex-1 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 truncate">{coupon.name || `คูปองส่วนลด ${coupon.code}`}</span>
                                            {coupon.min_spend > 0 && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 whitespace-nowrap">
                                                    ขั้นต่ำ ฿{Number(coupon.min_spend).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{coupon.description}</p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                            <Clock size={12} />
                                            <span>หมดอายุ: {new Date(coupon.expiry_date).toLocaleDateString('th-TH')} {new Date(coupon.expiry_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex-shrink-0 w-full sm:w-auto">
                                        {filter === 'active' ? (
                                            <button 
                                                onClick={() => handleCopy(coupon.code, coupon.user_coupon_id)}
                                                className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                                    copiedId === coupon.user_coupon_id
                                                    ? 'bg-green-50 text-green-600 border border-green-200'
                                                    : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                                                }`}
                                            >
                                                {copiedId === coupon.user_coupon_id ? (
                                                    <><Check size={16} /> คัดลอกแล้ว</>
                                                ) : (
                                                    <><Copy size={16} /> ใช้คูปอง (คัดลอก)</>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-bold text-center border border-gray-200 select-none">
                                                {filter === 'used' ? 'ใช้ไปแล้ว' : 'หมดอายุ'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Stamp if used/expired */}
                                {filter !== 'active' && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 transform -rotate-12 pointer-events-none">
                                        <div className="border-4 border-gray-800 px-4 py-2 text-3xl font-black uppercase text-gray-800 tracking-widest rounded-lg">
                                            {filter === 'used' ? 'USED' : 'EXPIRED'}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCoupons;
