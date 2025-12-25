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
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); 
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setQuantity(1); 

    fetch(`${API_BASE_URL}/api/product/${id}/`) 
      .then(res => {
        if (!res.ok) throw new Error('Not Found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
        // ✅ ดึงสินค้าแนะนำ (หมวดเดียวกัน)
        fetchRelatedProducts(data.category);
      })
      .catch(err => {
        console.error(err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  const fetchRelatedProducts = (category) => {
    // สมมติว่า Backend รองรับการ filter ?category=...
    fetch(`${API_BASE_URL}/api/products/?category=${encodeURIComponent(category)}&page_size=4`)
      .then(res => res.json())
      .then(data => {
        const items = data.results || data;
        // กรองตัวปัจจุบันออก
        const filtered = items.filter(item => item.id !== parseInt(id)).slice(0, 4);
        setRelatedProducts(filtered);
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
    <div className="min-h-screen bg-[#F9F9F7] py-10 px-4 font-sans pt-28 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-gray-500 hover:text-[#1a4d2e] font-bold"><ArrowLeft size={20}/> Back to Shop</button>
            <div className="flex gap-2">
                <button onClick={() => navigate(`/product/${parseInt(id) - 1}`)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"><ChevronLeft/></button>
                <button onClick={() => navigate(`/product/${parseInt(id) + 1}`)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"><ChevronRight/></button>
            </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm flex flex-col md:flex-row overflow-hidden border border-gray-100 mb-12">
          {/* Image */}
          <div className="md:w-1/2 bg-gray-50 p-10 flex items-center justify-center relative">
             <img src={getImageUrl(product.image || product.thumbnail)} className={`max-h-[500px] object-contain drop-shadow-2xl ${isOutOfStock ? 'grayscale opacity-50' : ''}`} alt="" />
             
             {isOutOfStock && <span className="absolute bg-red-600 text-white px-6 py-2 rounded-xl font-black rotate-[-12deg] shadow-xl text-xl">OUT OF STOCK</span>}
             
             {/* ✅ ปุ่มหัวใจในหน้า Detail */}
             {!isAdmin && (
                 <button onClick={() => toggleWishlist(product)} className="absolute top-10 right-10 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform">
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

             {/* ✅ Quantity Selector */}
             {!isAdmin && !isOutOfStock && (
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

             {!isAdmin && (
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
            <h3 className="text-2xl font-black text-[#263A33] mb-8 flex items-center gap-2"><MessageSquare /> Reviews</h3>
            <div className="space-y-6">
                <div className="border-b border-gray-50 pb-6">
                    <div className="flex justify-between mb-2">
                        <span className="font-bold text-[#1a4d2e]">Customer01</span>
                        <div className="flex text-orange-400"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                    </div>
                    <p className="text-gray-500 text-sm">"สินค้าดีมากครับ ส่งไว แพ็คของมาดีประทับใจ"</p>
                </div>
                {/* Form */}
                <div className="bg-gray-50 p-6 rounded-2xl mt-8">
                    <p className="font-bold text-[#263A33] mb-4">เขียนรีวิวของคุณ</p>
                    <textarea className="w-full p-4 rounded-xl border-none outline-none text-sm resize-none mb-4 focus:ring-2 focus:ring-[#1a4d2e]/10" rows="3" placeholder="แชร์ความรู้สึกของคุณ..."></textarea>
                    <button className="bg-[#1a4d2e] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#143d24]"><Send size={16}/> ส่งรีวิว</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;