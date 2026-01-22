import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Tag, Clock, Copy, Check, Users, Sparkles, AlertCircle, Zap, Flame, ShoppingBag, Gift
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';

import { useAuth } from '../context/AuthContext'; // Import Auth

const CouponCenter = () => {
    const { user, token } = useAuth(); // Get User & Token
    const [coupons, setCoupons] = useState([]);
    const [collectedIds, setCollectedIds] = useState([]); // Track collected coupons
    const [loading, setLoading] = useState(true);
    // const [copiedId, setCopiedId] = useState(null); // Unused for now

    useEffect(() => {
        fetchCoupons();
        if (token) {
            fetchCollectedCoupons();
        }
    }, [token]);

    const fetchCoupons = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/coupons-public/`);
            setCoupons(res.data);
        } catch (error) {
            console.error("Error fetching coupons", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollectedCoupons = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/user-coupons/`, {
                headers: { Authorization: `Token ${token}` }
            });
            // Map to Coupon IDs
            setCollectedIds(res.data.map(uc => uc.id));
        } catch (error) {
            console.error("Error fetching user coupons", error);
        }
    };

    const handleCollect = async (coupon) => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'ต้องเข้าสู่ระบบสมาชิกก่อนเก็บคูปอง',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/coupons/${coupon.id}/collect/`, {}, {
                headers: { Authorization: `Token ${token}` }
            });
            
            // ✅ Animation & Update State
            Swal.fire({
                icon: 'success',
                title: 'เก็บคูปองสำเร็จ!',
                text: 'คูปองถูกเพิ่มในกระเป๋าของคุณแล้ว',
                showConfirmButton: false,
                timer: 1500,
                position: 'top-end',
                toast: true
            });

            setCollectedIds(prev => [...prev, coupon.id]); // Add to collected list (Will hide automatically)
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเก็บคูปองได้',
                text: error.response?.data?.message || 'เกิดข้อผิดพลาด',
                confirmButtonText: 'ตกลง'
            });
        }
    };

    // Filter out collected coupons
    const displayedCoupons = coupons.filter(c => !collectedIds.includes(c.id));

    return (
        <div className="min-h-screen bg-[#F9F9F7] font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
            {/* Hero Header - Blue Theme */}
            <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 text-white overflow-hidden py-16 md:py-24 mb-12">
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/4"></div>
                 </div>
                 
                 <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full mb-6 relative">
                            <Gift className="text-cyan-300 animate-bounce" size={18} />
                            <span className="font-bold text-sm tracking-wider uppercase text-cyan-50">Special Vouchers</span>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-lg transform -rotate-1">
                            Coupon <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Zone</span>
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                            คลังคูปองส่วนลดสุดคุ้ม! เก็บโค้ดลดเพิ่ม ช้อปสบายใจ สบายกระเป๋า
                        </p>
                    </motion.div>
                 </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    </div>
                ) : displayedCoupons.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight">ไม่มีคูปองที่ใช้งานได้ในขณะนี้</h3>
                        <p className="text-gray-400 mt-2">โปรดกลับมาเช็คใหม่อีกครั้งเร็วๆ นี้ หรือตรวจสอบที่ "คูปองของฉัน"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <AnimatePresence>
                        {displayedCoupons.map((coupon, index) => (
                            <motion.div 
                                key={coupon.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative h-full"
                            >
                                <div className="bg-white rounded-[1.5rem] shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col overflow-hidden relative border border-transparent hover:border-blue-200">
                                    
                                    {/* Flash Badge */}
                                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-bl-xl z-20 shadow-md">
                                        Special Offer
                                    </div>

                                    {/* Ticket Cutouts (Visual Effect) */}
                                    <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F9F9F7] rounded-full z-10 box-content border-r border-gray-100"></div>
                                    <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F9F9F7] rounded-full z-10 box-content border-l border-gray-100"></div>

                                    {/* Top Section - Blue Gradient Background */}
                                    <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 relative text-white overflow-hidden">
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 opacity-10">
                                            <svg width="100%" height="100%">
                                                <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                                                </pattern>
                                                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
                                            </svg>
                                        </div>
                                        
                                        <div className="relative z-10 text-center pt-4">
                                            <div className="text-5xl font-black tracking-tighter mb-1 flex items-center justify-center gap-1 drop-shadow-md">
                                                {coupon.discount_type === 'percent' ? (
                                                    <>{Number(coupon.discount_value)}<span className="text-3xl text-cyan-300">%</span></>
                                                ) : (
                                                    <><span className="text-3xl text-cyan-300">฿</span>{Number(coupon.discount_value)}</>
                                                )}
                                                <div className="flex flex-col items-start ml-2">
                                                    <span className="text-xs font-bold bg-white/20 px-1.5 rounded uppercase tracking-wider">OFF</span>
                                                </div>
                                            </div>
                                            <p className="text-white/90 font-medium text-sm line-clamp-1">{coupon.description}</p>
                                        </div>
                                    </div>

                                    {/* Dashed Divider */}
                                    <div className="border-t-2 border-dashed border-gray-200 relative mx-6 my-0"></div>

                                    {/* Bottom Section */}
                                    <div className="p-6 flex-1 flex flex-col pt-4">
                                        {/* Tags / Roles */}
                                        <div className="flex flex-wrap gap-1 mb-4 justify-center">
                                            {coupon.allowed_roles && coupon.allowed_roles.length > 0 ? (
                                                coupon.allowed_roles.map(role => (
                                                    <span key={role} className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold uppercase border border-blue-100">
                                                        {role === 'new_user' ? 'สมาชิกใหม่' : role === 'customer' ? 'สมาชิกทั่วไป' : role}
                                                    </span>
                                                ))
                                            ) : (
                                                 <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold uppercase border border-cyan-100">
                                                    ทุกคน
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag size={14} className="text-gray-400" />
                                                    <span className="text-gray-500 font-bold text-xs uppercase">ขั้นต่ำ</span>
                                                </div>
                                                <span className="font-bold text-gray-800 text-sm">฿{Number(coupon.min_spend || 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="bg-white rounded-xl p-1 flex items-center gap-2 border border-gray-200 group-hover:border-blue-200 transition-colors shadow-inner">
                                                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 text-center relative overflow-hidden group-hover:bg-blue-50/30 transition-colors">
                                                    <span className="font-black text-gray-800 text-base tracking-widest uppercase select-all font-mono relative z-10">{coupon.code}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleCollect(coupon)}
                                                    className="p-2.5 rounded-lg transition-all font-bold text-sm flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 px-4 w-auto min-w-[30%] justify-center"
                                                >
                                                    เก็บ
                                                </button>
                                            </div>
                                            <p className="text-center text-[10px] text-gray-300 font-bold mt-2 uppercase tracking-wider group-hover:text-blue-300 transition-colors">
                                                Limited Redemption
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponCenter;
