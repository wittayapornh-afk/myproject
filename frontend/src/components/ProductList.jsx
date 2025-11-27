import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // นำเข้า Link เพื่อกดไปหน้าอื่น

function ProductList() {
  // State สำหรับเก็บข้อมูล
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับช่องค้นหา
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef(null);

  // ดึงข้อมูลจาก API
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

  // Auto Focus ช่องค้นหาตอนเปิดหน้าเว็บ
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Logic การกรองสินค้า (Filter)
  const filteredProducts = products.filter(product => {
    return product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <div style={{textAlign: 'center', marginTop: '20px'}}>กำลังโหลดสินค้า...</div>;

  return (
    <div className="product-list-container" style={{ padding: '20px' }}>
      
      {/* --- ส่วนช่องค้นหา (Search Bar) --- */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2>รายการสินค้า (จาก MySQL Database)</h2>
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="🔍 ค้นหาชื่อสินค้า หรือแบรนด์..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 15px',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '20px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      {/* แจ้งเตือนเมื่อค้นไม่เจอ */}
      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888' }}>
          ไม่พบสินค้าที่ค้นหา: "{searchTerm}"
        </div>
      )}

      {/* --- ส่วนแสดงรายการสินค้า (Grid) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', textAlign: 'center', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            
            <img src={product.thumbnail} alt={product.title} style={{ width: '100%', height: '150px', objectFit: 'contain', borderRadius: '5px' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '10px 0' }}>{product.title}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>แบรนด์: {product.brand}</p>
            <p style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '1.1rem' }}>${product.price}</p>
            
            {/* ปุ่มกดไปดูรายละเอียด */}
            <Link to={`/product/${product.id}`}>
                <button style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background 0.3s' }}>
                  ดูรายละเอียด
                </button>
            </Link>

          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;