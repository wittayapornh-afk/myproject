// ========================================
// 📦 Import Libraries และ Components
// ========================================
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Zap, Flame, Clock, ShoppingBag, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';

// 🎠 Swiper - สำหรับทำ Slider สินค้า Flash Sale
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// ========================================
// 🎯 Component หลัก: FlashSalePage
// หน้าแสดงสินค้า Flash Sale ทั้งหมด
// ========================================
const FlashSalePage = () => {
    // 👤 ข้อมูล User และสิทธิ์
    const { user } = useAuth();
    
    // 📊 State Management
    const [flashSales, setFlashSales] = useState([]); // เก็บรายการ Flash Sale
    const [loading, setLoading] = useState(true); // สถานะกำลังโหลด

    // 🔒 เช็คว่าเป็น Admin หรือไม่
    const userRole = (user?.role || user?.role_code || '').toLowerCase();
    const isAdmin = user?.is_staff || user?.is_superuser || ['admin', 'super_admin'].includes(userRole);

    // ========================================
    // 🔄 useEffect: ดึงข้อมูล Flash Sale เมื่อ Component โหลด
    // ========================================
    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                // 📡 เรียก API ดึง Flash Sale ที่กำลังเปิดอยู่
                const res = await axios.get(`${API_BASE_URL}/api/flash-sales/active/`);
                if (res.data && Array.isArray(res.data)) {
                    setFlashSales(res.data);
                }
            } catch (err) {
                console.error("❌ Error fetching flash sales:", err);
            } finally {
                setLoading(false); // หยุด Loading
            }
        };
        fetchFlashSales();
    }, []);

    // ========================================
    // 💀 Loading State
    // ========================================
    if (loading) return (
        <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9F9F7] pb-20">
            {/* ========================================
                🎨 Hero Header: หัวข้อหน้า Flash Sale
                ======================================== */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 md:py-20 relative overflow-hidden">
                {/* พื้นหลัง Blur Effect */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    {/* Badge "Hottest Deals" */}
                    <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full mb-6">
                        <Flame className="text-yellow-300 animate-pulse" size={18} />
                        <span className="font-bold text-sm tracking-wider uppercase text-yellow-50">Hottest Deals of the Day</span>
                    </div>
                    
                    {/* ชื่อหน้า */}
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-lg">
                        Flash Sale <span className="text-yellow-300">Hub</span>
                    </h1>
                    
                    {/* คำอธิบาย */}
                    <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        ดีลสุดพิเศษ ลดกระหน่ำ จำนวนจำกัด หมดแล้วหมดเลย!
                    </p>
                </div>
            </div>

            {/* ========================================
                ⚠️ Admin Warning Message
                ======================================== */}
            {isAdmin && (
                <div className="max-w-7xl mx-auto px-4 mt-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" />
                        <span className="font-bold text-red-700">Admin View Mode: คุณไม่สามารถสั่งซื้อสินค้า Flash Sale ได้</span>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 mt-8">
                {/* ========================================
                    📦 แสดงรายการ Flash Sale
                    ======================================== */}
                {flashSales.length === 0 ? (
                    // ❌ ถ้าไม่มี Flash Sale
                    <div className="text-center py-20">
                        <div className="bg-white rounded-[2rem] p-12 shadow-sm inline-block">
                            <Clock size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">ยังไม่มี Flash Sale ในขณะนี้</h3>
                            <p className="text-gray-400 mt-2">โปรดติดตามตอนต่อไป</p>
                        </div>
                    </div>
                ) : (
                    // ✅ มี Flash Sale - แสดงทีละแคมเปญ
                    flashSales.map(sale => (
                        <div key={sale.id} className="mb-16">
                            {/* ========================================
                                📋 Header แคมเปญ: ชื่อ + นับถอยหลัง
                                ======================================== */}
                            <div className="flex flex-col md:flex-row items-end md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
                                <div>
                                    {/* Badge "Active Now" */}
                                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                                        <Zap size={20} fill="currentColor" />
                                        <span className="font-black tracking-widest uppercase text-sm">Active Now</span>
                                    </div>
                                    {/* ชื่อแคมเปญ */}
                                    <h2 className="text-3xl font-black text-gray-800">{sale.name || "Flash Sale Campaign"}</h2>
                                    {/* คำอธิบายแคมเปญ */}
                                    <p className="text-gray-500 mt-1">{sale.description}</p>
                                </div>
                                {/* ⏰ นับถอยหลัง */}
                                <CountdownTimer endTime={sale.end_time} />
                            </div>

                            {/* ========================================
                                🎠 Swiper Slider: รายการสินค้า Flash Sale
                                ======================================== */}
                            <Swiper
                                // ⚙️ Modules ที่ใช้งาน
                                modules={[Navigation, Pagination]}
                                
                                // 📏 ระยะห่างระหว่างการ์ด
                                spaceBetween={16}
                                
                                // 👀 จำนวนการ์ดที่แสดงพร้อมกัน (default)
                                slidesPerView={2}
                                
                                // 🔘 เปิดใช้งานปุ่มเลื่อน
                                navigation
                                
                                // 📍 เปิดใช้งาน Pagination (จุดบอกตำแหน่ง)
                                pagination={{ clickable: true }}
                                
                                // 📱 Responsive: ปรับจำนวนการ์ดตามขนาดหน้าจอ
                                breakpoints={{
                                    640: { slidesPerView: 3 },   // หน้าจอ ≥640px: แสดง 3 การ์ด
                                    768: { slidesPerView: 4 },   // หน้าจอ ≥768px: แสดง 4 การ์ด
                                    1024: { slidesPerView: 5 },  // หน้าจอ ≥1024px: แสดง 5 การ์ด
                                    1280: { slidesPerView: 6 },  // หน้าจอ ≥1280px: แสดง 6 การ์ด
                                }}
                                
                                className="pb-12" // เผื่อพื้นที่ให้ pagination
                            >
                                {/* ========================================
                                    🔄 Loop แสดงสินค้าแต่ละรายการ
                                    ======================================== */}
                                {sale.products.map(item => {
                                    // 💰 คำนวณ % ส่วนลด
                                    const percentDiscount = Math.round(((item.original_price - item.sale_price) / item.original_price) * 100);
                                    // 📊 คำนวณ % ที่ขายไปแล้ว
                                    const soldPercent = (item.sold_count / item.quantity_limit) * 100;

                                    return (
                                        <SwiperSlide key={item.id}>
                                            {/* ========================================
                                                🎫 การ์ดสินค้า Flash Sale แต่ละใบ
                                                ======================================== */}
                                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-transparent hover:border-orange-100 flex flex-col h-full">
                                                {/* 📸 ส่วนรูปภาพสินค้า */}
                                                <div className="aspect-square bg-gray-50 relative p-4">
                                                    {/* 🏷️ Badge ส่วนลด (มุมขวาบน) */}
                                                    <div className="absolute top-0 right-0 bg-yellow-400 text-red-900 font-black text-xs px-2 py-1 rounded-bl-lg z-10 shadow-sm">
                                                        -{percentDiscount}%
                                                    </div>
                                                    
                                                    {/* รูปสินค้า */}
                                                    <img 
                                                        src={item.product_image ? `${API_BASE_URL}${item.product_image}` : '/placeholder.png'} 
                                                        alt={item.title}
                                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>

                                                {/* 📝 ส่วนข้อมูลสินค้า */}
                                                <div className="p-4 flex-1 flex flex-col">
                                                    {/* ชื่อสินค้า (แสดง 2 บรรทัด) */}
                                                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 min-h-[40px]" title={item.product_name}>
                                                        {item.product_name}
                                                    </h3>

                                                    <div className="mt-auto">
                                                        {/* 💰 ราคา: ราคาขาย + ราคาเดิม */}
                                                        <div className="flex items-baseline gap-2 mb-2">
                                                            <span className="text-lg font-black text-orange-600">฿{parseFloat(item.sale_price).toLocaleString()}</span>
                                                            <span className="text-xs text-gray-400 line-through">฿{parseFloat(item.original_price).toLocaleString()}</span>
                                                        </div>

                                                        {/* 📊 Progress Bar: แสดงจำนวนที่ขายไป */}
                                                        <div className="bg-orange-100 rounded-full h-3 w-full relative overflow-hidden mb-4">
                                                            {/* แถบเติม (สีส้ม-แดง) */}
                                                            <div 
                                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500"
                                                                style={{ width: `${Math.min(soldPercent, 100)}%` }}
                                                            ></div>
                                                            {/* ข้อความจำนวนที่ขาย */}
                                                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-orange-900 uppercase">
                                                                {item.sold_count >= item.quantity_limit ? 'Sold Out' : `Sold ${item.sold_count}`}
                                                            </span>
                                                        </div>

                                                        {/* 🛒 ปุ่ม Action */}
                                                        {isAdmin ? (
                                                            // Admin: ปุ่ม Disabled
                                                            <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-2 rounded-lg cursor-not-allowed text-xs">
                                                                สงวนสิทธิ์ Admin
                                                            </button>
                                                        ) : (
                                                            // ลูกค้า: ลิงก์ไปหน้าสินค้า
                                                            <Link 
                                                                to={`/product/${item.product}`}
                                                                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg text-center transition-colors text-sm shadow-lg shadow-orange-200"
                                                            >
                                                                ซื้อเลย
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ========================================
// ⏰ Component: CountdownTimer
// แสดงนับถอยหลังเวลา Flash Sale
// ========================================
const CountdownTimer = ({ endTime }) => {
    // 📊 State: เก็บเวลาที่เหลือ (ชั่วโมง, นาที, วินาที)
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        // 🧮 Function คำนวณเวลาที่เหลือ
        const calculate = () => {
            const diff = new Date(endTime).getTime() - new Date().getTime();
            if (diff > 0) {
                setTimeLeft({
                    h: Math.floor((diff / (1000 * 60 * 60))),     // ชั่วโมง
                    m: Math.floor((diff / 1000 / 60) % 60),       // นาที
                    s: Math.floor((diff / 1000) % 60),            // วินาที
                });
            } else {
                setTimeLeft({ h: 0, m: 0, s: 0 }); // หมดเวลา
            }
        };
        
        calculate(); // คำนวณครั้งแรก
        const timer = setInterval(calculate, 1000); // อัพเดตทุก 1 วินาที
        return () => clearInterval(timer); // ล้าง Timer เมื่อ Component ถูกลบ
    }, [endTime]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Ending in</span>
            {/* แสดงนาฬิกานับถอยหลัง */}
            <div className="flex gap-1 text-white font-black text-lg">
                <div className="bg-gray-800 px-2 py-1 rounded">{String(timeLeft.h).padStart(2, '0')}</div>
                <span className="text-gray-800 self-center">:</span>
                <div className="bg-gray-800 px-2 py-1 rounded">{String(timeLeft.m).padStart(2, '0')}</div>
                <span className="text-gray-800 self-center">:</span>
                <div className="bg-gray-800 px-2 py-1 rounded">{String(timeLeft.s).padStart(2, '0')}</div>
            </div>
        </div>
    );
};

export default FlashSalePage;
