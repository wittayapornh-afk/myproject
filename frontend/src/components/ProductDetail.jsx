import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // โหลดข้อมูลสินค้า
    const loadData = async () => {
        // ... (Logic การโหลดข้อมูลคงเดิม แต่เปลี่ยนสี UI ด้านล่าง) ...
        try {
            // เช็ค ID สมมติ (Mockup)
            if (id === '999') {
                const fakeProduct = {
                    id: 999,
                    title: "Classic Wooden Chair",
                    category: "furniture",
                    price: 129,
                    rating: 4.8,
                    stock: 12,
                    brand: "WoodCraft",
                    description: "เก้าอี้ไม้แท้ดีไซน์มินิมอล แข็งแรงทนทาน เหมาะสำหรับตกแต่งห้องสไตล์โมเดิร์น",
                    thumbnail: "https://www.pngarts.com/files/3/Wooden-Chair-PNG-Image-Background.png",
                    images: ["https://www.pngarts.com/files/3/Wooden-Chair-PNG-Image-Background.png"]
                };
                setProduct(fakeProduct);
                setSelectedImage(fakeProduct.thumbnail);
                return;
            } else if (id === '888') {
                 const fakeProduct = {
                    id: 888,
                    title: "Retro Chic Bookshelf",
                    category: "furniture",
                    price: 299,
                    rating: 4.9,
                    stock: 5,
                    brand: "Urban Loft",
                    description: "ชั้นวางของสไตล์ Industrial Loft โครงเหล็กสีดำด้าน ตัดกับไม้เนื้อแข็ง ดีไซน์เท่ ดิบ แข็งแรงทนทาน",
                    thumbnail: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80", 
                    images: ["https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80"]
                };
                setProduct(fakeProduct);
                setSelectedImage(fakeProduct.thumbnail);
                return;
            }

            // โหลดจาก API จริง
            const res = await fetch(`http://localhost:8000/api/products/${id}/`);
            if (!res.ok) throw new Error("Product not found");
            const data = await res.json();
            setProduct(data);
            setSelectedImage(data.thumbnail || "https://placehold.co/400?text=No+Image");
        } catch (err) {
            console.error(err);
        }
    };
    loadData();
  }, [id]);

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F0E4]">
        <div className="text-primary font-bold text-xl animate-pulse">Loading...</div>
    </div>
  );

  return (
    // ✅ เปลี่ยน bg เป็นสีครีม (#F2F0E4) เพื่อให้เข้ากับธีม Nature
    <div className="min-h-screen bg-[#F2F0E4] py-16 px-6 flex items-center justify-center">
        
        {/* การ์ดหลักสีขาว ขอบมนมาก เหมือนในรูป */}
        <div className="bg-white max-w-6xl w-full rounded-[3rem] shadow-xl p-8 md:p-12 border border-white flex flex-col lg:flex-row gap-12 items-center">
            
            {/* Left: Images */}
            <div className="w-full lg:w-1/2 space-y-6">
                <div className="bg-[#FAFAF8] rounded-[2.5rem] aspect-square flex items-center justify-center p-8 border border-gray-100 relative overflow-hidden group">
                    <img 
                        src={selectedImage || product.thumbnail} 
                        alt={product.title} 
                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply" 
                    />
                </div>
                {/* Thumbnails */}
                {product.images && product.images.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                        <button onClick={() => setSelectedImage(product.thumbnail)} className={`w-16 h-16 rounded-xl p-1 border-2 transition-all ${selectedImage === product.thumbnail ? 'border-secondary' : 'border-transparent hover:border-gray-200'}`}>
                            <img src={product.thumbnail} className="w-full h-full object-contain bg-[#FAFAF8] rounded-lg" />
                        </button>
                        {product.images.map((img, i) => (
                            <button key={i} onClick={() => setSelectedImage(img)} className={`w-16 h-16 rounded-xl p-1 border-2 transition-all ${selectedImage === img ? 'border-secondary' : 'border-transparent hover:border-gray-200'}`}>
                                <img src={img} className="w-full h-full object-contain bg-[#FAFAF8] rounded-lg" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Info */}
            <div className="w-full lg:w-1/2">
                
                {/* Breadcrumb & Category */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {product.category}
                    </span>
                    {product.brand && (
                        <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                            {product.brand}
                        </span>
                    )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-textMain mb-6 leading-tight">
                    {product.title}
                </h1>
                
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
                    {product.description || "รายละเอียดสินค้าคุณภาพดี คัดสรรมาเพื่อคุณโดยเฉพาะ..."}
                </p>

                <div className="flex items-center gap-6 mb-8 border-t border-b border-gray-100 py-6">
                    <span className="text-4xl font-bold text-primary">${product.price?.toLocaleString()}</span>
                    {product.stock > 0 ? (
                        <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-3 py-1 rounded-md">In Stock</span>
                    ) : (
                        <span className="bg-[#FFEBEE] text-[#C62828] text-xs font-bold px-3 py-1 rounded-md">Out of Stock</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Quantity */}
                    <div className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-full px-4 py-2 w-full sm:w-40 shadow-sm">
                        <button onClick={() => setQuantity(Math.max(1, q => q-1))} className="text-gray-400 hover:text-primary text-xl px-2">-</button>
                        <span className="font-bold text-lg text-primary">{quantity}</span>
                        <button onClick={() => setQuantity(q => q+1)} className="text-gray-400 hover:text-primary text-xl px-2">+</button>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button 
                        onClick={() => addToCart(product, quantity)} 
                        className="flex-1 bg-[#325343] hover:bg-[#234236] text-white py-3.5 rounded-full font-bold uppercase tracking-widest shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        Add to Cart
                    </button>
                </div>
                
                {/* Extra Info */}
                <div className="mt-8 text-xs text-gray-400 flex gap-6 uppercase tracking-wider">
                    <p>SKU: <span className="text-textMain font-bold">ZK-{product.id}</span></p>
                    <p>Free Shipping</p>
                    <p>Secure Checkout</p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default ProductDetail;