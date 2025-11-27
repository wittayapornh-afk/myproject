import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
   fetch(`http://localhost:8000/api/products/${id}/`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`โหลดข้อมูลไม่สำเร็จ (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => setProduct(data))
      .catch(err => {
        console.error(err);
        setError(err.message); // โชว์ Error ให้เห็น
      });
  }, [id]);

  if (error) return <div style={{color:'red', textAlign:'center', marginTop:'20px'}}>เกิดข้อผิดพลาด: {error}</div>;
  if (!product) return <div>กำลังโหลด...</div>;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Link to="/" style={{ fontSize: '20px' }}>⬅ กลับหน้าหลัก</Link>
      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '30px', borderRadius: '10px' }}>
        <img src={product.thumbnail} style={{ maxWidth: '300px' }} />
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <h2>ราคา: ${product.price}</h2>
      </div>
    </div>
  );
}

export default ProductDetail;