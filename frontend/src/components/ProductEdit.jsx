import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    brand: "",
    stock: ""
  });

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${id}/`)
      .then(res => res.json())
      .then(data => {
        setFormData({
            title: data.title,
            price: data.price,
            brand: data.brand,
            stock: data.stock
        });
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("บันทึกเรียบร้อย!");
        navigate(`/product/${id}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>✏️ แก้ไขสินค้า</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <label>ชื่อสินค้า:
            <input type="text" name="title" value={formData.title} onChange={handleChange} style={inputStyle} />
        </label>
        
        <label>ราคา:
            <input type="number" name="price" value={formData.price} onChange={handleChange} style={inputStyle} />
        </label>

        <label>แบรนด์:
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} style={inputStyle} />
        </label>

        <label>สต็อก:
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} style={inputStyle} />
        </label>

        <button type="submit" style={{ padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            บันทึกการแก้ไข
        </button>
        <Link to="/" style={{textAlign:'center', marginTop:'10px'}}>ยกเลิก</Link>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' };

export default ProductEdit;