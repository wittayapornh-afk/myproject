import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';

const CouponSection = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    // Change: Use Set to track multiple collected coupons
    const [collectedIds, setCollectedIds] = useState(new Set()); 

    useEffect(() => {
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
        fetchCoupons();

        // Load collected state from localStorage
        const loadedIds = new Set();
        // Since we don't have a simple list, we can iterate all keys or just check when rendering.
        // Better approach: Store a JSON array "collected_coupons" in localStorage.
        try {
            const stored = localStorage.getItem('collected_coupons');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    parsed.forEach(id => loadedIds.add(id));
                }
            }
        } catch (e) { console.error("Error loading collected coupons", e); }
        setCollectedIds(loadedIds);

    }, []);

    const handleCollect = (code, id) => {
        navigator.clipboard.writeText(code);
        
        // Update State
        const newSet = new Set(collectedIds);
        newSet.add(id);
        setCollectedIds(newSet);
        
        // Persist
        localStorage.setItem('collected_coupons', JSON.stringify([...newSet]));

        Swal.fire({
            title: 'เก็บคูปองสำเร็จ!',
            text: 'คูปองของคุณพร้อมใช้แล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#1a4d2e',
            timer: 2000,
            timerProgressBar: true
        });
    };



    if (loading) return null;

    return (
        <section className="mb-16 -mt-8 relative z-20">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header */}
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#1a4d2e] rounded-full"></span>
                    คูปองส่วนลดสำหรับคุณ
                </h2>

                {coupons.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm opacity-70">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-400 font-bold">ยังไม่มีคูปองที่ร่วมรายการในขณะนี้</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coupons.map((coupon) => (
                            <div key={coupon.id} className="flex min-h-[160px] rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 relative group">
                                
                                {/* Left Side (Premium Green Gradient) */}
                                <div className="w-[30%] bg-gradient-to-br from-[#123321] to-[#1a4d2e] flex flex-col items-center justify-center text-white relative p-3">
                                    {/* Border Dots (Serrated Edge Effect) - Improved */}
                                    <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-between py-2 pointer-events-none">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="w-4 h-4 bg-[#F9F9F7] rounded-full my-0.5"></div>
                                        ))}
                                    </div>

                                    <div className="bg-white/10 p-3 rounded-full mb-2 backdrop-blur-sm shadow-inner">
                                        <ShoppingBag size={24} strokeWidth={2} className="text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-center leading-tight opacity-90 tracking-wide uppercase">Voucher</span>
                                </div>

                                {/* Right Side (Details) */}
                                <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                                    <div className="pr-4"> 
                                        <h3 className="font-black text-gray-800 text-lg md:text-xl leading-tight mb-1">
                                            ส่วนลด {coupon.discount_type === 'percent' ? `${parseInt(coupon.discount_value)}%` : `฿${parseInt(coupon.discount_value)}`}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium mb-2">ขั้นต่ำ ฿{Number(coupon.min_spend || 0).toLocaleString()}</p>
                                        
                                        {/* ✅ Role Badges */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {coupon.allowed_roles && coupon.allowed_roles.map(role => (
                                                <span key={role} className="text-[9px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold uppercase border border-orange-100">
                                                    {role === 'new_user' ? 'สมาชิกใหม่' : role === 'customer' ? 'สมาชิกทั่วไป' : role}
                                                </span>
                                            ))}
                                            {(!coupon.allowed_roles || coupon.allowed_roles.length === 0) && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase border border-gray-200">
                                                    ทุกคน
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-3 pt-3 border-t border-dashed border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 font-medium">หมดเขต</span>
                                            <span className="text-[10px] text-gray-600 font-bold">
                                                {new Date(coupon.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                            </span>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                if (new Date(coupon.start_date) <= new Date() && !collectedIds.has(coupon.id)) {
                                                    handleCollect(coupon.code, coupon.id);
                                                }
                                            }}
                                            disabled={collectedIds.has(coupon.id) || new Date(coupon.start_date) > new Date()}
                                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all transform active:scale-95 shadow-sm flex items-center gap-1 ${
                                                collectedIds.has(coupon.id) 
                                                ? 'bg-gray-100 text-[#1a4d2e] cursor-default'
                                                : new Date(coupon.start_date) > new Date()
                                                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                                                    : 'bg-[#1a4d2e] text-white hover:bg-[#143d23] hover:shadow-green-900/20'
                                            }`}
                                        >
                                            {collectedIds.has(coupon.id) ? (
                                                <><Check size={12} strokeWidth={3} /> เก็บแล้ว</>
                                            ) : (
                                                new Date(coupon.start_date) > new Date() 
                                                ? `เริ่ม ${new Date(coupon.start_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
                                                : 'เก็บโค้ด'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CouponSection;
