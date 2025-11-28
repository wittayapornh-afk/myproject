import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 👇 1. เพิ่ม State สำหรับเก็บหมวดหมู่ที่เลือก (เริ่มต้นเลือก "ทั้งหมด")
  const [selectedCategory, setSelectedCategory] = useState("All");

  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/products/');
        if (!response.ok) throw new Error('เชื่อมต่อ API ไม่สำเร็จ');
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

  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("ยืนยันจะลบสินค้านี้ใช่ไหม?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}/`, { method: 'DELETE' });
        if (response.ok) setProducts(products.filter(p => p.id !== id));
      } catch (error) { console.error("ลบไม่สำเร็จ:", error); }
    }
  };

  // 👇 2. ดึงรายชื่อหมวดหมู่ทั้งหมดจากสินค้าที่มี (ไม่ให้ซ้ำกัน)
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // 👇 3. อัพเกรดระบบกรอง: เช็คทั้ง "คำค้นหา" และ "หมวดหมู่"
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="text-center mt-10 text-primary/60 animate-pulse">กำลังโหลดสินค้า...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* ส่วนหัว + ช่องค้นหา */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary">รายการสินค้าแนะนำ 🔥</h2>
        
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
                <input 
                ref={searchInputRef}
                type="text" 
                placeholder="🔍 ค้นหาสินค้า..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 rounded-full border border-primary/20 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition shadow-sm bg-white"
                />
            </div>
            <Link to="/product/add">
                <button className="bg-secondary hover:bg-primary text-white px-4 py-2 rounded-full shadow-md transition flex items-center gap-2 whitespace-nowrap font-medium">
                    + เพิ่มสินค้า
                </button>
            </Link>
        </div>
      </div>

      {/* 👇 4. แถบเลือกหมวดหมู่ (Category Bar) */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap border ${
              selectedCategory === cat 
                ? 'bg-primary text-white border-primary shadow-md' // สีตอนเลือก
                : 'bg-white text-primary border-primary/20 hover:bg-primary/10' // สีตอนไม่เลือก
            }`}
          >
            {cat === "All" ? "ทั้งหมด" : cat}
          </button>
        ))}
      </div>

      {/* แจ้งเตือนเมื่อไม่เจอของ */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 text-gray-500 bg-white/50 rounded-3xl border border-dashed border-primary/20">
          <p className="text-lg">ไม่พบสินค้าที่ค้นหา 😿</p>
          <button onClick={() => {setSearchTerm(""); setSelectedCategory("All");}} className="mt-2 text-secondary hover:underline">
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {/* Grid สินค้า */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-primary/5 flex flex-col overflow-hidden group">
            
            {/* รูปภาพ */}
            <Link to={`/product/${product.id}`} className="block relative pt-[75%] overflow-hidden bg-[#FAFAF5]">
                <img 
                  src={product.thumbnail} 
                  alt={product.title} 
                  className="absolute top-0 left-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" 
                />
                <span className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] uppercase px-2 py-1 rounded shadow-sm tracking-wider">
                    {product.category}
                </span>
            </Link>
            
            {/* เนื้อหา */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-primary mb-1 line-clamp-1 group-hover:text-secondary transition">
                    {product.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{product.brand || "No Brand"}</p>
                
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-secondary">${product.price}</span>
                    
                    <div className="flex gap-1">
                         <Link to={`/product/edit/${product.id}`} className="p-2 text-gray-400 hover:text-accent transition" title="แก้ไข">
                            ✏️
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition" title="ลบ">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <Link to={`/product/${product.id}`}>
                    <button className="w-full mt-3 bg-[#F2F0E4] hover:bg-highlight text-primary py-2 rounded-xl font-bold transition text-sm">
                        ดูรายละเอียด
                    </button>
                </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;