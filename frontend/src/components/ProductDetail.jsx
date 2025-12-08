import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]); // State สำหรับรีวิว
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const { addToCart } = useCart();
  
  // State ฟอร์มรีวิว
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true
  });

  useEffect(() => {
    const loadData = async () => {
        try {
            // 1. ดึงข้อมูลสินค้า
            const res = await fetch(`http://localhost:8000/api/products/${id}/`);
            if (!res.ok) throw new Error("Product not found");
            const data = await res.json();
            setProduct(data);
            setReviews(data.reviews || []); // รับรีวิวมาด้วย
            setSelectedImage(data.thumbnail || "https://placehold.co/400?text=No+Image");
            
            // 2. ดึงสินค้า Related
            const resAll = await fetch('http://localhost:8000/api/products/');
            const dataAll = await resAll.json();
            if (dataAll.products) {
                let related = dataAll.products.filter(p => 
                    p.category === data.category && p.id !== data.id
                );
                related = related.sort(() => 0.5 - Math.random());
                setRelatedProducts(related.slice(0, 4));
            }
        } catch (err) {
            console.error(err);
        }
    };
    loadData();
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
      addToCart(product, quantity);
      Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าเรียบร้อย' });
  };

  const handleSubmitReview = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch(`http://localhost:8000/api/products/${id}/reviews/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newReview)
          });
          if (res.ok) {
              Swal.fire('ขอบคุณ!', 'รีวิวของคุณถูกบันทึกแล้ว', 'success');
              // โหลดหน้าใหม่เพื่อให้คะแนนอัปเดต
              window.location.reload(); 
          }
      } catch (err) {
          Swal.fire('Error', 'ส่งรีวิวไม่สำเร็จ', 'error');
      }
  };

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-[#F2F0E4]">
        <div className="text-[#305949] font-bold text-xl animate-pulse">กำลังโหลดสินค้า...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F0E4] py-16 px-6">
        
        {/* Main Product Info */}
        <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-xl p-8 md:p-12 border border-white flex flex-col lg:flex-row gap-12 items-center mb-16">
            <div className="w-full lg:w-1/2 space-y-6">
                <div className="bg-[#FAFAF8] rounded-[2.5rem] aspect-square flex items-center justify-center p-8 border border-gray-100 relative overflow-hidden group">
                    <img src={selectedImage} alt={product.title} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply" />
                </div>
                {product.images && product.images.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                        <button onClick={() => setSelectedImage(product.thumbnail)} className={`w-16 h-16 rounded-xl p-1 border-2 flex-shrink-0 transition-all ${selectedImage === product.thumbnail ? 'border-secondary' : 'border-transparent hover:border-gray-200'}`}>
                            <img src={product.thumbnail} className="w-full h-full object-contain bg-[#FAFAF8] rounded-lg" />
                        </button>
                        {product.images.map((img, i) => (
                            <button key={i} onClick={() => setSelectedImage(img)} className={`w-16 h-16 rounded-xl p-1 border-2 flex-shrink-0 transition-all ${selectedImage === img ? 'border-secondary' : 'border-transparent hover:border-gray-200'}`}>
                                <img src={img} className="w-full h-full object-contain bg-[#FAFAF8] rounded-lg" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-full lg:w-1/2">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{product.category}</span>
                    {product.brand && <span className="text-xs font-bold text-[#749B6B] uppercase tracking-widest">{product.brand}</span>}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#263A33] mb-4 leading-tight">{product.title}</h1>
                
                {/* แสดงคะแนนเฉลี่ย */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="text-yellow-400 text-xl">{"★".repeat(Math.round(product.rating || 0))}{"☆".repeat(5 - Math.round(product.rating || 0))}</div>
                    <span className="text-gray-400 text-sm">({reviews.length} รีวิว)</span>
                </div>

                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">{product.description}</p>

                <div className="flex items-center gap-6 mb-8 border-t border-b border-gray-100 py-6">
                    <span className="text-4xl font-bold text-[#305949]">฿{product.price?.toLocaleString()}</span>
                    {product.stock > 0 ? <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-3 py-1 rounded-md">มีสินค้า</span> : <span className="bg-[#FFEBEE] text-[#C62828] text-xs font-bold px-3 py-1 rounded-md">สินค้าหมด</span>}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-full px-4 py-2 w-full sm:w-40 shadow-sm">
                        <button onClick={() => setQuantity(Math.max(1, q => q-1))} className="text-gray-400 hover:text-primary text-xl px-2 font-bold">-</button>
                        <span className="font-bold text-lg text-[#305949]">{quantity}</span>
                        <button onClick={() => setQuantity(q => q+1)} className="text-gray-400 hover:text-primary text-xl px-2 font-bold">+</button>
                    </div>
                    <button onClick={handleAddToCart} className="flex-1 bg-[#325343] hover:bg-[#234236] text-white py-3.5 rounded-full font-bold uppercase tracking-widest shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-sm">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        เพิ่มลงตะกร้า
                    </button>
                </div>
            </div>
        </div>

        {/* --- Review Section --- */}
        <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-sm p-8 md:p-12 border border-white mb-16">
            <h2 className="text-2xl font-bold text-[#263A33] mb-8 flex items-center gap-3">
                รีวิวจากผู้ใช้จริง <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-500">{reviews.length} ความเห็น</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
                    {reviews.length === 0 ? (
                        <p className="text-gray-400 italic">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวสินค้านี้สิ!</p>
                    ) : (
                        reviews.map((rev, index) => (
                            <div key={index} className="pb-6 border-b border-gray-100 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-[#305949]">{rev.user}</h4>
                                    <div className="text-yellow-400 text-sm">{"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}</div>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                                <p className="text-xs text-gray-300 mt-2">{new Date(rev.created_at).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-[#FAFAF8] p-8 rounded-3xl border border-gray-100 h-fit">
                    <h3 className="font-bold text-lg mb-6 text-[#263A33]">เขียนรีวิวของคุณ</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">คะแนนความพึงพอใจ</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        type="button" 
                                        key={star}
                                        onClick={() => setNewReview({...newReview, rating: star})}
                                        className={`text-2xl transition ${star <= newReview.rating ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                                    >★</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">ชื่อของคุณ</label>
                            <input type="text" required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#305949]/20 outline-none" placeholder="เช่น คุณลูกค้าใจดี"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">ความคิดเห็น</label>
                            <textarea required rows="3" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#305949]/20 outline-none resize-none" placeholder="สินค้าเป็นอย่างไรบ้าง..."></textarea>
                        </div>
                        <button type="submit" className="w-full bg-[#305949] text-white py-3 rounded-xl font-bold shadow-md hover:bg-[#234236] transition">ส่งรีวิว</button>
                    </form>
                </div>
            </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-2xl font-bold text-[#263A33]">สินค้าที่คุณอาจสนใจ</h2>
                    <div className="h-[1px] flex-1 bg-gray-300 opacity-50"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((item) => (
                        <Link to={`/product/${item.id}`} key={item.id} className="group bg-white p-4 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-white hover:-translate-y-2">
                            <div className="bg-[#FAFAF8] rounded-[1.5rem] aspect-square flex items-center justify-center p-4 mb-4 overflow-hidden relative">
                                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500" />
                                <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-md text-gray-500 uppercase">{item.category}</span>
                            </div>
                            <div className="px-2 pb-2">
                                <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{item.title}</h3>
                                <div className="flex justify-between items-center">
                                    <p className="text-[#305949] font-bold">฿{item.price?.toLocaleString()}</p>
                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#305949] group-hover:text-white transition">→</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}

export default ProductDetail;