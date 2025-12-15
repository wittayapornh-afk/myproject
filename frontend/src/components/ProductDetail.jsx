import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Swal from "sweetalert2";
// นำเข้าไอคอนสวยๆ
import { Star, ShoppingCart, Minus, Plus, User, MessageCircle, Package, Send, ArrowLeft, ShoppingBag, Box } from 'lucide-react';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  // State สำหรับรีวิว
  const [reviews, setReviews] = useState([
      { id: 1, user: "Sompong Happy", rating: 5, text: "สินค้าคุณภาพดีมากครับ จัดส่งไว แพ็คของมาดีประทับใจครับ ไว้จะมาอุดหนุนใหม่แน่นอน", date: "2 วันที่แล้ว" },
      { id: 2, user: "Marry Jane", rating: 4, text: "สวยตรงปก คุ้มราคามากค่ะ", date: "1 สัปดาห์ที่แล้ว" }
  ]);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState("");

  // ✅ ฟังก์ชันช่วยแก้เรื่องรูปภาพไม่ขึ้น (สำคัญมาก!)
  const getImageUrl = (path) => {
      if (!path) return "https://via.placeholder.com/500"; // กันเหนียวถ้าไม่มีรูป
      if (path.startsWith("http")) return path; // ถ้ามี http แล้วก็ใช้เลย
      return `http://localhost:8000${path}`; // ถ้าไม่มี ให้เติม domain หลังบ้านเข้าไป
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`http://localhost:8000/api/products/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setMainImage(data.thumbnail); // เริ่มต้นใช้รูป Thumbnail
        
        // ดึงสินค้าแนะนำ
        fetch(`http://localhost:8000/api/products/?category=${data.category}`)
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
      Swal.fire({
          icon: 'success',
          title: 'ขอบคุณสำหรับรีวิว!',
          text: 'รีวิวของคุณถูกเผยแพร่แล้ว',
          timer: 1500,
          showConfirmButton: false
      });
  };

  if (loading) return <div className="p-20 text-center text-gray-500 font-bold animate-pulse">กำลังโหลดข้อมูล...</div>;
  if (!product) return <div className="p-20 text-center">ไม่พบสินค้า</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ✅ ปุ่มย้อนกลับ (Back Button) */}
        <div>
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-500 hover:text-[#305949] font-bold transition-all hover:-translate-x-1"
            >
                <ArrowLeft size={20} /> ย้อนกลับ
            </button>
        </div>

        {/* ================= Product Section ================= */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Images */}
          <div className="md:w-1/2 p-6">
            <div className="aspect-square bg-[#F5F5F0] rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative group">
              {/* ✅ ใช้ getImageUrl ที่สร้างไว้ */}
              <img 
                src={getImageUrl(mainImage)} 
                alt={product.title} 
                className="max-h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" 
              />
            </div>
            
            {/* Gallery */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
               {/* รูป Thumbnail */}
               <img 
                 src={getImageUrl(product.thumbnail)} 
                 onClick={() => setMainImage(product.thumbnail)} 
                 className={`w-20 h-20 rounded-xl border-2 cursor-pointer object-cover transition-all bg-white ${getImageUrl(mainImage) === getImageUrl(product.thumbnail) ? 'border-[#305949] ring-2 ring-[#305949]/20' : 'border-transparent hover:border-gray-200'}`} 
               />
               {/* รูปอื่นๆ ใน Gallery */}
               {product.images?.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={getImageUrl(img.image)} 
                    onClick={() => setMainImage(img.image)} 
                    className={`w-20 h-20 rounded-xl border-2 cursor-pointer object-cover transition-all bg-white ${getImageUrl(mainImage) === getImageUrl(img.image) ? 'border-[#305949] ring-2 ring-[#305949]/20' : 'border-transparent hover:border-gray-200'}`} 
                  />
               ))}
            </div>
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-auto">
                <span className="text-xs font-bold text-[#305949] bg-[#305949]/10 px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                <h1 className="text-3xl md:text-4xl font-black text-[#263A33] mt-4 mb-2 leading-tight">{product.title}</h1>
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex text-yellow-400"><Star size={18} fill="currentColor" /></div>
                    <span className="text-gray-500 font-medium">({product.rating || 4.5} reviews)</span>
                </div>
                <p className="text-gray-600 leading-relaxed mb-8 text-base">{product.description}</p>
                
                <div className="text-4xl font-extrabold text-[#305949] mb-8">฿{Number(product.price).toLocaleString()}</div>

                {/* ✅ ส่วนเลือกจำนวน และ แสดงสินค้าคงเหลือ */}
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
                        
                        {/* 📦 แสดงสินค้าคงเหลือ (Stock) */}
                        <div className="flex items-center gap-2 text-sm">
                            <Box size={18} className="text-gray-400"/>
                            <span className="text-gray-500">สินค้าคงเหลือ:</span>
                            <span className={`font-bold text-lg ${product.stock > 0 ? 'text-[#305949]' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} ชิ้น` : 'หมดชั่วคราว'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ปุ่มดำเนินการ */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-[#305949] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#305949]/20 hover:bg-[#234236] hover:-translate-y-1 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                   <ShoppingCart size={22} /> {product.stock > 0 ? "เพิ่มใส่ตะกร้า" : "สินค้าหมด"}
                </button>
                
                {/* ✅ ปุ่มดูสินค้าอื่นต่อ */}
                <Link 
                   to="/shop" 
                   className="px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-[#305949] hover:text-[#305949] transition-all flex justify-center items-center gap-2"
                >
                   <ShoppingBag size={20} /> ดูสินค้าอื่น
                </Link>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ... (ส่วนรีวิวเหมือนเดิมที่แก้ไปรอบก่อน) ... */}
            <div className="lg:col-span-1 bg-[#263A33] rounded-[2rem] shadow-lg p-8 text-white h-fit">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><MessageCircle size={20}/> เขียนรีวิวสินค้า</h3>
                <form onSubmit={handleSubmitReview}>
                    <div className="flex gap-2 mb-4 justify-center bg-white/10 p-3 rounded-xl">
                        {[1,2,3,4,5].map(s => (
                            <button key={s} type="button" onClick={() => setUserRating(s)} className={`transition ${s <= userRating ? 'text-yellow-400 scale-110' : 'text-gray-500'}`}>
                                <Star size={24} fill="currentColor" />
                            </button>
                        ))}
                    </div>
                    <textarea 
                        value={userReview}
                        onChange={e => setUserReview(e.target.value)}
                        placeholder="สินค้าเป็นอย่างไรบ้าง?..." 
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 mb-4 h-24 resize-none"
                        required
                    ></textarea>
                    <button type="submit" className="w-full bg-white text-[#263A33] font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-lg flex justify-center items-center gap-2">
                        <Send size={16} /> ส่งรีวิว
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-[#263A33] mb-6 flex items-center gap-2">รีวิวล่าสุด ({reviews.length})</h2>
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 animate-fade-in">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#305949] font-bold border border-gray-200">
                                    {review.user.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-[#263A33] text-sm">{review.user}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400 text-xs">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />)}
                                        </div>
                                        <span className="text-xs text-gray-400">• {review.date}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed pl-14">{review.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Recommended Products */}
        {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-black text-[#263A33] mb-6 flex items-center gap-2">
                   <Package size={28} /> สินค้าแนะนำสำหรับคุณ
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map(rel => (
                        <Link to={`/product/${rel.id}`} key={rel.id} className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100">
                             {/* ✅ ใช้ getImageUrl กับสินค้าแนะนำด้วย */}
                             <div className="aspect-square bg-[#F4F4F2] rounded-xl mb-3 overflow-hidden flex items-center justify-center p-4">
                                <img src={getImageUrl(rel.thumbnail)} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                             </div>
                             <div className="px-1">
                                 <p className="text-xs text-gray-400 uppercase font-bold mb-1">{rel.category}</p>
                                 <h4 className="font-bold text-[#263A33] text-sm line-clamp-1 mb-2">{rel.title}</h4>
                                 <p className="text-[#305949] font-extrabold">฿{Number(rel.price).toLocaleString()}</p>
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