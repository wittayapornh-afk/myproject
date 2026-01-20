import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ticket, Tag, Clock, Copy, Check, Users, Sparkles, AlertCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';

const CouponCenter = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);

    const API_BASE_URL = "http://localhost:8000";

    useEffect(() => {
        fetchCoupons();
    }, []);

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
            title: `Copied: ${code}`
        });

        setTimeout(() => setCopiedId(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
            {/* Header Hero - Brand Green Theme */}
            <div className="relative bg-[#1a4d2e] text-white overflow-hidden py-16 md:py-24 mb-12">
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500 rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/4"></div>
                 </div>
                 
                 <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-6 shadow-2xl ring-1 ring-white/20 rotate-3">
                            <Ticket size={48} className="text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 drop-shadow-md">
                            Coupon <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-300">Center</span>
                        </h1>
                        <p className="text-green-100 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                            เก็บโค้ดส่วนลดสุดคุ้ม! ช้อปสนุกยิ่งขึ้นด้วยดีลพิเศษที่เราคัดสรรมาเพื่อคุณโดยเฉพาะ
                        </p>
                    </motion.div>
                 </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-[#1a4d2e]"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight">ไม่มีคูปองที่ใช้งานได้ในขณะนี้</h3>
                        <p className="text-gray-400 mt-2">โปรดกลับมาเช็คใหม่อีกครั้งเร็วๆ นี้</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {coupons.map((coupon, index) => (
                            <motion.div 
                                key={coupon.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative h-full"
                            >
                                <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-green-100 transition-all h-full flex flex-col overflow-hidden">
                                    
                                    {/* Ticket Cutouts */}
                                    <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gray-50/50 rounded-full border border-gray-100 -translate-y-1/2 z-10" />
                                    <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gray-50/50 rounded-full border border-gray-100 -translate-y-1/2 z-10" />

                                    {/* Top Section - Green Gradient */}
                                    <div className="p-8 pb-6 bg-gradient-to-br from-green-50/50 to-white relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-[#1a4d2e]/10 text-[#1a4d2e] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Tag size={12} fill="currentColor" /> Coupon
                                            </div>
                                        </div>
                                        
                                        <div className="text-center mb-2">
                                            <div className="text-5xl font-black text-[#1a4d2e] tracking-tighter mb-1 flex items-center justify-center gap-1">
                                                {coupon.discount_type === 'percent' ? (
                                                    <>{parseInt(coupon.discount_value)}<span className="text-2xl">%</span></>
                                                ) : (
                                                    <><span className="text-2xl">฿</span>{parseInt(coupon.discount_value)}</>
                                                )}
                                                <span className="text-xl text-gray-400 font-bold ml-1 self-end mb-2">OFF</span>
                                            </div>
                                            <p className="text-gray-500 font-medium text-sm">{coupon.description}</p>
                                            
                                            {/* ✅ Role Badges */}
                                            <div className="flex flex-wrap justify-center gap-1 mt-2">
                                                {coupon.allowed_roles && coupon.allowed_roles.map(role => (
                                                    <span key={role} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold uppercase border border-amber-100">
                                                        {role === 'new_user' ? 'สมาชิกใหม่' : role === 'customer' ? 'สมาชิกทั่วไป' : role}
                                                    </span>
                                                ))}
                                                {(!coupon.allowed_roles || coupon.allowed_roles.length === 0) && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase border border-gray-200">
                                                        ทุกคน
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t-2 border-dashed border-gray-100 relative mx-4"></div>

                                    {/* Bottom Section */}
                                    <div className="p-8 pt-6 flex-1 flex flex-col">
                                        <div className="space-y-3 mb-8">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">ขั้นต่ำ</span>
                                                <span className="font-bold text-gray-900">฿{Number(coupon.min_spend || 0).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto">
                                            <div className="bg-gray-50 rounded-xl p-1.5 flex items-center gap-2 border border-gray-200 group-hover:border-green-200 transition-colors">
                                                <div className="flex-1 bg-white rounded-lg px-4 py-3 text-center border border-gray-100">
                                                    <span className="font-black text-gray-800 text-lg tracking-widest uppercase select-all font-mono">{coupon.code}</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleCopy(coupon.code, coupon.id)}
                                                    className={`p-3 rounded-lg transition-all ${
                                                        copiedId === coupon.id 
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                                                        : 'bg-[#1a4d2e] text-white hover:bg-[#143d23] shadow-lg shadow-green-900/20 active:scale-95'
                                                    }`}
                                                >
                                                    {copiedId === coupon.id ? <Check size={20} /> : <Copy size={20} />}
                                                </button>
                                            </div>
                                            <p className="text-center text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-wider">
                                                Click to Copy
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponCenter;
