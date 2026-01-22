// ========================================
// 📦 Import Libraries และ Components
// ========================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

// 🎠 Swiper - สำหรับทำ Slider แถวสินค้า
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ========================================
// 🎯 Component: CategoryRow
// แสดงสินค้าในหมวดหมู่เป็น Slider เลื่อนได้
// ========================================
function CategoryRow({ title, categorySlug, bgColor = "#FFFFFF" }) {
    // 📊 State Management
    const [products, setProducts] = useState([]); // เก็บรายการสินค้า
    const [loading, setLoading] = useState(true); // สถานะกำลังโหลด
    const { addToCart } = useCart(); // Function เพิ่มสินค้าลงตะกร้า
    const { user } = useAuth(); // ข้อมูล User
    
    // 🔒 เช็คว่าเป็น Admin/Seller หรือไม่ (ซ่อนปุ่มเพิ่มตะกร้า)
    const isRestricted = ['admin', 'super_admin', 'seller'].includes(user?.role?.toLowerCase());

    // 🔔 Toast Alert (แสดงมุมบนขวา)
    const Toast = Swal.mixin({
        toast: true, 
        position: 'top-end', 
        showConfirmButton: false, 
        timer: 1500, 
        timerProgressBar: true
    });

    // ========================================
    // 🔄 useEffect: ดึงข้อมูลสินค้าเมื่อ Component โหลด
    // ========================================
    useEffect(() => {
        setLoading(true);
        
        // 📡 เรียก API ดึงสินค้าตามหมวดหมู่
        fetch(`/api/products/?category=${categorySlug}`)
            .then(res => {
                if (!res.ok) {
                    res.text().then(text => console.error("❌ API Error:", text));
                    throw new Error("Failed to fetch");
                }
                return res.json();
            })
            .then(data => {
                // ✅ รองรับทั้ง results และ products (ขึ้นอยู่กับ API)
                const productData = data.results || data.products || [];
                setProducts(productData.slice(0, 8)); // แสดงสูงสุด 8 ชิ้น
                setLoading(false);
            })
            .catch(err => {
                console.error(`❌ Error loading category ${categorySlug}:`, err);
                setProducts([]);
                setLoading(false);
            });
    }, [categorySlug]); // ทำงานใหม่เมื่อ categorySlug เปลี่ยน

    // ========================================
    // 🛒 Function: เพิ่มสินค้าลงตะกร้า
    // ========================================
    const handleAddToCart = (product) => {
        addToCart(product, 1); // เพิ่ม 1 ชิ้น
        Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าเรียบร้อย' });
    };

    // ========================================
    // 🚫 ถ้าไม่มีสินค้า ไม่แสดง Section นี้
    // ========================================
    if (!loading && products.length === 0) return null;

    return (
        <div className="py-12 px-6 border-b border-gray-50" style={{ backgroundColor: bgColor }}>
            <div className="max-w-7xl mx-auto">
                
                {/* ========================================
                    📋 Header: ชื่อหมวดหมู่ + ปุ่ม View All
                    ======================================== */}
                <div className="flex justify-between items-center mb-12">
                     {/* ชื่อหมวดหมู่ */}
                     <h2 className="text-3xl md:text-5xl font-medium text-[#263A33] tracking-tight">{title}</h2>
                    
                    {/* ปุ่ม "View All" - ลิงก์ไปหน้าร้านค้าโชว์แค่หมวดหมู่นี้ */}
                    <Link 
                        to={`/shop?category=${categorySlug}`} 
                        className="group flex items-center gap-2 text-[#1a4d2e] font-bold text-sm tracking-wide transition-all hover:gap-3 opacity-70 hover:opacity-100"
                    >
                        View All <span className="text-xl leading-none">&rarr;</span>
                    </Link>
                </div>

                {/* ========================================
                    🎠 Swiper Slider: รายการสินค้า
                    ======================================== */}
                <Swiper
                    // ⚙️ Modules ที่ใช้งาน
                    modules={[Navigation]}
                    
                    // 📏 ระยะห่างระหว่างการ์ด
                    spaceBetween={32}
                    
                    // 👀 จำนวนการ์ดที่แสดงพร้อมกัน (default)
                    slidesPerView={1.5}
                    
                    // 🔘 เปิดใช้งานปุ่มเลื่อน (ลูกศรซ้าย-ขวา)
                    navigation
                    
                    // 📱 Responsive: ปรับจำนวนการ์ดตามขนาดหน้าจอ
                    breakpoints={{
                        640: { slidesPerView: 2 },    // หน้าจอ ≥640px: แสดง 2 การ์ด
                        768: { slidesPerView: 3 },    // หน้าจอ ≥768px: แสดง 3 การ์ด
                        1024: { slidesPerView: 4 },   // หน้าจอ ≥1024px: แสดง 4 การ์ด
                        1280: { slidesPerView: 5 },   // หน้าจอ ≥1280px: แสดง 5 การ์ด
                    }}
                    
                    className="pb-12 !overflow-visible" // เผื่อพื้นที่ให้เงาโชว์
                >
                    {loading ? (
                        // 💀 Skeleton Loading: แสดงตอนกำลังโหลดข้อมูล
                        [...Array(4)].map((_, i) => (
                            <SwiperSlide key={i}>
                                <div className="min-w-[280px] md:min-w-[300px] h-[400px] bg-gray-50 rounded-[2rem] animate-pulse"></div>
                            </SwiperSlide>
                        ))
                    ) : (
                        // 🎨 แสดงการ์ดสินค้าจริง
                        products.map((product) => (
                            <SwiperSlide key={product.id}>
                                {/* ========================================
                                    🎫 การ์ดสินค้าแต่ละใบ (Minimal Design)
                                    ======================================== */}
                                <div className="group relative cursor-pointer">
                                    
                                    {/* 📸 ส่วนรูปภาพสินค้า */}
                                    <div className="aspect-[4/5] bg-[#F3F4F6] rounded-[2rem] mb-5 overflow-hidden relative">
                                        {/* Link ครอบทั้งรูป - คลิกแล้วไปหน้า ProductDetail */}
                                        <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center p-6">
                                            <img 
                                                src={product.thumbnail} 
                                                alt={product.title} 
                                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" 
                                            />
                                        </Link>
                                        
                                        {/* 🛒 ปุ่มเพิ่มลงตะกร้า (แสดงตอน Hover) */}
                                        {!isRestricted && product.stock > 0 && (
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault(); // ป้องกันไม่ให้ไปหน้าสินค้า
                                                    handleAddToCart(product); 
                                                }}
                                                className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#1a4d2e] translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#1a4d2e] hover:text-white"
                                            >
                                                {/* ไอคอนตะกร้า (SVG) */}
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                                                </svg>
                                            </button>
                                        )}

                                        {/* 🏷️ Badge "Out of Stock" (ถ้าสินค้าหมด) */}
                                        {product.stock === 0 && (
                                            <span className="absolute top-4 left-4 bg-gray-900 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                                                Out of Stock
                                            </span>
                                        )}
                                    </div>

                                    {/* 📝 ข้อมูลสินค้า (ชื่อ, ราคา, คะแนน) */}
                                    <div>
                                        <h3 className="text-lg font-bold text-[#263A33] mb-1 truncate">{product.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#1a4d2e] font-bold text-lg">฿{product.price?.toLocaleString()}</span>
                                            {product.rating > 0 && <span className="text-xs text-gray-400">★ {product.rating}</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.category}</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))
                    )}
                </Swiper>
            </div>
        </div>
    );
}

export default CategoryRow;