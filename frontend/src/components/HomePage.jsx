
import React, { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';
import CategoryRow from './CategoryRow';
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react'; // ✅ Import Icons
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/formatUtils';

const HomePage = () => {
    const [newArrivals, setNewArrivals] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    // Load Recently Viewed from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('recentlyViewed');
            if (stored) {
                setRecentlyViewed(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    // Fetch New Arrivals (Latest 4 products)
    useEffect(() => {
        fetch('/api/products/?page_size=8') 
            .then(res => res.json())
            .then(data => {
                const items = data.results || data;
                if (Array.isArray(items)) {
                    setNewArrivals(items.slice(0, 8)); // Show 8 items
                }
            })
            .catch(err => console.error(err));
    }, []);

    // ✅ Functional Info Bar Handler
    const handleInfoClick = (title, desc, detail) => {
        Swal.fire({
            title: `<h3 class="text-2xl font-bold text-[#1a4d2e]">${title}</h3>`,
            html: `
                <div class="text-gray-600">
                    <p class="mb-4 text-lg font-medium">${desc}</p>
                    <div class="bg-gray-50 p-4 rounded-xl text-sm text-left border border-gray-100">
                        ${detail}
                    </div>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Great!',
            confirmButtonColor: '#1a4d2e',
            buttonsStyling: false,
            customClass: {
                popup: 'rounded-[2rem] p-6',
                confirmButton: 'bg-[#1a4d2e] text-white px-8 py-3 rounded-full font-bold hover:bg-[#143d23] transition-all'
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#F9F9F7] pb-20">
            {/* Hero Section */}
            <HeroBanner />

            {/* ✅ Trust Features Bar (Interactive & Premium - Thai) */}
            <div className="max-w-6xl mx-auto px-6 relative z-20 -mt-16 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-white/60">
                    {[
                        { 
                            icon: <Truck size={32} strokeWidth={1.5} />, 
                            title: "จัดส่งไว 1-3 วัน", 
                            desc: "ได้รับสินค้าแน่นอน",
                            detail: "เราจัดส่งด้วยขนส่งเอกชนชั้นนำ (Kerry/Flash) มั่นใจได้ว่าสินค้าจะถึงมือคุณภายใน 1-3 วันทำการ พร้อมเลข Tracking ติดตามสถานะ"
                        },
                        { 
                            icon: <RefreshCw size={32} strokeWidth={1.5} />, 
                            title: "เปลี่ยนคืนสินค้าง่าย", 
                            desc: "ภายใน 7 วัน",
                            detail: "หากสินค้ามีปัญหาหรือไม่พอใจ สามารถเปลี่ยนหรือคืนสินค้าได้ภายใน 7 วัน (ตามเงื่อนไขที่กำหนด) เพื่อความสบายใจของคุณ"
                        },
                        { 
                            icon: <ShieldCheck size={32} strokeWidth={1.5} />, 
                            title: "ประกันศูนย์แท้", 
                            desc: "สินค้าลิขสิทธิ์ 100%",
                            detail: "สินค้าทุกชิ้นเป็นของแท้ 100% รับประกันศูนย์ไทย มั่นใจได้ในคุณภาพและการบริการหลังการขายที่ได้มาตรฐาน"
                        },
                        { 
                            icon: <CreditCard size={32} strokeWidth={1.5} />, 
                            title: "ผ่อน 0% สูงสุด 10 ด.", 
                            desc: "บัตรเครดิตที่ร่วมรายการ",
                            detail: "ช้อปสบายกระเป๋า! ผ่อน 0% นานสูงสุด 10 เดือน กับบัตรเครดิตธนาคารชั้นนำ (กสิกร, ไทยพาณิชย์, กรุงศรี และอื่นๆ)"
                        },
                    ].map((feature, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleInfoClick(feature.title, feature.desc, feature.detail)}
                            className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="w-16 h-16 mb-4 bg-gradient-to-br from-[#F5F7F6] to-[#E8ECEB] rounded-2xl flex items-center justify-center text-[#1a4d2e] group-hover:from-[#1a4d2e] group-hover:to-[#143d23] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-[0_10px_30px_rgba(26,77,46,0.3)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-2xl"></div>
                                <div className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                    {feature.icon}
                                </div>
                            </div>
                            <h3 className="font-bold text-[#263A33] text-sm md:text-lg group-hover:text-[#1a4d2e] transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 text-xs md:text-sm mt-1 group-hover:text-gray-500 font-light">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Categories Section (Clean & Minimal) */}
            <div className="flex flex-col w-full bg-white relative z-10 overflow-hidden pb-20 pt-16 -mt-10 rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto px-4 w-full relative mb-12">
                     <div className="text-center">
                        <span className="text-[#1a4d2e] font-bold tracking-widest text-xs uppercase mb-4 block opacity-60">Collections</span>
                        <h2 className="text-5xl md:text-6xl font-medium text-[#263A33] tracking-tighter">Shop by Category</h2>
                     </div>
                </div>
                
                <div className="space-y-0">
                    <CategoryRow title="Smartphones" categorySlug="smartphones" bgColor="transparent" />
                    <CategoryRow title="Furniture" categorySlug="furniture" bgColor="transparent" />
                    <CategoryRow title="Beauty" categorySlug="beauty" bgColor="transparent" />
                </div>
            </div>

            {/* New Arrivals Grid */}
            <div className="max-w-7xl mx-auto px-4 mt-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <span className="text-[#1a4d2e] font-black tracking-[0.2em] text-sm uppercase block mb-3 pl-1">Daily Drops</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#263A33] tracking-tight">New Arrivals <span className="text-[#1a4d2e]">.</span></h2>
                    </div>
                    <Link to="/shop" className="hidden md:flex items-center gap-2 text-gray-400 font-bold hover:text-[#1a4d2e] transition-colors group">
                        View All Products <div className="bg-gray-100 p-2 rounded-full group-hover:bg-[#1a4d2e] group-hover:text-white transition-all"><ArrowRight size={16}/></div>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {newArrivals.map((product) => (
                        <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50">
                            <div className="aspect-[1/1] bg-[#F5F5F3] rounded-[1.5rem] mb-4 overflow-hidden relative">
                                {product.stock <= 0 && (
                                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10">OUT OF STOCK</span>
                                )}
                                <img 
                                    src={getImageUrl(product.thumbnail || product.image)} 
                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                                    alt={product.title} 
                                />
                                {/* Add to Cart / Quick View actions could go here (hover) */}
                            </div>
                            
                            <div className="px-2">
                                <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">{product.category}</p>
                                <h3 className="font-bold text-[#263A33] text-lg mb-2 line-clamp-1 group-hover:text-[#1a4d2e] transition-colors">{product.title}</h3>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[#1a4d2e] font-black text-xl">{formatPrice(product.price)}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#1a4d2e] group-hover:text-white transition-colors">
                                        <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform"/>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ✅ Recently Viewed Section */}
            {recentlyViewed.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 mt-24 mb-16 border-t border-gray-200 pt-16">
                    <h2 className="text-2xl font-black text-gray-400 mb-8 flex items-center gap-2 uppercase tracking-widest text-sm">
                         <span className="text-xl mr-2">🕒</span> Recently Viewed
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {recentlyViewed.map((item) => (
                            <Link key={item.id} to={`/product/${item.id}`} className="min-w-[160px] md:min-w-[200px] bg-white rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all border border-gray-100 flex-shrink-0">
                                <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden p-2 flex items-center justify-center">
                                    <img src={getImageUrl(item.thumbnail)} className="w-full h-full object-contain mix-blend-multiply" alt=""/>
                                </div>
                                <h4 className="font-bold text-[#263A33] text-sm truncate">{item.title}</h4>
                                <p className="text-[#1a4d2e] font-black text-sm">{formatPrice(item.price)}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 text-center md:hidden px-4">
                <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-600 shadow-sm w-full justify-center">
                    ดูสินค้าทั้งหมด <ArrowRight size={18}/>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
