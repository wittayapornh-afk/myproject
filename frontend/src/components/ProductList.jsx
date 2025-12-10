import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { useCart } from "../context/CartContext";
import Swal from 'sweetalert2';

function ProductList() {
  // State หลัก
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState("http://localhost:8000/api/products/");

  // 🎛️ Filter States (เยอะสะใจตามคำขอ)
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(0); // กรองดาว (Client-side)
  const [inStockOnly, setInStockOnly] = useState(false); // กรองเฉพาะมีของ (Client-side)
  
  // Mobile Sidebar State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { searchQuery } = useSearch();
  const { addToCart } = useCart();

  const Toast = Swal.mixin({
    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
  });

  // โหลดหมวดหมู่
  useEffect(() => {
    fetch('http://localhost:8000/api/categories/')
      .then(res => res.json())
      .then(data => { if(data.categories) setCategories(data.categories); })
      .catch(err => console.error(err));
  }, []);

  // ฟังก์ชันดึงข้อมูล (API Filter)
  const fetchProducts = (urlOverride) => {
    setLoading(true);
    let url = urlOverride || `http://localhost:8000/api/products/?sort=${sortOption}`;
    
    if (!urlOverride) {
        if (minPrice) url += `&min_price=${minPrice}`;
        if (maxPrice) url += `&max_price=${maxPrice}`;
        if (selectedCategory !== "ทั้งหมด") url += `&category=${selectedCategory}`;
        if (searchQuery) url += `&search=${searchQuery}`;
    }

    fetch(url)
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then((data) => {
        const rawData = data.results || data.products || [];
        setProducts(rawData);
        setNextPage(data.next);
        setPrevPage(data.previous);
        setLoading(false);
      })
      .catch((err) => { 
          console.error(err); 
          setProducts([]); 
          setLoading(false); 
      });
  };

  useEffect(() => { fetchProducts(null); }, [sortOption, selectedCategory, searchQuery]); // Price กดปุ่มค่อยหา

  // กรอง Client-Side เพิ่มเติม (Rating & Stock)
  const filteredProducts = products.filter(p => {
      if (inStockOnly && p.stock <= 0) return false;
      if (ratingFilter > 0 && (p.rating || 0) < ratingFilter) return false;
      return true;
  });

  const handleAddToCart = (product) => {
      addToCart(product, 1);
      Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว' });
  };

  // UI Components ย่อย
  const SidebarFilter = () => (
    <div className="space-y-8">
        {/* 1. หมวดหมู่ */}
        <div>
            <h3 className="font-bold text-[#263A33] mb-4 text-lg">หมวดหมู่สินค้า</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${selectedCategory === cat ? 'bg-[#305949] border-[#305949]' : 'border-gray-300 group-hover:border-[#305949]'}`}>
                            {selectedCategory === cat && <span className="text-white text-xs">✓</span>}
                        </div>
                        <input type="radio" name="category" className="hidden" checked={selectedCategory === cat} onChange={() => { setSelectedCategory(cat); setIsFilterOpen(false); }} />
                        <span className={`text-sm ${selectedCategory === cat ? 'text-[#305949] font-bold' : 'text-gray-600'}`}>{cat}</span>
                    </label>
                ))}
            </div>
        </div>

        {/* 2. ช่วงราคา */}
        <div>
            <h3 className="font-bold text-[#263A33] mb-4 text-lg">ช่วงราคา</h3>
            <div className="flex items-center gap-2 mb-3">
                <input type="number" placeholder="ต่ำสุด" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#305949]" />
                <span className="text-gray-400">-</span>
                <input type="number" placeholder="สูงสุด" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#305949]" />
            </div>
            <button onClick={() => fetchProducts(null)} className="w-full py-2 bg-[#305949] text-white text-sm font-bold rounded-lg hover:bg-[#234236] transition">กรองราคา</button>
        </div>

        {/* 3. คะแนนรีวิว */}
        <div>
            <h3 className="font-bold text-[#263A33] mb-4 text-lg">คะแนนรีวิว</h3>
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                    <button key={star} onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)} className="flex items-center gap-2 w-full hover:bg-gray-50 p-1 rounded transition">
                        <div className={`w-4 h-4 rounded-full border border-gray-300 ${ratingFilter === star ? 'bg-[#305949] border-[#305949]' : ''}`}></div>
                        <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => <span key={i}>{i < star ? '★' : '☆'}</span>)}
                        </div>
                        <span className="text-xs text-gray-500">& ขึ้นไป</span>
                    </button>
                ))}
            </div>
        </div>

        {/* 4. สถานะสินค้า */}
        <div>
            <h3 className="font-bold text-[#263A33] mb-4 text-lg">สถานะ</h3>
            <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="w-5 h-5 rounded text-[#305949] focus:ring-[#305949]" />
                <span className="text-sm text-gray-600">พร้อมส่งเท่านั้น (In Stock)</span>
            </label>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">
    <Link to="/" className="hover:text-[#305949] transition-colors">หน้าหลัก</Link> 
    <span className="mx-2">/</span> 
    <span className="text-gray-800">สินค้าทั้งหมด</span>
</p>
                <h1 className="text-3xl font-extrabold text-[#263A33]">🛍️ เลือกช้อปสินค้า</h1>
            </div>
            {/* Mobile Filter Toggle */}
            <button onClick={() => setIsFilterOpen(true)} className="md:hidden flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-[#263A33] font-bold">
                ⚙️ ตัวกรองสินค้า
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            
            {/* 🔴 Left Sidebar (Desktop) */}
            <aside className="hidden md:block w-64 flex-shrink-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                    <SidebarFilter />
                </div>
            </aside>

            {/* 🔴 Mobile Sidebar Drawer */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="relative bg-white w-80 h-full p-6 overflow-y-auto shadow-2xl animate-slide-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#263A33]">ตัวกรอง</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 text-2xl">✕</button>
                        </div>
                        <SidebarFilter />
                    </div>
                </div>
            )}

            {/* 🟢 Right Content (Grid) */}
            <main className="flex-1">
                {/* Sort Bar */}
                <div className="flex justify-between items-center mb-6 bg-white p-3 px-5 rounded-xl shadow-sm border border-gray-100">
                    <span className="text-sm text-gray-500">พบสินค้า {filteredProducts.length} รายการ</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">เรียงตาม:</span>
                        <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="text-sm font-bold text-[#263A33] bg-transparent border-none outline-none cursor-pointer hover:text-[#305949]">
                            <option value="newest">✨ มาใหม่ล่าสุด</option>
                            <option value="price_asc">💰 ราคา ต่ำ ➜ สูง</option>
                            <option value="price_desc">💎 ราคา สูง ➜ ต่ำ</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white h-80 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <span className="text-4xl">🔍</span>
                        <p className="mt-4 text-gray-500">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
                        <button onClick={() => { setSelectedCategory("ทั้งหมด"); setMinPrice(""); setMaxPrice(""); setSearchQuery(""); }} className="mt-4 text-[#305949] font-bold underline">ล้างตัวกรองทั้งหมด</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="group bg-white rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col relative overflow-hidden">
                                {/* Badges */}
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                                    {product.stock === 0 && <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase">Sold Out</span>}
                                    {product.rating >= 4.5 && <span className="bg-yellow-400 text-yellow-900 text-[10px] px-2 py-1 rounded-md font-bold">★ Top Rated</span>}
                                </div>

                                {/* Image */}
                                <div className="w-full aspect-square bg-[#F4F4F2] rounded-xl mb-4 relative overflow-hidden group-hover:bg-[#EFEFEA] transition">
                                    <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center p-4">
                                        <img src={product.thumbnail} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110" />
                                    </Link>
                                    {/* Quick Add Button */}
                                    <button onClick={(e) => { e.preventDefault(); handleAddToCart(product); }} className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-[#305949] translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#305949] hover:text-white disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={product.stock === 0}>
                                        🛒
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{product.category}</span>
                                    <Link to={`/product/${product.id}`} className="text-sm md:text-base font-bold text-[#263A33] hover:text-[#305949] line-clamp-2 mb-2 leading-tight">
                                        {product.title}
                                    </Link>
                                    
                                    <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                                        <div>
                                            <span className="text-lg font-extrabold text-[#305949]">฿{product.price?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex text-yellow-400 text-xs">★ {product.rating || 0}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && (prevPage || nextPage) && (
                    <div className="flex justify-center gap-3 mt-12">
                        <button disabled={!prevPage} onClick={() => { if(prevPage) fetchProducts(prevPage); window.scrollTo(0,0); }} className="px-5 py-2 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:border-[#305949] hover:text-[#305949] disabled:opacity-50 disabled:hover:border-gray-200">← หน้าก่อนหน้า</button>
                        <button disabled={!nextPage} onClick={() => { if(nextPage) fetchProducts(nextPage); window.scrollTo(0,0); }} className="px-5 py-2 bg-[#305949] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#234236] disabled:opacity-50">หน้าถัดไป →</button>
                    </div>
                )}
            </main>
        </div>
      </div>
    </div>
  );
}

export default ProductList;