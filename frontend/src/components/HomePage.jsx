
import React, { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';
import FlashSaleSection from './FlashSaleSection'; // ✅ Import Flash Sale
import CategoryRow from './CategoryRow';
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw, CreditCard, Rocket, RotateCcw, Headphones, Zap } from 'lucide-react'; // ✅ Import Icons
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/formatUtils';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext'; // ✅ Import Auth
import CouponSection from './CouponSection'; // ✅ Import Coupon Section

const HomePage = () => {
    const { user } = useAuth(); // ✅ Get User State
    const [newArrivals, setNewArrivals] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [activeFlashSale, setActiveFlashSale] = useState(null); // ✅ Flash Sale State

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

    // ✅ Fetch New Arrivals & Flash Sales
    useEffect(() => {
        const fetchData = async () => {
             // 1. Products
             try {
                const res = await fetch(`${API_BASE_URL}/api/products/?page_size=8`);
                const data = await res.json();
                const items = data.results || data;
                if (Array.isArray(items)) {
                    setNewArrivals(items.slice(0, 8)); 
                }
             } catch(err) { console.error("Products fetch error:", err); }

             // 2. Flash Sales (Now supports multiple)
             try {
                 const fsRes = await axios.get(`${API_BASE_URL}/api/flash-sales/active/`);
                 if (fsRes.data && Array.isArray(fsRes.data)) {
                     setActiveFlashSale(fsRes.data); // ✅ Store Array
                 }
             } catch (err) { console.error("Flash Sale fetch error:", err); }
        };
        fetchData();
    }, []);

    // ... handleInfoClick ...

    return (
        <div className="min-h-screen bg-[#F9F9F7] pb-20">
            {/* Hero Section */}
            <HeroBanner />

            {/* Flash Sale Section - Login Required - Render All Active Sales */}
            {user ? (
                activeFlashSale && Array.isArray(activeFlashSale) && activeFlashSale.map(sale => (
                    <FlashSaleSection key={sale.id} flashSale={sale} />
                ))
            ) : (
               <div className="max-w-7xl mx-auto px-4 py-16 text-center bg-white my-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6 animate-pulse">
                        <Zap size={32} className="text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">Flash Sale สำหรับสมาชิกเท่านั้น!</h2>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                        เข้าสู่ระบบเพื่อพบกับดีลสินค้าราคาพิเศษลดกระหน่ำที่มีจำนวนจำกัด ห้ามพลาดโอกาสดีๆ แบบนี้
                    </p>
                    <Link to="/login" className="inline-flex items-center gap-2 bg-[#1a4d2e] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#143d24] transition-all shadow-lg shadow-green-900/20">
                        เข้าสู่ระบบเพื่อดูสินค้า <ArrowRight size={20} />
                    </Link>
               </div>
            )}

            {/* ✅ Public Coupon Section (Visible to Everyone) */}
            <CouponSection />



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
