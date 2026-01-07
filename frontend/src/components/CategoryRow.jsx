import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // ✅ Import Auth
import Swal from 'sweetalert2';

function CategoryRow({ title, categorySlug, bgColor = "#FFFFFF" }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth(); // ✅ Get User
    
    // ✅ Check Restricted Role
    const isRestricted = ['admin', 'super_admin', 'seller'].includes(user?.role?.toLowerCase());

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
    });

    useEffect(() => {
        setLoading(true);
        // ดึงข้อมูลสินค้าตามหมวดหมู่
        fetch(`/api/products/?category=${categorySlug}`)
            .then(res => {
                if (!res.ok) {
                    res.text().then(text => console.error("API Error:", text));
                    throw new Error("Failed");
                }
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
                {/* หัวข้อหมวดหมู่ (Minimal Premium Design) */}
                <div className="flex justify-between items-center mb-12">
                     {/* Title */}
                     <h2 className="text-3xl md:text-5xl font-medium text-[#263A33] tracking-tight">{title}</h2>
                    
                    {/* Minimal Button */}
                    <Link to={`/shop?category=${categorySlug}`} className="group flex items-center gap-2 text-[#1a4d2e] font-bold text-sm tracking-wide transition-all hover:gap-3 opacity-70 hover:opacity-100">
                        View All <span className="text-xl leading-none">&rarr;</span>
                    </Link>
                </div>

                {/* รายการสินค้า (เลื่อนแนวนอน) */}
                <div className="flex overflow-x-auto pb-12 gap-8 snap-x snap-mandatory scrollbar-none">
                    {loading ? (
                        // Skeleton Loading
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="min-w-[280px] md:min-w-[300px] h-[400px] bg-gray-50 rounded-[2rem] animate-pulse"></div>
                        ))
                    ) : (
                        products.map((product) => (
                            // ✨ Minimal Product Card
                            <div key={product.id} className="min-w-[260px] md:min-w-[280px] snap-center group relative cursor-pointer">
                                
                                {/* Image Area - Clean & Simple */}
                                <div className="aspect-[4/5] bg-[#F3F4F6] rounded-[2rem] mb-5 overflow-hidden relative">
                                    <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center p-6">
                                        <img src={product.thumbnail} alt={product.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" />
                                    </Link>
                                    
                                    {/* Action Button (Add to Cart) - Appears on Hover */}
                                    {!isRestricted && product.stock > 0 && (
                                        <button 
                                            onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                                            className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#1a4d2e] translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#1a4d2e] hover:text-white"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        </button>
                                    )}

                                    {/* Badges */}
                                    {product.stock === 0 && (
                                        <span className="absolute top-4 left-4 bg-gray-900 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">Out of Stock</span>
                                    )}
                                </div>

                                {/* Text Info */}
                                <div>
                                    <h3 className="text-lg font-bold text-[#263A33] mb-1 truncate">{product.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#1a4d2e] font-bold text-lg">฿{product.price?.toLocaleString()}</span>
                                        {product.rating > 0 && <span className="text-xs text-gray-400">★ {product.rating}</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.category}</p>
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