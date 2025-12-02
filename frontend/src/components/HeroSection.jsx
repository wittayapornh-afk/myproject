import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🎨 1. ฟังก์ชันเลือกธีมสีตามหมวดหมู่สินค้า
const getThemeStyle = (category) => {
    switch (category) {
        case 'smartphones':
        case 'laptops':
        case 'electronics':
        case 'mens-watches':
            // 🟠 ธีมส้มอิฐ (สำหรับสินค้า IT)
            return { bg: '#9A3412', accent: '#FDBA74', text: 'white', btnBg: 'white', btnText: '#9A3412' };
        
        case 'furniture':
        case 'home-decoration':
        case 'lighting':
            // ⚪️ ธีมครีม/ขาว (สำหรับเฟอร์นิเจอร์) - ตัวหนังสือสีเขียวเข้ม
            return { bg: '#F5F5F0', accent: '#325343', text: '#263A33', btnBg: '#325343', btnText: 'white' };
        
        case 'beauty':
        case 'skincare':
        case 'fragrances':
            // 🔴 ธีมชมพูเข้ม/แดง (สำหรับความงาม)
            return { bg: '#831843', accent: '#FBCFE8', text: 'white', btnBg: 'white', btnText: '#831843' };
            
        case 'groceries':
            // 🥦 ธีมเขียวสด (สำหรับของกิน)
            return { bg: '#14532D', accent: '#86EFAC', text: 'white', btnBg: 'white', btnText: '#14532D' };
            
        default:
            // 🟢 ธีมเขียวมาตรฐาน (Default)
            return { bg: '#325343', accent: '#B5D69E', text: 'white', btnBg: 'white', btnText: '#325343' };
    }
};

// 🧱 2. Component ย่อย: สำหรับแสดงผล 1 บล็อก
const HeroBlock = ({ product, isReversed }) => {
    const navigate = useNavigate();
    
    // ถ้าข้อมูลยังไม่มา ให้แสดง Loading
    if (!product) return (
        <div className="w-full h-[450px] flex items-center justify-center bg-gray-100 animate-pulse">
            <span className="text-4xl text-gray-300">⏳ Loading...</span>
        </div>
    );

    const theme = getThemeStyle(product.category);

    // กดแล้วไปหน้ารายละเอียดสินค้านั้นๆ
    const handleBuyNow = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div 
            className="relative w-full h-[450px] md:h-[500px] overflow-hidden flex items-center transition-colors duration-1000"
            style={{ backgroundColor: theme.bg }}
        >
            {/* Effect พื้นหลังจางๆ */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ background: `linear-gradient(120deg, transparent 40%, ${theme.text} 150%)` }}>
            </div>

            <div className={`max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-12 relative z-10 ${isReversed ? 'md:flex-row-reverse' : ''}`}>
                
                {/* ส่วนข้อความ */}
                <div className={`w-full md:w-1/2 text-center ${isReversed ? 'md:text-right' : 'md:text-left'}`}>
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest rounded-full border opacity-80" 
                          style={{ color: theme.text, borderColor: theme.text }}>
                        {product.category}
                    </span>
                    
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-sm" style={{ color: theme.text }}>
                        {product.title}
                    </h2>
                    
                    <p className="text-sm md:text-lg mb-8 opacity-90 line-clamp-2 max-w-md mx-auto md:mx-0" 
                       style={{ color: theme.text, marginLeft: isReversed ? 'auto' : '0' }}>
                        {product.description}
                    </p>
                    
                    <button 
                        onClick={handleBuyNow}
                        className="px-8 py-3 rounded-full font-bold shadow-lg transform hover:-translate-y-1 transition-all active:scale-95"
                        style={{ backgroundColor: theme.btnBg, color: theme.btnText }}
                    >
                        ช้อปเลย
                    </button>
                </div>

                {/* ส่วนรูปภาพ */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <img 
                        src={product.thumbnail} 
                        alt={product.title} 
                        className="h-[250px] md:h-[380px] object-contain drop-shadow-2xl hover:scale-105 transition duration-700 cursor-pointer"
                        style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.3))" }}
                        onClick={handleBuyNow}
                    />
                </div>
            </div>
        </div>
    );
};

// 🏠 3. Component หลัก: ดึงข้อมูลและวนลูปแสดงผล
function HeroSection() {
  const [productsToShow, setProductsToShow] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length >= 2) {
            // 🎯 Logic: พยายามหาสินค้า 2 ชิ้นที่ "ต่างหมวดหมู่กัน"
            
            // ชิ้นที่ 1: หาพวก IT/Electronics ก่อน
            let first = data.products.find(p => ['smartphones', 'laptops', 'electronics'].includes(p.category));
            if (!first) first = data.products[0]; // ถ้าไม่มีเอาตัวแรกสุด

            // ชิ้นที่ 2: หาพวก Furniture/Home ที่ไม่ใช่ชิ้นแรก
            let second = data.products.find(p => ['furniture', 'home-decoration'].includes(p.category) && p.id !== first.id);
            if (!second) second = data.products.find(p => p.id !== first.id); // ถ้าไม่มีเอาตัวถัดไปที่ไม่ซ้ำ

            setProductsToShow([first, second].filter(Boolean));
        } else if (data.products.length > 0) {
            setProductsToShow([data.products[0]]);
        }
      })
      .catch(err => console.error("Error fetching hero products:", err));
  }, []);

  return (
    <div className="flex flex-col w-full">
        {/* Loop แสดง HeroBlock ตามจำนวนสินค้าที่เลือกมา (สูงสุด 2) */}
        {productsToShow.map((product, index) => (
            <HeroBlock 
                key={product.id} 
                product={product} 
                isReversed={index % 2 !== 0} // ถ้าเป็นตัวที่ 2 ให้สลับฝั่งรูป (Zig-Zag)
            />
        ))}
    </div>
  );
}

export default HeroSection;