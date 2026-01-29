import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import { 
  ShoppingCart, Search, Eye, ChevronLeft, ChevronRight, 
  CheckCircle, Heart, Star, SlidersHorizontal, XCircle, Filter, X, ShoppingBag, Zap,
  Flower2, Sofa, Utensils, Shirt, Footprints, Watch, Sparkles, Gem, Smartphone, Monitor, ShoppingBasket, Gift, Rocket, LayoutGrid, Glasses,
  Tablet, Headphones, Bike, Car, Trophy, Laptop, CookingPot, Dumbbell, Pipette, Briefcase
} from 'lucide-react'; 
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
// Wishlist removed
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/formatUtils';

// Skeleton Loader
const ProductSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-4 shadow-sm animate-pulse border border-gray-100 mb-6">
    <div className="bg-gray-100 aspect-square rounded-[1.5rem] mb-4"></div>
    <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-2"></div>
    <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-4"></div>
    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
        <div className="h-6 w-20 bg-gray-100 rounded-lg"></div>
        <div className="h-10 w-10 bg-gray-100 rounded-xl"></div>
    </div>
  </div>
);

function ProductList() {
  const { addToCart, cartItems } = useCart(); 
  // Wishlist removed
  const { user } = useAuth(); // Need to check role manually
  const navigate = useNavigate(); // ✅ Added for URL updates
  
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

  // ✅ New Filter States
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('ทั้งหมด');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [activeFlashSales, setActiveFlashSales] = useState({}); // Map: productId -> { sale_price, limit, sold }

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
  
  // ✅ 1.0.5 Initialize Filter from URL (e.g. ?category=Sofa&page=2)
  const location = useLocation();

  useEffect(() => {
      const params = new URLSearchParams(location.search);
      const catParam = params.get('category');
      const pageParam = params.get('page');
      
      if (catParam) {
          setSelectedCategory(catParam);
      }
      
      // 🔖 ลองกลับมาจาก sessionStorage ก่อน (ถ้ามี)
      const savedPage = sessionStorage.getItem('shopCurrentPage');
      
      if (savedPage && !pageParam) {
          // มีหน้าที่บันทึกไว้ และไม่มี page ใน URL -> กลับไปหน้าเดิม
          const pageNum = parseInt(savedPage, 10);
          if (!isNaN(pageNum) && pageNum > 0) {
              setCurrentPage(pageNum);
          }
          sessionStorage.removeItem('shopCurrentPage'); // ลบหลังใช้แล้ว
      } else if (pageParam) {
          // มี page ใน URL -> ใช้เลย
          const pageNum = parseInt(pageParam, 10);
          if (!isNaN(pageNum) && pageNum > 0) {
              setCurrentPage(pageNum);
          }
      }
  }, [location.search]);

  // 1.1 โหลด Flash Sales ที่ Active
  useEffect(() => {
    const fetchActiveFlashSales = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/flash-sales/active/`);
            if (res.ok) {
                const data = await res.json();
                // Flatten all products from all active flash sales
                const flashSaleMap = {};
                data.forEach(sale => {
                    sale.products.forEach(p => {
                        flashSaleMap[p.product_id] = {
                            sale_price: p.sale_price,
                            limit: p.limit, // or quantity
                            sold: p.sold,
                            start_time: sale.start_time,
                            end_time: sale.end_time
                        };
                    });
                });
                setActiveFlashSales(flashSaleMap);
            }
        } catch (err) {
            console.error("Failed to fetch flash sales:", err);
        }
    };
    fetchActiveFlashSales();
  }, []);

  // 1.2 โหลดแบรนด์
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/brands/`)
      .then(res => res.json())
      .then(data => setBrands(data.brands || []))
      .catch(err => console.error(err));
  }, []);

  // 2. ฟังก์ชันโหลดสินค้า (รวมทุกเงื่อนไข)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
        let url = `${API_BASE_URL}/api/products/?page=${currentPage}&sort=${sortOption}`;
        
        if (selectedCategory !== 'ทั้งหมด') url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (selectedBrand !== 'ทั้งหมด') url += `&brand=${encodeURIComponent(selectedBrand)}`;
        if (showInStockOnly) url += `&in_stock=true`;

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
  }, [currentPage, selectedCategory, selectedBrand, showInStockOnly, sortOption, searchQuery, minPrice, maxPrice, minRating]);

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


  // ✅ Helper: Update page in URL
  const updatePage = (newPage) => {
      const params = new URLSearchParams(location.search);
      params.set('page', newPage);
      navigate(`?${params.toString()}`, { replace: true });
      setCurrentPage(newPage);
  };

  const clearFilters = () => {
      setSelectedCategory('ทั้งหมด');
      setSelectedBrand('ทั้งหมด');
      setShowInStockOnly(false);
      setSearchQuery('');
      setMinPrice('');
      setMaxPrice('');
      setMinRating(0);
      setSortOption('newest');
      updatePage(1); // ✅ ใช้ updatePage แทน setCurrentPage
  };

    // 🎓 Icon Mapping Helper (Enhanced with Thai & Modern Icons)
    const getCategoryConfig = (catName) => {
        if (!catName) return { icon: LayoutGrid, label: '', color: 'bg-gray-200' };
        const lower = String(catName).toLowerCase();
        // console.log("Matching Category:", lower); // 🔍 Debug

        // 💄 Beauty & Health
        if (lower.includes('beauty') && !lower.includes('health') && !lower.includes('skin')) return {
            icon: Sparkles, label: 'เครื่องสำอาง / ความงาม', color: 'bg-pink-50 text-pink-600'
        };
        // 🧴 Skin Care
        if (lower.includes('skin') || lower.includes('serum') || lower.includes('cream')) return {
            icon: Pipette, label: 'ผลิตภัณฑ์ดูแลผิว', color: 'bg-blue-50 text-blue-400'
        };
        // 🌸 Fragrances
        if (lower.includes('fragrance') || lower.includes('perfume') || lower.includes('น้ำหอม')) return {
            icon: Gem, label: 'น้ำหอม', color: 'bg-purple-50 text-purple-600'
        };

        // 🛋️ Furniture
        if (lower.includes('furniture') || lower.includes('sofa') || lower.includes('armchair')) return {
            icon: Sofa, label: 'เฟอร์นิเจอร์', color: 'bg-orange-50 text-stone-600'
        };
        // 🏠 Home Decoration
        if (lower.includes('decor') || lower.includes('home')) return {
            icon: Flower2, label: 'ของตกแต่งบ้าน', color: 'bg-teal-50 text-teal-600'
        };
        // 🍳 Kitchen Accessories
        if (lower.includes('kitchen') || lower.includes('pan') || lower.includes('knife')) return {
            icon: CookingPot, label: 'อุปกรณ์ครัว', color: 'bg-gray-100 text-gray-800'
        };

        // 🥬 Groceries
        if (lower.includes('grocery') || lower.includes('groceries') || lower.includes('vegetable') || lower.includes('food')) return {
            icon: ShoppingBasket, label: 'สินค้าอุปโภคบริโภค', color: 'bg-green-50 text-green-700'
        };

        // 💻 Laptops
        if (lower.includes('laptop')) return {
            icon: Laptop, label: 'โน้ตบุ๊ก / แล็ปท็อป', color: 'bg-slate-100 text-blue-600'
        };
        // 📱 Smartphones
        if (lower.includes('smartphone') || (lower.includes('phone') && !lower.includes('access'))) return {
            icon: Smartphone, label: 'สมาร์ทโฟน', color: 'bg-gray-900 text-white'
        };
        // 📱 Tablets
        if (lower.includes('tablet') || lower.includes('ipad')) return {
            icon: Tablet, label: 'แท็บเล็ต', color: 'bg-gray-200 text-gray-700'
        };
        // 🎧 Mobile Accessories
        if (lower.includes('mobile access') || lower.includes('earbud') || lower.includes('case')) return {
            icon: Headphones, label: 'อุปกรณ์เสริมมือถือ', color: 'bg-cyan-50 text-cyan-500'
        };

        // 👔 Mens Shirts
        if (lower.includes('mens shirt') || (lower.includes('shirt') && lower.includes('men'))) return {
            icon: Shirt, label: 'เสื้อเชิ้ตผู้ชาย', color: 'bg-blue-50 text-blue-900'
        };
        // 👞 Mens Shoes
        if (lower.includes('mens shoes') || (lower.includes('shoe') && lower.includes('men'))) return {
            icon: Footprints, label: 'รองเท้าผู้ชาย', color: 'bg-amber-100 text-amber-800'
        };
        // ⌚ Mens Watches
        if (lower.includes('mens watch') || (lower.includes('watch') && lower.includes('men'))) return {
            icon: Watch, label: 'นาฬิกาผู้ชาย', color: 'bg-gray-100 text-slate-600'
        };

        // 👗 Tops (Women)
        if (lower.includes('top') || lower.includes('t-shirt')) return {
            icon: Shirt, label: 'เสื้อผ้าส่วนบน (ทั่วไป)', color: 'bg-sky-50 text-sky-400'
        };
        // 👜 Womens Bags
        if (lower.includes('womens bag') || lower.includes('handbag')) return {
            icon: ShoppingBag, label: 'กระเป๋าผู้หญิง', color: 'bg-rose-50 text-rose-800'
        };
        // 👗 Womens Dresses
        if (lower.includes('dress')) return {
            icon: Shirt, label: 'ชุดเดรสผู้หญิง', color: 'bg-orange-50 text-orange-400'
        };
        // 💍 Womens Jewellery
        if (lower.includes('jewel') || lower.includes('ring') || lower.includes('necklace')) return {
            icon: Gem, label: 'เครื่องประดับผู้หญิง', color: 'bg-slate-50 text-slate-400'
        };
        // 👠 Womens Shoes
        if (lower.includes('womens shoes') || lower.includes('heels') || lower.includes('pumps')) return {
            icon: Footprints, label: 'รองเท้าผู้หญิง', color: 'bg-red-50 text-red-600'
        };
        // ⌚ Womens Watches
        if (lower.includes('womens watch')) return {
            icon: Watch, label: 'นาฬิกาผู้หญิง', color: 'bg-rose-50 text-rose-500'
        };

        // 🏍️ Motorcycle
        if (lower.includes('motorcycle') || lower.includes('helmet')) return {
            icon: Bike, label: 'มอเตอร์ไซค์', color: 'bg-stone-900 text-orange-500'
        };
        // 🚗 Vehicle
        if (lower.includes('vehicle') || lower.includes('car')) return {
            icon: Car, label: 'ยานยนต์ / รถยนต์', color: 'bg-blue-50 text-blue-500'
        };
        
        // 🏋️ Sports Accessories
        if (lower.includes('sport') || lower.includes('dumbbell') || lower.includes('gym')) return {
            icon: Dumbbell, label: 'อุปกรณ์กีฬา', color: 'bg-red-50 text-red-600'
        };
        // 🕶️ Sunglasses
        if (lower.includes('sunglass') || lower.includes('glass')) return {
            icon: Glasses, label: 'แว่นกันแดด', color: 'bg-yellow-50 text-yellow-800'
        };

        return { icon: LayoutGrid, label: catName, color: 'bg-gray-50 text-gray-600' }; // Default
    };

  const isInCart = (id) => cartItems.some(item => item.id === id);

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans selection:bg-[#1a4d2e] selection:text-white pb-12">
      
      {/* 🌟 Sticky Glass Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#1a4d2e] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20">
                       <ShoppingBag size={20} />
                   </div>
                   <h1 className="text-2xl font-black text-[#263A33] tracking-tight uppercase">Shop All</h1>
               </div>

               {/* Mobile Filter Toggle */}
               <button onClick={() => setShowMobileFilter(true)} className="md:hidden p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500 hover:text-[#1a4d2e] active:scale-95 transition-all">
                   <Filter size={20} />
               </button>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ✅ Sidebar Filter (Responsive + Sticky) */}
          <aside className={`fixed inset-0 z-50 bg-white/95 backdrop-blur-xl lg:backdrop-blur-none lg:bg-transparent p-6 lg:p-0 lg:static lg:w-72 lg:block transition-all duration-300 ${showMobileFilter ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0 lg:opacity-100'}`}>
             <div className="flex justify-between items-center mb-6 lg:hidden">
                 <h3 className="font-black text-2xl text-[#1a4d2e]">Filters</h3>
                 <button onClick={() => setShowMobileFilter(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={24} /></button>
             </div>

             <div className="bg-white lg:p-6 lg:rounded-[2rem] lg:shadow-sm lg:border lg:border-gray-100 space-y-8 sticky top-28 transition-all hover:shadow-md">
                {/* หมวดหมู่ */}
                <div>
                    <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <SlidersHorizontal size={14} /> Categories
                    </h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {['ทั้งหมด', ...categories].filter((v, i, a) => a.indexOf(v) === i).map(cat => {
                            const config = getCategoryConfig(cat);
                            const isSelected = selectedCategory === cat;
                            // ✅ Use config.label (Thai) if available, otherwise fallback to cat
                            const label = config.label || (cat === 'ทั้งหมด' ? 'สินค้าทั้งหมด' : cat); 

                            return (
                                <label key={cat} className={`flex items-center gap-3 cursor-pointer group p-2 rounded-xl transition-all ${isSelected ? 'bg-green-50/80 shadow-sm' : 'hover:bg-gray-50'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 overflow-hidden ${isSelected ? 'bg-white shadow-sm ' /*+ config.color*/ : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-gray-600'}`}>
                                        <config.icon size={16} strokeWidth={2.5} className={isSelected ? config.color.replace('text-', '') : ''} />
                                    </div>
                                    <span className={`text-sm font-bold truncate flex-1 ${isSelected ? 'text-[#1a4d2e]' : 'text-gray-500'} group-hover:text-[#1a4d2e] transition-colors`}>
                                        {label}
                                    </span>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#1a4d2e] mr-2" />}
                                    <input type="radio" name="category" className="hidden" checked={isSelected} onChange={() => { setSelectedCategory(cat); updatePage(1); }} />
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* แบรนด์ */}
                <div>
                    <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4">Brands</h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {brands.map(brand => (
                            <label key={brand} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selectedBrand === brand ? 'border-[#1a4d2e]' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                    {selectedBrand === brand && <div className="w-2.5 h-2.5 bg-[#1a4d2e] rounded-full" />}
                                </div>
                                <span className={`text-sm font-bold ${selectedBrand === brand ? 'text-[#1a4d2e]' : 'text-gray-500'} group-hover:text-[#1a4d2e]`}>{brand}</span>
                                <input type="radio" name="brand" className="hidden" checked={selectedBrand === brand} onChange={() => { setSelectedBrand(brand); updatePage(1); }} />
                            </label>
                        ))}
                    </div>
                </div>

                {/* สถานะสินค้า */}
                <div>
                    <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4">Status</h3>
                    <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-green-50/50 transition-colors border border-transparent hover:border-green-100">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${showInStockOnly ? 'bg-[#1a4d2e] border-[#1a4d2e]' : 'border-gray-300 bg-white'}`}>
                             {showInStockOnly && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm font-bold ${showInStockOnly ? 'text-[#1a4d2e]' : 'text-gray-500'} group-hover:text-[#1a4d2e]`}>เฉพาะสินค้าพร้อมส่ง</span>
                        <input type="checkbox" className="hidden" checked={showInStockOnly} onChange={(e) => { setShowInStockOnly(e.target.checked); updatePage(1); }} />
                    </label>
                </div>

                {/* เรตติ้งดาว */}
                <div>
                    <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4">Rating</h3>
                    <div className="space-y-1">
                        {[4, 3, 2, 1].map(star => (
                            <button key={star} onClick={() => setMinRating(star)} className={`flex items-center gap-3 text-sm font-bold w-full p-2 rounded-xl transition-colors ${minRating === star ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-gray-500 hover:bg-gray-50 border border-transparent'}`}>
                                <div className="flex text-orange-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < star ? "currentColor" : "none"} className={i >= star ? "text-gray-200" : ""} />)}
                                </div>
                                <span className="text-xs">& Up</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4">Price Range</h3>
                    <div className="flex gap-2 mb-4">
                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg text-xs font-bold border border-gray-200 outline-none focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e]" />
                        <span className="text-gray-300 self-center">-</span>
                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg text-xs font-bold border border-gray-200 outline-none focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e]" />
                    </div>
                </div>

                <button onClick={clearFilters} className="w-full py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                    <XCircle size={16} /> Clear Filters
                </button>
             </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 gap-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Found <span className="text-[#1a4d2e] font-black text-base mx-1">{products.length}</span> items</p>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500">Sort by:</span>
                    <select value={sortOption} onChange={(e) => { setSortOption(e.target.value); updatePage(1); }} className="bg-transparent text-sm font-black text-[#1a4d2e] outline-none cursor-pointer">
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low - High</option>
                        <option value="price_desc">Price: High - Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  // ✅ Check if in active flash sale
                  const flashSaleItem = activeFlashSales[product.id];
                  // Prioritize the frontend fetched flash sale data, fallback to product.flash_sale if backend already populated it (optional, but map is fresher)
                  const flashSale = flashSaleItem || product.flash_sale;

                  return (
                  <div key={product.id} className={`group bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-300 relative border border-gray-100/50 hover:border-[#1a4d2e]/20 flex flex-col hover:-translate-y-2 ${flashSale ? 'ring-2 ring-red-500/10' : ''}`}>
                    
                    {/* Flash Sale Badge */}
                    {flashSale && (
                        <div className="absolute top-4 left-4 z-30 flex flex-col items-start gap-1">
                             <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                                <Zap size={12} fill="currentColor" /> FLASH SALE
                            </div>
                            {/* Calculate Discount % */}
                            <div className="bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg shadow-md">
                                -{Math.round((1 - (flashSale.sale_price || flashSale.price) / product.price) * 100)}%
                            </div>
                        </div>
                    )}

                    {/* Icons Overlay */}
                    <div className="absolute top-5 right-5 z-20 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <Link to={`/product/${product.id}`} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-[#1a4d2e] hover:scale-110 transition-all delay-75">
                            <Eye size={18} />
                        </Link>
                    </div>

                    <Link 
                        to={`/product/${product.id}`} 
                        onClick={() => sessionStorage.setItem('shopCurrentPage', currentPage)} // 🔖 บันทึกหน้าปัจจุบัน
                        className="block relative aspect-square mb-5 bg-[#F8F9FA] rounded-[2rem] overflow-hidden p-6 group-hover:bg-[#f0fdf4] transition-colors"
                    >
                       <img src={getImageUrl(product.thumbnail || product.image)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" alt={product.title} />
                       {product.stock <= 0 && <span className="absolute inset-0 bg-white/60 flex items-center justify-center text-red-600 font-black text-xs uppercase tracking-widest rotate-[-12deg] border-4 border-red-600 rounded-[2rem] m-6">Out of Stock</span>}
                    </Link>
                    
                    <div className="space-y-2 flex-grow flex flex-col px-1">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] font-black text-[#1a4d2e] uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg w-fit">{product.category}</p>
                            {isInCart(product.id) && <CheckCircle size={16} className="text-[#1a4d2e]" />}
                        </div>
                        <Link to={`/product/${product.id}`} className="block font-bold text-gray-800 text-base leading-snug line-clamp-2 hover:text-[#1a4d2e] transition-colors flex-grow">{product.title}</Link>
                        
                        <div className="flex items-end justify-between pt-4 mt-auto border-t border-gray-50 border-dashed">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5 uppercase tracking-wide">Price</p>
                                {flashSale ? (
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 line-through decoration-red-400">{formatPrice(product.price)}</span>
                                        <span className="font-black text-xl text-red-500 flex items-center gap-1">
                                            {formatPrice(flashSale.sale_price)} <Zap size={12} fill="currentColor"/>
                                        </span>
                                    </div>
                                ) : (
                                    <span className="font-black text-xl text-[#1a4d2e]">{formatPrice(product.price)}</span>
                                )}
                            </div>
                            {!isRestricted && product.stock > 0 && (
                                <button onClick={() => handleAddToCart(product)} className="w-11 h-11 rounded-2xl bg-[#1a4d2e] text-white flex items-center justify-center shadow-lg shadow-green-900/20 hover:bg-[#143d24] transition-all active:scale-95 hover:-translate-y-1 group-hover:shadow-green-500/30">
                                    <ShoppingCart size={20} />
                                </button>
                            )}
                        </div>
                   </div>
                  </div>
                  );
                })}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">ไม่พบสินค้าที่คุณค้นหา</h3>
                    <p className="text-gray-400 font-medium mt-2 mb-6">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
                    <button onClick={clearFilters} className="px-6 py-2.5 bg-[#1a4d2e] text-white rounded-xl font-bold hover:bg-[#153e25] transition-colors">ล้างตัวกรองทั้งหมด</button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-16 pb-12">
                    <button onClick={() => { updatePage(Math.max(1, currentPage - 1)); window.scrollTo(0,0); }} disabled={currentPage === 1} className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm hover:-translate-x-1"><ChevronLeft size={24} className="text-gray-600"/></button>
                    
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="font-black text-[#1a4d2e] text-xl">{currentPage}</span>
                        <span className="text-gray-300 font-medium">/</span>
                        <span className="font-bold text-gray-400 text-sm">{totalPages}</span>
                    </div>

                    <button onClick={() => { updatePage(Math.min(totalPages, currentPage + 1)); window.scrollTo(0,0); }} disabled={currentPage === totalPages} className="w-12 h-12 rounded-2xl bg-[#1a4d2e] text-white flex items-center justify-center hover:bg-[#143d24] disabled:opacity-50 disabled:hover:bg-[#1a4d2e] transition-all shadow-lg hover:translate-x-1"><ChevronRight size={24}/></button>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductList;