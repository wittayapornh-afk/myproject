import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";
import { Star, ShoppingCart, Minus, Plus, MessageCircle, Package, Send, ArrowLeft, ShoppingBag, Box } from 'lucide-react';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const [reviews, setReviews] = useState([
      { id: 1, user: "Sompong Happy", rating: 5, text: "สินค้าคุณภาพดีมากครับ จัดส่งไว", date: "2 วันที่แล้ว" },
      { id: 2, user: "Marry Jane", rating: 4, text: "สวยตรงปก คุ้มราคามากค่ะ", date: "1 สัปดาห์ที่แล้ว" }
  ]);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState("");

  const getImageUrl = (path) => {
      if (!path) return "https://via.placeholder.com/500";
      if (path.startsWith("http")) return path;
      return `${path}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`/api/products/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setMainImage(data.thumbnail); // เริ่มต้นใช้รูป Thumbnail
        
        fetch(`/api/products/?category=${data.category}`)
            .then(res => res.json())
            .then(relatedData => {
                const related = (relatedData.results || relatedData.products || [])
                    .filter(p => p.id !== data.id)
                    .slice(0, 4);
                setRelatedProducts(related);
            });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Swal.fire({
      icon: "success",
      title: "เพิ่มลงตะกร้าแล้ว",
      text: `เพิ่ม ${product.title} จำนวน ${quantity} ชิ้น`,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const adjustQuantity = (amount) => {
      setQuantity(prev => {
          const newQty = prev + amount;
          return newQty < 1 ? 1 : newQty > product.stock ? product.stock : newQty;
      });
  };

  const handleSubmitReview = (e) => {
      e.preventDefault();
      if (!userReview.trim()) return;
      const newReview = {
          id: reviews.length + 1,
          user: "คุณ (Guest)",
          rating: userRating,
          text: userReview,
          date: "เมื่อสักครู่"
      };
      setReviews([newReview, ...reviews]); 
      setUserReview("");
      Swal.fire({ icon: 'success', title: 'ขอบคุณสำหรับรีวิว!', showConfirmButton: false, timer: 1500 });
  };

  if (loading) return <div className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>;
  if (!product) return <div className="p-20 text-center">ไม่พบสินค้า</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#305949] font-bold transition-all hover:-translate-x-1">
            <ArrowLeft size={20} /> ย้อนกลับ
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          {/* Images */}
          <div className="md:w-1/2 p-6">
            <div className="aspect-square bg-[#F5F5F0] rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative group">
              <img src={getImageUrl(mainImage)} alt={product.title} className="max-h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
            </div>
            
            {/* ✅ Gallery Loop */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
               <img 
                 src={getImageUrl(product.thumbnail)} 
                 onClick={() => setMainImage(product.thumbnail)} 
                 className={`w-20 h-20 rounded-xl border-2 cursor-pointer object-cover transition-all bg-white ${getImageUrl(mainImage) === getImageUrl(product.thumbnail) ? 'border-[#305949] ring-2 ring-[#305949]/20' : 'border-transparent hover:border-gray-200'}`} 
               />
               {product.images && product.images.map((img) => (
                  <img 
                    key={img.id} 
                    src={img.image} 
                    onClick={() => setMainImage(img.image)} 
                    className={`w-20 h-20 rounded-xl border-2 cursor-pointer object-cover transition-all bg-white ${getImageUrl(mainImage) === getImageUrl(img.image) ? 'border-[#305949] ring-2 ring-[#305949]/20' : 'border-transparent hover:border-gray-200'}`} 
                  />
               ))}
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-auto">
                <span className="text-xs font-bold text-[#305949] bg-[#305949]/10 px-3 py-1 rounded-full uppercase">{product.category}</span>
                <h1 className="text-3xl md:text-4xl font-black text-[#263A33] mt-4 mb-2">{product.title}</h1>
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex text-yellow-400"><Star size={18} fill="currentColor" /></div>
                    <span className="text-gray-500 font-medium">({product.rating || 4.5})</span>
                </div>
                <p className="text-gray-600 mb-8">{product.description}</p>
                <div className="text-4xl font-extrabold text-[#305949] mb-8">฿{Number(product.price).toLocaleString()}</div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 font-bold text-sm">จำนวน:</span>
                            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                                <button onClick={() => adjustQuantity(-1)} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 hover:text-[#305949] hover:bg-gray-200 transition"><Minus size={16} /></button>
                                <span className="w-10 text-center font-bold text-xl text-[#263A33]">{quantity}</span>
                                <button onClick={() => adjustQuantity(1)} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 hover:text-[#305949] hover:bg-gray-200 transition"><Plus size={16} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Box size={18} className="text-gray-400"/>
                            <span className="text-gray-500">คงเหลือ:</span>
                            <span className={`font-bold text-lg ${product.stock > 0 ? 'text-[#305949]' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} ชิ้น` : 'หมดชั่วคราว'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-[#305949] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#305949]/20 hover:bg-[#234236] hover:-translate-y-1 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                   <ShoppingCart size={22} /> {product.stock > 0 ? "เพิ่มใส่ตะกร้า" : "สินค้าหมด"}
                </button>
                <Link to="/shop" className="px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-[#305949] hover:text-[#305949] transition-all flex justify-center items-center gap-2">
                   <ShoppingBag size={20} /> ดูสินค้าอื่น
                </Link>
            </div>
          </div>
        </div>

        {/* Reviews section omitted for brevity (same as previous) */}
      </div>
    </div>
  );
}

export default ProductDetail;