import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from 'sweetalert2';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const Toast = Swal.mixin({
    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
  });

  // ฟังก์ชันโหลดข้อมูล (แยกออกมาเพื่อให้เรียกซ้ำได้ตอนเปลี่ยนหน้า)
  const fetchProductData = (productId) => {
    setLoading(true);
    fetch(`http://localhost:8000/api/products/${productId}/`)
      .then((res) => {
          if (!res.ok) throw new Error("Not Found");
          return res.json();
      })
      .then((data) => {
        setProduct(data);
        setMainImage(data.thumbnail);
        setLoading(false);
        window.scrollTo(0,0); // เลื่อนขึ้นบนสุดเสมอ
      })
      .catch((err) => {
          console.error(err);
          navigate('/shop'); // ถ้าหาไม่เจอให้เด้งกลับหน้ารวม
      });
  };

  useEffect(() => {
    fetchProductData(id);
  }, [id]);

  const handleAddToCart = () => {
      addToCart(product, 1);
      Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าเรียบร้อย' });
  };

  if (loading) return <div className="text-center py-20 animate-pulse">กำลังโหลดรายละเอียด...</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-10 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* ⭐ 1. Breadcrumb Links (กดได้จริง) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <nav className="text-sm font-medium text-gray-500">
                <Link to="/" className="hover:text-[#305949] transition">หน้าหลัก</Link> 
                <span className="mx-2">/</span>
                <Link to="/shop" className="hover:text-[#305949] transition">สินค้าทั้งหมด</Link>
                <span className="mx-2">/</span>
                <span className="text-[#305949] font-bold">{product.title}</span>
            </nav>

            {/* ⭐ 2. ปุ่ม Previous / Next */}
            <div className="flex gap-2">
                <button 
                    disabled={!product.prev_product}
                    onClick={() => navigate(`/product/${product.prev_product}`)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:text-[#305949] hover:border-[#305949] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                >
                    ← ก่อนหน้า
                </button>
                <button 
                    disabled={!product.next_product}
                    onClick={() => navigate(`/product/${product.next_product}`)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:text-[#305949] hover:border-[#305949] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                >
                    ถัดไป →
                </button>
            </div>
        </div>

        {/* Product Main Content (Card Design) */}
        <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-12 mb-16">
            {/* Left: Gallery */}
            <div className="lg:w-1/2 space-y-6">
                <div className="aspect-square bg-[#F4F4F2] rounded-[2.5rem] flex items-center justify-center p-8 overflow-hidden relative">
                    <img src={mainImage} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-500 hover:scale-110" />
                    {product.stock < 5 && product.stock > 0 && <span className="absolute top-6 left-6 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm animate-pulse">🔥 เหลือ {product.stock} ชิ้น</span>}
                </div>
                {/* Thumbnails */}
                {product.images && product.images.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                        <div onClick={() => setMainImage(product.thumbnail)} className={`w-20 h-20 rounded-2xl flex-shrink-0 cursor-pointer border-2 p-2 ${mainImage === product.thumbnail ? 'border-[#305949] bg-gray-50' : 'border-transparent bg-[#F9F9F7]'}`}>
                            <img src={product.thumbnail} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        {product.images.map((img, idx) => (
                            <div key={idx} onClick={() => setMainImage(img)} className={`w-20 h-20 rounded-2xl flex-shrink-0 cursor-pointer border-2 p-2 ${mainImage === img ? 'border-[#305949] bg-gray-50' : 'border-transparent bg-[#F9F9F7]'}`}>
                                <img src={img} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Info */}
            <div className="lg:w-1/2 flex flex-col justify-center">
                <div className="mb-2">
                    <span className="bg-[#305949]/10 text-[#305949] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#263A33] leading-tight mb-4">{product.title}</h1>
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-yellow-400 text-xl">{'★'.repeat(Math.round(product.rating || 0))}</span>
                    <span className="text-gray-400 text-sm">({product.reviews?.length || 0} รีวิว)</span>
                </div>
                <p className="text-gray-500 leading-relaxed mb-8 text-lg font-light">{product.description}</p>
                
                <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">ราคาปัจจุบัน</p>
                        <span className="text-4xl font-extrabold text-[#305949]">฿{product.price?.toLocaleString()}</span>
                    </div>
                    <button onClick={handleAddToCart} disabled={product.stock === 0} className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center gap-3 ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#305949] text-white hover:bg-[#234236] hover:shadow-xl'}`}>
                        {product.stock === 0 ? 'สินค้าหมด' : <><span>🛒</span> ใส่ตะกร้าเลย</>}
                    </button>
                </div>
            </div>
        </div>

        {/* ⭐ 3. Recommended Products (สินค้าแนะนำ) */}
        {product.related_products && product.related_products.length > 0 && (
            <div className="mb-16 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-[#263A33] mb-8 flex items-center gap-2">
                    <span>✨</span> สินค้าที่คุณอาจสนใจ (Recommended)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {product.related_products.map((rp) => (
                        <Link to={`/product/${rp.id}`} key={rp.id} className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-square bg-[#FAFAF8] rounded-2xl p-4 mb-4 flex items-center justify-center relative overflow-hidden">
                                <img src={rp.thumbnail} alt={rp.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                            </div>
                            <h3 className="font-bold text-[#263A33] line-clamp-1 group-hover:text-[#305949] transition">{rp.title}</h3>
                            <p className="text-gray-400 text-xs mb-2">{rp.category}</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-[#305949]">฿{rp.price.toLocaleString()}</span>
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md">★ {rp.rating}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default ProductDetail;