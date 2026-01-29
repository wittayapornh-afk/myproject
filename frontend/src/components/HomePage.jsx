
import React, { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';
import FlashSaleSection from './FlashSaleSection'; // ✅ Import Flash Sale
import CategoryRow from './CategoryRow';
import CouponSection from './CouponSection'; // ✅ Import Coupon Section
import { 
    ArrowRight, Star, Truck, ShieldCheck, RefreshCw, CreditCard, Rocket, RotateCcw, Headphones, Zap, 
    Sofa, LayoutGrid, Watch, Monitor, Smartphone, Shirt, Footprints,
    Utensils, Gift, Flower2, Glasses, ShoppingBag, Sparkles, Gem, ShoppingBasket,
    Tablet, Bike, Car, Trophy, Laptop, CookingPot, Dumbbell, Pipette, Briefcase // ✅ Import More Icons
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/formatUtils';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext'; // ✅ Import Auth


const HomePage = () => {
    const { user } = useAuth(); // ✅ Get User State
    const [newArrivals, setNewArrivals] = useState([]);
    const [categories, setCategories] = useState([]); // ✅ Real Categories State
    const [essentials, setEssentials] = useState([]);

    const [activeFlashSale, setActiveFlashSale] = useState(null); // ✅ Flash Sale State



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
                     // ✅ Filter: Show only if active OR starts within 1 hour
                     const now = Date.now();
                     const oneHour = 60 * 60 * 1000;
                     const filtered = fsRes.data.filter(sale => {
                         const start = new Date(sale.start_time).getTime();
                         if (start <= now) return true; // Started
                         return (start - now) <= oneHour; // Coming soon (<= 1h)
                     });
                     setActiveFlashSale(filtered);
                 }
             } catch (err) { console.error("Flash Sale fetch error:", err); }

             // 3. Essentials / Often Bought (Low Price)
             // 🎓 Optimization: Fetch items sorted by price (asc) to represent "Essentials" or "Easy to buy" items
             try {
                 const res = await fetch(`${API_BASE_URL}/api/products/?ordering=price&page_size=4`);
                 const data = await res.json();
                 const items = data.results || data;
                 if (Array.isArray(items)) setEssentials(items.slice(0, 4));
                 if (Array.isArray(items)) setEssentials(items.slice(0, 4));
             } catch(err) { console.error("Essentials fetch error:", err); }

             // 4. Categories
             try {
                const catRes = await fetch(`${API_BASE_URL}/api/categories/`);
                const catData = await catRes.json();
                // catData might be { categories: [...] } or just [...]
                const cats = catData.categories || catData || [];
                if (Array.isArray(cats)) {
                     // Filter duplicates just in case
                     setCategories([...new Set(cats)]);
                }
             } catch(err) { console.error("Categories fetch error:", err); }
        };
        fetchData();
    }, []);

    // 🎓 Icon Mapping Helper (Enhanced with Thai & Modern Icons)
    const getCategoryConfig = (catName) => {
        const lower = catName.toLowerCase();

        // 💄 Beauty & Health
        if (lower.includes('beauty') && !lower.includes('health') && !lower.includes('skin')) return {
            icon: Sparkles, label: 'เครื่องสำอาง / ความงาม', color: 'bg-pink-50 text-pink-600'
        };
        // 🧴 Skin Care
        if (lower.includes('skin') || lower.includes('serum') || lower.includes('cream')) return {
            icon: Pipette, label: 'ผลิตภัณฑ์ดูแลผิว', color: 'bg-blue-50 text-blue-400'
        };
        // 🌸 Fragrances
        if (lower.includes('fragrance') || lower.includes('perfume') || lower.includes('น้ำหอม')) return {
            icon: Gem, label: 'น้ำหอม', color: 'bg-purple-50 text-purple-600'
        };

        // 🛋️ Furniture
        if (lower.includes('furniture') || lower.includes('sofa') || lower.includes('armchair')) return {
            icon: Sofa, label: 'เฟอร์นิเจอร์', color: 'bg-orange-50 text-stone-600'
        };
        // 🏠 Home Decoration
        if (lower.includes('decor') || lower.includes('home')) return {
            icon: Flower2, label: 'ของตกแต่งบ้าน', color: 'bg-teal-50 text-teal-600'
        };
        // 🍳 Kitchen Accessories
        if (lower.includes('kitchen') || lower.includes('pan') || lower.includes('knife')) return {
            icon: CookingPot, label: 'อุปกรณ์ครัว', color: 'bg-gray-100 text-gray-800'
        };

        // 🥬 Groceries
        if (lower.includes('grocery') || lower.includes('groceries') || lower.includes('vegetable') || lower.includes('food')) return {
            icon: ShoppingBasket, label: 'สินค้าอุปโภคบริโภค', color: 'bg-green-50 text-green-700'
        };

        // 💻 Laptops
        if (lower.includes('laptop')) return {
            icon: Laptop, label: 'โน้ตบุ๊ก / แล็ปท็อป', color: 'bg-slate-100 text-blue-600'
        };
        // 📱 Smartphones
        if (lower.includes('smartphone') || (lower.includes('phone') && !lower.includes('access'))) return {
            icon: Smartphone, label: 'สมาร์ทโฟน', color: 'bg-gray-900 text-white'
        };
        // 📱 Tablets
        if (lower.includes('tablet') || lower.includes('ipad')) return {
            icon: Tablet, label: 'แท็บเล็ต', color: 'bg-gray-200 text-gray-700'
        };
        // 🎧 Mobile Accessories
        if (lower.includes('mobile access') || lower.includes('earbud') || lower.includes('case')) return {
            icon: Headphones, label: 'อุปกรณ์เสริมมือถือ', color: 'bg-cyan-50 text-cyan-500'
        };

        // 👔 Mens Shirts
        if (lower.includes('mens shirt') || (lower.includes('shirt') && lower.includes('men'))) return {
            icon: Shirt, label: 'เสื้อเชิ้ตผู้ชาย', color: 'bg-blue-50 text-blue-900'
        };
        // 👞 Mens Shoes
        if (lower.includes('mens shoes') || (lower.includes('shoe') && lower.includes('men'))) return {
            icon: Footprints, label: 'รองเท้าผู้ชาย', color: 'bg-amber-100 text-amber-800'
        };
        // ⌚ Mens Watches
        if (lower.includes('mens watch') || (lower.includes('watch') && lower.includes('men'))) return {
            icon: Watch, label: 'นาฬิกาผู้ชาย', color: 'bg-gray-100 text-slate-600'
        };

        // 👗 Tops (Women)
        if (lower.includes('top') || lower.includes('t-shirt')) return {
            icon: Shirt, label: 'เสื้อผ้าส่วนบน (ทั่วไป)', color: 'bg-sky-50 text-sky-400'
        };
        // 👜 Womens Bags
        if (lower.includes('womens bag') || lower.includes('handbag')) return {
            icon: ShoppingBag, label: 'กระเป๋าผู้หญิง', color: 'bg-rose-50 text-rose-800'
        };
        // 👗 Womens Dresses
        if (lower.includes('dress')) return {
            icon: Shirt, label: 'ชุดเดรสผู้หญิง', color: 'bg-orange-50 text-orange-400'
        };
        // 💍 Womens Jewellery
        if (lower.includes('jewel') || lower.includes('ring') || lower.includes('necklace')) return {
            icon: Gem, label: 'เครื่องประดับผู้หญิง', color: 'bg-slate-50 text-slate-400'
        };
        // 👠 Womens Shoes
        if (lower.includes('womens shoes') || lower.includes('heels') || lower.includes('pumps')) return {
            icon: Footprints, label: 'รองเท้าผู้หญิง', color: 'bg-red-50 text-red-600'
        };
        // ⌚ Womens Watches
        if (lower.includes('womens watch')) return {
            icon: Watch, label: 'นาฬิกาผู้หญิง', color: 'bg-rose-50 text-rose-500'
        };

        // 🏍️ Motorcycle
        if (lower.includes('motorcycle') || lower.includes('helmet')) return {
            icon: Bike, label: 'มอเตอร์ไซค์', color: 'bg-stone-900 text-orange-500'
        };
        // 🚗 Vehicle
        if (lower.includes('vehicle') || lower.includes('car')) return {
            icon: Car, label: 'ยานยนต์ / รถยนต์', color: 'bg-blue-50 text-blue-500'
        };
        
        // 🏋️ Sports Accessories
        if (lower.includes('sport') || lower.includes('dumbbell') || lower.includes('gym')) return {
            icon: Dumbbell, label: 'อุปกรณ์กีฬา', color: 'bg-red-50 text-red-600'
        };
        // 🕶️ Sunglasses
        if (lower.includes('sunglass') || lower.includes('glass')) return {
            icon: Glasses, label: 'แว่นกันแดด', color: 'bg-yellow-50 text-yellow-800'
        };

        return { icon: LayoutGrid, label: catName, color: 'bg-gray-50 text-gray-600' }; // Default
    };

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
            <div className="flex flex-col w-full bg-white relative z-10 overflow-hidden pb-20 pt-10 -mt-10 rounded-t-[3rem]">
                
                <div className="max-w-7xl mx-auto px-4 w-full mb-16">
                    <h3 className="text-center font-bold text-gray-400 uppercase tracking-widest text-xs mb-8">เลือกหมวดหมู่สินค้า</h3>
                    <div className="flex flex-wrap justify-center gap-6 px-4">
                        {/* Dynamic Categories - Limit to 6 */}
                        {categories.slice(0, 6).map((catName, idx) => {
                             const config = getCategoryConfig(catName);
                             // Use config.label if available, otherwise catName
                             const displayName = config.label || catName;
                             
                             return (
                                <Link to={`/shop?category=${encodeURIComponent(catName)}`} key={idx} className="flex flex-col items-center gap-3 group cursor-pointer w-24">
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${config.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ring-4 ring-white`}>
                                        <config.icon size={28} strokeWidth={1.5} />
                                    </div>
                                    <span className="font-bold text-gray-700 text-xs md:text-sm group-hover:text-[#1a4d2e] transition-colors text-center leading-tight">{displayName}</span>
                                </Link>
                             );
                        })}

                        {/* View All Button */}
                        <Link to="/shop" className="flex flex-col items-center gap-3 group cursor-pointer w-24">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ring-4 ring-white group-hover:bg-[#1a4d2e] group-hover:text-white">
                                <LayoutGrid size={28} strokeWidth={1.5} className="text-gray-600 group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-bold text-gray-700 text-xs md:text-sm group-hover:text-[#1a4d2e] transition-colors text-center leading-tight">ดูทั้งหมด</span>
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 w-full relative mb-12">
                     <div className="text-center">
                        <span className="text-[#1a4d2e] font-bold tracking-widest text-xs uppercase mb-4 block opacity-60">คอลเลกชัน</span>
                        <h2 className="text-5xl md:text-6xl font-medium text-[#263A33] tracking-tighter">ช้อปตามหมวดหมู่</h2>
                     </div>
                </div>
                
                <div className="space-y-0">
                    <CategoryRow title="สมาร์ทโฟน" categorySlug="smartphones" bgColor="transparent" />
                    <CategoryRow title="เฟอร์นิเจอร์" categorySlug="furniture" bgColor="transparent" />
                </div>
            </div>


            {/* 🎓 Feature: Essentials / Often Bought Section */}
            <div className="max-w-7xl mx-auto px-4 py-8 mb-16 bg-[#F4F4F0] rounded-3xl mx-4 md:mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 px-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#263A33]">ของใช้ประจำวัน 🌿</h2>
                        <p className="text-gray-500 mt-2">สินค้าใช้บ่อย ราคาดี ที่ควรมีติดบ้าน</p>
                    </div>
                    <Link to="/shop" className="text-[#1a4d2e] font-bold text-sm underline mt-4 md:mt-0">ดูสินค้าทั้งหมด</Link>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {essentials.map((item) => (
                        <Link key={item.id} to={`/product/${item.id}`} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                             <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                                <img src={getImageUrl(item.thumbnail)} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" alt={item.title}/>
                             </div>
                             <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.title}</h4>
                             <p className="text-[#1a4d2e] font-black mt-1">{formatPrice(item.price)}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* New Arrivals Grid */}
            <div className="max-w-7xl mx-auto px-4 mt-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div>
                        <span className="text-[#1a4d2e] font-black tracking-[0.2em] text-sm uppercase block mb-3 pl-1">อัพเดททุกวัน</span>
                        <h2 className="text-4xl md:text-5xl font-black text-[#263A33] tracking-tight">สินค้ามาใหม่ <span className="text-[#1a4d2e]">.</span></h2>
                    </div>
                    <Link to="/shop" className="hidden md:flex items-center gap-2 text-gray-400 font-bold hover:text-[#1a4d2e] transition-colors group">
                        ดูสินค้าทั้งหมด <div className="bg-gray-100 p-2 rounded-full group-hover:bg-[#1a4d2e] group-hover:text-white transition-all"><ArrowRight size={16}/></div>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {newArrivals.map((product) => {
                        // ⚡ Flash Sale Logic Check
                        let flashPrice = null;
                        if (activeFlashSale && Array.isArray(activeFlashSale)) {
                            for (const sale of activeFlashSale) {
                                // Ensure sale.items is an array before trying to find
                                if (sale.items && Array.isArray(sale.items)) {
                                    const item = sale.items.find(i => (i.product?.id || i.product) === product.id);
                                    if (item) {
                                        flashPrice = item.price;
                                        break; // Found in one sale, no need to check others
                                    }
                                }
                            }
                        }

                        return (
                            <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50">
                                <div className="aspect-[1/1] bg-[#F5F5F3] rounded-[1.5rem] mb-4 overflow-hidden relative">
                                    {product.stock <= 0 && (
                                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10">OUT OF STOCK</span>
                                    )}
                                    {flashPrice && (
                                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md z-10 animate-pulse shadow-sm">
                                            ⚡ FLASH SALE
                                        </div>
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
                                            {flashPrice ? (
                                                <>
                                                    <span className="text-[#1a4d2e] font-black text-xl">{formatPrice(flashPrice)}</span>
                                                    <span className="text-gray-400 text-sm line-through">{formatPrice(product.price)}</span>
                                                </>
                                            ) : (
                                                <span className="text-[#1a4d2e] font-black text-xl">{formatPrice(product.price)}</span>
                                            )}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#1a4d2e] group-hover:text-white transition-colors">
                                            <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform"/>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>



            <div className="mt-8 text-center md:hidden px-4">
                <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-gray-600 shadow-sm w-full justify-center">
                    ดูสินค้าทั้งหมด <ArrowRight size={18}/>
                </Link>
            </div>

            {/* 🎓 Feature: CTA Section (Conversion Booster) */}
            <div className="max-w-5xl mx-auto px-4 mt-24 mb-12">
                <div className="bg-[#1a4d2e] rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                            ช้อปคุ้มกว่าเดิม!
                        </h2>
                        <p className="text-green-100 text-lg mb-10 max-w-2xl mx-auto">
                            อย่าลืมเก็บคูปองส่วนลดก่อนช้อป วันนี้เรามีคูปองใหม่ๆ เพียบ
                            คลิกดูคูปองทั้งหมดได้เลย
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <Link to="/coupons" className="bg-white text-[#1a4d2e] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-transform hover:scale-105 shadow-lg flex items-center gap-2 justify-center">
                                <Zap size={20} className="fill-current" /> เก็บโค้ดส่วนลด
                            </Link>
                            <Link to="/shop" className="bg-[#325343] border border-green-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#2a4538] transition-all">
                                ดูสินค้ามาใหม่
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🎁 Floating Coupon Button */}
            <Link to="/coupons" className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform hover:shadow-pink-500/50 group animate-bounce-slow">
                <Gift size={28} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-[10px] font-black text-yellow-900 px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-pulse">
                    FREE
                </span>
            </Link>
        </div>
    );
};

export default HomePage;
