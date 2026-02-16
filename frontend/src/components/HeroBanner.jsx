// ========================================
// 📦 Import Libraries และ Components  
// ========================================
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Star, Zap, Ticket, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/formatUtils';
import Swal from 'sweetalert2';

// ========================================
// 🎯 Component หลัก: HeroBanner
// Manual Slider หน้าแรก (รองรับ Drag)
// ========================================
const HeroBanner = () => {
    // 📊 State Management
    const [slides, setSlides] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [flashSale, setFlashSale] = useState(null); 
    const [current, setCurrent] = useState(0); 
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); 
    
    // 👆 Drag State
    const [dragStart, setDragStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const navigate = useNavigate();

    // 🖱️ Handler: ติดตามการเคลื่อนไหวของเมาส์
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePos({ x, y });
    };

    // 👆 Drag Handlers
    const handleDragStart = (e) => {
        setDragStart(e.clientX || e.touches?.[0]?.clientX);
        setIsDragging(true);
    };

    const handleDragEnd = (e) => {
        if (!dragStart) return;
        
        const dragEnd = e.clientX || e.changedTouches?.[0]?.clientX;
        const diff = dragStart - dragEnd;

        // ถ้าลากเกิน 50px ให้เปลี่ยนหน้า
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // ลากซ้าย → หน้าถัดไป
                setCurrent((current + 1) % slides.length);
            } else {
                // ลากขวา → หน้าก่อนหน้า
                setCurrent((current - 1 + slides.length) % slides.length);
            }
        }

        setDragStart(null);
        setIsDragging(false);
    };

    // ========================================
    // 🔄 useEffect: ดึงข้อมูลเมื่อ Component โหลด
    // ========================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                let flashItems = [];
                try {
                    const flashRes = await fetch('http://localhost:8000/api/flash-sales/active/');
                    const flashData = await flashRes.json();
                    
                    if (Array.isArray(flashData) && flashData.length > 0) {
                        const activeFS = flashData[0]; 
                        setFlashSale(activeFS);
                        
                        const eventSlide = {
                            id: `fs-event-${activeFS.id}`,
                            title: activeFS.name,
                            description: activeFS.description || `⏰ ${new Date(activeFS.start_time).toLocaleString('th-TH', {dateStyle: 'short', timeStyle: 'short'})} - ${new Date(activeFS.end_time).toLocaleString('th-TH', {dateStyle: 'short', timeStyle: 'short'})}`,
                            price: 0,
                            sale_price: 0,
                            image: activeFS.banner_image, 
                            isFlashSaleEvent: true,
                            isFlashSale: true,
                            category: "Campaign"
                        };
                        flashItems.push(eventSlide);

                        /* 
                        // ❌ DISABLED: Don't show individual flash sale products in Hero (User Request)
                        if (activeFS.products && activeFS.products.length > 0) {
                            const fsProducts = activeFS.products.map(p => ({
                                id: p.product || p.id,
                                title: p.product_name || p.name,
                                description: p.description || activeFS.name, 
                                price: p.original_price || p.price,
                                sale_price: p.sale_price || p.flash_sale_price, 
                                image: p.product_image || p.image,
                                isFlashSale: true,
                                category: "Flash Sale"
                            }));
                            flashItems = [...flashItems, ...fsProducts];
                        }
                        */
                    }
                } catch (e) { 
                    console.warn("⚠️ No active flash sale:", e); 
                }

                const couponZoneSlide = {
                    id: 'coupon-zone-main',
                    title: 'Coupon Zone',
                    description: 'คลังคูปองส่วนลดสุดคุ้ม! เก็บโค้ดลดเพิ่ม ช้อปสบายใจ สบายกระเป๋า',
                    isCouponZone: true,
                    category: 'Special Vouchers'
                };

                const productRes = await fetch('http://localhost:8000/api/products/?page_size=6');
                const productData = await productRes.json();
                const normalItems = productData.results || productData;

                let combined = [...flashItems, couponZoneSlide, ...normalItems];
                
                const unique = [];
                const map = new Map();
                for (const item of combined) {
                    if(!map.has(item.id)){
                        map.set(item.id, true);
                        unique.push(item);
                    }
                }

                if (unique.length > 0) {
                    const finalSlides = unique.slice(0, 8);
                    setSlides(finalSlides);
                }
                setLoading(false);

            } catch (err) {
                console.error("❌ Hero Fetch Error", err);
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    // ========================================
    // ⏰ useEffect: Auto Slide ทุก 8 วินาที
    // ========================================
    useEffect(() => {
        if (slides.length === 0) return;
        
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 8000);

        return () => clearInterval(timer);
    }, [slides.length]);

    // ========================================
    // 🎨 Function: กำหนดธีมสี (มืดลง ไม่แสบตา)
    // ========================================
    const getTheme = (slide) => {
        if (slide.isCouponZone) {
            return {
                bg: "bg-gradient-to-r from-sky-600 to-blue-700", // สีฟ้าสดใส
                accent: "text-cyan-300",
                btn: "bg-white/10 border border-cyan-500/20 text-cyan-100 hover:bg-white/20",
                orb: "bg-sky-400/25", // ฟ้าสว่าง
                text: "text-white",
                subtext: "text-blue-100",
                badgeBorder: "border-white/10",
                badgeText: "text-white/70"
            };
        }

        if (slide.isFlashSaleEvent || slide.isFlashSale) {
            return {
                bg: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-600 via-red-700 to-red-900", // แดงสว่างมาก
                accent: "text-yellow-300",
                btn: "bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-900/30",
                orb: "bg-red-400/30", // แดงสว่าง
                text: "text-white",
                subtext: "text-white/70",
                badgeBorder: "border-red-600/20",
                badgeText: "text-white"
            };
        }
        
        // 🎨 Dynamic Theme based on Category (Match Product)
        const cat = (slide.category || '').toLowerCase();
        let bgGradient = "bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfccb]"; // Default: Green/Lime

        if (cat.includes('furniture') || cat.includes('decor') || cat.includes('home') || cat.includes('sofa')) {
             bgGradient = "bg-gradient-to-br from-orange-100 via-amber-50 to-stone-200"; // 🛋️ Warm/Earth Tones (More visible)
        } else if (cat.includes('electronics') || cat.includes('phone') || cat.includes('watch') || cat.includes('monitor')) {
             bgGradient = "bg-gradient-to-br from-blue-200 via-cyan-50 to-slate-200"; // 📱 Cool/Tech Blue (Clearly colored)
        } else if (cat.includes('beauty') || cat.includes('fashion') || cat.includes('shirt')) {
             bgGradient = "bg-gradient-to-br from-pink-200 via-rose-50 to-purple-200"; // 💄 Vibrant Pink/Rose
        } else {
             bgGradient = "bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100"; // 🌿 Fresh Green (Brand)
        }
        
        return {
            bg: bgGradient,
            accent: "text-[#1a4d2e]", 
            btn: "bg-[#1a4d2e] text-white hover:bg-[#143d24] shadow-lg shadow-green-900/20",
            orb: "bg-green-500/10",
            text: "text-gray-800", // Dark Text
            subtext: "text-gray-600",
            badgeBorder: "border-black/5",
            badgeText: "text-black/60"
        };
    };

    // ========================================
    // 📍 Functions: เลื่อน Slide
    // ========================================
    const nextSlide = () => setCurrent((current + 1) % slides.length);
    const prevSlide = () => setCurrent((current - 1 + slides.length) % slides.length);

    // ========================================
    // 💀 Loading State
    // ========================================
    if (loading) return <div className="w-full h-[600px] bg-gray-900 animate-pulse"></div>;
    if (slides.length === 0) return null;

    const slide = slides[current];
    const theme = getTheme(slide);

    return (
        <div 
            className="relative w-full h-[500px] md:h-[600px] overflow-hidden cursor-grab active:cursor-grabbing bg-gray-900" // เปลี่ยนจาก black เป็น gray-900 (สว่างขึ้น)
            onMouseMove={handleMouseMove}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
        >
            <AnimatePresence initial={false}> {/* ไม่ wait = crossfade */}
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 0.98 }} // เริ่มจาง + ซูมเล็กน้อย
                    animate={{ opacity: 1, scale: 1 }} // แสดงเต็มที่
                    exit={{ opacity: 0, scale: 0.98 }} // จางหาย + ซูมเล็กน้อย
                    transition={{ 
                        duration: 0.4, // ลดเวลาให้เร็วขึ้น (ไม่มีช่วงสว่างแว๊บ)
                        ease: "easeInOut" // ให้นุ่มนวล
                    }}
                    className="absolute inset-0"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => {
                        if (info.offset.x < -100) nextSlide();
                        if (info.offset.x > 100) prevSlide();
                    }}
                >
                    <div className={`w-full h-full transition-colors duration-1000 ${theme.bg}`}>
                        
                        {/* พื้นหลัง Blur (ลดความสว่าง) */}
                        <div className="absolute inset-0 z-0">
                            <div 
                                className={`absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen transition-all duration-300 ${theme.orb} opacity-40 animate-blob`}
                                style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
                            ></div>
                            <div 
                                className={`absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[100px] mix-blend-screen transition-all duration-300 ${theme.orb} opacity-30 animate-blob animation-delay-2000`}
                                style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }}
                            ></div>
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"></div>
                        </div>

                        {/* เนื้อหา Slide */}
                        {slide.isCouponZone ? (
                            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4">
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm border border-white/10 px-6 py-2 rounded-full mb-8 relative"
                                >
                                    <Gift className="text-cyan-300 animate-bounce" size={24} />
                                    <span className="font-bold text-base tracking-wider uppercase text-cyan-50">Special Vouchers</span>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                                </motion.div>

                                <motion.h1 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-6 drop-shadow-2xl transform -rotate-2 text-white"
                                >
                                    Coupon <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Zone</span>
                                </motion.h1>
                                
                                <motion.p 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-blue-100/80 text-xl md:text-2xl font-medium max-w-3xl leading-relaxed mb-10"
                                >
                                    {slide.description}
                                </motion.p>

                                <motion.button 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/coupons')}
                                    className="group relative px-10 py-4 rounded-full bg-white text-blue-900 font-black text-xl tracking-wide shadow-[0_0_30px_rgba(59,130,246,0.3)] overflow-hidden transition-all"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        เก็บโค้ดเลย <Ticket size={24} className="fill-blue-900/20"/>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </motion.button>
                            </div>
                        ) : (
                            <div className="relative z-10 w-full h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-center">
                                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20">
                                    
                                    <motion.div 
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex-1 text-center md:text-left pt-10 md:pt-0"
                                    >
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                            {(slide.isFlashSale || slide.isFlashSaleEvent) ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-red-700/15 backdrop-blur-md rounded-full border border-red-600/20 text-white font-bold uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                                    <Zap size={14} className="fill-yellow-300 text-yellow-300 animate-pulse"/> Flash Sale
                                                </div>
                                            ) : (
                                                <div className={`flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border ${theme.badgeBorder || 'border-white/10'} ${theme.badgeText || 'text-white/70'} font-bold uppercase tracking-widest text-xs`}>
                                                    <Star size={14} className="fill-current"/> Featured Product
                                                </div>
                                            )}
                                        </div>

                                        <h1 className={`text-5xl md:text-7xl font-black ${theme.text} leading-[0.9] tracking-tighter mb-6 drop-shadow-sm`}>
                                            {slide.title}
                                        </h1>

                                        <p className={`text-lg md:text-xl ${theme.subtext} max-w-lg mx-auto md:mx-0 font-medium leading-relaxed mb-10 line-clamp-2`}>
                                            {slide.description}
                                        </p>

                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                             {/* ซ่อนราคาสำหรับ Flash Sale Event */}
                                             {!slide.isFlashSaleEvent && (
                                                 <div className="flex flex-col items-start">
                                                    <span className={`${theme.subtext} opacity-60 text-sm font-bold uppercase tracking-wider mb-1`}>ราคา</span>
                                                    <div className="flex items-baseline gap-3">
                                                        <span className={`text-5xl md:text-6xl font-black ${theme.accent} tracking-tight drop-shadow-lg`}>
                                                            {formatPrice(slide.sale_price || slide.price)}
                                                        </span>
                                                        {slide.isFlashSale && (
                                                            <span className={`text-xl ${theme.subtext} opacity-40 line-through decoration-2 decoration-current`}>
                                                                {formatPrice(slide.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                             )}

                                             {!slide.isFlashSaleEvent && (
                                                 <div className="h-12 w-px bg-white/5 mx-4 hidden md:block"></div>
                                             )}

                                             {slide.isFlashSaleEvent ? (
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => navigate('/flash-sale')}
                                                    className={`group relative px-10 py-5 rounded-2xl ${theme.btn} text-white font-black text-lg tracking-wide shadow-2xl overflow-hidden transition-all`}
                                                >
                                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                    <span className="relative flex items-center gap-3">
                                                        <Zap size={20} className="fill-white animate-pulse"/> ไปช้อปด่วน
                                                    </span>
                                                </motion.button>
                                            ) : (
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => navigate(`/product/${slide.id}`)}
                                                    className={`group relative px-10 py-5 rounded-2xl ${theme.btn} text-white font-black text-lg tracking-wide shadow-2xl overflow-hidden transition-all`}
                                                >
                                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                    <span className="relative flex items-center gap-3">
                                                        ช้อปเลย <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                                                    </span>
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>

                                     <motion.div 
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex-1 relative flex items-center justify-center h-full w-full"
                                        style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }}
                                     >
                                        <div className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border border-white/5 bg-white/5 backdrop-blur-[2px] animate-[spin_30s_linear_infinite]" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}></div>
                                        
                                        {slide.isFlashSaleEvent ? (
                                            // ⚡ Flash Sale: Design แบบ Text-based
                                            <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                                                <div className="relative w-[90%] md:w-[450px] aspect-square">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-red-800/80 via-orange-800/80 to-red-900/80 rounded-[3rem] shadow-2xl shadow-red-900/30"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-red-600/10 rounded-[3rem] blur-xl"></div>
                                                    
                                                    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 md:p-12 text-center">
                                                        <div className="relative mb-6">
                                                            <Zap size={100} className="text-yellow-300 fill-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                                                            <Zap size={60} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white fill-white animate-ping" />
                                                        </div>

                                                        <h2 className="text-4xl md:text-5xl font-black text-white mb-3 uppercase tracking-tighter drop-shadow-lg">
                                                            Flash Sale
                                                        </h2>
                                                        <p className="text-white/80 text-sm md:text-base font-bold mb-5 max-w-xs">
                                                            ⏰ ดีลสุดว้าว! ลดกระหน่ำ จำนวนจำกัด
                                                        </p>

                                                        {flashSale && (
                                                            <div className="flex gap-2 mb-5">
                                                                <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
                                                                    <span className="text-xl font-black text-white">
                                                                        {Math.max(0, Math.floor((new Date(flashSale.end_time) - new Date()) / (1000 * 60 * 60)))}
                                                                    </span>
                                                                    <span className="text-xs text-white/60 ml-1">ชม.</span>
                                                                </div>
                                                                <span className="text-white text-xl font-black self-center">:</span>
                                                                <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
                                                                    <span className="text-xl font-black text-white">
                                                                        {Math.max(0, Math.floor((new Date(flashSale.end_time) - new Date()) / (1000 * 60)) % 60)}
                                                                    </span>
                                                                    <span className="text-xs text-white/60 ml-1">นาที</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="inline-flex items-center gap-2 bg-yellow-400/90 text-red-900 px-5 py-2 rounded-full font-black text-sm uppercase tracking-wider shadow-lg">
                                                            <Zap size={14} fill="currentColor" />
                                                            ลดสูงสุด 70%
                                                        </div>
                                                    </div>

                                                    <div className="absolute inset-0 rounded-[3rem] border-2 border-yellow-400/20"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img 
                                                src={getImageUrl(slide.image || slide.thumbnail)} 
                                                alt={slide.title}
                                                // ✅ Mix Blend Multiply to remove white background + Padding for better fit
                                                className="relative z-10 w-[85%] md:w-full max-h-[350px] md:max-h-[600px] object-contain drop-shadow-2xl mix-blend-multiply pointer-events-none"
                                            />
                                        )}
                                     </motion.div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            {/* Navigation Controls - ✅ Enhanced Visibility */}
            <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-black/60 hover:border-white/50 transition-all shadow-xl hover:scale-110 group active:scale-95"
            >
                <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform drop-shadow-md" />
            </button>

            <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-black/60 hover:border-white/50 transition-all shadow-xl hover:scale-110 group active:scale-95"
            >
                <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform drop-shadow-md" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 p-2 bg-black/20 backdrop-blur-sm rounded-full border border-white/10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`transition-all duration-300 rounded-full ${
                            current === index 
                                ? 'w-8 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};


export default HeroBanner;
