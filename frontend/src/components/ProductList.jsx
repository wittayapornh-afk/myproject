// frontend/src/components/ProductList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/products/');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setProducts(data.products); 
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false); 
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id, e) => {
    e.preventDefault(); // ป้องกันลิงก์ทำงาน
    if (confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}/`, { method: 'DELETE' });
        if (response.ok) setProducts(products.filter(p => p.id !== id));
      } catch (error) { console.error("Error:", error); }
    }
  };

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-textMuted font-medium">กำลังโหลดสินค้า...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-secondary mb-2">Discover Products</h1>
            <p className="text-textMuted">คัดสรรสินค้าคุณภาพเพื่อคุณ</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                ref={searchInputRef}
                type="text" 
                placeholder="ค้นหาสินค้า..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition shadow-sm"
                />
            </div>
            <Link to="/product/add">
                <button className="bg-secondary hover:bg-black text-white px-5 py-2.5 rounded-xl shadow-lg shadow-gray-200 transition flex items-center gap-2 font-medium whitespace-nowrap">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    เพิ่มสินค้า
                </button>
            </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-white text-textMuted hover:bg-gray-100 border border-transparent'
            }`}
          >
            {cat === "All" ? "ทั้งหมด" : cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="inline-block p-4 rounded-full bg-gray-50 mb-4 text-4xl">🔍</div>
          <p className="text-lg font-medium text-secondary">ไม่พบสินค้าที่คุณค้นหา</p>
          <button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="mt-2 text-primary hover:underline font-medium">
            ล้างตัวกรอง
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
            
            {/* Image */}
            <Link to={`/product/${product.id}`} className="block relative pt-[80%] overflow-hidden bg-gray-50">
                <img 
                  src={product.thumbnail} 
                  alt={product.title} 
                  className="absolute top-0 left-0 w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-3 left-3">
                   <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-secondary uppercase tracking-wider">
                     {product.category}
                   </span>
                </div>
            </Link>
            
            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                    <p className="text-xs text-textMuted mb-1 font-medium">{product.brand || "Generic"}</p>
                    <Link to={`/product/${product.id}`}>
                        <h3 className="text-base font-bold text-secondary line-clamp-1 group-hover:text-primary transition">
                            {product.title}
                        </h3>
                    </Link>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-lg font-bold text-primary">${product.price.toLocaleString()}</span>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                         <Link to={`/product/edit/${product.id}`} className="p-2 bg-gray-50 rounded-lg text-textMuted hover:bg-primary hover:text-white transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </Link>
                        <button onClick={(e) => handleDelete(product.id, e)} className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;