import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

function CategoryRow({ title, categorySlug, bgColor = "#FFFFFF" }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
    });

    useEffect(() => {
        setLoading(true);
        // ดึงข้อมูลสินค้าตามหมวดหมู่
        fetch(`/api/products/?category=${categorySlug}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed");
                return res.json();
            })
            .then(data => {
                // ✅ ใช้ Logic กันหน้าขาว: รองรับทั้ง results และ products
                const productData = data.results || data.products || [];
                setProducts(productData.slice(0, 8)); // แสดงสูงสุด 8 ชิ้นต่อแถว
                setLoading(false);
            })
            .catch(err => {
                console.error(`Error loading category ${categorySlug}:`, err);
                setProducts([]);
                setLoading(false);
            });
    }, [categorySlug]);

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าเรียบร้อย' });
    };

    if (!loading && products.length === 0) return null;

    return (
        <div className="py-12 px-6 border-b border-gray-50" style={{ backgroundColor: bgColor }}>
            <div className="max-w-7xl mx-auto">
                
                {/* หัวข้อหมวดหมู่ */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <span className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-1 block">Collection</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-textMain">{title}</h2>
                    </div>
                    <Link to={`/shop?category=${categorySlug}`} className="group flex items-center gap-2 text-primary font-bold text-sm transition-all hover:gap-3">
                        ดูทั้งหมด <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs group-hover:scale-110 transition">→</span>
                    </Link>
                </div>

                {/* รายการสินค้า (เลื่อนแนวนอน) */}
                <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {loading ? (
                        // Skeleton Loading
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="min-w-[280px] md:min-w-[320px] h-[450px] bg-white rounded-[2.5rem] animate-pulse border border-gray-100"></div>
                        ))
                    ) : (
                        products.map((product) => (
                            // ✨ การ์ดสินค้า (ดีไซน์เดียวกับ ProductList เป๊ะๆ)
                            <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-center group bg-white rounded-[2.5rem] p-5 shadow-soft hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col border border-white hover:-translate-y-2">
                                
                                {/* Status Badges */}
                                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 items-start">
                                    <span className="bg-white/95 backdrop-blur text-gray-800 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm border border-gray-100 flex items-center gap-1">
                                        ⭐ {product.rating || 0}
                                    </span>
                                    {product.stock === 0 ? (
                                        <span className="bg-gray-800 text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase shadow-sm">⚫ หมด</span>
                                    ) : product.stock < 5 ? (
                                        <span className="bg-red-500 text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase shadow-sm animate-pulse">🔥 เหลือ {product.stock}</span>
                                    ) : null}
                                </div>

                                {/* Image Area */}
                                <div className="w-full h-64 rounded-[2rem] flex-shrink-0 relative overflow-hidden transition-colors flex items-center justify-center bg-[#FAFAF8] mb-6 group-hover:bg-[#F2F0E4]/50">
                                    <Link to={`/product/${product.id}`} className="block w-full h-full p-6 flex items-center justify-center">
                                        <img src={product.thumbnail} alt={product.title} className="max-w-full max-h-full object-contain transition duration-700 group-hover:scale-110 drop-shadow-md mix-blend-multiply" />
                                    </Link>
                                </div>

                                {/* Content */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">{product.category}</p>
                                        <Link to={`/product/${product.id}`} className="block">
                                            <h3 className="text-xl font-bold text-textMain hover:text-primary transition duration-300 leading-tight line-clamp-2">{product.title}</h3>
                                        </Link>
                                        <p className="text-gray-400 text-xs mt-2 line-clamp-2 font-light">{product.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                                        <span className="text-2xl font-bold text-primary">฿{product.price?.toLocaleString()}</span>
                                        <button 
                                            onClick={() => handleAddToCart(product)} 
                                            disabled={product.stock === 0} 
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-[#234236] hover:rotate-90'}`}
                                        >
                                            {product.stock === 0 ? '✕' : '+'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default CategoryRow;