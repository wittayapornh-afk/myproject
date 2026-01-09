import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, ArrowLeft, Star, Plus, Minus, 
  ChevronRight, ChevronLeft, MessageSquare, Send, Zap 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { formatPrice, getImageUrl } from '../utils/formatUtils';

function ProductDetail() {
  const { id } = useParams();
  const { user, isAdmin, token: authToken } = useAuth(); // Get token from context (renamed to avoid conflict)
  const isRestricted = ['admin', 'super_admin', 'seller'].includes(user?.role?.toLowerCase()); // ✅ Restriction Check
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); 
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(null); // ✅ State สำหรับรูปที่โชว์อยู่
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // ✅ State สำหรับรีวิว
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // ✅ State สำหรับ Reply (Admin/Seller)
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const API_BASE_URL = "http://localhost:8000";

  const handleSubmitReview = async () => {
    // ใช้งาน token จาก context แทน localStorage โดยตรง เพื่อความชัวร์
    // หรือถ้า context ไม่มี token ก็ลอง fallback ไป localStorage
    const token = authToken || localStorage.getItem('token');
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาเข้าสู่ระบบ',
            text: 'คุณต้องเข้าสู่ระบบก่อนรีวิวสินค้า',
            confirmButtonColor: '#1a4d2e'
        });
        navigate('/login');
        return;
    }

    if (!newReview.comment.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาใส่ข้อความ',
            text: 'ช่วยเล่าความประทับใจของคุณหน่อยครับ',
            confirmButtonColor: '#1a4d2e'
        });
        return;
    }

    setSubmitting(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/submit-review/`, {
            method: 'POST',
            headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Token ${authToken || localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                  product_id: parseInt(id), // ✅ Use URL ID directly
                  rating: parseInt(newReview.rating),
                  comment: newReview.comment
              })
          });
          if (res.ok) {
              Swal.fire('สำเร็จ', 'รีวิวของคุณถูกบันทึกแล้ว', 'success');
              setNewReview({ rating: 5, comment: '' });
              // Reload product to see new review
              window.location.reload(); 
          } else {
              const errorData = await res.json();
              throw new Error(errorData.error || 'Failed to submit review');
          }
      } catch (err) {
          Swal.fire('ผิดพลาด', err.message, 'error');
      } finally {
          setSubmitting(false);
      }
  };

  const handleReplySubmit = async (reviewId) => {
      if (!replyText.trim()) return;
      try {
          const res = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/reply/`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': `Token ${authToken || localStorage.getItem('token')}`
              },
              body: JSON.stringify({ reply_comment: replyText })
          });
          if (res.ok) {
              const data = await res.json();
              // Optimistic Update
              const updatedReviews = product.reviews.map(r => 
                  r.id === reviewId ? { ...r, reply_comment: data.reply_comment, reply_date: data.reply_date } : r
              );
              setProduct({ ...product, reviews: updatedReviews });
              setReplyingTo(null);
              setReplyText("");
              Swal.fire({
                icon: 'success',
                title: 'ตอบกลับสำเร็จ',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
              });
          } else {
              const errorData = await res.json();
              Swal.fire("Error", errorData.error || "Failed to reply", "error");
          }
      } catch (err) {
          Swal.fire("Error", err.message || "Something went wrong", "error");
      }
  };


  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setQuantity(1); 

    fetch(`${API_BASE_URL}/api/products/${id}/`) 
      .then(res => {
        if (!res.ok) throw new Error('Not Found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setActiveImage(data.image || data.thumbnail); // ✅ Set main image as default
        setLoading(false);

        // ✅ Save to Recently Viewed
        try {
            const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const newEntry = {
                id: data.id,
                title: data.title,
                price: data.price,
                thumbnail: data.thumbnail || data.image,
                category: data.category
            };
            const filtered = recent.filter(item => item.id !== data.id);
            filtered.unshift(newEntry);
            localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(0, 10)));
        } catch (e) {
            console.error("Failed to save recently viewed:", e);
        }
        // ✅ ดึงสินค้าแนะนำ (หมวดเดียวกัน)
        fetchRelatedProducts();
      })
      .catch(err => {
        console.error(err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  const fetchRelatedProducts = () => {
    fetch(`${API_BASE_URL}/api/products/${id}/related/`)
      .then(res => {
          if (!res.ok) throw new Error('Failed to fetch related');
          return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
            setRelatedProducts(data);
        } else {
            setRelatedProducts([]);
        }
      })
      .catch(err => {
          console.error("Error fetching related products:", err);
      });
  };

  const handleAddToCart = () => {
    if (product) {
      // ✅ ส่งจำนวนที่เลือก (quantity) ไปที่ Context
      addToCart(product, quantity); 
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มลงตะกร้าแล้ว',
        text: `จำนวน ${quantity} ชิ้น`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        background: '#1a4d2e',
        color: '#fff',
      });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div></div>;
  if (!product) return <div className="text-center pt-20">ไม่พบสินค้า <Link to="/shop" className="text-blue-500">กลับร้านค้า</Link></div>;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-10 px-4 font-sans pt-28 pb-12 relative">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
            {/* Left: Back to Shop */}
            <button onClick={() => navigate('/shop')} className="group flex items-center gap-3 text-gray-400 hover:text-[#1a4d2e] font-bold transition-colors">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 group-hover:border-[#1a4d2e] transition-all">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
                </div>
                <span>กลับหน้าร้านค้า</span>
            </button>

            {/* Right: Prev/Next Buttons (Moved here) */}
            <div className="flex items-center gap-3">
                {product.prev_id && (
                    <button 
                        onClick={() => navigate(`/product/${product.prev_id}`)}
                        className="group relative flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 hover:border-[#1a4d2e] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(26,77,46,0.15)] active:scale-95"
                    >
                        <ChevronLeft size={18} className="text-gray-400 group-hover:text-[#1a4d2e] transition-colors"/>
                        <span className="text-sm font-bold text-gray-500 group-hover:text-[#1a4d2e] hidden md:inline transition-colors mb-[2px]">ก่อนหน้า</span>
                    </button>
                )}
                
                {/* Logic: If no next_id, try to use the first related product as "Next" to keep browsing */}
                {(product.next_id || (relatedProducts.length > 0)) && (
                    <button 
                        onClick={() => navigate(`/product/${product.next_id || relatedProducts[0].id}`)}
                        className="group relative flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 hover:border-[#1a4d2e] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(26,77,46,0.15)] active:scale-95"
                    >
                        <span className="text-sm font-bold text-gray-500 group-hover:text-[#1a4d2e] hidden md:inline transition-colors mb-[2px]">
                            {product.next_id ? 'ถัดไป' : 'ดูสินค้าอื่น'}
                        </span>
                        <ChevronRight size={18} className="text-gray-400 group-hover:text-[#1a4d2e] transition-colors"/>
                        
                        {/* Pulse Effect for "Discover" mode */}
                        {!product.next_id && (
                             <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#1a4d2e] rounded-full animate-ping opacity-75"></span>
                        )}
                    </button>
                )}
            </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm flex flex-col md:flex-row overflow-hidden border border-gray-100 mb-12">
          {/* Image */}
          <div className="md:w-1/2 bg-gray-50 p-10 flex flex-col items-center justify-center relative">
             <img src={getImageUrl(activeImage || product.image || product.thumbnail)} className={`max-h-[600px] w-full object-contain drop-shadow-2xl mb-8 ${isOutOfStock ? 'grayscale opacity-50' : ''}`} alt="" />
             
             {/* ✅ Gallery Thumbnails */}
             {product.images && product.images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto p-2 w-full justify-center">
                    {/* Show Main Image as first thumbnail */}
                    <button 
                        onClick={() => setActiveImage(product.image || product.thumbnail)} 
                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 ${activeImage === (product.image || product.thumbnail) ? 'border-[#1a4d2e]' : 'border-transparent'}`}
                    >
                        <img src={getImageUrl(product.image || product.thumbnail)} className="w-full h-full object-cover" alt="main"/>
                    </button>

                    {product.images.map((img) => (
                        <button 
                            key={img.id} 
                            onClick={() => setActiveImage(img.image)} 
                            className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 ${activeImage === img.image ? 'border-[#1a4d2e]' : 'border-transparent'}`}
                        >
                            <img src={getImageUrl(img.image)} className="w-full h-full object-cover" alt="gallery"/>
                        </button>
                    ))}
                </div>
             )}

             {isOutOfStock && <span className="absolute top-10 left-10 bg-red-600 text-white px-6 py-2 rounded-xl font-black rotate-[-12deg] shadow-xl text-xl">OUT OF STOCK</span>}
             
             {/* ✅ ปุ่มหัวใจในหน้า Detail (ซ่อนถ้าเป็น Admin/Seller) */}
             {!isRestricted && (
                 <button onClick={() => toggleWishlist(product)} className="absolute top-10 right-10 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform z-10">
                    <Heart size={28} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-300"} />
                 </button>
             )}
          </div>

          {/* Info */}
          <div className="md:w-1/2 p-12 flex flex-col justify-center">
             <span className="text-[#1a4d2e] font-black text-xs uppercase tracking-widest bg-green-50 px-3 py-1 w-fit rounded-full mb-4">{product.category}</span>
             <h1 className="text-4xl font-black text-[#263A33] mb-4">{product.title}</h1>
             
             <div className="flex items-center gap-2 mb-6">
                <div className="flex text-orange-400"><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} className="text-gray-300"/></div>
                <span className="text-sm font-bold text-gray-400">(12 Reviews)</span>
             </div>

             <p className="text-gray-500 mb-8 leading-relaxed">{product.description}</p>

             {/* ✅ Quantity Selector (ซ่อนถ้าเป็น Admin/Seller) */}
             {!isRestricted && !isOutOfStock && (
                <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-2xl w-fit">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 bg-white rounded shadow flex items-center justify-center hover:text-red-500"><Minus size={16}/></button>
                    <span className="font-black text-xl w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-8 h-8 bg-white rounded shadow flex items-center justify-center hover:text-[#1a4d2e]"><Plus size={16}/></button>
                </div>
             )}

             <div className="flex items-end gap-4 mb-10">
                 <span className="text-5xl font-black text-[#1a4d2e]">{formatPrice(product.price * quantity)}</span>
                 {quantity > 1 && <span className="text-gray-400 font-bold mb-2">({formatPrice(product.price)} / ชิ้น)</span>}
             </div>

             {/* ปุ่มใส่ตะกร้า (ซ่อนถ้าเป็น Admin/Seller) */}
             {!isRestricted && (
                <button onClick={handleAddToCart} disabled={isOutOfStock} className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all ${!isOutOfStock ? 'bg-[#1a4d2e] text-white hover:bg-[#143d24]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    <ShoppingCart size={24} /> {isOutOfStock ? 'OUT OF STOCK' : `ADD TO CART (${quantity})`}
                </button>
             )}
          </div>
        </div>

        {/* ✅ Recommended Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-20 mb-20">
                <h2 className="text-3xl font-black text-[#263A33] mb-8 uppercase tracking-tighter">Recommended For You</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((item) => (
                        <Link key={item.id} to={`/product/${item.id}`} className="group bg-white p-4 rounded-[2rem] shadow-sm hover:shadow-xl transition-all">
                            <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden p-4 flex items-center justify-center">
                                <img src={getImageUrl(item.thumbnail || item.image)} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt=""/>
                            </div>
                            <h3 className="font-bold text-[#263A33] truncate">{item.title}</h3>
                            <p className="text-[#1a4d2e] font-black">{formatPrice(item.price)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* ✅ Reviews Section */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black text-[#263A33] mb-8 flex items-center gap-2"><MessageSquare /> Reviews ({product.reviews ? product.reviews.length : 0})</h3>
            <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-50 pb-6">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-[#1a4d2e]">{review.user}</span>
                                <div className="flex text-orange-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-orange-400" : "text-gray-300"} />
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 block mb-2">{review.date}</span>
                            <p className="text-gray-500 text-sm">"{review.comment}"</p>

                            {/* ✅ Display Reply */}
                            {review.reply_comment && (
                                <div className="mt-4 ml-4 p-4 bg-gray-50 rounded-xl border-l-4 border-[#1a4d2e]">
                                    <p className="text-xs font-bold text-[#1a4d2e] mb-1">ตอบกลับเมื่อ {review.reply_date}</p>
                                    <p className="text-gray-600 text-sm">{review.reply_comment}</p>
                                </div>
                            )}

                            {/* ✅ Reply Form for Admin/Seller */}
                            {isRestricted && !review.reply_comment && (
                                <div className="mt-4">
                                    {replyingTo === review.id ? (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a4d2e]"
                                                placeholder="เขียนตอบกลับ..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <button onClick={() => handleReplySubmit(review.id)} className="bg-[#1a4d2e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#143d24]">ส่ง</button>
                                            <button onClick={() => setReplyingTo(null)} className="text-gray-400 px-2">ยกเลิก</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setReplyingTo(review.id); setReplyText(""); }} className="text-xs text-[#1a4d2e] font-bold hover:underline flex items-center gap-1">
                                            <MessageSquare size={12}/> ตอบกลับรีวิว
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวสินค้านี้!</p>
                )}

                {/* Form */}
                <div className="bg-gray-50 p-6 rounded-2xl mt-8">
                    <p className="font-bold text-[#263A33] mb-4">เขียนรีวิวของคุณ</p>
                    
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })} type="button">
                                <Star size={24} className={star <= newReview.rating ? "fill-orange-400 text-orange-400" : "text-gray-300"} />
                            </button>
                        ))}
                    </div>

                    <textarea 
                        className="w-full p-4 rounded-xl border-none outline-none text-sm resize-none mb-4 focus:ring-2 focus:ring-[#1a4d2e]/10" 
                        rows="3" 
                        placeholder="แชร์ความรู้สึกของคุณ..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    ></textarea>
                    
                    <button 
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className={`bg-[#1a4d2e] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#143d24] ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Send size={16}/> {submitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;