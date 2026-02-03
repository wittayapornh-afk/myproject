import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate
import { 
  ShoppingCart, Search, Eye, ChevronLeft, ChevronRight, ChevronDown, 
  CheckCircle, Heart, Star, SlidersHorizontal, XCircle, Filter, X, ShoppingBag, Zap, Tag,
  Flower2, Sofa, Utensils, Shirt, Footprints, Watch, Sparkles, Gem, Smartphone, Monitor, ShoppingBasket, Gift, Rocket, LayoutGrid, Glasses,
  Tablet, Headphones, Bike, Car, Trophy, Laptop, CookingPot, Dumbbell, Pipette, Briefcase, Menu, CreditCard
} from 'lucide-react'; 
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
// Wishlist removed
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/formatUtils';
import ProductBadge from './ProductBadge';

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

// ✅ Collapsible Filter Section Component
const FilterSection = ({ title, icon: Icon, id, openSections, toggleSection, children }) => (
    <div className="border-b border-gray-100 last:border-0">
        <button 
            onClick={() => toggleSection(id)} 
            className="w-full flex items-center justify-between py-4 px-1 hover:text-[#1a4d2e] transition-colors group"
        >
            <span className="font-bold text-gray-800 text-sm flex items-center gap-2 group-hover:text-[#1a4d2e]">
                {Icon && <Icon size={16} className="text-gray-400 group-hover:text-[#1a4d2e]"/>}
                {title}
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${openSections[id] ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections[id] ? 'max-h-[600px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
            {children}
        </div>
    </div>
);

// 🎓 Icon Mapping Helper (Enhanced with Thai & Modern Icons)
const getCategoryConfig = (catName) => {
    if (!catName) return { icon: LayoutGrid, label: '', color: 'bg-gray-200' };
    const lower = String(catName).toLowerCase();
    
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
  
  // ✅ Tag Filter States
  const [allTags, setAllTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  
  // ✅ Layout State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ category: true, price: true, brand: true, tags: false });

  const toggleSection = (section) => {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const API_BASE_URL = "http://localhost:8000";

  // ✅ Dynamic Grouping Logic (Backend Driven)
  const groupTags = (tags) => {
    const groups = {};
    
    // Define Display Names
    const groupDisplayNames = {
      'promotion': 'โปรโมชั่น (Promotion)',
      'category': 'หมวดหมู่ (Category)',
      'feature': 'คุณสมบัติ (Feature)',
      'brand': 'แบรนด์ (Brand)',
      'other': 'อื่นๆ (Other)'
    };

    tags.forEach(tag => {
      const groupKey = tag.group_name || 'other';
      const groupName = groupDisplayNames[groupKey] || 'อื่นๆ (Other)';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(tag);
    });

    // Sort groups logic if needed (Promotion first)
    return groups;
  };

  const tagGroups = groupTags(allTags);

  // 1. โหลดหมวดหมู่ (ใช้ API เดียวกับ Navbar เพื่อความตรงกัน)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menu-configs/`)
      .then(res => res.json())
      .then(data => {
        // Data is array of objects: [{ id, name, menu_config }, ...]
        // We set the full objects to state
        setCategories(data || []);
      })
      .catch(err => console.error(err));
  }, []);

  // ... (Keep existing useEffects)

// ...

             {/* 1. Category Section */}
             <FilterSection title="หมวดหมู่สินค้า" icon={LayoutGrid} id="category" openSections={openSections} toggleSection={toggleSection}>
                 <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                     <button 
                        onClick={() => { setSelectedCategory('ทั้งหมด'); updatePage(1); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${selectedCategory === 'ทั้งหมด' ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a4d2e]'}`}
                     >
                        <span>ดูทั้งหมด</span>
                        {selectedCategory === 'ทั้งหมด' && <CheckCircle size={14} />}
                     </button>

                     {categories.map(catObj => {
                         // ✅ Handle both object (from new API) and legacy string format
                         const catName = typeof catObj === 'string' ? catObj : catObj.name;
                         
                         // Helper to get icon (assuming getCategoryConfig works with name)
                         const config = getCategoryConfig(catName); 
                         const isSelected = selectedCategory === catName;
                         
                         return (
                            <button 
                                key={catName}
                                onClick={() => { setSelectedCategory(catName); updatePage(1); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${isSelected ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a4d2e]'}`}
                            >
                                <span className="flex items-center gap-2 text-left line-clamp-1">
                                    {config.icon && <config.icon size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />} 
                                    {catName}
                                </span>
                                {isSelected && <CheckCircle size={14} />}
                            </button>
                         );
                     })}
                 </div>
             </FilterSection>
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

  // 1.2 โหลดแบรนด์ Dynamic ตาม Category
  useEffect(() => {
    let url = `${API_BASE_URL}/api/brands/`;
    if (selectedCategory !== 'ทั้งหมด') {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
          setBrands(data.brands || []);
          // ถ้า Brand ที่เลือกอยู่ ไม่ได้อยู่ใน List ใหม่ ให้ Reset เป็น 'ทั้งหมด'
          if (selectedBrand !== 'ทั้งหมด' && data.brands && !data.brands.includes(selectedBrand)) {
              setSelectedBrand('ทั้งหมด');
          }
      })
      .catch(err => console.error(err));
  }, [selectedCategory]); // ✅ Run whenever Category changes

  // 1.3 Load Tags (Global)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tags/`)
        .then(res => res.json())
        .then(data => {
            const activeTags = (data || []).filter(t => t.is_active !== false);
            setAllTags(activeTags);
        })
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
        
        // ✅ Multi-select Tag Support
        if (selectedTagIds.length > 0) {
            url += `&tags=${selectedTagIds.join(',')}`;
        }

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
  }, [currentPage, selectedCategory, selectedBrand, showInStockOnly, sortOption, searchQuery, minPrice, maxPrice, minRating, selectedTagIds]);

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

  const toggleTag = (id) => {
      setSelectedTagIds(prev => 
          prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
      updatePage(1);
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
      setSelectedTagIds([]); // Clear Tags
      updatePage(1);
  };

  const isInCart = (id) => cartItems.some(item => item.id === id);

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans selection:bg-[#1a4d2e] selection:text-white pb-12">
      
      {/* 🌟 Header */}
      <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-16 flex justify-between items-center gap-4">
               <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-[#1a4d2e] rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-900/20">
                       <ShoppingBag size={18} />
                   </div>
                   <h1 className="text-xl font-black text-[#263A33] tracking-tight uppercase">Shop All</h1>
               </div>

               {/* Mobile Filter Toggle */}
               <button onClick={() => setShowMobileFilter(true)} className="lg:hidden p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500 hover:text-[#1a4d2e] active:scale-95 transition-all flex items-center gap-2 font-bold text-xs">
                   <Filter size={18} /> ตัวกรอง
               </button>
          </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 md:px-6 mt-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* 🍌 LEFT SIDEBAR (Desktop Only - Modern Redesign) */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0 sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden px-4 py-2">
             
             {/* 1. Category Section */}
             <FilterSection title="หมวดหมู่สินค้า" icon={LayoutGrid} id="category" openSections={openSections} toggleSection={toggleSection}>
                 <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                     <button 
                        onClick={() => { setSelectedCategory('ทั้งหมด'); updatePage(1); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${selectedCategory === 'ทั้งหมด' ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a4d2e]'}`}
                     >
                        <span>ดูทั้งหมด</span>
                        {selectedCategory === 'ทั้งหมด' && <CheckCircle size={14} />}
                     </button>

                     {categories.map(catObj => {
                         // ✅ Handle both object (from new API) and legacy string format
                         const catName = typeof catObj === 'string' ? catObj : catObj.name;
                         
                         // Helper to get icon (assuming getCategoryConfig works with name)
                         const config = getCategoryConfig(catName); 
                         const isSelected = selectedCategory === catName;
                         
                         return (
                            <button 
                                key={catName}
                                onClick={() => { setSelectedCategory(catName); updatePage(1); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-bold ${isSelected ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a4d2e]'}`}
                            >
                                <span className="flex items-center gap-2 text-left line-clamp-1">
                                    {config.icon && <config.icon size={14} className={isSelected ? 'text-white' : 'text-gray-400'} />} 
                                    {catName}
                                </span>
                                {isSelected && <CheckCircle size={14} />}
                            </button>
                         );
                     })}
                 </div>
             </FilterSection>

             {/* 2. Price Range */}
             <FilterSection title="ช่วงราคา" icon={CreditCard} id="price" openSections={openSections} toggleSection={toggleSection}>
                 <div className="flex items-center gap-2 p-1">
                     <input 
                        type="number" 
                        placeholder="Min" 
                        value={minPrice} 
                        onChange={e => setMinPrice(e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium border border-gray-200 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all placeholder:text-gray-300" 
                     />
                     <span className="text-gray-300 font-medium">-</span>
                     <input 
                        type="number" 
                        placeholder="Max" 
                        value={maxPrice} 
                        onChange={e => setMaxPrice(e.target.value)} 
                        className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium border border-gray-200 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all placeholder:text-gray-300" 
                     />
                 </div>
             </FilterSection>

             {/* 3. Brands */}
             {brands.length > 0 && (
                 <FilterSection title="แบรนด์" icon={Star} id="brand" openSections={openSections} toggleSection={toggleSection}>
                     <div className="flex flex-wrap gap-2 p-1">
                         {brands.slice(0, 15).map(brand => (
                             <button 
                                 key={brand}
                                 onClick={() => { setSelectedBrand(selectedBrand === brand ? 'ทั้งหมด' : brand); updatePage(1); }}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedBrand === brand ? 'bg-[#1a4d2e] border-[#1a4d2e] text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-[#1a4d2e]'}`}
                             >
                                 {brand}
                             </button>
                         ))}
                     </div>
                 </FilterSection>
             )}

             {/* 4. Tags (NEW) */}
             {allTags.length > 0 && (
                <FilterSection title="แท็กสินค้า" icon={Tag} id="tags" openSections={openSections} toggleSection={toggleSection}>
                    <div className="flex flex-wrap gap-2 p-1">
                        {allTags.slice(0, 20).map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${selectedTagIds.includes(tag.id) ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                            >
                                {tag.icon && <span>{tag.icon}</span>}
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </FilterSection>
             )}

             {/* 5. Status & Reset */}
             <div className="pt-4 border-t border-gray-100 space-y-3">
                <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#1a4d2e] transition-all">
                    <span className="text-xs font-bold text-gray-700">พร้อมส่งเท่านั้น</span>
                    <div className={`w-8 h-5 rounded-full p-1 transition-colors ${showInStockOnly ? 'bg-[#1a4d2e]' : 'bg-gray-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${showInStockOnly ? 'translate-x-3' : 'translate-x-0'}`}></div>
                    </div>
                    <input type="checkbox" className="hidden" checked={showInStockOnly} onChange={(e) => { setShowInStockOnly(e.target.checked); updatePage(1); }} />
                </label>
                
                <button onClick={clearFilters} className="w-full py-3 bg-white border border-gray-200 text-gray-400 font-bold rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                    <Filter size={14} /> ล้างตัวกรอง
                </button>
             </div>
        </aside>

        {/* 📱 MOBILE FILTER DRAWER (Hidden on Desktop) */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 lg:hidden">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)}></div>
             <aside className="absolute bottom-0 left-0 w-full h-[85vh] bg-white rounded-t-[2rem] shadow-2xl flex flex-col animate-slide-up">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-black text-xl text-[#263A33]">ตัวกรองสินค้า</h3>
                     <button onClick={() => setShowMobileFilter(false)} className="bc-gray-100 p-2 rounded-full"><X size={20}/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     {/* Mobile Filter Content (Simplified) */}
                     <div>
                        <h4 className="font-bold mb-3">หมวดหมู่</h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(catObj => {
                                const catName = typeof catObj === 'string' ? catObj : catObj.name;
                                return (
                                    <button key={catName} onClick={() => { setSelectedCategory(catName); setShowMobileFilter(false); updatePage(1); }} className={`px-4 py-2 rounded-lg border text-sm font-bold ${selectedCategory === catName ? 'bg-[#1a4d2e] text-white' : 'bg-white'}`}>
                                        {catName}
                                    </button>
                                );
                            })}
                        </div>
                     </div>
                     {/* Include Price/Brand inputs here if needed for mobile completeness */}
                 </div>
             </aside>
          </div>
        )}

      <main className="flex-1 w-full min-w-0">
         {/* Sort & Status Bar */}
         <div className="flex justify-between items-center mb-6">
             <p className="text-gray-500 font-medium">พบสินค้า <span className="text-[#1a4d2e] font-bold">{loading ? '...' : (products.length || 0)}</span> รายการ</p>
             <select 
                value={sortOption} 
                onChange={(e) => { setSortOption(e.target.value); updatePage(1); }} 
                className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 outline-none focus:border-[#1a4d2e]"
            >
                <option value="newest">มาใหม่ล่าสุด</option>
                <option value="price_asc">ราคา: ต่ำ - สูง</option>
                <option value="price_desc">ราคา: สูง - ต่ำ</option>
            </select>
         </div>

         {/* Active Filters Tags */}
         {(selectedTagIds.length > 0 || selectedBrand !== 'ทั้งหมด' || minPrice || maxPrice || showInStockOnly) && (
             <div className="mb-6 flex flex-wrap items-center gap-2">
                 {/* ... (Keep existing Active Filter display logic if needed or simplify) ... */}
                 {showInStockOnly && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">พร้อมส่ง</span>}
             </div>
         )}



            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-20">
                {products.map((product) => {
                  const flashSaleItem = activeFlashSales[product.id];
                  const flashSale = flashSaleItem || product.flash_sale;

                  return (
                  <div key={product.id} className={`group bg-white rounded-3xl p-3 shadow-sm hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 relative border border-gray-100 hover:border-transparent flex flex-col hover:-translate-y-2 ${flashSale ? 'ring-2 ring-red-50' : ''}`}>
                    
                    {/* Flash Sale Badge */}
                    {flashSale && (
                        <div className="absolute top-4 left-4 z-30 flex flex-col items-start gap-1">
                             <div className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-red-500/30 animate-pulse">
                                <Zap size={10} fill="currentColor" /> FLASH SALE
                            </div>
                        </div>
                    )}
                    
                    {/* Discount Badge */}
                     {flashSale && (
                        <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur text-red-600 text-[10px] font-black px-2 py-1 rounded-lg shadow-sm border border-red-100">
                             -{Math.round((1 - (flashSale.sale_price || flashSale.price) / product.price) * 100)}%
                        </div>
                    )}

                    {/* Image Area */}
                    <Link 
                        to={`/product/${product.id}`} 
                        onClick={() => sessionStorage.setItem('shopCurrentPage', currentPage)}
                        className="block relative aspect-[4/5] mb-4 bg-[#F8F9FA] rounded-2xl overflow-hidden p-6 group-hover:bg-white transition-colors"
                    >
                       <img src={getImageUrl(product.thumbnail || product.image)} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply group-hover:mix-blend-normal" alt={product.title} />
                       
                       {/* Hover Actions */}
                       <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                            {!isRestricted && product.stock > 0 && (
                                <button onClick={(e) => { e.preventDefault(); handleAddToCart(product); }} className="flex-1 h-10 bg-[#1a4d2e] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-900/30 hover:bg-[#143d24]">
                                    <ShoppingBag size={14} /> Add
                                </button>
                            )}
                       </div>
                       
                       {product.stock <= 0 && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center"><span className="bg-black/80 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">Out of Stock</span></div>}
                    </Link>
                    
                    {/* Info Area */}
                    <div className="space-y-2 flex-grow flex flex-col px-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                             {product.tags && product.tags.slice(0,2).map(tag => (
                                 <span key={tag.id} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded-md whitespace-nowrap">{tag.name}</span>
                             ))}
                        </div>

                        <Link to={`/product/${product.id}`} className="font-bold text-[#263A33] text-sm leading-snug line-clamp-2 hover:text-[#1a4d2e] transition-colors">{product.title}</Link>
                        
                        <div className="mt-auto pt-2 flex items-baseline gap-2">
                             {flashSale ? (
                                <>
                                    <span className="font-black text-lg text-red-500">{formatPrice(flashSale.sale_price)}</span>
                                    <span className="text-xs text-gray-300 line-through font-bold">{formatPrice(product.price)}</span>
                                </>
                             ) : (
                                <span className="font-black text-lg text-[#1a4d2e]">{formatPrice(product.price)}</span>
                             )}
                        </div>
                   </div>
                  </div>
                  );
                })}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <Search size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-[#263A33]">No products found</h3>
                    <p className="text-gray-400 text-sm font-bold mt-2 mb-8 max-w-xs text-center">We couldn't find any products matching your filters.</p>
                    <button onClick={clearFilters} className="px-8 py-3 bg-[#1a4d2e] text-white rounded-2xl font-bold hover:bg-[#153e25] transition-all shadow-xl shadow-green-900/20 active:scale-95">Clear All Filters</button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pb-8">
                    <button onClick={() => { updatePage(Math.max(1, currentPage - 1)); window.scrollTo(0,0); }} disabled={currentPage === 1} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm hover:-translate-x-1"><ChevronLeft size={24} className="text-gray-600"/></button>
                    
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="font-black text-[#1a4d2e] text-xl">{currentPage}</span>
                        <span className="text-gray-300 font-bold">/</span>
                        <span className="font-bold text-gray-400">{totalPages}</span>
                    </div>

                    <button onClick={() => { updatePage(Math.min(totalPages, currentPage + 1)); window.scrollTo(0,0); }} disabled={currentPage === totalPages} className="w-12 h-12 rounded-2xl bg-[#1a4d2e] text-white flex items-center justify-center hover:bg-[#143d24] disabled:opacity-50 transition-all shadow-lg hover:translate-x-1"><ChevronRight size={24}/></button>
                </div>
            )}
          </main>
        </div>
      </div>
  );
}

export default ProductList;