// ========================================
// 📦 Import Libraries และ Components
// ========================================
import { useState, useEffect } from 'react';
import axios from 'axios';
// ไอคอนต่างๆ จาก lucide-react
import { ShoppingBag, Copy, Check, Truck, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2'; // สำหรับแสดง Alert สวยงาม
import { useAuth } from '../context/AuthContext'; // เช็คว่าเป็น Admin หรือไม่

// 🎠 Swiper - Library สำหรับทำ Slider/Carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
// 🎨 CSS ของ Swiper (จำเป็นต้อง import)
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ========================================
// 🎯 Component หลัก: CouponSection
// แสดงคูปองในรูปแบบ Slider เลื่อนได้
// ========================================
const CouponSection = () => {
    // 👤 ดึงข้อมูล User จาก Context
    const { user, token } = useAuth();
    
    // 📊 State Management
    const [coupons, setCoupons] = useState([]); // เก็บรายการคูปองทั้งหมด
    const [loading, setLoading] = useState(true); // สถานะกำลังโหลด
    const [collectedIds, setCollectedIds] = useState(new Set()); // คูปองที่เก็บแล้ว (ใช้ Set เพื่อหาซ้ำได้เร็ว)
    const [collectingMap, setCollectingMap] = useState({}); // สถานะกำลังเก็บคูปอง (แสดง Loading)

    // ========================================
    // 🔄 useEffect: ทำงานครั้งแรกที่ Component โหลด
    // ========================================
    useEffect(() => {
        // 1. Fetch All Coupons (Public)
        const fetchCoupons = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/coupons-public/`);
                setCoupons(res.data);
            } catch (error) {
                console.error("❌ Error fetching coupons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();

        // 2. Fetch User Collected Coupons (If Logged In)
        if (token) {
            const fetchCollected = async () => {
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/user-coupons/`, {
                        headers: { Authorization: `Token ${token}` }
                    });
                    // res.data is array of UserCoupon objects or custom format.
                    // Based on views.py get_my_coupons_api, it returns array of objects with "id" (coupon id).
                    // Wait, view returns: "id": c.id (Coupon ID), "user_coupon_id": uc.id
                    // So we map res.data.map(item => item.id)
                    setCollectedIds(new Set(res.data.map(item => item.id)));
                } catch (e) {
                    console.error("❌ Error fetching collected coupons", e);
                }
            };
            fetchCollected();
        }
    }, [token]);

    // ========================================
    // 🎁 Function: เก็บคูปอง
    // ========================================
    const handleCollect = async (code, id) => {
        if (!user) {
            Swal.fire({
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'คุณต้องเข้าสู่ระบบเพื่อเก็บคูปอง',
                icon: 'warning',
                confirmButtonColor: '#1a4d2e',
                confirmButtonText: 'เข้าสู่ระบบ'
            });
            return;
        }

        setCollectingMap(prev => ({ ...prev, [id]: true }));

        try {
            await axios.post(`${API_BASE_URL}/api/coupons/${id}/collect/`, {}, {
                 headers: { Authorization: `Token ${token}` }
            });

            setCollectedIds(prev => new Set(prev).add(id));
            
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'เก็บคูปองเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: '#2563eb',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Collect failed", error);
            const msg = error.response?.data?.message || 'เกิดข้อผิดพลาด';
            Swal.fire({
                title: 'ไม่สำเร็จ',
                text: msg,
                icon: 'error',
                confirmButtonColor: '#d33',
            });
        } finally {
            setCollectingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    // ========================================
    // 🚫 เงื่อนไขการแสดงผล
    // ========================================
    if (loading) return null; // ถ้ายังโหลด ไม่แสดงอะไร
    if (coupons.length === 0) return null; // ถ้าไม่มีคูปอง ไม่แสดง Section นี้

    const visibleCoupons = coupons.filter(c => !collectedIds.has(c.id));

    // ========================================
    // 🎨 Render UI
    // ========================================
    return (
        <section className="mb-16 -mt-8 relative z-20">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* ========================================
                    📋 Header: ชื่อ Section พร้อมปุ่มเลื่อน
                    ======================================== */}
                <div className="flex items-center justify-between mb-6">
                    {/* ชื่อ Section */}
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                        {/* ไอคอนของขวัญ */}
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-200 shadow-md">
                            <Gift size={20} className="text-white" />
                        </div>
                        <span className="tracking-tight">คูปองส่วนลดสำหรับคุณ</span>
                        {/* Badge "NEW" */}
                        <span className="px-2.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm tracking-wider">
                            NEW
                        </span>
                    </h2>
                    
                    {/* ปุ่มเลื่อนซ้าย-ขวา (เชื่อมกับ Swiper) */}
                    <div className="flex gap-2">
                        {/* ปุ่มเลื่อนซ้าย */}
                        <button className="swiper-button-prev-custom p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50">
                            <ChevronLeft size={20} />
                        </button>
                        {/* ปุ่มเลื่อนขวา */}
                        <button className="swiper-button-next-custom p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* ========================================
                    🎠 Swiper Slider
                    ======================================== */}
                <Swiper
                    // ⚙️ Modules ที่ใช้งาน
                    modules={[Navigation, Pagination]}
                    
                    // 📏 ระยะห่างระหว่างการ์ด
                    spaceBetween={20}
                    
                    // 👀 จำนวนการ์ดที่แสดงพร้อมกัน (default)
                    slidesPerView={1.2}
                    
                    // 🔘 เชื่อมปุ่มเลื่อนกับ Swiper
                    navigation={{
                        nextEl: '.swiper-button-next-custom', // class ของปุ่มถัดไป
                        prevEl: '.swiper-button-prev-custom', // class ของปุ่มย้อนกลับ
                    }}
                    
                    // 📱 Responsive: ปรับจำนวนการ์ดตามขนาดหน้าจอ
                    breakpoints={{
                        640: { slidesPerView: 2.2 },   // หน้าจอ ≥640px แสดง 2.2 การ์ด
                        768: { slidesPerView: 2.5 },   // หน้าจอ ≥768px แสดง 2.5 การ์ด
                        1024: { slidesPerView: 3.2 },  // หน้าจอ ≥1024px แสดง 3.2 การ์ด
                        1280: { slidesPerView: 4 },    // หน้าจอ ≥1280px แสดง 4 การ์ด
                    }}
                    
                    className="pb-10 !overflow-visible" // เผื่อพื้นที่ด้านล่างและให้เงาโชว์
                >
                    {/* ========================================
                        🎫 Loop แสดงการ์ดคูปองแต่ละใบ
                        ======================================== */}
                    {visibleCoupons.map((coupon) => (
                        <SwiperSlide key={coupon.id} className="h-auto">
                            <div className={`flex flex-col h-full rounded-2xl overflow-hidden shadow-sm bg-white transition-all duration-300 relative group hover:-translate-y-1 hover:shadow-xl ${
                                coupon.discount_type === 'free_shipping' 
                                ? 'border-2 border-emerald-200 shadow-emerald-100/50'
                                : coupon.discount_type === 'percent'
                                    ? 'border border-purple-100'
                                    : 'border border-blue-100'
                            }`}>
                                
                                    {/* 🎨 ส่วนบน: แถบสีตามประเภท */}
                                    <div className={`h-28 relative overflow-hidden p-4 flex items-center justify-between ${
                                        coupon.discount_type === 'free_shipping' 
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600' // Green for Free Shipping
                                        : coupon.discount_type === 'percent'
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600' // Purple for Percent
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-500' // Blue for Fixed
                                    }`}>
                                        {/* ลาย Pattern พื้นหลัง */}
                                        <div className="absolute inset-0 opacity-10">
                                             <svg width="100%" height="100%">
                                                <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                    <circle cx="10" cy="10" r="2" fill="white" />
                                                </pattern>
                                                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
                                            </svg>
                                        </div>
                                        
                                        {/* ข้อความ: ส่วนลด */}
                                        <div className="relative z-10 text-white">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">
                                                {coupon.discount_type === 'free_shipping' ? 'Special Deal' : 'Voucher'}
                                            </p>
                                            <h3 className="font-black text-2xl tracking-tighter shadow-black/10 drop-shadow-md">
                                                {/* แสดงส่วนลดตามประเภท: % หรือ ฿ หรือ ส่งฟรี */}
                                                {coupon.discount_type === 'free_shipping' ? (
                                                    <div className="flex flex-col leading-none">
                                                        <span className="text-3xl">ส่งฟรี</span>
                                                        <span className="text-[10px] opacity-90 font-bold tracking-widest uppercase mt-1">Free Shipping</span>
                                                    </div>
                                                ) : (
                                                    coupon.discount_type === 'percent' 
                                                        ? (
                                                            <div className="flex flex-col items-start leading-tight">
                                                                <span>{Number(coupon.discount_value)}%</span>
                                                                {coupon.max_discount_amount && (
                                                                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-md font-bold border border-white/10 mt-1">
                                                                        max ฿{Number(coupon.max_discount_amount).toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                        : `฿${Number(coupon.discount_value)}`
                                                )}
                                            </h3>
                                        </div>

                                    {/* ไอคอนของขวัญ */}
                                    <div className="relative z-10 bg-white/20 p-2.5 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
                                        <Gift size={24} className="text-white" />
                                    </div>
                                </div>

                                {/* ========================================
                                    📄 ส่วนล่าง: รายละเอียดคูปอง
                                    ======================================== */}
                                <div className="flex-1 p-5 flex flex-col justify-between relative bg-white">
                                     {/* 🎟️ วงกลมตัดขอบ (Ticket Cutouts) */}
                                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#F9F9F7] rounded-full z-10 box-content border border-gray-100/50"></div>
                                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#F9F9F7] rounded-full z-10 box-content border border-gray-100/50"></div>

                                    <div>
                                        {/* 🏷️ Badge: ประเภทคูปอง */}
                                        <div className="flex items-center gap-2 mb-3">
                                             {coupon.discount_type === 'free_shipping' ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <Truck size={10} /> ส่งฟรี
                                                </span>
                                            ) : coupon.discount_type === 'percent' ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                                                    ส่วนลด %
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                    ส่วนลดบาท
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* 📝 คำอธิบายคูปอง */}
                                        <p className="text-sm text-gray-500 font-medium mb-3 line-clamp-2">
                                            {coupon.description || `ส่วนลดพิเศษเมื่อช้อปครบ ฿${Number(coupon.min_spend || 0).toLocaleString()}`}
                                        </p>

                                        {/* 👥 Role Badges: ใครใช้ได้บ้าง */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {coupon.conditions?.new_user ? (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold uppercase border border-pink-100">
                                                    New User
                                                </span>
                                            ) : coupon.allowed_roles && coupon.allowed_roles.map(role => (
                                                <span key={role} className="text-[9px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 font-bold uppercase border border-gray-200">
                                                    {role === 'new_user' ? 'New User' : role === 'customer' ? 'Member' : role}
                                                </span>
                                            ))}
                                             {(!coupon.conditions?.new_user && (!coupon.allowed_roles || coupon.allowed_roles.length === 0)) && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-bold uppercase border border-gray-200">
                                                    All Users
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* ========================================
                                        🎬 Footer: วันหมดอายุ + ปุ่มเก็บคูปอง
                                        ======================================== */}
                                    <div className="pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                                        {/* 📅 วันหมดอายุ */}
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-medium">Expires</span>
                                            <span className="text-xs font-bold text-gray-700">
                                                {new Date(coupon.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>

                                        {/* 🔐 ซ่อนปุ่มถ้าเป็น Admin/Superuser/Seller */}
                                        {(!user || !['admin', 'super_admin', 'seller'].includes(user?.role)) && (
                                            <button 
                                                onClick={() => {
                                                    // ✅ เช็คเงื่อนไข: เริ่มแล้ว + ยังไม่เก็บ
                                                    if (new Date(coupon.start_date) <= new Date() && !collectedIds.has(coupon.id)) {
                                                        handleCollect(coupon.code, coupon.id);
                                                    }
                                                }}
                                                // 🚫 Disable ถ้า: เก็บแล้ว, ยังไม่เริ่ม, หรือกำลัง Loading
                                                disabled={collectedIds.has(coupon.id) || new Date(coupon.start_date) > new Date() || collectingMap[coupon.id]}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all transform active:scale-95 shadow-sm flex items-center gap-1.5 min-w-[90px] justify-center ${
                                                    collectedIds.has(coupon.id) 
                                                    ? 'bg-gray-100 text-gray-400 cursor-default' // เก็บแล้ว
                                                    : new Date(coupon.start_date) > new Date()
                                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed' // ยังไม่เริ่ม
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20' // ปกติ
                                                }`}
                                            >
                                                {/* 🔄 แสดงสถานะต่างๆ */}
                                                {collectingMap[coupon.id] ? (
                                                    // กำลัง Loading
                                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : collectedIds.has(coupon.id) ? (
                                                    // เก็บแล้ว
                                                    <><Check size={14} /> เก็บแล้ว</>
                                                ) : (
                                                    // ยังไม่เริ่ม / ปกติ
                                                    new Date(coupon.start_date) > new Date() 
                                                    ? 'เร็วๆ นี้'
                                                    : 'เก็บโค้ด'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default CouponSection;
