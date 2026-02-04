import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Tag, Filter, LayoutGrid, Menu, Zap, CheckCircle, Smartphone, Shirt, Home, Sparkles, ArrowLeft } from 'lucide-react'; 
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatUtils';
import Swal from 'sweetalert2';
import axios from 'axios';

// ✅ Reused Components (Should be extracted to common later)
const ProductSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-4 shadow-sm animate-pulse border border-gray-100 mb-6">
    <div className="bg-gray-100 aspect-square rounded-[1.5rem] mb-4"></div>
    <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-4"></div>
  </div>
);

export default function TagPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [tag, setTag] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const API_BASE_URL = "http://localhost:8000";

  // ✅ 1. Fetch Tag Details & Products
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // A. Fetch Tag Info (Dynamic from Backend)
            const tagRes = await axios.get(`${API_BASE_URL}/api/tags/${slug}/`);
            setTag(tagRes.data);

            // B. Fetch Products by Tag Slug (Correct usage: ?tag=slug)
            const prodRes = await axios.get(`${API_BASE_URL}/api/products/?tag=${slug}`);
            setProducts(prodRes.data.results || prodRes.data || []);
            
        } catch (error) {
            console.error("Error fetching tag data:", error);
            // Fallback for "virtual" tags (like best-seller) if not in DB, 
            // or just show empty state.
        } finally {
            setLoading(false);
        }
    };

    if (slug) {
        window.scrollTo(0, 0);
        fetchData();
    }
  }, [slug]);

  // ✅ SEO: Dynamic Title
  useEffect(() => {
      if (tag) {
          document.title = `${tag.name} | Shop System`;
      } else if (slug) {
            document.title = `${slug} | Shop System`;
      }
  }, [tag, slug]);

  const handleAddToCart = (product) => {
    if ((product.stock || 0) <= 0) return; 
    addToCart(product, 1); 
    Swal.fire({
      icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว', toast: true, position: 'top-end',
      showConfirmButton: false, timer: 1000, background: '#1a4d2e', color: '#fff'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-12 text-[#263A33]">
      
      {/* 🌟 Header & Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm transition-all duration-300">
          <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4">
               {/* Breadcrumb */}
               <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                    <Link to="/" className="hover:text-[#1a4d2e] transition-colors">หน้าแรก</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-[#1a4d2e] transition-colors">สินค้า</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#1a4d2e] font-bold capitalize">{tag?.name || slug?.replace('-', ' ')}</span>
               </nav>

               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                   <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-[#1a4d2e]/5 rounded-2xl flex items-center justify-center text-[#1a4d2e] shadow-sm rotate-3 transition-transform hover:rotate-6 border border-[#1a4d2e]/10">
                           {tag?.icon ? <span className="text-3xl">{tag.icon}</span> : <Tag size={32} />}
                       </div>
                       <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black text-[#263A33] tracking-tight uppercase">
                                    {tag?.name || slug?.replace('-', ' ')}
                                </h1>
                                {tag?.group_name === 'promotion' && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1"><Zap size={10} fill="currentColor"/> PROMO</span>}
                            </div>
                            <p className="text-gray-500 text-sm font-medium mt-1 max-w-2xl text-balance">
                                {tag?.description || `พบกับสินค้าคัดพิเศษในหมวด ${tag?.name || slug}`}
                            </p>
                       </div>
                   </div>

                   {/* Toolbar */}
                   <div className="flex items-center gap-3">
                       {/* View Toggle */}
                       <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                <LayoutGrid size={18} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                <Menu size={18} />
                            </button>
                       </div>
                       
                       <button onClick={() => navigate('/shop')} className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-500 hover:bg-[#1a4d2e] hover:text-white transition-all shadow-sm">
                            <ArrowLeft size={18} />
                       </button>
                   </div>
               </div>
          </div>
      </div>

      {/* 📦 Content */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 mt-8">
            {loading ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1'}`}>
                  {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            ) : products.length > 0 ? (
                <div className={`grid gap-6 mb-20 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1'}`}>
                  {products.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className={`group bg-white rounded-3xl p-3 shadow-sm hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 relative border border-gray-100 hover:border-transparent flex ${viewMode === 'list' ? 'flex-row gap-6 items-center' : 'flex-col hover:-translate-y-2'}`}>
                    
                        <div className={`relative overflow-hidden rounded-2xl bg-[#F4F4F5] ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-[4/5] w-full'}`}>
                            {product.thumbnail ? (
                                <img src={product.thumbnail.startsWith('http') ? product.thumbnail : API_BASE_URL + product.thumbnail} alt={product.title} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold bg-gray-100">NO IMAGE</div>
                            )}
                            
                            {/* Overlay Button */}
                            <button 
                                onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                                className="absolute bottom-3 right-3 w-10 h-10 bg-white text-[#1a4d2e] rounded-full shadow-lg flex items-center justify-center translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#1a4d2e] hover:text-white z-10"
                            >
                                <ShoppingBag size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 pt-3 px-1">
                            <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-[#1a4d2e] transition-colors mb-1">
                                {product.title}
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-black text-[#1a4d2e]">{formatPrice(product.price)}</span>
                            </div>
                        </div>
                    </Link>
                  ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Tag size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400">ไม่พบสินค้าในหมวดหมู่นี้</h3>
                    <p className="text-gray-400 text-sm mt-2">อาจยังไม่มีการติดป้ายกำกับสินค้า หรือแท็กนี้ไม่มีอยู่จริง</p>
                    <Link to="/shop" className="mt-6 px-8 py-3 bg-[#1a4d2e] text-white rounded-xl font-bold hover:bg-[#143d24] transition-all">
                        ดูสินค้าทั้งหมด
                    </Link>
                </div>
            )}
      </div>
    </div>
  );
}
