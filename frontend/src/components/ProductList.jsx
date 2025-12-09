import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { useCart } from "../context/CartContext";
import Swal from 'sweetalert2';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categories, setCategories] = useState(["ทั้งหมด"]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [user, setUser] = useState(null);

  const { searchQuery } = useSearch();
  const { addToCart } = useCart();

  const Toast = Swal.mixin({
    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true,
    didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    fetch('http://localhost:8000/api/categories/')
      .then(res => res.json())
      .then(data => setCategories(data.categories))
      .catch(err => console.error(err));
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    let url = `http://localhost:8000/api/products/?sort=${sortOption}`;
    if (minPrice) url += `&min_price=${minPrice}`;
    if (maxPrice) url += `&max_price=${maxPrice}`;
    if (selectedCategory !== "ทั้งหมด") url += `&category=${selectedCategory}`;
    if (searchQuery) url += `&search=${searchQuery}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchProducts(); }, [sortOption, minPrice, maxPrice, selectedCategory, searchQuery]);

  const handleAddToCart = (product) => {
      addToCart(product, 1);
      Toast.fire({ icon: 'success', title: 'เพิ่มลงตะกร้าเรียบร้อย' });
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    const result = await Swal.fire({
        title: 'ยืนยันการลบ?', text: "กู้คืนไม่ได้นะ!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'ลบเลย!'
    });
    if (result.isConfirmed) {
      try {
        await fetch(`http://localhost:8000/api/products/${id}/`, { method: "DELETE" });
        setProducts(products.filter((p) => p.id !== id));
        Swal.fire('ลบสำเร็จ!', '', 'success');
      } catch (err) { Swal.fire('Error', 'ลบไม่ได้', 'error'); }
    }
  };

  return (
    <div id="shop-section" className="w-full py-16 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-thin">
              {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{cat}</button>
              ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              <div className="flex items-center gap-2">
                  <input type="number" placeholder="ต่ำสุด" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-20 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"/>
                  <span className="text-gray-400">-</span>
                  <input type="number" placeholder="สูงสุด" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-20 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"/>
              </div>
              <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 focus:outline-none focus:border-primary cursor-pointer">
                  <option value="newest">✨ มาใหม่ล่าสุด</option>
                  <option value="price_asc">💰 ราคา ต่ำ ➜ สูง</option>
                  <option value="price_desc">💎 ราคา สูง ➜ ต่ำ</option>
              </select>
          </div>
        </div>

        {loading ? <div className="text-center py-20 text-gray-400">กำลังโหลด...</div> : products.length === 0 ? <div className="text-center py-20 text-gray-400">ไม่พบสินค้า</div> : (
            <div className="space-y-10">
              {products.map((product) => (
                  <div key={product.id} className="group bg-white rounded-[2.5rem] p-5 shadow-soft hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center border border-white">
                      <div className="absolute top-6 left-6 z-20 flex gap-2">
                           <span className="bg-white text-gray-800 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm border border-gray-100">⭐ {product.rating || 0}</span>
                           {product.stock === 0 ? <span className="bg-gray-800 text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase shadow-sm">⚫ สินค้าหมด</span> : product.stock < 5 ? <span className="bg-red-500 text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase shadow-sm animate-pulse">🔥 เหลือ {product.stock}</span> : null}
                      </div>
                      <div className="w-full md:w-80 h-72 rounded-[2rem] flex-shrink-0 relative overflow-hidden transition-colors flex items-center justify-center bg-[#FAFAF8]">
                          <Link to={`/product/${product.id}`} className="block w-full h-full p-8 flex items-center justify-center">
                              <img src={product.thumbnail} alt={product.title} className="max-w-full max-h-full object-contain transition duration-700 group-hover:scale-110 drop-shadow-lg" />
                          </Link>
                      </div>
                      <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center py-2 pr-4 md:pr-8">
                          <div className="mb-4">
                              <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-2">{product.category}</p>
                              <Link to={`/product/${product.id}`} className="block"><h3 className="text-2xl md:text-3xl font-bold text-textMain hover:text-primary transition duration-300 leading-tight">{product.title}</h3></Link>
                          </div>
                          <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-2 md:line-clamp-3 font-light">{product.description}</p>
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-auto">
                              <span className="text-3xl font-bold text-primary">฿{product.price?.toLocaleString()}</span>
                              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                  <button onClick={() => handleAddToCart(product)} disabled={product.stock === 0} className={`flex-1 md:flex-none px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-[#234236] text-white'}`}>
                                      {product.stock === 0 ? 'หมด' : 'ใส่ตะกร้า'}
                                  </button>
                                  {user && user.is_superuser && (
                                      <>
                                          <Link to={`/product/edit/${product.id}`} className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary hover:border-primary transition shadow-sm">✎</Link>
                                          <button onClick={(e) => handleDelete(product.id, e)} className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition shadow-sm">✕</button>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;