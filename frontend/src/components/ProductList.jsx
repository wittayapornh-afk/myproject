import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

function ProductList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); 

  const Toast = Swal.mixin({
    toast: true, position: "top-end", showConfirmButton: false, timer: 1500, timerProgressBar: true,
  });

  useEffect(() => {
    fetch("http://localhost:8000/api/categories/")
      .then((res) => res.json())
      .then((data) => { if (data.categories) setCategories(data.categories); })
      .catch((err) => console.error(err));
  }, []);

  const fetchProducts = (urlOverride) => {
    setLoading(true);
    let url = urlOverride || `http://localhost:8000/api/products/?sort=${sortOption}`;
    if (!urlOverride) {
      if (minPrice) url += `&min_price=${minPrice}`;
      if (maxPrice) url += `&max_price=${maxPrice}`;
      if (selectedCategory !== "ทั้งหมด") url += `&category=${selectedCategory}`;
      if (searchQuery) url += `&search=${searchQuery}`;
    }
    fetch(url).then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then((data) => {
        setProducts(data.results || data.products || []);
        setNextPage(data.next);
        setPrevPage(data.previous);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setProducts([]); setLoading(false); });
  };

  useEffect(() => { fetchProducts(null); }, [sortOption, selectedCategory, searchQuery]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Toast.fire({ icon: "success", title: "เพิ่มลงตะกร้าแล้ว" });
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "ลบสินค้า?", text: "ยืนยันการลบรายการนี้", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "ลบเลย", cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/products/${productId}/delete/`, {
            method: "DELETE", headers: { Authorization: `Token ${token}` },
        });
        if (response.ok) {
          Swal.fire("เรียบร้อย", "ลบสินค้าแล้ว", "success");
          fetchProducts(null);
        } else { Swal.fire("Error", "เกิดข้อผิดพลาด", "error"); }
      } catch (error) { Swal.fire("Error", "เกิดข้อผิดพลาด", "error"); }
    }
  };

  const filteredProducts = products.filter((p) => {
    if (inStockOnly && p.stock <= 0) return false;
    if (ratingFilter > 0 && (p.rating || 0) < ratingFilter) return false;
    return true;
  });

  const SidebarFilter = () => (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="font-bold text-[#263A33] mb-4 text-lg">ค้นหา</h3>
        <div className="relative">
            <input type="text" placeholder="พิมพ์ชื่อสินค้า..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#305949] focus:ring-1 focus:ring-[#305949]" />
            <i className="bi bi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-[#263A33] mb-4 text-lg flex items-center gap-2"><i className="bi bi-grid-fill"></i> หมวดหมู่สินค้า</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${selectedCategory === cat ? "bg-[#305949] border-[#305949]" : "border-gray-300 group-hover:border-[#305949]"}`}>
                {selectedCategory === cat && <span className="text-white text-xs">✓</span>}
              </div>
              <input type="radio" name="category" className="hidden" checked={selectedCategory === cat} onChange={() => { setSelectedCategory(cat); setIsFilterOpen(false); }} />
              <span className={`text-sm ${selectedCategory === cat ? "text-[#305949] font-bold" : "text-gray-600"}`}>{cat}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-[#263A33] mb-4 text-lg">ช่วงราคา</h3>
        <div className="flex items-center gap-2 mb-3">
          <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#305949] focus:ring-1 focus:ring-[#305949]" />
          <span className="text-gray-400">-</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#305949] focus:ring-1 focus:ring-[#305949]" />
        </div>
        <button onClick={() => fetchProducts(null)} className="w-full py-2 bg-[#305949] text-white text-sm font-bold rounded-lg hover:bg-[#234236] transition shadow-md">ค้นหาตามราคา</button>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-bold text-[#263A33] mb-4 text-lg">ตัวกรองเพิ่มเติม</h3>
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="w-5 h-5 rounded text-[#305949] focus:ring-[#305949] border-gray-300" />
          <span className="text-sm text-gray-600">พร้อมส่ง (In Stock)</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <nav className="flex text-sm text-gray-500 mb-2">
              <Link to="/" className="hover:text-[#305949] transition-colors">หน้าหลัก</Link>
              <span className="mx-2">/</span>
              <span className="text-[#305949] font-medium">สินค้าทั้งหมด</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-[#263A33] tracking-tight">🛍️ รายการสินค้า</h1>
          </div>
          <div className="flex gap-3">
            {user && (user.role_code === "admin" || user.role_code === "super_admin") && (
              <Link to="/product/add" className="hidden md:flex items-center justify-center gap-2 bg-[#305949] text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-[#234236] transition hover:-translate-y-0.5">
                <i className="bi bi-plus-lg"></i> เพิ่มสินค้า
              </Link>
            )}
            <button onClick={() => setIsFilterOpen(true)} className="md:hidden flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-[#263A33] font-bold"><i className="bi bi-funnel"></i> ตัวกรอง</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24"><SidebarFilter /></div>
          </aside>

          {isFilterOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
              <div className="relative bg-white w-80 h-full p-6 overflow-y-auto shadow-2xl animate-slide-in">
                <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-[#263A33]">ตัวกรองสินค้า</h2><button onClick={() => setIsFilterOpen(false)} className="text-gray-400 text-2xl hover:text-red-500">✕</button></div>
                <SidebarFilter />
              </div>
            </div>
          )}

          <main className="flex-1">
            <div className="flex wrap justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-500">ผลลัพธ์ทั้งหมด <span className="text-[#305949] font-bold">{filteredProducts.length}</span> รายการ</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">เรียงตาม:</span>
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="text-sm font-bold text-[#263A33] bg-gray-50 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-[#305949]/20">
                  <option value="newest">✨ มาใหม่ล่าสุด</option>
                  <option value="price_asc">💰 ราคา: ต่ำ ➜ สูง</option>
                  <option value="price_desc">💎 ราคา: สูง ➜ ต่ำ</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">{[...Array(8)].map((_, i) => <div key={i} className="bg-white h-80 rounded-2xl animate-pulse shadow-sm"></div>)}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-700">ไม่พบสินค้า</h3>
                <p className="text-gray-500">ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น</p>
                <button onClick={() => { setSelectedCategory("ทั้งหมด"); setMinPrice(""); setMaxPrice(""); setSearchQuery(""); }} className="mt-4 text-[#305949] font-bold hover:underline">ล้างตัวกรองทั้งหมด</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col relative overflow-hidden">
                    
                    {/* ✅✅✅ ปุ่มสติ๊กเกอร์ (แก้ไข/ลบ) ใส่ไอคอน 🔧 🪣 ✅✅✅ */}
                    {user && (user.role_code === "admin" || user.role_code === "super_admin") && (
                      <div className="absolute top-3 right-3 z-30 flex gap-2">
                        {/* Sticker Edit */}
                        <Link 
                            to={`/product/edit/${product.id}`} 
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-white hover:bg-gray-50 hover:scale-110 transition-all"
                            title="แก้ไขสินค้า"
                        >
                          <span className="text-sm">🔧</span>
                        </Link>
                        {/* Sticker Delete */}
                        <button 
                            onClick={() => handleDelete(product.id)} 
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-white hover:bg-gray-50 hover:scale-110 transition-all"
                            title="ลบสินค้า"
                        >
                          <span className="text-sm">🪣</span>
                        </button>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      {product.stock === 0 ? <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide">SOLD OUT</span> : product.stock < 5 ? <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-md font-bold">เหลือ {product.stock}</span> : null}
                    </div>

                    <div className="w-full aspect-square bg-[#F4F4F2] rounded-xl mb-3 relative overflow-hidden group-hover:bg-[#EFEFEA] transition">
                      <Link to={`/product/${product.id}`} className="block w-full h-full flex items-center justify-center p-4">
                        <img src={product.thumbnail} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110" />
                      </Link>
                      {user?.role_code !== 'super_admin' && product.stock > 0 && (
                        <button onClick={(e) => { e.preventDefault(); handleAddToCart(product); }} className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#305949] translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#305949] hover:text-white">
                          <i className="bi bi-cart-plus-fill text-lg"></i>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col px-1">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 line-clamp-1">{product.category}</span>
                      <Link to={`/product/${product.id}`} className="text-sm font-bold text-[#263A33] hover:text-[#305949] line-clamp-2 mb-2 leading-snug min-h-[2.5em]">{product.title}</Link>
                      <div className="mt-auto flex items-end justify-between pt-2 border-t border-gray-50">
                        <div><span className="text-lg font-extrabold text-[#305949]">฿{product.price?.toLocaleString()}</span></div>
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md"><i className="bi bi-star-fill text-yellow-400 text-[10px]"></i> {product.rating || 0}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && (prevPage || nextPage) && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button disabled={!prevPage} onClick={() => { if (prevPage) fetchProducts(prevPage); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:border-[#305949] hover:text-[#305949] disabled:opacity-50 transition-all shadow-sm"><i className="bi bi-arrow-left mr-2"></i> ก่อนหน้า</button>
                <button disabled={!nextPage} onClick={() => { if (nextPage) fetchProducts(nextPage); window.scrollTo({top:0, behavior:'smooth'}); }} className="px-6 py-2.5 bg-[#305949] text-white rounded-full text-sm font-bold shadow-md hover:bg-[#234236] hover:shadow-lg disabled:opacity-50 transition-all">ถัดไป <i className="bi bi-arrow-right ml-2"></i></button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductList;