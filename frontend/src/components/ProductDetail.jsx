import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const Toast = Swal.mixin({
    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
  });

  const fetchProductData = (productId) => {
    setLoading(true);
    fetch(`http://localhost:8000/api/products/${productId}/`)
      .then((res) => { if (!res.ok) throw new Error("Not Found"); return res.json(); })
      .then((data) => {
        setProduct(data);
        setMainImage(data.thumbnail);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => { console.error(err); navigate('/shop'); });
  };

  useEffect(() => { fetchProductData(id); }, [id]);

  const handleAddToCart = () => {
      addToCart(product, 1);
      Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าเรียบร้อย' });
  };

  // ฟังก์ชันลบสินค้า (Delete)
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการลบสินค้า?",
      text: "คุณไม่สามารถกู้คืนสินค้านี้ได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/products/${id}/delete/`, {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        });

        if (response.ok) {
          await Swal.fire("Deleted!", "ลบสินค้าเรียบร้อยแล้ว", "success");
          navigate('/shop');
        } else {
          Swal.fire("Error", "ไม่มีสิทธิ์ลบสินค้านี้", "error");
        }
      } catch (error) {
        Swal.fire("Error", "เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#305949]"></div>
    </div>
  );
  
  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <nav className="flex items-center text-sm font-medium text-gray-500">
                <Link to="/" className="hover:text-[#305949] transition-colors">หน้าหลัก</Link> 
                <i className="bi bi-chevron-right text-xs mx-3 text-gray-300"></i>
                <Link to="/shop" className="hover:text-[#305949] transition-colors">สินค้าทั้งหมด</Link>
                <i className="bi bi-chevron-right text-xs mx-3 text-gray-300"></i>
                <span className="text-[#305949] font-bold truncate max-w-[150px] sm:max-w-xs">{product.title}</span>
            </nav>

            <div className="flex gap-2 self-end sm:self-auto">
                <button disabled={!product.prev_product} onClick={() => navigate(`/product/${product.prev_product}`)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-600 hover:border-[#305949] hover:text-[#305949] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm">
                    <i className="bi bi-arrow-left"></i>
                </button>
                <button disabled={!product.next_product} onClick={() => navigate(`/product/${product.next_product}`)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-600 hover:border-[#305949] hover:text-[#305949] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm">
                    <i className="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-10 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-12 mb-16 animate-fade-in">
            
            {/* Gallery Section (ลบสติ๊กเกอร์ลอยออกแล้ว) */}
            <div className="lg:w-1/2 space-y-6 relative"> 
                <div className="aspect-square bg-[#FAFAF8] rounded-[1.5rem] flex items-center justify-center p-8 overflow-hidden relative group border border-gray-50">
                    <img src={mainImage} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                    {product.stock < 5 && product.stock > 0 && (
                        <span className="absolute top-4 left-4 bg-red-50 text-red-600 border border-red-100 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                            <i className="bi bi-fire"></i> เหลือ {product.stock} ชิ้น
                        </span>
                    )}
                </div>
                
                {product.images && product.images.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                        <div onClick={() => setMainImage(product.thumbnail)} className={`w-20 h-20 rounded-xl flex-shrink-0 cursor-pointer border-2 p-1.5 transition-all ${mainImage === product.thumbnail ? 'border-[#305949] bg-white shadow-md scale-105' : 'border-transparent bg-[#FAFAF8] opacity-70 hover:opacity-100'}`}>
                            <img src={product.thumbnail} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        {product.images.map((img, idx) => (
                            <div key={idx} onClick={() => setMainImage(img)} className={`w-20 h-20 rounded-xl flex-shrink-0 cursor-pointer border-2 p-1.5 transition-all ${mainImage === img ? 'border-[#305949] bg-white shadow-md scale-105' : 'border-transparent bg-[#FAFAF8] opacity-70 hover:opacity-100'}`}>
                                <img src={img} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info Section */}
            <div className="lg:w-1/2 flex flex-col">
                <div className="mb-4 flex items-center gap-3">
                    <span className="bg-[#305949]/10 text-[#305949] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <i className="bi bi-star-fill"></i>
                        <span className="text-gray-500 font-medium">4.8 (120 รีวิว)</span>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[#263A33] leading-snug mb-6">{product.title}</h1>
                <p className="text-gray-500 leading-7 mb-8 font-light text-lg">{product.description}</p>
                
                <div className="mt-auto pt-8 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="text-sm text-gray-400 mb-1 font-medium">ราคาต่อหน่วย</p>
                            <span className="text-4xl font-extrabold text-[#305949]">฿{product.price?.toLocaleString()}</span>
                        </div>

                        {/* ✅✅✅ ปุ่ม Action Zone (ย้ายมาอยู่ตรงนี้) ✅✅✅ */}
                        {user && (user.role_code === 'admin' || user.role_code === 'super_admin') ? (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                {/* ปุ่มลบ */}
                                <button 
                                    onClick={handleDelete}
                                    className="flex-1 sm:flex-none px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-lg shadow-sm hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2 border border-gray-200"
                                >
                                    <span className="text-xl">🪣</span> ลบสินค้า
                                </button>
                                {/* ปุ่มแก้ไข */}
                                <Link 
                                    to={`/product/edit/${product.id}`}
                                    className="flex-1 sm:flex-none px-8 py-4 bg-[#305949] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-[#234236] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">🔧</span> แก้ไขสินค้า
                                </Link>
                            </div>
                        ) : (
                            <button 
                                onClick={handleAddToCart} 
                                disabled={product.stock === 0} 
                                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#305949]/20 transition-all active:scale-95 flex items-center justify-center gap-3 ${product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#305949] text-white hover:bg-[#234236] hover:shadow-xl hover:-translate-y-1'}`}
                            >
                                {product.stock === 0 ? <>สินค้าหมดชั่วคราว</> : <><i className="bi bi-cart-plus-fill text-xl"></i> เพิ่มลงตะกร้า</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Related Products */}
        {product.related_products && product.related_products.length > 0 && (
            <div className="mb-20">
                <h2 className="text-2xl font-bold text-[#263A33] mb-8 flex items-center gap-3">
                    <span className="w-1 h-8 bg-[#305949] rounded-full block"></span> สินค้าที่คุณอาจสนใจ
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {product.related_products.map((rp) => (
                        <Link to={`/product/${rp.id}`} key={rp.id} className="group bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block">
                            <div className="aspect-square bg-[#F9F9F7] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                                <img src={rp.thumbnail} alt={rp.title} className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                            </div>
                            <div className="px-1">
                                <h3 className="font-bold text-[#263A33] text-sm line-clamp-1 group-hover:text-[#305949] transition">{rp.title}</h3>
                                <p className="text-gray-400 text-xs mb-2 mt-1">{rp.category}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-extrabold text-[#305949]">฿{rp.price.toLocaleString()}</span>
                                    <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md border border-gray-100">★ {rp.rating || 4.5}</span>
                                </div>
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