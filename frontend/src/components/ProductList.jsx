import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Search, Eye, ChevronLeft, ChevronRight, 
  CheckCircle, Heart, Star, SlidersHorizontal, XCircle, Filter, X 
} from 'lucide-react'; 
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/formatUtils';

// Skeleton Loader
const ProductSkeleton = () => (
  <div className="bg-white rounded-[1.5rem] p-4 shadow-sm animate-pulse border border-gray-100">
    <div className="bg-gray-100 aspect-square rounded-[1rem] mb-4"></div>
    <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-4"></div>
  </div>
);

function ProductList() {
  const { addToCart, cartItems } = useCart(); 
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth(); // Need to check role manually
  
  // ✅ Restriction for Admin/Seller
  const isRestricted = ['admin', 'super_admin', 'seller'].includes(user?.role?.toLowerCase());

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0); 
  const [sortOption, setSortOption] = useState('newest');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  // 1. โหลดหมวดหมู่
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories/`)
      .then(res => res.json())
      .then(data => {
        const uniqueCats = data.categories ? [...new Set(data.categories)] : [];
        setCategories(uniqueCats);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. ฟังก์ชันโหลดสินค้า (รวมทุกเงื่อนไข)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
        let url = `${API_BASE_URL}/api/products/?page=${currentPage}&sort=${sortOption}`;
        
        if (selectedCategory !== 'ทั้งหมด') url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery.trim())}`;
        if (minPrice) url += `&min_price=${minPrice}`;
        if (maxPrice) url += `&max_price=${maxPrice}`;

        const res = await fetch(url);
        const data = await res.json();

        // รับข้อมูลและกรอง Rating ฝั่ง Frontend (กรณี Backend ยังไม่รองรับ)
        let items = data.results ? data.results : (Array.isArray(data) ? data : []);
        if (minRating > 0) {
            items = items.filter(p => (p.rating || 0) >= minRating);
        }

        setProducts(items);
        // คำนวณหน้า: ถ้า Backend ส่ง total_pages มาก็ใช้เลย ถ้าไม่ส่งให้คำนวณเอง
        setTotalPages(data.total_pages || Math.ceil((data.count || items.length) / 12) || 1);
    } catch (err) {
        console.error("Fetch Error:", err);
    } finally {
        setLoading(false);
    }
  }, [currentPage, selectedCategory, sortOption, searchQuery, minPrice, maxPrice, minRating]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(fetchProducts, 500);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleAddToCart = (product) => {
    if (isRestricted || product.stock <= 0) return; 
    addToCart(product, 1); 
    Swal.fire({
      icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว', toast: true, position: 'top-end',
      showConfirmButton: false, timer: 1000, background: '#1a4d2e', color: '#fff'
    });
  };


  const clearFilters = () => {
      setSelectedCategory('ทั้งหมด');
      setSearchQuery('');
      setMinPrice('');
      setMaxPrice('');
      setMinRating(0);
      setSortOption('newest');
      setCurrentPage(1);
  };

  const isInCart = (id) => cartItems.some(item => item.id === id);

  return (
    <div className="min-h-screen bg-[#F9F9F7] pt-28 pb-12 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl font-black text-[#263A33] uppercase tracking-tighter">Shop All</h1>
            
            <div className="flex gap-2 w-full md:w-auto">
                {/* Mobile Filter Toggle */}
                <button onClick={() => setShowMobileFilter(true)} className="md:hidden p-3 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500 hover:text-[#1a4d2e]">
                    <Filter size={20} />
                </button>
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4d2e]" size={20} />
                    <input 
                        type="text" placeholder="ค้นหาสินค้า..." 
                        value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#1a4d2e] outline-none transition-all font-bold text-sm"
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ✅ Sidebar Filter (Responsive) */}
          <aside className={`fixed inset-0 z-50 bg-white p-6 lg:static lg:bg-transparent lg:p-0 lg:w-72 lg:block transition-transform duration-300 overflow-y-auto ${showMobileFilter ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
             <div className="flex justify-between items-center mb-6 lg:hidden">
                 <h3 className="font-bold text-lg">Filters</h3>
                 <button onClick={() => setShowMobileFilter(false)}><X size={24} /></button>
             </div>

             <div className="bg-white lg:p-6 lg:rounded-[2rem] lg:shadow-sm lg:border lg:border-gray-100 space-y-8 sticky top-28">
                {/* หมวดหมู่ */}
                <div>
                    <h3 className="font-black text-sm text-[#263A33] uppercase tracking-widest mb-4">Categories</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {['ทั้งหมด', ...categories].filter((v, i, a) => a.indexOf(v) === i).map(cat => (
                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedCategory === cat ? 'border-[#1a4d2e]' : 'border-gray-300'}`}>
                                    {selectedCategory === cat && <div className="w-2.5 h-2.5 bg-[#1a4d2e] rounded-full" />}
                                </div>
                                <span className={`text-sm font-bold ${selectedCategory === cat ? 'text-[#1a4d2e]' : 'text-gray-500'} group-hover:text-[#1a4d2e]`}>{cat}</span>
                                <input type="radio" name="category" className="hidden" checked={selectedCategory === cat} onChange={() => { setSelectedCategory(cat); setCurrentPage(1); }} />
                            </label>
                        ))}
                    </div>
                </div>

                {/* ช่วงราคา */}
                <div>
                    <h3 className="font-black text-sm text-[#263A33] uppercase tracking-widest mb-4">Price Range</h3>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e]" />
                        <span className="text-gray-400 self-center">-</span>
                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e]" />
                    </div>
                </div>

                {/* เรตติ้งดาว */}
                <div>
                    <h3 className="font-black text-sm text-[#263A33] uppercase tracking-widest mb-4">Rating</h3>
                    <div className="space-y-2">
                        {[4, 3, 2, 1].map(star => (
                            <button key={star} onClick={() => setMinRating(star)} className={`flex items-center gap-2 text-sm font-bold w-full p-2 rounded-lg transition-colors ${minRating === star ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <div className="flex text-orange-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < star ? "currentColor" : "none"} className={i >= star ? "text-gray-200" : ""} />)}
                                </div>
                                <span>& Up</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={clearFilters} className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors uppercase text-xs tracking-widest">Clear All Filters</button>
             </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Showing <span className="text-[#1a4d2e] font-black">{products.length}</span> Products</p>
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-gray-400" />
                    <select value={sortOption} onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }} className="bg-transparent text-xs font-bold text-[#263A33] outline-none cursor-pointer">
                        <option value="newest">Sort by: Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-300 relative border border-transparent hover:border-[#1a4d2e]/10 flex flex-col">
                    

                    {/* Icons Overlay */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                        {!isRestricted && (
                            <button onClick={() => toggleWishlist(product)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md text-gray-400 hover:text-red-500 hover:scale-110 transition-all">
                                <Heart size={16} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} />
                            </button>
                        )}
                        <Link to={`/product/${product.id}`} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md text-gray-400 hover:text-[#1a4d2e] hover:scale-110 transition-all">
                            <Eye size={16} />
                        </Link>
                    </div>

                    <Link to={`/product/${product.id}`} className="block relative aspect-square mb-4 bg-gray-50 rounded-2xl overflow-hidden p-4">
                       <img src={getImageUrl(product.thumbnail || product.image)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" alt="" />
                       {product.stock <= 0 && <span className="absolute inset-0 bg-white/60 flex items-center justify-center text-red-600 font-black text-xs uppercase tracking-widest rotate-[-12deg] border-2 border-red-600 rounded-xl m-8">Out of Stock</span>}
                    </Link>
                    
                    <div className="space-y-1 flex-grow flex flex-col">
                        <div className="flex justify-between items-start">
                            <p className="text-[9px] font-black text-[#1a4d2e] uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded w-fit">{product.category}</p>
                            {isInCart(product.id) && <CheckCircle size={14} className="text-[#1a4d2e]" />}
                        </div>
                        <Link to={`/product/${product.id}`} className="block font-bold text-gray-800 text-sm line-clamp-2 hover:text-[#1a4d2e] transition-colors flex-grow leading-tight mt-1">{product.title}</Link>
                        
                        <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50">
                            <span className="font-black text-lg text-[#1a4d2e]">{formatPrice(product.price)}</span>
                            {!isRestricted && product.stock > 0 && (
                                <button onClick={() => handleAddToCart(product)} className="w-9 h-9 rounded-xl bg-[#1a4d2e] text-white flex items-center justify-center shadow-lg hover:bg-[#143d24] transition-all active:scale-90 hover:-translate-y-1">
                                    <ShoppingCart size={16} />
                                </button>
                            )}
                        </div>
                   </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                    <XCircle className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-400 font-bold">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
                    <button onClick={clearFilters} className="mt-2 text-[#1a4d2e] underline text-sm font-bold">ล้างตัวกรองทั้งหมด</button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                    <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }} disabled={currentPage === 1} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"><ChevronLeft size={20}/></button>
                    <div className="flex items-center gap-2">
                        <span className="font-black text-[#1a4d2e] text-xl">{currentPage}</span>
                        <span className="text-gray-300 text-sm">/</span>
                        <span className="font-bold text-gray-400 text-sm">{totalPages}</span>
                    </div>
                    <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0,0); }} disabled={currentPage === totalPages} className="w-10 h-10 rounded-xl bg-[#1a4d2e] text-white flex items-center justify-center hover:bg-[#143d24] disabled:opacity-50 transition-all shadow-lg"><ChevronRight size={20}/></button>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductList;