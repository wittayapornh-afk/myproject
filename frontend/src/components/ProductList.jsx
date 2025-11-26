import React, { useState, useEffect } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1. สั่งให้ไปดึงข้อมูลจาก API ของ Django เราเอง
        const response = await fetch('http://localhost:8000/api/products/');
        
        if (!response.ok) {
          throw new Error('เชื่อมต่อ API ไม่สำเร็จ');
        }

        // 2. แปลงข้อมูลที่ได้เป็น JSON
        const data = await response.json();
        
        // 3. เก็บข้อมูลลงใน State เพื่อนำไปแสดงผล
        setProducts(data.products); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false); 
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>กำลังโหลดสินค้า...</div>;
  }

  return (
    <div>
      <h2>รายการสินค้า (จาก MySQL Database)</h2>
      
      {/* สร้าง Grid สำหรับแสดงสินค้า */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
            
            {/* รูปภาพสินค้า */}
            <img 
              src={product.thumbnail} 
              alt={product.title} 
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} 
            />
            
            {/* ชื่อและรายละเอียด */}
            <h3>{product.title}</h3>
            <p style={{ color: '#555' }}>แบรนด์: {product.brand}</p>
            <p><strong>ราคา: ${product.price}</strong></p>
            
            {/* ปุ่มกด (สมมติ) */}
            <button style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              ดูรายละเอียด
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}

export default ProductList;