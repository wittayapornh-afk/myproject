import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, ArrowLeft, Star, Plus, Minus, 
  ChevronRight, ChevronLeft, MessageSquare, Send, Zap, ShieldCheck, Truck, Package 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { formatPrice, getImageUrl } from '../utils/formatUtils';

function ProductDetail() {
  const { id } = useParams();
  const { user, isAdmin, token: authToken } = useAuth(); 
  const isRestricted = ['admin', 'super_admin', 'seller'].includes(user?.role?.toLowerCase()); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); 
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState(null); 
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Review & Reply States
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const API_BASE_URL = "http://localhost:8000";

  const handleSubmitReview = async () => {
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
                  'Authorization': `Token ${token}`
              },
              body: JSON.stringify({
                  product_id: parseInt(id),
                  rating: parseInt(newReview.rating),
                  comment: newReview.comment
              })
          });
          if (res.ok) {
              Swal.fire('สำเร็จ', 'รีวิวของคุณถูกบันทึกแล้ว', 'success');
              setNewReview({ rating: 5, comment: '' });
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
              const updatedReviews = product.reviews.map(r => 
                  r.id === reviewId ? { ...r, reply_comment: data.reply_comment, reply_date: data.reply_date } : r
              );
              setProduct({ ...product, reviews: updatedReviews });
              setReplyingTo(null);
              setReplyText("");
              Swal.fire({ icon: 'success', title: 'ตอบกลับสำเร็จ', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
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
        setActiveImage(data.image || data.thumbnail); 
        setLoading(false);

        // Save to Recently Viewed
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
      .then(res => res.ok ? res.json() : [])
      .then(data => setRelatedProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error related:", err));
  };

  const handleAddToCart = () => {
    if (product) {
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F0F2F5]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div></div>;
  if (!product) return <div className="text-center pt-20">ไม่พบสินค้า <Link to="/shop" className="text-blue-500">กลับร้านค้า</Link></div>;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans selection:bg-[#1a4d2e] selection:text-white pb-20">
      
      {/* 🌟 Sticky Header for Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
             <button onClick={() => navigate('/shop')} className="group flex items-center gap-2 text-gray-500 hover:text-[#1a4d2e] font-bold transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-50/50 flex items-center justify-center border border-transparent group-hover:border-green-100 group-hover:bg-green-50 transition-all">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
                </div>
                <span className="hidden md:inline">Back to Shop</span>
             </button>

             <div className="flex items-center gap-3">
                 {product.prev_id && (
                     <button onClick={() => navigate(`/product/${product.prev_id}`)} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#1a4d2e] transition-all text-gray-400 hover:text-[#1a4d2e]">
                         <ChevronLeft size={20} />
                     </button>
                 )}
                 {(product.next_id || (relatedProducts.length > 0)) && (
                     <button onClick={() => navigate(`/product/${product.next_id || relatedProducts[0].id}`)} className="w-10 h-10 rounded-xl bg-[#1a4d2e] text-white flex items-center justify-center hover:bg-[#143d24] shadow-lg hover:shadow-green-900/20 transition-all hover:translate-x-0.5">
                         <ChevronRight size={20} />
                     </button>
                 )}
             </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-100/50 flex flex-col lg:flex-row overflow-hidden border border-gray-100/50">
          
          {/* 🖼️ Product Image Section */}
          <div className="lg:w-1/2 bg-[#F8F9FA] p-8 lg:p-12 flex flex-col items-center justify-center relative group">
             {/* Main Image */}
             <div className="relative w-full aspect-square flex items-center justify-center z-10">
                 <img src={getImageUrl(activeImage || product.image || product.thumbnail)} className={`max-h-[500px] w-full object-contain drop-shadow-2xl transition-all duration-500 ${isOutOfStock ? 'grayscale opacity-70' : 'group-hover:scale-105'}`} alt="" />
             </div>
             
             {/* Gallery */}
             {product.images && product.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto p-2 w-full justify-center mt-8 relative z-20">
                    <button 
                        onClick={() => setActiveImage(product.image || product.thumbnail)} 
                        className={`w-16 h-16 rounded-2xl bg-white border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === (product.image || product.thumbnail) ? 'border-[#1a4d2e] scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                        <img src={getImageUrl(product.image || product.thumbnail)} className="w-full h-full object-contain p-1" alt="main"/>
                    </button>
                    {product.images.map((img) => (
                        <button 
                            key={img.id} 
                            onClick={() => setActiveImage(img.image)} 
                            className={`w-16 h-16 rounded-2xl bg-white border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === img.image ? 'border-[#1a4d2e] scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={getImageUrl(img.image)} className="w-full h-full object-contain p-1" alt="gallery"/>
                        </button>
                    ))}
                </div>
             )}

             {isOutOfStock && (
                 <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/20 backdrop-blur-[2px]">
                     <span className="bg-red-600/90 text-white px-8 py-3 rounded-2xl font-black rotate-[-12deg] shadow-2xl text-2xl border-4 border-white">OUT OF STOCK</span>
                 </div>
             )}
             
             {!isRestricted && (
                 <button onClick={() => toggleWishlist(product)} className="absolute top-8 right-8 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center z-30 hover:scale-110 transition-all border border-gray-100">
                    <Heart size={24} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-300"} />
                 </button>
             )}
          </div>

          {/* 📝 Product Info Section */}
          <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center bg-white relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-bl-[10rem] -z-0 opacity-50 pointer-events-none"></div>

             <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                     <span className="text-[#1a4d2e] font-black text-[10px] uppercase tracking-[0.2em] bg-green-50 px-3 py-1.5 rounded-lg">{product.category}</span>
                     {product.stock > 0 && product.stock < 5 && <span className="text-orange-500 font-bold text-[10px] uppercase tracking-wide bg-orange-50 px-2 py-1.5 rounded-lg flex items-center gap-1"><Zap size={10} fill="currentColor"/> Low Stock</span>}
                 </div>

                 <h1 className="text-4xl md:text-5xl font-black text-[#263A33] mb-4 leading-tight">{product.title}</h1>
                 
                 <div className="flex items-center gap-4 mb-8">
                    <div className="flex bg-orange-50 px-3 py-1 rounded-lg gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-orange-400" fill="currentColor"/>)}
                    </div>
                    <span className="text-sm font-bold text-gray-400 border-l pl-4 border-gray-200">{product.reviews ? product.reviews.length : 0} Reviews</span>
                 </div>

                 <div className="prose prose-sm text-gray-500 mb-10 leading-relaxed max-w-lg">
                     {product.description || "สัมผัสประสบการณ์สินค้าคุณภาพที่เราคัดสรรมาเพื่อคุณโดยเฉพาะ ด้วยการออกแบบที่ใส่ใจทุกรายละเอียด..."}
                 </div>

                 {/* Price & Quantity */}
                 <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 mb-10 pb-10 border-b border-gray-50 border-dashed">
                     <div>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Price</p>
                         <div className="flex items-baseline gap-2">
                             <span className="text-5xl font-black text-[#1a4d2e] tracking-tight">{formatPrice(product.price * quantity)}</span>
                             {quantity > 1 && <span className="text-gray-400 font-bold text-sm">({formatPrice(product.price)} / unit)</span>}
                         </div>
                     </div>

                     {!isRestricted && !isOutOfStock && (
                        <div className="flex items-center bg-[#F8F9FA] rounded-[1.2rem] p-1.5 border border-gray-100 shadow-inner">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"><Minus size={18}/></button>
                            <span className="font-black text-xl w-12 text-center text-[#263A33]">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600 hover:text-[#1a4d2e] transition-colors"><Plus size={18}/></button>
                        </div>
                     )}
                 </div>

                 {/* Actions */}
                 <div className="space-y-4">
                     {!isRestricted && (
                        <button onClick={handleAddToCart} disabled={isOutOfStock} className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-[0.98] ${!isOutOfStock ? 'bg-[#1a4d2e] text-white hover:bg-[#153e25] shadow-green-900/20' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                            <ShoppingCart size={24} /> 
                            {isOutOfStock ? 'OUT OF STOCK' : `ADD TO CART`}
                        </button>
                     )}
                     
                     <div className="flex items-center justify-center gap-6 text-xs font-bold text-gray-400 mt-6">
                         <span className="flex items-center gap-1"><ShieldCheck size={14}/> Secure Payment</span>
                         <span className="flex items-center gap-1"><Truck size={14}/> Fast Shipping</span>
                         <span className="flex items-center gap-1"><Package size={14}/> 7 Days Return</span>
                     </div>
                 </div>
             </div>
          </div>
        </div>

        {/* ✅ Recommended Products */}
        {relatedProducts.length > 0 && (
            <div className="mt-24 mb-24">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h2 className="text-2xl font-black text-[#263A33] uppercase tracking-tighter text-center">You May Also Like</h2>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((item) => (
                        <Link key={item.id} to={`/product/${item.id}`} className="group bg-white p-4 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-green-50">
                            <div className="aspect-square bg-gray-50 rounded-[1.5rem] mb-4 overflow-hidden p-4 flex items-center justify-center relative">
                                <img src={getImageUrl(item.thumbnail || item.image)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" alt=""/>
                            </div>
                            <h3 className="font-bold text-[#263A33] text-sm truncate px-1">{item.title}</h3>
                            <p className="text-[#1a4d2e] font-black mt-1 px-1">{formatPrice(item.price)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* ✅ Reviews Section */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#1a4d2e] to-transparent opacity-20"></div>
            
            <h3 className="text-2xl font-black text-[#263A33] mb-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><MessageSquare size={20}/></div>
                Customer Reviews <span className="text-gray-300 text-lg font-bold">({product.reviews ? product.reviews.length : 0})</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-12">
                {/* Review List */}
                <div className="md:col-span-2 space-y-8">
                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-50 pb-8 last:border-0">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-sm">
                                            {review.user ? review.user.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#263A33] text-sm">{review.user}</p>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{review.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex text-orange-400 bg-orange-50 px-2 py-1 rounded-lg">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-orange-400" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 text-sm leading-relaxed pl-14">"{review.comment}"</p>

                                {/* Reply */}
                                {review.reply_comment && (
                                    <div className="mt-4 ml-14 p-4 bg-gray-50 rounded-xl border-l-4 border-[#1a4d2e]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-[#1a4d2e] uppercase bg-white px-2 py-0.5 rounded shadow-sm">Admin Reply</span>
                                            <span className="text-[10px] text-gray-400">{review.reply_date}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">{review.reply_comment}</p>
                                    </div>
                                )}

                                {/* Reply Form */}
                                {isRestricted && !review.reply_comment && (
                                    <div className="mt-4 ml-14">
                                        {replyingTo === review.id ? (
                                            <div className="flex gap-2 animate-fade-in-up">
                                                <input type="text" className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#1a4d2e] focus:ring-2 focus:ring-green-500/10" placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                                                <button onClick={() => handleReplySubmit(review.id)} className="bg-[#1a4d2e] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#143d24]">Send</button>
                                                <button onClick={() => setReplyingTo(null)} className="text-gray-400 px-3 hover:text-gray-600 font-bold text-sm">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setReplyingTo(review.id); setReplyText(""); }} className="text-xs text-[#1a4d2e] font-bold hover:underline flex items-center gap-1 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                                                <MessageSquare size={12}/> Reply to review
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                             <MessageSquare className="mx-auto text-gray-300 mb-2" size={32}/>
                             <p className="text-gray-400 font-bold text-sm">No reviews yet. Be the first!</p>
                        </div>
                    )}
                </div>

                {/* Write Review */}
                <div className="md:col-span-1">
                    <div className="bg-[#F8F9FA] p-6 rounded-[2rem] sticky top-24">
                        <h4 className="font-bold text-[#263A33] mb-4 text-center">Write a Review</h4>
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })} type="button" className="group">
                                    <Star size={24} className={`transition-all ${star <= newReview.rating ? "fill-orange-400 text-orange-400 scale-110" : "text-gray-300 group-hover:text-orange-200"}`} />
                                </button>
                            ))}
                        </div>

                        <textarea 
                            className="w-full p-4 rounded-xl border border-gray-200 outline-none text-sm resize-none mb-4 focus:border-[#1a4d2e] focus:ring-2 focus:ring-green-500/10 transition-all bg-white" 
                            rows="4" 
                            placeholder="Share your thoughts about this product..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        ></textarea>
                        
                        <button 
                            onClick={handleSubmitReview}
                            disabled={submitting}
                            className={`w-full bg-[#1a4d2e] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#143d24] shadow-lg shadow-green-900/10 transition-all active:scale-95 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Send size={16}/> {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;