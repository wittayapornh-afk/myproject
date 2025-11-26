import React, { useState, useEffect } from 'react';

function ProductList() {
  
  const [products, setProducts] = useState([]);
  
  
  const [loading, setLoading] = useState(true);
  
  
  useEffect(() => {
    
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://dummyjson.com/products');
        
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        
        setProducts(data.products); 
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setLoading(false); 
      }
    };

    fetchProducts();
  }, []); 
 
  if (loading) {
    return <div>Loading products...</div>;
  }

  if (products.length === 0) {
    return <div>No products found.</div>;
  }

  return (
    <div className="product-list-container">
      <h2>รายการสินค้าจาก DummyJSON</h2>
      {}
      {products.map(product => (
        <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <h3>{product.title}</h3>
          <p><strong>ราคา:</strong> ${product.price}</p>
          <p>{product.description}</p>
          <img src={product.thumbnail} alt={product.title} style={{ width: '100px', height: '100px' }} />
        </div>
      ))}
    </div>
  );
}

export default ProductList;