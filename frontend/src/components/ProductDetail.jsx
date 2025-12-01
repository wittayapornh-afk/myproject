// frontend/src/components/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${id}/`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setProduct(data);
        setSelectedImage(data.thumbnail);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
        addToCart(product, quantity);
        // เพิ่มลูกเล่นเล็กน้อย (Optional)
        alert(`เพิ่ม ${product.title} ลงตะกร้าแล้ว!`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">กำลังโหลดข้อมูล...</div>;
  if (!product) return <div className="text-center mt-20">ไม่พบสินค้า</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm text-textMuted">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-secondary font-medium">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left: Images */}
        <div className="space-y-4">
            <div className="aspect-square bg-white rounded-3xl border border-gray-100 flex items-center justify-center p-8 shadow-sm overflow-hidden">
                <img src={selectedImage} alt={product.title} className="max-w-full max-h-full object-contain hover:scale-105 transition duration-500" />
            </div>
            {product.images && product.images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <button onClick={() => setSelectedImage(product.thumbnail)} className={`border-2 rounded-xl p-1 w-20 h-20 flex-shrink-0 ${selectedImage === product.thumbnail ? 'border-primary' : 'border-transparent'}`}>
                        <img src={product.thumbnail} className="w-full h-full object-cover rounded-lg" />
                    </button>
                    {product.images.map((img, idx) => (
                        <button key={idx} onClick={() => setSelectedImage(img)} className={`border-2 rounded-xl p-1 w-20 h-20 flex-shrink-0 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}>
                            <img src={img} className="w-full h-full object-cover rounded-lg" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-center">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2">{product.category}</span>
            <h1 className="text-4xl font-bold text-secondary mb-4 leading-tight">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-secondary">${product.price}</span>
                {product.stock > 0 ? (
                    <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">In Stock ({product.stock})</span>
                ) : (
                    <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">Out of Stock</span>
                )}
            </div>

            <p className="text-textMuted leading-relaxed mb-8 border-b border-gray-100 pb-8">
                {product.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-white border border-gray-300 rounded-xl">
                    <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="px-4 py-3 text-lg text-gray-500 hover:text-secondary">-</button>
                    <span className="w-12 text-center font-bold text-secondary">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-lg text-gray-500 hover:text-secondary">+</button>
                </div>
                
                <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary hover:bg-primaryHover text-white py-3.5 px-8 rounded-xl font-bold shadow-lg shadow-primary/30 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Add to Cart
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;